use std::fmt;

#[cfg(test)]
mod tests {
    use crate::models::request_model::RequestType;


    #[test]
    fn test_request_type_creation() {
        let request_type = RequestType::Vacation;

        assert_eq!(request_type, RequestType::Vacation);
    }

    #[test]
    fn test_request_type_clone() {
        let rt1 = RequestType::Vacation;
        let rt2 = rt1.clone();

        assert_eq!(rt1, rt2);
    }

    #[test]
    fn test_request_type_serialize() {
        let request_type = RequestType::Vacation;

        let json = serde_json::to_string(&request_type).unwrap();
        assert!(json.contains("\"id\":1"));
        assert!(json.contains("\"name\":\"Ferias\""));
    }

    #[test]
    fn test_request_type_deserialize() {
        let json = r#"{"ParentalLeave"}"#;

        let request_type: RequestType = serde_json::from_str(json).unwrap();
        assert_eq!(request_type, RequestType::ParentalLeave);
    }
}
