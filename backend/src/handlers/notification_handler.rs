use std::sync::Arc;

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::{Json};
use serde::Deserialize;
use sqlx::Row;
use crate::state::AppState;
use crate::models::notification_model::{Notification, NotificationInput};

pub async fn fetch_notifications(
    State(state): State<Arc<AppState>>,
    Path(user_id): Path<i32>,
) -> Result<Json<Vec<Notification>>, (StatusCode, String)> {
    let rows: Vec<Notification> = sqlx::query_as(
        r#"
        SELECT id, user_id, mensagem, lida, link_pedido, created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        "#
    )
    .bind(user_id)
    .fetch_all(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(rows))
}

#[derive(Deserialize)]
pub struct UnreadQuery {
    unread: Option<bool>,
}

pub async fn fetch_unread_notifications(
    State(state): State<Arc<AppState>>,
    Path(user_id): Path<i32>,
) -> Result<Json<Vec<Notification>>, (StatusCode, String)> {
    let rows: Vec<Notification> = sqlx::query_as(
        r#"
        SELECT id, user_id, mensagem, lida, link_pedido, created_at
        FROM notifications
        WHERE user_id = $1 AND lida = FALSE
        ORDER BY created_at DESC
        "#
    )
    .bind(user_id)
    .fetch_all(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(rows))
}

pub async fn count_unread_notifications(
    State(state): State<Arc<AppState>>,
    Path(user_id): Path<i32>,
) -> Result<Json<i32>, (StatusCode, String)> {
    let rows = sqlx::query(
        r#"
        SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND lida = FALSE
        "#
    )
    .bind(user_id)
    .fetch_all(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let count = if let Some(row) = rows.first() {
        row.get::<i64, _>("count") as i32
    } else {
        0
    };
    
    Ok(Json(count))
}

#[derive(Deserialize)]
pub struct MarkReadInput {
    ids: Vec<i32>,
}

pub async fn mark_notifications_read(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<MarkReadInput>,
) -> Result<StatusCode, (StatusCode, String)> {
    if payload.ids.is_empty() {
        return Ok(StatusCode::OK);
    }

    let ids = payload.ids.clone();
    sqlx::query(
        "UPDATE notifications SET lida = TRUE WHERE id = ANY($1)"
    )
    .bind(&ids)
    .execute(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(StatusCode::OK)
}

pub async fn mark_notification_read(
    State(state): State<Arc<AppState>>,
    Path(notification_id): Path<i32>,
) -> Result<StatusCode, (StatusCode, String)> {
    sqlx::query(
        "UPDATE notifications SET lida = TRUE WHERE id = $1"
    )
    .bind(notification_id)
    .execute(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(StatusCode::OK)
}

pub async fn create_notification(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<NotificationInput>,
) -> Result<Json<Notification>, (StatusCode, String)> {
    let notification: Notification = sqlx::query_as(
        r#"
        INSERT INTO notifications (user_id, mensagem, link_pedido)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, mensagem, lida, link_pedido, created_at
        "#
    )
    .bind(payload.user_id)
    .bind(&payload.mensagem)
    .bind(payload.link_pedido)
    .fetch_one(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(notification))
}

pub async fn notify_leader_and_admins(
    state: Arc<AppState>,
    request_user_id: i32,
    request_id: i32,
    request_type: &str,
) -> Result<(), (StatusCode, String)> {
    let user: (i32, Option<i32>, Option<i32>) = sqlx::query_as(
        "SELECT id, superior_id, team_id FROM users WHERE id = $1"
    )
    .bind(request_user_id)
    .fetch_one(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let leader_id = user.1;
    let team_id = user.2.unwrap_or(1);

    if let Some(leader) = leader_id {
        if leader != 0 {
            let leader_notif = NotificationInput {
                user_id: leader,
                mensagem: format!("Novo pedido de {} pendente para aprovação", request_type),
                link_pedido: Some(request_id),
            };
            let _ = create_notification(State(state.clone()), Json(leader_notif)).await;
        }
    }

    let admin_ids: Vec<(i32,)> = sqlx::query_as(
        "SELECT id FROM users WHERE role_id = 1"
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    for admin in admin_ids {
        let admin_notif = NotificationInput {
            user_id: admin.0,
            mensagem: format!("Novo pedido de {} pendente para aprovação", request_type),
            link_pedido: Some(request_id),
        };
        let _ = create_notification(State(state.clone()), Json(admin_notif)).await;
    }

    Ok(())
}