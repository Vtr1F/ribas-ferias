use crate::models::{role_model::Role, user_model::{CreateUser, UserPrivate, UserPublic}};
use axum::{Json, extract::Path, http::StatusCode};
use axum::extract::State;
use crate::state::AppState;

pub async fn list_users(State(state): State<AppState>) -> Json<Vec<UserPublic>> {
    
    let rows: Vec<UserPrivate> = sqlx::query_as(
    "SELECT id, nome, email, password_hash, role_id, superior_id,dias_ferias_disponiveis, created_at FROM users")
    .fetch_all(&*state.db)
    .await
    .expect("Failed to fetch users");

    let mut users = Vec::new();

    for row in rows {
        let role: Role = sqlx::query_as(
            "SELECT id, nome FROM roles WHERE id = $1"
        )
        .bind(row.role_id)
        .fetch_one(&*state.db)
        .await
        .unwrap();

        users.push(row.into_public(role));
    }


    Json(users)
}

pub async fn fetch_user(State(state): State<AppState>, Path(id): Path<i32>) -> Json<UserPublic> {
    
    let row: UserPrivate = sqlx::query_as(
        "SELECT id, name, email, password_hash, birthday, phone, role_id, leader, created_at FROM users WHERE id = $1")
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
    
    Json(row)
}

pub async fn add_user(Json(payload): Json<CreateUser>) -> (StatusCode, Json<UserPublic>) {
    //save user to db + error handling
    let new_user = UserPublic { id: 1, username: "alice".to_string(), //use insert from sqlx during db conenct
            email: "alice@ribas.pt".to_string() , birthday:"22/04/1987".to_string(), 
            phone: "9999999".to_string(), role: Role { id: 1, name: "Admin".to_string() }, leader: 2};

    (StatusCode::OK, Json(new_user))
}

pub async fn alter_user(Path(_id): Path<u64>, Json(payload): Json<UserPublic>) -> (StatusCode, Json<UserPublic>) {
    //Update DB
    let new_user = UserPublic { id: _id, username: "alice".to_string(), //use update from sqlx during db conenct
            email: "alice@ribas.pt".to_string() , birthday:"22/04/1987".to_string(), 
            phone: "9999999".to_string(), role: Role { id: 1, name: "Admin".to_string() }, leader: 2};

    (StatusCode::OK, Json(new_user))
}

pub async fn remove_user(Path(_id): Path<u64>) -> StatusCode {
    //check if user exists/isnt deleted
    //soft delete him from DB

    StatusCode::OK
}
