pub mod user_routes;
pub mod role_routes;
pub mod request_type_routes;
pub mod request_routes;
pub mod team_routes;

use crate::state::AppState;
use axum::Router;

pub fn create_routes() -> Router<AppState> {
    Router::new()
        .nest("/users", user_routes::routes())
        .nest("/roles", role_routes::routes())
        .nest("/types", request_type_routes::routes())
        .nest("/requests", request_routes::routes())
        .nest("/team", team_routes::routes())
}