use serde::{Serialize, Deserialize};

use crate::models::user_model::UserPublic;

#[derive(Serialize, Deserialize)] 
pub struct Team {
    pub id: u64,
    pub team_name: String,
    pub desc: Option<String>,
    pub members: Option<Vec<UserPublic>>,
}