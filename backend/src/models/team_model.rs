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
    pub created_at: DateTime<Utc>,
}