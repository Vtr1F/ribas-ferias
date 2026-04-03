use crate::state::AppState;
use axum::{routing::post, Router};
use std::sync::Arc;

use crate::handlers::password_reset_handler::{request_password_reset, reset_password};

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/request", post(request_password_reset))
        .route("/reset", post(reset_password))
}
