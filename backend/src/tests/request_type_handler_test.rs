#[cfg(test)]
mod tests {
    use crate::models::request_type_model::RequestType;

    #[test]
    fn test_request_type_creation() {
        let request_type = RequestType {
            id: 1,
            name: "Ferias".to_string(),
        };

        assert_eq!(request_type.id, 1);
        assert_eq!(request_type.name, "Ferias");
    }

    #[test]
    fn test_request_type_clone() {
        let rt1 = RequestType {
            id: 1,
            name: "Ferias".to_string(),
        };
        let rt2 = rt1.clone();

        assert_eq!(rt1.id, rt2.id);
        assert_eq!(rt1.name, rt2.name);
    }

    #[test]
    fn test_request_type_serialize() {
        let request_type = RequestType {
            id: 1,
            name: "Ferias".to_string(),
        };

        let json = serde_json::to_string(&request_type).unwrap();
        assert!(json.contains("\"id\":1"));
        assert!(json.contains("\"name\":\"Ferias\""));
    }

    #[test]
    fn test_request_type_deserialize() {
        let json = r#"{"id":2,"name":"Licenca"}"#;

        let request_type: RequestType = serde_json::from_str(json).unwrap();
        assert_eq!(request_type.id, 2);
        assert_eq!(request_type.name, "Licenca");
    }
}
