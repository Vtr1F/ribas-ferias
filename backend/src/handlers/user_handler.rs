use crate::models::user_model::User;
use axum::Json;

pub async fn list_users() -> Json<Vec<User>> {
    let users = vec![
        User { id: 1, username: "alice".to_string() }, //add DB fetch during connection task
        User { id: 2, username: "bob".to_string() },
    ]; 
    Json(users)
}