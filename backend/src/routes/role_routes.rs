use std::sync::Arc;

use axum::{routing::{get}, Router};
use crate::state::AppState;

use crate::{handlers::role_handler};

pub fn routes() -> Router<Arc<AppState>> { 
    Router::new()
        .route("/", get(role_handler::fetch_roles))
}