use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Role {
    pub id: u64,
    pub name: String
}