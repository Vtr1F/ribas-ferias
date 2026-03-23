use std::sync::Arc;

use axum::Json;
use axum::extract::State;

use crate::models::role_model::Role;
use crate::{state::AppState};

pub async fn fetch_roles (State(state): State<Arc<AppState>>) -> Json<Vec<Role>> {
   
    let roles: Vec<Role> = sqlx::query_as(
        "SELECT id, name FROM roles"
    )
    .fetch_all(&*state.db)
    .await
    .expect("Failed to fetch roles");



    Json(roles)
} 