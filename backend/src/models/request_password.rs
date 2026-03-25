use serde::Deserialize;

#[derive(Deserialize)]
pub struct PasswordResetRequest {
    pub email: String,
}