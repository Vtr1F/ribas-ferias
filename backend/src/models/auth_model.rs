use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: u64,      // ID
    pub exp: usize,    // Expiration time
    pub role: String,  // User role for permissions
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String
}