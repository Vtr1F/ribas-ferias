use axum::{routing::get, Router};
use crate::handlers::user_handler;

pub fn routes() -> Router {
    Router::new().route("/", get(user_handler::list_users))
}