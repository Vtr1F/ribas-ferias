
use crate::models::{role_model::Role, user_model::{CreateUser, UpdateUser, UserPrivate, UserPublic}};
use axum::{Json, extract::Path, http::StatusCode};
use axum::extract::State;
use crate::state::AppState;
use std::sync::Arc;
use serde_json::json;
use validator::Validate;



pub async fn list_users(State(state): State<Arc<AppState>>) -> Json<Vec<UserPublic>> {
    
    let rows: Vec<UserPrivate> = sqlx::query_as(
    "SELECT id, nome, email, password_hash, role_id, superior_id,dias_ferias_disponiveis, created_at FROM users")
    .fetch_all(&*state.db)
    .await
    .expect("Failed to fetch users");

    let mut users = Vec::new();

    for row in rows {
        let role: Role = sqlx::query_as(
            "SELECT id, name FROM roles WHERE id = $1"
        )
        .bind(row.role_id)
        .fetch_one(&*state.db)
        .await
        .unwrap();

        users.push(row.into_public(role));
    }


    Json(users)
}

pub async fn fetch_user(State(state): State<Arc<AppState>>, Path(id): Path<i32>) -> Json<UserPublic> {
    
    let row: UserPrivate = sqlx::query_as(
        "SELECT id, nome, email, password_hash, role_id, superior_id, dias_ferias_disponiveis, created_at FROM users WHERE id = $1")
    .bind(id)
    .fetch_one(&*state.db)
    .await
    .expect("User not found");

    let role: Role = sqlx::query_as(
        "SELECT id, name FROM roles WHERE id = $1"
    )
    .bind(row.role_id)
    .fetch_one(&*state.db)
    .await
    .unwrap();

    Json(row.into_public(role))
    
}


pub async fn add_user(State(state): State<Arc<AppState>>,Json(payload): Json<CreateUser>) -> (StatusCode, Json<serde_json::Value>) {

    // 1. Validate input
    if let Err(errors) = payload.validate() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "Validation failed",
                "details": errors
            })),
        );
    }


    // 3. Insert into DB
    let row: UserPrivate = sqlx::query_as(
        "INSERT INTO users (nome, email, password_hash, role_id, superior_id, dias_ferias_disponiveis)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, nome, email, password_hash, role_id, superior_id, dias_ferias_disponiveis, created_at"
    )
    .bind(&payload.nome)
    .bind(&payload.email)
    .bind(&payload.password)
    .bind(payload.role_id)
    .bind(payload.superior_id)
    .bind(payload.dias_ferias_disponiveis)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to insert user");

    // 4. Fetch role
    let role: Role = sqlx::query_as(
        "SELECT id, nome FROM roles WHERE id = $1"
    )
    .bind(row.role_id)
    .fetch_one(&*state.db)
    .await
    .unwrap();

    // 5. Convert to public
    let public_user = row.into_public(role);

    (StatusCode::CREATED, Json(json!(public_user)))
}

pub async fn alter_user(State(state): State<Arc<AppState>>, Path(_id): Path<i32>, Json(payload): Json<UpdateUser>) -> (StatusCode, Json<serde_json::Value>) {
    
    // 1. Validate input
    if let Err(errors) = payload.validate() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "Validation failed",
                "details": errors
            })),
        );
    }

    // 2. Update user in DB
    let row: UserPrivate = sqlx::query_as(
        "UPDATE users
         SET nome = $1,
             email = $2,
             dias_ferias_disponiveis = $3,
             role_id = $4,
             superior_id = $5
         WHERE id = $6
         RETURNING id, nome, email, password_hash, role_id, superior_id, dias_ferias_disponiveis, created_at"
    )
    .bind(&payload.nome)
    .bind(&payload.email)
    .bind(payload.dias_ferias_disponiveis)
    .bind(payload.role_id)
    .bind(payload.superior_id)
    .bind(_id)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to update user");

    // 3. Fetch role
    let role: Role = sqlx::query_as(
        "SELECT id, nome FROM roles WHERE id = $1"
    )
    .bind(row.role_id)
    .fetch_one(&*state.db)
    .await
    .unwrap();

    // 4. Convert to public
    let public_user = row.into_public(role);

    (StatusCode::OK, Json(json!(public_user)))
}

pub async fn remove_user(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i32>,
) -> StatusCode {

    let result = sqlx::query(
        "UPDATE users
         SET deleted_at = NOW()
         WHERE id = $1 AND deleted_at IS NULL"
    )
    .bind(id)
    .execute(&*state.db)
    .await;

    match result {
        Ok(res) => {
            if res.rows_affected() == 0 {
                StatusCode::NOT_FOUND
            } else {
                StatusCode::NO_CONTENT
            }
        }
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

