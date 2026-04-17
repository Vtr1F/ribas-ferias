
use crate::{handlers::auth_handler::generate_reset_token, models::{role_model::Role, user_model::{CreateUser, UpdateUser, User, UserPrivate, UserPublic}}, utils::hash_password};
use axum::{Json, extract::Path, http::StatusCode};
use axum::extract::State;
use crate::state::AppState;
use std::sync::Arc;
use serde_json::json;
use validator::Validate;
use crate::database::db::update_user_password;


pub async fn list_users(State(state): State<Arc<AppState>>) -> Json<Vec<UserPublic>> {
    
    let rows: Vec<UserPublic> = sqlx::query_as(
    // Altere para incluir os 3 campos:
"SELECT id, nome, email, role_id, superior_id, team_id, dias_ferias_disponiveis, birthday, phone_number, headquarter FROM users
        WHERE deleted_at IS NULL")
    .fetch_all(&*state.db)
    .await
    .expect("Failed to fetch users");
    
    Json(rows)
}

pub async fn fetch_user(State(state): State<Arc<AppState>>, Path(id): Path<i32>) -> Json<UserPublic> {
    
    let row: UserPublic = sqlx::query_as(
        "SELECT id, nome, email, role_id, superior_id, team_id, dias_ferias_disponiveis, birthday, phone_number, headquarter, created_at FROM users WHERE id = $1")
    .bind(id)
    .fetch_one(&*state.db)
    .await
    .expect("User not found");

    Json(row)
}


pub async fn add_user(State(state): State<Arc<AppState>>,Json(payload): Json<CreateUser>) -> (StatusCode, Json<serde_json::Value>) {

    // Validate input
    if let Err(errors) = payload.validate() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "Validation failed",
                "details": errors
            })),
        );
    }

    let team_id = payload.team_id.unwrap_or(1);

    // Insert into DB
    let row: UserPrivate = sqlx::query_as(
        "INSERT INTO users (nome, email, password_hash, role_id, superior_id, dias_ferias_disponiveis, team_id, birthday, phone_number, headquarter)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, nome, email, password_hash, role_id, superior_id, team_id, dias_ferias_disponiveis, created_at, birthday, phone_number, headquarter"
    )
    .bind(&payload.nome)
    .bind(&payload.email)
    .bind("Not-Set")
    .bind(payload.role_id)
    .bind(payload.superior_id)
    .bind(22)
    .bind(team_id)
    .bind(&payload.birthday)
    .bind(&payload.phone_number)
    .bind(&payload.headquarter)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to insert user");

    // Convert to public
    let public_user = row.into_public();

    let jwt_secret = state.jwt_secret.as_ref();
    let set_token = generate_reset_token(&public_user.id, &jwt_secret);
    // Send email
    let _ = state
        .mail_service
        .send_set_email("victor.fonseca.f2@gmail.com", &set_token) //email para testes deveria ser &payload.email
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR);
    

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
             superior_id = $5,
             team_id = $6,
             birthday = $7,
             phone_number = $8,
             headquarter = $9
         WHERE id = $10
         RETURNING id, nome, email, password_hash, role_id, superior_id, team_id, dias_ferias_disponiveis, created_at, birthday, phone_number, headquarter"
    )
    .bind(&payload.nome)
    .bind(&payload.email)
    .bind(payload.dias_ferias_disponiveis)
    .bind(payload.role_id)
    .bind(payload.superior_id)
    .bind(payload.team_id)
    .bind(&payload.birthday)
    .bind(&payload.phone_number)
    .bind(&payload.headquarter)
    .bind(_id)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to update user");

    if payload.team_id.is_some() {
        sqlx::query(
            "INSERT INTO team_members (team_id, user_id, leader) VALUES ($1, $2, FALSE) ON CONFLICT DO NOTHING"
        )
        .bind(payload.team_id)
        .bind(_id)
        .execute(&*state.db)
        .await
        .ok();
    }

    (StatusCode::OK, Json(json!(row)))
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

pub async fn alter_password(State(state): State<Arc<AppState>>,  Path(_id): Path<i32>, Json(payload): Json<User>) 
    ->  Result<StatusCode, (StatusCode, String)>  {
    let hashed = hash_password(&payload.password_hash).await;
    
    update_user_password(&*state.db, &_id, &hashed)
    .await
    .map_err(|e| {
        eprintln!("DEBUG: Database error: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
    })?;
    
    eprintln!("DEBUG: Password updated successfully");

    Ok(StatusCode::NO_CONTENT)
}

