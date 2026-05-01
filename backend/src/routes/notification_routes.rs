use std::sync::Arc;

use axum::{routing::{get, post, put}, Router};

use crate::{
    handlers::notification_handler::{count_unread_notifications, create_notification, fetch_notifications, fetch_unread_notifications, mark_notification_read, mark_notifications_read},
    state::AppState,
};

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/user/{id}", get(fetch_notifications))
        .route("/user/{id}/unread", get(fetch_unread_notifications))
        .route("/user/{id}/count", get(count_unread_notifications))
        .route("/create", post(create_notification))
        .route("/read", put(mark_notifications_read))
        .route("/{id}/read", put(mark_notification_read))
}