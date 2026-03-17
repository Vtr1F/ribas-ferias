pub mod user_routes;

use axum::Router;

pub fn create_routes() -> Router {
    Router::new()
        .nest("/users", user_routes::routes())
}