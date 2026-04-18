#[cfg(test)]
mod tests {
    use chrono::{Duration, Utc};
    use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};

    use crate::handlers::auth_handler::{generate_reset_token, validate_reset_token};
    use crate::models::auth_model::ResetClaims;

    const TEST_SECRET: &str = "test_secret_key_for_testing";

    #[test]
    fn test_generate_reset_token() {
        let user_id = 1;
        let token = generate_reset_token(&user_id, TEST_SECRET);

        assert!(!token.is_empty());

        let claims = decode::<ResetClaims>(
            &token,
            &DecodingKey::from_secret(TEST_SECRET.as_bytes()),
            &Validation::default(),
        )
        .expect("Token should be valid")
        .claims;

        assert_eq!(claims.sub, user_id);
        assert_eq!(claims.kind, "password_reset");
        assert!(claims.exp > Utc::now().timestamp());
    }

    #[test]
    fn test_validate_reset_token_success() {
        let user_id = 42;
        let token = generate_reset_token(&user_id, TEST_SECRET);

        let result = validate_reset_token(&token, TEST_SECRET);

        assert!(result.is_ok());
        let claims = result.unwrap();
        assert_eq!(claims.sub, user_id);
        assert_eq!(claims.kind, "password_reset");
    }

    #[test]
    fn test_validate_reset_token_invalid_secret() {
        let user_id = 1;
        let token = generate_reset_token(&user_id, TEST_SECRET);

        let result = validate_reset_token(&token, "wrong_secret");

        assert!(result.is_err());
    }

    #[test]
    fn test_validate_reset_token_invalid_token() {
        let result = validate_reset_token("invalid_token", TEST_SECRET);

        assert!(result.is_err());
    }

    #[test]
    fn test_validate_reset_token_wrong_kind() {
        let user_id = 1;
        let exp = (Utc::now() + Duration::minutes(30)).timestamp();

        let claims = ResetClaims {
            sub: user_id,
            exp,
            kind: "not_password_reset".into(),
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(TEST_SECRET.as_bytes()),
        )
        .unwrap();

        let result = validate_reset_token(&token, TEST_SECRET);

        assert!(result.is_err());
    }

    #[test]
    fn test_expired_token_not_validated_by_default() {
        let user_id = 1;
        let expired_exp = (Utc::now() - Duration::minutes(1)).timestamp();

        let claims = ResetClaims {
            sub: user_id,
            exp: expired_exp,
            kind: "password_reset".into(),
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(TEST_SECRET.as_bytes()),
        )
        .unwrap();

        let result = validate_reset_token(&token, TEST_SECRET);

        assert!(result.is_ok());
    }
}
