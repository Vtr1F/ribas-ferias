use serde::{Serialize, Deserialize};
use sqlx::FromRow;

use crate::models::user_model::UserPublic;

#[derive(Serialize, Deserialize, FromRow)] 
pub struct Team {
    pub id: i32,
    pub team_name: String,
    pub desc: Option<String>,
    pub members: Option<Vec<UserPublic>>,
}