use serde::{Serialize, Deserialize};
use crate::models::{request_type_model::RequestType, user_model::UserPublic};
use sqlx::FromRow;

#[derive(Serialize, Deserialize,FromRow)]
pub struct Request {
    pub id: i32,
    pub user: i64,
    pub request_type: RequestType,
    pub reason: Option<String>,
    pub days: Vec<i64>,
    pub status: Option<Status>,     //Every request should be created with pending
    pub created_at: Option<String>, //Its optional because it shouldnt be on payload
}



#[derive(Serialize, Deserialize)]
pub enum Status {
    Pending,
    Rejected,
    Accepted,
}