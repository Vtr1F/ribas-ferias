use axum::{routing::{get}, Router};

use crate::handlers::request_handler::{self, fetch_request, fetch_team_requests, fetch_user_requests};
use crate::state::AppState;

pub fn routes() -> Router<AppState> { // Added <()>
    Router::new()
        .route("/", get(request_handler::fetch_requests)
            .post(request_handler::add_request))
        .route("/{id}",get(fetch_request))
        .route("/user/{id}",get(fetch_user_requests))
        .route("/team/{id}",get(fetch_team_requests))
        .route("/{id}/accept", get(request_handler::accept_request))
        .route("/{id}/reject", get(request_handler::reject_request))
}