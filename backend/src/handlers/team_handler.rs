use crate::models::{role_model::Role, team_model::Team, user_model::{CreateUser, UserPublic}};
use axum::{Json, extract::Path, http::StatusCode};
use crate::state::AppState;
use axum::extract::State;


pub async fn fetch_teams(
    State(state): State<AppState>
) -> Json<Vec<Team>> {

    let teams: Vec<Team> = sqlx::query_as(
        "SELECT id, team_name, description, leader_id, members, created_at FROM teams"
    )
    .fetch_all(&*state.db)
    .await
    .expect("Failed to fetch teams");

    Json(teams)
}

pub async fn fetch_team(
    State(state): State<AppState>,
    Path(id): Path<i32>
) -> Json<Team> {

    let team: Team = sqlx::query_as(
        "SELECT id, team_name, description, leader_id, members, created_at FROM teams WHERE id = $1"
    )
    .bind(id)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to fetch team");

    Json(team)
}

pub async fn alter_team(State(state): State<AppState>,Json(payload): Json<Team>) -> (StatusCode, Json<Team>) {
    //save user to db + error handling
     let updated_team: Team = sqlx::query_as("UPDATE teams SET team_name = $1,
             description = $2,
             leader_id = $3,
             members = $4
         WHERE id = $5
         RETURNING id, team_name, description, leader_id, members, created_at"
    )
    .bind(&payload.team_name)
    .bind(&payload.description)
    .bind(&payload.leader_id)
    .bind(&payload.members)
    .bind(payload.id)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to update team");

    (StatusCode::OK, Json(updated_team))
}

pub async fn add_team(
    State(state): State<AppState>,
    Json(payload): Json<Team>
) -> (StatusCode, Json<Team>) {

    let new_team: Team = sqlx::query_as(
        "INSERT INTO teams (team_name, description, leader_id, members)
         VALUES ($1, $2, $3, $4)
         RETURNING id, team_name, description, leader_id, members, created_at"
    )
    .bind(&payload.team_name)
    .bind(&payload.description)
    .bind(&payload.leader_id)
    .bind(&payload.members)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to insert team");

    (StatusCode::OK, Json(new_team))
}

pub async fn add_to_team(
    State(state): State<AppState>,
    Path((team_id, user_id)): Path<(i32, i32)>
) -> (StatusCode, Json<Team>) {

    let updated_team: Team = sqlx::query_as(
        "UPDATE teams
         SET members = array_append(members, $2)
         WHERE id = $1
         RETURNING id, team_name, description, leader_id, members, created_at"
    )
    .bind(team_id)
    .bind(user_id)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to add user to team");

    (StatusCode::OK, Json(updated_team))
}

pub async fn remove_from_team(
    State(state): State<AppState>,
    Path((team_id, user_id)): Path<(i32, i32)>
) -> (StatusCode, Json<Team>) {

    let updated_team: Team = sqlx::query_as(
        "UPDATE teams
         SET members = array_remove(members, $2)
         WHERE id = $1
         RETURNING id, team_name, description, leader_id, members, created_at"
    )
    .bind(team_id)
    .bind(user_id)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to remove user from team");

    (StatusCode::OK, Json(updated_team))
}

pub async fn alter_team_lead(
    State(state): State<AppState>,
    Path((team_id, lead_id)): Path<(i32, i32)>
) -> (StatusCode, Json<Team>) {

    //Update DB Query to Change Team Leader
    let updated_team: Team = sqlx::query_as(
        "UPDATE teams
         SET leader_id = $2
         WHERE id = $1
         RETURNING id, team_name, description, leader_id, members, created_at"
    )
    .bind(team_id)
    .bind(lead_id)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to update team leader");

    (StatusCode::OK, Json(updated_team))
}

pub async fn remove_team(
    State(state): State<AppState>,
    Path(team_id): Path<i32>
) -> StatusCode {

    let result = sqlx::query(
        "UPDATE teams
         SET deleted_at = NOW()
         WHERE id = $1"
    )
    .bind(team_id)
    .execute(&*state.db)
    .await;

    match result {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}