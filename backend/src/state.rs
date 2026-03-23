use std::sync::Arc;
use sqlx::{Pool, Postgres};

#[derive(Clone)]
pub struct AppState {
    pub jwt_secret: String,
    pub db: Arc<Pool<Postgres>>,
}
