use std::sync::Arc;

use axum::{
    Json, extract::{Request, State}, http::{StatusCode, header}, middleware::Next, response::{IntoResponse, Response}
};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use crate::models::{auth_model::{AppState, Claims, LoginRequest}};

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
    if payload.email == "admin@ribas.pt" && payload.password == "admin123" {
        
        // Token data
        let my_claims = Claims {
            sub: 1, // Mock User ID
            exp: 10000000000, // Set a very far future date for testing
            role: "Admin".to_string(),
        };

        let token = encode(
            &Header::default(),
            &my_claims,
            &EncodingKey::from_secret(state.jwt_secret.as_ref()),
        ).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        Ok(Json(token))
    } else {
        // If credentials don't match
        Err(StatusCode::UNAUTHORIZED)
    }
}