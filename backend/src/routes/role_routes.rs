use std::sync::Arc;

use axum::{routing::{get}, Router};
use crate::state::AppState;

use crate::{handlers::role_handler, models::auth_model::AppState};

pub fn routes() -> Router<Arc<AppState>> { 
    Router::new()
        .route("/", get(fetch_roles))
}