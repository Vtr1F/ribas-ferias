use std::sync::Arc;
use crate::handlers::auth_handler::validate_reset_token;
use crate::state::AppState;
use axum::http::StatusCode;
use axum::Json;
use axum::extract::State;
use crate::models::request_password::PasswordResetRequest;
use crate::database::db::find_user_by_email;
use crate::database::db::update_user_password;
use crate::models::reset_password::PasswordResetPayload;
use crate::handlers::auth_handler::generate_reset_token;
use crate::utils::hash_password;

pub async fn request_password_reset(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<PasswordResetRequest>,
) -> Result<StatusCode, StatusCode> {
    // 1. Look up user by email
    let user = find_user_by_email(&*state.db, &payload.email)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if user.is_none() {
        // Do NOT reveal that the email doesn't exist
        return Ok(StatusCode::NO_CONTENT);
    }

    let user = user.unwrap();

    // 2. Generate JWT reset token
    let jwt_secret = state.jwt_secret.as_ref();
    let reset_token = generate_reset_token(&user.id, &jwt_secret);
    // 3. Send email
    state
        .mail_service
        .send_reset_email("diogovieira11112@gmail.com", &reset_token) //email para testes deveria ser &payload.email
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::NO_CONTENT)
}

pub async fn reset_password(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<PasswordResetPayload>,
) -> Result<StatusCode, (StatusCode, String)> {
    
    let jwt_secret = state.jwt_secret.as_ref();

    eprintln!("DEBUG: Token received: {}", &payload.token[..20.min(payload.token.len())]);

    // 1. Validate token
    let claims = match validate_reset_token(&payload.token, &jwt_secret) {
        Ok(c) => c,
        Err(_) => {
            eprintln!("DEBUG: Token validation FAILED");
            return Err((StatusCode::UNAUTHORIZED, "Invalid token".to_string()));
        }
    };

    eprintln!("DEBUG: Token validated successfully for user_id: {}", claims.sub);

    let user_id = claims.sub;

    // 2. Hash new password
    let hashed = hash_password(&payload.new_password).await;
    eprintln!("DEBUG: Password hashed, hash length: {}", hashed.len());

    // 3. Update DB
    update_user_password(&*state.db, &user_id, &hashed)
    .await
    .map_err(|e| {
        eprintln!("DEBUG: Database error: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
    })?;

    eprintln!("DEBUG: Password updated successfully");


    Ok(StatusCode::NO_CONTENT)
}