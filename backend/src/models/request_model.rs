use serde::{Serialize, Deserialize};
use crate::models::{request_type_model::RequestType, user_model::UserPublic};
use sqlx::FromRow;
use sqlx::Type;
use chrono::{DateTime, Utc};

#[derive(Serialize, Deserialize,FromRow)]
pub struct Request {
    pub id: i32,
    pub user: i32,
    pub request_type: RequestType,
    pub reason: Option<String>,
    pub days: Vec<i32>,
    pub status: Status,     //Every request should be created with pending
    pub created_at: Option<DateTime<Utc>>, //Its optional because it shouldnt be on payload
}

#[derive(Deserialize)]
pub struct RequestInput {
    pub user: i32,
    pub request_type_id: i32,
    pub reason: Option<String>,
    pub days: Vec<i32>,
}



#[derive(Serialize, Deserialize, Type, Debug)]
#[sqlx(type_name = "request_status")]
pub enum Status {
    Pending,
    Rejected,
    Accepted,
}