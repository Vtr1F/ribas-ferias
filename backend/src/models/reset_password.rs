use serde::Deserialize;

#[derive(Deserialize)]
pub struct PasswordResetPayload {
    pub token: String,
    pub new_password: String,
}