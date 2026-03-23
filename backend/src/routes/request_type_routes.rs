use std::sync::Arc;

use axum::{routing::{get}, Router};


use crate::{handlers::request_type_handler, models::auth_model::AppState};

pub fn routes() -> Router<Arc<AppState>> { 
    Router::new()
        .route("/", get(request_type_handler::fetch_types))
}