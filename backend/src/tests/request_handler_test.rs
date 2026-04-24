#[cfg(test)]
mod tests {
    use crate::models::request_model::{RequestInput, RequestType, Status};

    #[test]
    fn test_request_type_serialization() {
        let rt = RequestType::Vacation;
        let json = serde_json::to_string(&rt).unwrap();
        assert!(json.contains("\"id\":1"));
        assert!(json.contains("\"name\":\"Ferias\""));
    }

    #[test]
    fn test_status_pending() {
        let status = Status::Pending;
        assert!(matches!(status, Status::Pending));
    }

    #[test]
    fn test_status_accepted() {
        let status = Status::Approved;
        assert!(matches!(status, Status::Approved));
    }

    #[test]
    fn test_status_rejected() {
        let status = Status::Rejected;
        assert!(matches!(status, Status::Rejected));
    }

    #[test]
    fn test_request_input_creation() {
        let input = RequestInput {
            user: 1,
            request_type: RequestType::Vacation,
            reason: Some("Vacation time".to_string()),
            days: vec![1, 2, 3],
        };

        assert_eq!(input.user, 1);
        assert_eq!(input.request_type, RequestType::Vacation);
        assert_eq!(input.reason, Some("Vacation time".to_string()));
        assert_eq!(input.days, vec![1, 2, 3]);
    }

    #[test]
    fn test_request_input_empty_reason() {
        let input = RequestInput {
            user: 1,
            request_type: RequestType::Vacation,
            reason: None,
            days: vec![1],
        };

        assert_eq!(input.user, 1);
        assert!(input.reason.is_none());
    }

    #[test]
    fn test_status_serialize() {
        let status = Status::Pending;
        let json = serde_json::to_string(&status).unwrap();
        assert!(json.contains("Pending"));
    }

    #[test]
    fn test_status_deserialize() {
        let json = r#""Approved""#;
        let status: Status = serde_json::from_str(json).unwrap();
        assert!(matches!(status, Status::Approved));
    }
}
