use axum::{routing::{get}, Router};

use crate::handlers::request_type_handler;

pub fn routes() -> Router<()> { 
    Router::new()
        .route("/", get(request_type_handler::fetch_types))
}