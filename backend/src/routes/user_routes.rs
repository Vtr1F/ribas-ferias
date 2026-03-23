use std::sync::Arc;

use axum::{routing::{get}, Router};


use crate::{handlers::user_handler, models::auth_model::AppState};

pub fn routes() -> Router<Arc<AppState>> { 
    Router::new()
        .route("/", get(list_users)
            .post(add_user))
        .route("/{id}",get(fetch_user)
            .put(alter_user)
            .delete(remove_user)
        )
}