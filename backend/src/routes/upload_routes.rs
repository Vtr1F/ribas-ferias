use std::sync::Arc;

use axum::{routing::post, Router};

use crate::{
    handlers::{file_handler, image_handler},
    state::AppState,
};

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/",post(image_handler::upload_image))
        .route("/files",post(file_handler::upload_file),)
}
