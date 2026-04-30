use std::sync::Arc;

use axum::{Router, routing::{get, post}};

use crate::{
    handlers::{file_handler, image_handler},
    state::AppState,
};

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/",post(image_handler::upload_image))
        .route("/files",post(file_handler::upload_file))
        .route( "/files/{file_name}", get(file_handler::download_file))
}
