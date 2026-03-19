use axum::{routing::{get}, Router};
use crate::state::AppState;

use crate::handlers::role_handler::fetch_roles;

pub fn routes() -> Router<AppState> { 
    Router::new()
        .route("/", get(fetch_roles))
}