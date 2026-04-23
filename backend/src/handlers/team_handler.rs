use std::mem;
use std::sync::Arc;

use axum::{extract::Path, Json, extract::State, http::StatusCode};
use crate::models::team_model::{Team, CreateTeam, TeamResponse, TeamWithUsers, MemberWithUser, User};
use crate::state::AppState;


pub async fn fetch_teams(
    State(state): State<Arc<AppState>>,
) -> Json<Vec<Team>> {

    let rows: Vec<TeamResponse> = sqlx::query_as(
        r#"
        SELECT
            t.id,
            t.team_name,
            t.description,
            t.leader_id,
            t.created_at,
            t.members
        FROM teams t
        WHERE t.deleted_at IS NULL
        ORDER BY t.id
        "#
    )
    .fetch_all(&*state.db)
    .await
    .expect("Failed to fetch teams");

    let mut teams: Vec<Team> = Vec::new();


    for row in rows {
        let members: Vec<User> = serde_json::from_value(row.members).unwrap_or_default();
        teams.push(Team {
            id: row.id,
            team_name: row.team_name,
            description: row.description,
            leader_id: row.leader_id,
            created_at: row.created_at,
            members: sqlx::types::Json(members),
        });
    }

    Json(teams)
}

pub async fn fetch_team(
    State(state): State<Arc<AppState>>,
    Path(team_id): Path<i32>,
) -> Result<Json<TeamWithUsers>, (StatusCode, String)> {

    let team_row: Option<TeamResponse> = sqlx::query_as(
        r#"
        SELECT id, team_name, description, leader_id, members, created_at
        FROM teams
        WHERE id = $1 AND deleted_at IS NULL
        "#,
    )
    .bind(team_id)
    .fetch_optional(&*state.db)
    .await
    .map_err(internal_error)?;

    let Some(team_row) = team_row else {
        return Err((StatusCode::NOT_FOUND, "Team not found".into()));
    };

    let member_ids: Vec<(i32, bool)> = sqlx::query_as(
        "SELECT user_id, leader FROM team_members WHERE team_id = $1"
    )
    .bind(team_id)
    .fetch_all(&*state.db)
    .await
    .map_err(internal_error)?;

    let mut members: Vec<MemberWithUser> = Vec::new();

    for (user_id, is_leader) in member_ids {
        let user_row: Option<(i32, String, String, Option<i32>)> = sqlx::query_as(
            "SELECT id, nome, email, role_id FROM users WHERE id = $1"
        )
        .bind(user_id)
        .fetch_optional(&*state.db)
        .await
        .map_err(internal_error)?;

        if let Some((id, nome, email, role_id)) = user_row {
            members.push(MemberWithUser {
                user: User { id, nome, email, role_id },
                leader: is_leader,
            });
        }
    }

    members.sort_by(|a, b| b.leader.cmp(&a.leader));

    let team = TeamWithUsers {
        id: team_row.id,
        team_name: team_row.team_name,
        description: team_row.description,
        leader_id: team_row.leader_id,
        created_at: team_row.created_at,
        members: sqlx::types::Json(members),
    };

    Ok(Json(team))
}

pub async fn alter_team(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i32>,
    Json(payload): Json<CreateTeam>,
) -> (StatusCode, Json<TeamResponse>) {
    let row: TeamResponse = sqlx::query_as(
        r#"
        UPDATE teams SET 
            team_name = $1,
            description = $2,
            leader_id = $3
        WHERE id = $4
        RETURNING 
            id,
            team_name,
            description,
            leader_id,
            members,
            created_at
        "#,
    )
    .bind(&payload.team_name)
    .bind(&payload.description)
    .bind(&payload.leader_id)
    .bind(id)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to update team");

    if payload.leader_id.is_some() {
        let leader_id = payload.leader_id.unwrap();
        
        sqlx::query(
            "DELETE FROM team_members WHERE user_id = $1"
        )
        .bind(leader_id)
        .execute(&*state.db)
        .await
        .ok();

        sqlx::query(
            "INSERT INTO team_members (team_id, user_id, leader) VALUES ($1, $2, TRUE) ON CONFLICT DO NOTHING"
        )
        .bind(id)
        .bind(leader_id)
        .execute(&*state.db)
        .await
        .ok();
    }

    (StatusCode::OK, Json(row))
}

pub async fn add_team(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateTeam>
) -> (StatusCode, Json<TeamResponse>) {

    let row: TeamResponse = sqlx::query_as(
        "INSERT INTO teams (team_name, description, leader_id, members)
         VALUES ($1, $2, $3, '[]'::jsonb)
         RETURNING id, team_name, description, leader_id, members, created_at"
    )
    .bind(&payload.team_name)
    .bind(&payload.description)
    .bind(&payload.leader_id)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to insert team");

    if payload.leader_id.is_some() {
        let leader_id = payload.leader_id.unwrap();
        
        sqlx::query(
            "DELETE FROM team_members WHERE user_id = $1"
        )
        .bind(leader_id)
        .execute(&*state.db)
        .await
        .ok();

        sqlx::query(
            "INSERT INTO team_members (team_id, user_id, leader) VALUES ($1, $2, TRUE) ON CONFLICT DO NOTHING"
        )
        .bind(row.id)
        .bind(leader_id)
        .execute(&*state.db)
        .await
        .ok();
    }

    (StatusCode::OK, Json(row))
}

pub async fn add_to_team(
    State(state): State<Arc<AppState>>,
    Path((team_id, user_id)): Path<(i32, i32)>
) -> (StatusCode, Json<TeamResponse>) {

    sqlx::query(
        "INSERT INTO team_members (team_id, user_id, leader) VALUES ($1, $2, FALSE)"
    )
    .bind(team_id)
    .bind(user_id)
    .execute(&*state.db)
    .await
    .expect("Failed to add user to team");

    sqlx::query(
        "UPDATE users SET team_id = $1 WHERE id = $2"
    )
    .bind(team_id)
    .bind(user_id)
    .execute(&*state.db)
    .await
    .expect("Failed to update user team_id");

    let row: TeamResponse = sqlx::query_as(
        "SELECT id, team_name, description, leader_id, members, created_at FROM teams WHERE id = $1"
    )
    .bind(team_id)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to fetch team");

    (StatusCode::OK, Json(row))
}

pub async fn remove_from_team(
    State(state): State<Arc<AppState>>,
    Path((team_id, user_id)): Path<(i32, i32)>
) -> (StatusCode, Json<TeamResponse>) {

    let is_leader: Option<i32> = sqlx::query_scalar(
        "SELECT leader_id FROM teams WHERE id = $1"
    )
    .bind(team_id)
    .fetch_optional(&*state.db)
    .await
    .ok()
    .flatten();

    sqlx::query(
        "DELETE FROM team_members WHERE team_id = $1 AND user_id = $2"
    )
    .bind(team_id)
    .bind(user_id)
    .execute(&*state.db)
    .await
    .expect("Failed to remove user from team");

    if is_leader == Some(user_id) {
        sqlx::query(
            "UPDATE teams SET leader_id = NULL WHERE id = $1"
        )
        .bind(team_id)
        .execute(&*state.db)
        .await
        .ok();
    }

    sqlx::query(
        "UPDATE users SET team_id = 1 WHERE id = $1"
    )
    .bind(user_id)
    .execute(&*state.db)
    .await
    .expect("Failed to update user team_id");

    sqlx::query(
        "INSERT INTO team_members (team_id, user_id, leader) VALUES (1, $1, FALSE) ON CONFLICT DO NOTHING"
    )
    .bind(user_id)
    .execute(&*state.db)
    .await
    .ok();

    let row: TeamResponse = sqlx::query_as(
        "SELECT id, team_name, description, leader_id, members, created_at FROM teams WHERE id = $1"
    )
    .bind(team_id)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to fetch team");

    (StatusCode::OK, Json(row))
}

pub async fn alter_team_lead(
    State(state): State<Arc<AppState>>,
    Path((team_id, lead_id)): Path<(i32, i32)>
) -> (StatusCode, Json<TeamResponse>) {

    let row: TeamResponse = sqlx::query_as(
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

    sqlx::query(
        "UPDATE team_members SET leader = TRUE WHERE team_id = $1 AND user_id = $2"
    )
    .bind(team_id)
    .bind(lead_id)
    .execute(&*state.db)
    .await
    .expect("Failed to update team member leader status");

    (StatusCode::OK, Json(row))
}

pub async fn remove_team(
    State(state): State<Arc<AppState>>,
    Path(team_id): Path<i32>
) -> StatusCode {
    sqlx::query(
        "UPDATE users SET team_id = NULL WHERE team_id = $1"
    )
    .bind(team_id)
    .execute(&*state.db)
    .await
    .expect("Failed to update users team_id");

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

fn internal_error<E: std::fmt::Display>(err: E) -> (axum::http::StatusCode, String) {
    (
        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        format!("Internal server error: {}", err),
    )
}
