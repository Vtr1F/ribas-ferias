#[cfg(test)]
mod tests {
    use crate::models::role_model::Role;

    #[test]
    fn test_role_creation() {
        let role = Role {
            id: 1,
            name: "Admin".to_string(),
        };

        assert_eq!(role.id, 1);
        assert_eq!(role.name, "Admin");
    }

    #[test]
    fn test_role_clone() {
        let role1 = Role {
            id: 1,
            name: "Admin".to_string(),
        };
        let role2 = role1.clone();

        assert_eq!(role1.id, role2.id);
        assert_eq!(role1.name, role2.name);
    }

    #[test]
    fn test_role_serialize() {
        let role = Role {
            id: 1,
            name: "Admin".to_string(),
        };

        let json = serde_json::to_string(&role).unwrap();
        assert!(json.contains("\"id\":1"));
        assert!(json.contains("\"name\":\"Admin\""));
    }

    #[test]
    fn test_role_deserialize() {
        let json = r#"{"id":2,"name":"User"}"#;

        let role: Role = serde_json::from_str(json).unwrap();
        assert_eq!(role.id, 2);
        assert_eq!(role.name, "User");
    }
}
