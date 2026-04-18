#[cfg(test)]
mod tests {
    use crate::models::team_model::{CreateTeam, MemberWithUser, Team, TeamWithUsers, User};

    #[test]
    fn test_create_team_creation() {
        let team = CreateTeam {
            team_name: "Engineering".to_string(),
            description: Some("Engineering team".to_string()),
            leader_id: Some(1),
            members: vec![1, 2, 3],
        };

        assert_eq!(team.team_name, "Engineering");
        assert_eq!(team.description, Some("Engineering team".to_string()));
        assert_eq!(team.leader_id, Some(1));
        assert_eq!(team.members, vec![1, 2, 3]);
    }

    #[test]
    fn test_create_team_no_optionals() {
        let team = CreateTeam {
            team_name: "New Team".to_string(),
            description: None,
            leader_id: None,
            members: vec![],
        };

        assert_eq!(team.team_name, "New Team");
        assert!(team.description.is_none());
        assert!(team.leader_id.is_none());
        assert!(team.members.is_empty());
    }

    #[test]
    fn test_user_creation() {
        let user = User {
            id: 1,
            nome: "John Doe".to_string(),
            email: "john@ribas.pt".to_string(),
            role_id: Some(1),
        };

        assert_eq!(user.id, 1);
        assert_eq!(user.nome, "John Doe");
        assert_eq!(user.email, "john@ribas.pt");
        assert_eq!(user.role_id, Some(1));
    }

    #[test]
    fn test_member_with_user_creation() {
        let user = User {
            id: 1,
            nome: "John Doe".to_string(),
            email: "john@ribas.pt".to_string(),
            role_id: Some(1),
        };
        let member = MemberWithUser { user, leader: true };

        assert_eq!(member.user.nome, "John Doe");
        assert!(member.leader);
    }

    #[test]
    fn test_member_not_leader() {
        let user = User {
            id: 2,
            nome: "Jane Doe".to_string(),
            email: "jane@ribas.pt".to_string(),
            role_id: Some(2),
        };
        let member = MemberWithUser {
            user,
            leader: false,
        };

        assert!(!member.leader);
    }

    #[test]
    fn test_team_serialize() {
        let team = CreateTeam {
            team_name: "Engineering".to_string(),
            description: Some("Test".to_string()),
            leader_id: Some(1),
            members: vec![],
        };

        let json = serde_json::to_string(&team).unwrap();
        assert!(json.contains("Engineering"));
    }

    #[test]
    fn test_team_deserialize() {
        let json =
            r#"{"team_name":"Test","description":"Test team","leader_id":1,"members":[1,2]}"#;

        let team: CreateTeam = serde_json::from_str(json).unwrap();
        assert_eq!(team.team_name, "Test");
        assert_eq!(team.leader_id, Some(1));
        assert_eq!(team.members.len(), 2);
    }
}
