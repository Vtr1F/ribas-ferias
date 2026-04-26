#[cfg(test)]
mod tests {
    use crate::models::user_model::{CreateUser, UpdateUser};
    use chrono::NaiveDate;
    use validator::Validate;

    #[test]
    fn test_create_user_validation_empty_name() {
        let payload = CreateUser {
            nome: "".to_string(),
            email: "test@ribas.pt".to_string(),
            role_id: 1,
            superior_id: None,
            team_id: None,
            birthday: None,
            phone_number: None,
            headquarter: None,
            avatar_url: None,
        };

        let result = payload.validate();
        assert!(result.is_err());
    }

    #[test]
    fn test_create_user_validation_invalid_email() {
        let payload = CreateUser {
            nome: "John Doe".to_string(),
            email: "invalid-email".to_string(),
            role_id: 1,
            superior_id: None,
            team_id: None,
            birthday: None,
            phone_number: None,
            headquarter: None,
            avatar_url: None,
        };

        let result = payload.validate();
        assert!(result.is_err());
    }

    #[test]
    fn test_create_user_validation_valid() {
        let payload = CreateUser {
            nome: "John Doe".to_string(),
            email: "john@ribas.pt".to_string(),
            role_id: 1,
            superior_id: Some(2),
            team_id: Some(1),
            birthday: Some(NaiveDate::from_ymd_opt(1990, 1, 1).unwrap()),
            phone_number: Some("+1234567890".to_string()),
            headquarter: Some("Lisbon".to_string()),
            avatar_url: Some("https://example.com/avatar.jpg".to_string()),
        };

        let result = payload.validate();
        assert!(result.is_ok());
    }

    #[test]
    fn test_update_user_validation_empty_name() {
        let payload = UpdateUser {
            nome: Some("".to_string()),
            email: Some("test@ribas.pt".to_string()),
            role_id: Some(1),
            superior_id: None,
            team_id: None,
            dias_ferias_disponiveis: Some(22),
            birthday: None,
            phone_number: None,
            headquarter: None,
            avatar_url: None,
        };

        let result = payload.validate();
        assert!(result.is_err());
    }

    #[test]
    fn test_update_user_validation_invalid_email() {
        let payload = UpdateUser {
            nome: Some("Jane Dough".to_string()),
            email: Some("invalid-email".to_string()),
            role_id: Some(1),
            superior_id: None,
            team_id: None,
            dias_ferias_disponiveis: Some(22),
            birthday: None,
            phone_number: None,
            headquarter: None,
            avatar_url: None,
        };

        let result = payload.validate();
        assert!(result.is_err());
    }

    #[test]
    fn test_update_user_validation_valid() {
        let payload = UpdateUser {
            nome: Some("John Doe".to_string()),
            email: Some("john@ribas.pt".to_string()),
            role_id: Some(1),
            superior_id: Some(2),
            team_id: Some(1),
            dias_ferias_disponiveis: Some(22),
            birthday: Some(NaiveDate::from_ymd_opt(1990, 1, 1).unwrap()),
            phone_number: Some("+1234567890".to_string()),
            headquarter: Some("Lisbon".to_string()),
            avatar_url: Some("https://example.com/avatar.jpg".to_string()),
        };

        let result = payload.validate();
        assert!(result.is_ok());
    }

    #[test]
    fn test_update_user_negative_days_not_allowed() {
        let payload = UpdateUser {
            nome: Some("John Doe".to_string()),
            email: Some("john@ribas.pt".to_string()),
            role_id: Some(1),
            superior_id: None,
            team_id: None,
            dias_ferias_disponiveis: Some(-1),
            birthday: None,
            phone_number: None,
            headquarter: None,
            avatar_url: None,
        };

        let result = payload.validate();
        assert!(result.is_err());
    }
}
