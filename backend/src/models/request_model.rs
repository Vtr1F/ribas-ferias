use serde::{Serialize, Deserialize};
use crate::models::{request_type_model::RequestType, user_model::UserPublic};

#[derive(Serialize, Deserialize)]
pub struct Request {
    pub id: u64,
    pub user: u64,
    pub request_type: RequestType,
    pub reason: Option<String>,
    pub days: Vec<u64>,
    pub status: Option<Status>,     //Every request should be created with pending
    pub created_at: Option<String>, //Its optional because it shouldnt be on payload
}



#[derive(Serialize, Deserialize)]
pub enum Status {
    Pending,
    Rejected,
    Accepted,
}