use std::sync::Arc;

use axum::{routing::get, Router};

use crate::{handlers::image_handler, handlers::user_handler, state::AppState};

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route(
            "/",
            get(user_handler::list_users).post(user_handler::add_user),
        )
        .route("/{id}/image", get(image_handler::get_user_image))
        .route(
            "/{id}",
            get(user_handler::fetch_user)
                .put(user_handler::alter_user)
                .delete(user_handler::remove_user),
        )
}
