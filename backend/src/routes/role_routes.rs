use axum::{routing::{get}, Router};

use crate::handlers::role_handler;

pub fn routes() -> Router<()> { 
    Router::new()
        .route("/", get(role_handler::fetch_roles))
}