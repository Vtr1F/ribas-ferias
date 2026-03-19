use crate::models::{role_model::Role, team_model::Team, user_model::{CreateUser, UserPublic}};
use axum::{Json, extract::Path, http::StatusCode};

pub async fn fetch_teams() -> Json<Vec<Team>> {
    let teams = vec![
        Team { id: 1, team_name: "Desgin".to_string(), desc: None, members: None}
    ]; 
    Json(teams)
}

pub async fn fetch_team(Path(_id): Path<u64>) -> Json<Team> {
    let team= 
        Team { id: 1, team_name: "Desgin".to_string(), desc: None, members: None}; 
    
    Json(team)
}

pub async fn alter_team(Json(payload): Json<Team>) -> (StatusCode, Json<Team>) {
    //save user to db + error handling
    let new_team = Team { id: 1, team_name: "Desgin".to_string(), desc: None, members: None}; 

    (StatusCode::OK, Json(new_team))
}

pub async fn add_team(Json(payload): Json<Team>) -> (StatusCode, Json<Team>) {
    //save user to db + error handling
    let new_team = Team { id: 1, team_name: "Desgin".to_string(), desc: None, members: None}; 

    (StatusCode::OK, Json(new_team))
}

pub async fn add_to_team(Path(_id): Path<u64>, Path(user_id): Path<i64>) -> (StatusCode, Json<Team>) {
    //Update DB
    let new_team = Team { id: 1, team_name: "Desgin".to_string(), desc: None, members: None}; 

    (StatusCode::OK, Json(new_team))
}

pub async fn remove_from_team(Path(_id): Path<u64>, Path(user_id): Path<i64>) -> (StatusCode, Json<Team>) {
    //Update DB
    let new_team = Team { id: 1, team_name: "Desgin".to_string(), desc: None, members: None}; 

    (StatusCode::OK, Json(new_team))
}

pub async fn alter_team_lead(Path(_id): Path<u64>, Path(lead_id): Path<i64>) -> (StatusCode, Json<Team>) {
    //Update DB
    let new_team = Team { id: 1, team_name: "Desgin".to_string(), desc: None, members: None}; 

    (StatusCode::OK, Json(new_team))
}

pub async fn remove_team(Path(_id): Path<i64>) -> StatusCode {
    //Update DB

    (StatusCode::OK)
}