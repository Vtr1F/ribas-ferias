use crate::models::{role_model::Role, user_model::{CreateUser, UserPublic}};
use axum::{Json, extract::Path, http::StatusCode};

pub async fn list_users() -> Json<Vec<UserPublic>> {
    let users = vec![
        //UserPublic { id: 1, username: "alice".to_string() }, //add DB fetch during connection task
        //UserPublic { id: 2, username: "bob".to_string() },
    ]; 
    Json(users)
}

pub async fn fetch_user(Path(id): Path<u64>) -> Json<UserPublic> {
    let user= UserPublic { id: 1, username: "alice".to_string(), //use select from sqlx during db conenct
            email: "alice@ribas.pt".to_string() , birthday:"22/04/1987".to_string(), 
            phone: "9999999".to_string(), role: Role { id: 1, name: "Admin".to_string() }, superior: 2}; 
    
    Json(user)
}

pub async fn add_user(Json(payload): Json<CreateUser>) -> (StatusCode, Json<UserPublic>) {
    //save user to db + error handling
    let new_user = UserPublic { id: 1, username: "alice".to_string(), //use insert from sqlx during db conenct
            email: "alice@ribas.pt".to_string() , birthday:"22/04/1987".to_string(), 
            phone: "9999999".to_string(), role: Role { id: 1, name: "Admin".to_string() }, superior: 2};

    (StatusCode::OK, Json(new_user))
}

pub async fn alter_user(Path(id): Path<u64>, Json(payload): Json<UserPublic>) -> (StatusCode, Json<UserPublic>) {
    //Update DB
    let new_user = UserPublic { id: 1, username: "alice".to_string(), //use update from sqlx during db conenct
            email: "alice@ribas.pt".to_string() , birthday:"22/04/1987".to_string(), 
            phone: "9999999".to_string(), role: Role { id: 1, name: "Admin".to_string() }, superior: 2};

    (StatusCode::OK, Json(new_user))
}

pub async fn remove_user(Path(id): Path<u64>) -> StatusCode {
    //check if user exists/isnt deleted
    //soft delete him from DB

    StatusCode::OK
}
