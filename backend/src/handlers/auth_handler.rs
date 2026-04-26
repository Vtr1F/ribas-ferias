use std::sync::Arc;
use axum_extra::extract::{CookieJar, cookie::{Cookie, SameSite}};
use chrono::{Utc, Duration};
use time::Duration as TimeDuration;

use argon2::{Argon2, PasswordVerifier, password_hash::PasswordHash};
use axum::{
    Extension, Json, extract::{Request, State}, http::{StatusCode}, middleware::Next, response::{IntoResponse, Response}
};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use crate::{models::{auth_model::{Claims, LoginRequest, ResetClaims}}, state::AppState};
use std::fmt::Debug;

const TOKEN_EXPIRATION_MINUTES: i64 = 30; //30 minutes for testing, can be changed to 60 or more for production

#[derive(sqlx::FromRow, Debug)]
struct UserRow {
    id: i32,
    password_hash: String,
    role_id: i32,
}

pub async fn auth_middleware(
    State(state): State<String>,
    jar: CookieJar,
    mut req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // Look for the "token" cookie
    let token = jar
        .get("token")
        .map(|cookie| cookie.value().to_string())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // Validate
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.as_ref()),
        &Validation::default(),
    ).map_err(|_| StatusCode::UNAUTHORIZED)?;

    req.extensions_mut().insert(token_data.claims);

    Ok(next.run(req).await)
}

pub async fn check_auth(
    Extension(claims): Extension<Claims>,
) -> impl IntoResponse {
    // If the middleware passed, the user is valid
    (StatusCode::OK, Json(claims))
}

pub async fn login(
    State(state): State<Arc<AppState>>,
    jar: CookieJar,
    Json(payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    
    // DB check
    let user_result = sqlx::query_as::<_, UserRow>(
    "SELECT id, password_hash, role_id FROM users WHERE email = $1"
    )
    .bind(&payload.email)
    .fetch_one(&*state.db) 
    .await;


    let user = user_result.map_err(|_| StatusCode::UNAUTHORIZED)?;


    let expected_hash = PasswordHash::new(&user.password_hash)
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let result = Argon2::default().verify_password(
        payload.password.as_bytes(), 
        &expected_hash
    );


    if result.is_err() {
        return Err(StatusCode::UNAUTHORIZED);
    }
        
        // Token data
    let exp = (Utc::now() + Duration::minutes(TOKEN_EXPIRATION_MINUTES)).timestamp() as usize;
    let my_claims = Claims {
        sub: user.id, // Mock User ID
        exp,
        role: user.role_id,
    };

    let token = encode(
        &Header::default(),
        &my_claims,
        &EncodingKey::from_secret(state.jwt_secret.as_ref()),
    ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let cookie = Cookie::build(("token", token))
        .path("/")
        .http_only(true)
        .secure(true)
        .same_site(SameSite::Lax) 
        .build();


    Ok((jar.add(cookie), Json(serde_json::json!({"message": "Logged in safely", "id": user.id, "role": user.role_id}))))
}


pub fn generate_reset_token(user_id: &i32, secret: &str) -> String {
    let exp = (Utc::now() + Duration::minutes(TOKEN_EXPIRATION_MINUTES)).timestamp();

    let claims = ResetClaims {
        sub: *user_id,
        exp,
        kind: "password_reset".into(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .unwrap()
}

pub fn validate_reset_token(token: &str, secret: &str) -> Result<ResetClaims, ()> {
    let data = decode::<ResetClaims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    ).map_err(|_| ())?;

    if data.claims.kind != "password_reset" {
        return Err(());
    }

    Ok(data.claims)
}

pub async fn refresh_token(
    State(state): State<Arc<AppState>>,
    jar: CookieJar,
) -> Result<impl IntoResponse, StatusCode> {
    let old_token = jar
        .get("token")
        .map(|cookie| cookie.value().to_string())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let token_data = decode::<Claims>(
        &old_token,
        &DecodingKey::from_secret(state.jwt_secret.as_ref()),
        &Validation::default(),
    ).map_err(|_| StatusCode::UNAUTHORIZED)?;

    let exp = (Utc::now() + Duration::minutes(TOKEN_EXPIRATION_MINUTES)).timestamp() as usize;
    let new_claims = Claims {
        sub: token_data.claims.sub,
        exp,
        role: token_data.claims.role,
    };

    let new_token = encode(
        &Header::default(),
        &new_claims,
        &EncodingKey::from_secret(state.jwt_secret.as_ref()),
    ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let cookie = Cookie::build(("token", new_token))
        .path("/")
        .http_only(true)
        .secure(true)
        .same_site(SameSite::Lax)
        .build();

    Ok((jar.add(cookie), Json(serde_json::json!({"message": "Token refreshed"}))))
}

pub async fn logout(
    jar: CookieJar,
) -> impl IntoResponse {
    let cookie = Cookie::build(("token", ""))
        .path("/")
        .http_only(true)
        .secure(true)
        .same_site(SameSite::Lax)
        .max_age(TimeDuration::ZERO)
        .build();


    (jar.add(cookie), Json(serde_json::json!({"message": "Logged out"})))
}