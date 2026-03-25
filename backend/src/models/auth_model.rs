use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: i32,      // ID
    pub exp: usize,    // Expiration time
    pub role: i32,  // User role for permissions
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String
}

pub struct PasswordReset {
    pub email: String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResetClaims {
    pub sub: String,   // user id
    pub exp: i64,      // expiration timestamp
    pub kind: String,  // must be "password_reset"
}