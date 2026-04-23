use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::Type;

#[derive(Serialize, Deserialize, FromRow)]
pub struct Request {
    pub id: i32,
    pub user_id: i32,
    pub request_type: RequestType,
    pub reason: Option<String>,
    pub days: Vec<i32>,
    pub status: Status, //Every request should be created with pending
    pub created_at: DateTime<Utc>
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
    Approved,
}

#[derive(Serialize, Deserialize, Type, Debug)]
#[sqlx(type_name = "request_type")]
pub enum RequestType {
    Vacation,
    SickLeave,
    ParentalLeave,
    BereavementLeave
}
