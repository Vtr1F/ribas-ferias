pub mod user_routes;
pub mod role_routes;
pub mod request_type_routes;
pub mod request_routes;
pub mod team_routes;
pub mod password_reset_routes;

use std::sync::Arc;

use axum::{Router, middleware, routing::{get, post}};

use crate::{handlers::auth_handler::{auth_middleware, check_auth}, state::AppState};

pub fn create_routes(state: Arc<AppState>) -> Router<()> {
    let protected_routes = Router::new()
        .route("/check", get(check_auth))
        .nest("/users", user_routes::routes())
        .nest("/roles", role_routes::routes())
        .nest("/types", request_type_routes::routes())
        .nest("/requests", request_routes::routes())
        .nest("/team", team_routes::routes())
        .layer(middleware::from_fn_with_state(state.jwt_secret.clone(), auth_middleware));
    
    let public_routes = Router::<Arc<AppState>>::new() 
        .route("/login", post(crate::handlers::auth_handler::login))
        .nest("/password", password_reset_routes::routes());

    Router::new()
        .nest("/api", protected_routes)
        .nest("/auth", public_routes)
        .with_state(state)
}