use axum::{routing::{get}, Router};

use crate::handlers::{user_handler};
use crate::state::AppState;

pub fn routes() -> Router<AppState> { // Added <()>
    Router::new()
        .route("/", get(user_handler::list_users)
            .post(user_handler::add_user))
        .route("/{id}",get(user_handler::fetch_user)
            .put(user_handler::alter_user)
            .delete(user_handler::remove_user)
        )
}