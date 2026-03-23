use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};


#[derive(Serialize, Deserialize, FromRow)]
pub struct Team {
    pub id: i32,
    pub team_name: String,
    pub description: Option<String>,
    pub leader_id: Option<i32>,
    pub members: Vec<i32>,           // INTEGER[] → Vec<i32>
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MemberWithUser {
    pub user: User,
    pub leader: bool,
}


#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub nome: String,
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TeamWithUsers {
    pub id: i32,
    pub team_name: String,
    pub description: Option<String>,
    pub leader_id: Option<i32>,
    pub created_at: Option<DateTime<Utc>>,
    pub members: Vec<MemberWithUser>,
}