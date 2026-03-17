use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct RequestType{
    pub id: u64,
    pub name: String
}