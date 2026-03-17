pub mod user_routes;
pub mod role_routes;
pub mod request_type_routes;

use axum::Router;

pub fn create_routes() -> Router {
    Router::new()
        .nest("/users", user_routes::routes())
        .nest("/roles", role_routes::routes())
}