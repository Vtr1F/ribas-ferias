use axum::{routing::{get, post, delete, put}, Router};

use crate::handlers::{user_handler};

pub fn routes() -> Router<()> { // Added <()>
    Router::new()
        .route("/", get(user_handler::list_users)
            .post(user_handler::add_user))
        .route("/{id}",get(user_handler::fetch_user)
            .put(user_handler::alter_user)
            .delete(user_handler::remove_user)
        )
}