use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: i32,
    pub nome: String,
    pub email: String,
    pub role_id: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MemberWithUser {
    pub user: User,
    pub leader: bool,
}

#[derive(Serialize, Deserialize)]
pub struct Team {
    pub id: i32,
    pub team_name: String,
    pub description: Option<String>,
    pub leader_id: Option<i32>,
    pub members: Vec<User>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TeamWithUsers {
    pub id: i32,
    pub team_name: String,
    pub description: Option<String>,
    pub leader_id: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub members: Vec<MemberWithUser>,
}

#[derive(Serialize, Deserialize)]
pub struct CreateTeam {
    pub team_name: String,
    pub description: Option<String>,
    pub leader_id: Option<i32>,
    pub members: Vec<i32>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct TeamResponse {
    pub id: i32,
    pub team_name: String,
    pub description: Option<String>,
    pub leader_id: Option<i32>,
    pub members: serde_json::Value,
    pub created_at: DateTime<Utc>,
}
