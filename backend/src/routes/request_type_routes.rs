use axum::{routing::{get}, Router};

use crate::handlers::request_type_handler;
use crate::state::AppState;

pub fn routes() -> Router<AppState> { 
    Router::new()
        .route("/", get(request_type_handler::fetch_types))
}