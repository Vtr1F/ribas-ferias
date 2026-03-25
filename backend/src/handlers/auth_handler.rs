use std::sync::Arc;
use chrono::{Utc, Duration};

use argon2::{Argon2, PasswordVerifier, password_hash::PasswordHash};
use axum::{
    Json, extract::{Request, State}, http::{StatusCode, header}, middleware::Next, response::Response
};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use crate::{models::{auth_model::{Claims, LoginRequest}, team_model::User, user_model::UserPrivate}, state::AppState};

#[derive(sqlx::FromRow)]
struct UserRow {
    id: i32,
    password_hash: String,
    role_id: i32,
}

pub async fn auth_middleware(
    state: axum::extract::State<String>, // JWT Secret
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {

    let auth_header = request.headers()
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .filter(|v| v.starts_with("Bearer "))
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let token = &auth_header[7..];

    // Validate
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.as_ref()),
        &Validation::default(),
    ).map_err(|_| StatusCode::UNAUTHORIZED)?;

    // Insert the claims into the request so handlers can use them
    request.extensions_mut().insert(token_data.claims);

    Ok(next.run(request).await)
}

pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<String>, StatusCode> {
    
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
        let my_claims = Claims {
            sub: user.id, // Mock User ID
            exp: 10000000000, // Set a very far future date for testing
            role: user.role_id,
        };

        let token = encode(
            &Header::default(),
            &my_claims,
            &EncodingKey::from_secret(state.jwt_secret.as_ref()),
        ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        Ok(Json(token))
}

use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ResetClaims {
    pub sub: String,   // user id
    pub exp: i64,      // expiration timestamp
    pub kind: String,  // must be "password_reset"
}

pub fn generate_reset_token(user_id: &str, secret: &str) -> String {
    let exp = (Utc::now() + Duration::minutes(30)).timestamp();

    let claims = ResetClaims {
        sub: user_id.to_string(),
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