use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, Deserialize, FromRow, Clone)]
pub struct Notification {
    pub id: i32,
    pub user_id: i32,
    pub mensagem: String,
    pub lida: bool,
    pub link_pedido: Option<i32>,
    pub created_at: DateTime<Utc>
}

#[derive(Deserialize)]
pub struct NotificationInput {
    pub user_id: i32,
    pub mensagem: String,
    pub link_pedido: Option<i32>,
}