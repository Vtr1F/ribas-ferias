#[cfg(test)]
mod tests {
    use crate::models::reset_password::PasswordResetPayload;
    use crate::utils::hash_password;

    #[tokio::test]
    async fn test_hash_password() {
        let password = "test_password_123";
        let hash = hash_password(password).await;
        println!("Password: {}", password);
        println!("Hash: {}", hash);
        assert!(!hash.is_empty());
        assert!(hash.starts_with("$argon2"));
    }

    #[tokio::test]
    async fn test_hash_password_different_salts() {
        let password = "same_password";
        let hash1 = hash_password(password).await;
        let hash2 = hash_password(password).await;
        println!("Hash 1: {}", hash1);
        println!("Hash 2: {}", hash2);
        assert_ne!(hash1, hash2);
    }

    #[test]
    fn test_password_reset_payload_creation() {
        let payload = PasswordResetPayload {
            token: "test_token".to_string(),
            new_password: "new_secure_password".to_string(),
        };
        println!("Payload Token: {}", payload.token);
        println!("Payload New Password: {}", payload.new_password);
        assert_eq!(payload.token, "test_token");
        assert_eq!(payload.new_password, "new_secure_password");
    }
}