use std::sync::Arc;

use axum::{routing::{get}, Router};

use crate::{handlers::user_handler, models::auth_model::AppState};

pub fn routes() -> Router<Arc<AppState>> { 
    Router::new()
        .route("/", get(user_handler::list_users)
            .post(user_handler::add_user))
        .route("/{id}",get(user_handler::fetch_user)
            .put(user_handler::alter_user)
            .delete(user_handler::remove_user)
        )
}