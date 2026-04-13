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
        let member_ids = row.members;
        let mut members: Vec<MemberWithUser> = Vec::new();

        for member_id in member_ids {
            let user_row: Option<(i32, String, String)> = sqlx::query_as(
                "SELECT id, nome, email FROM users WHERE id = $1"
            )
            .bind(member_id)
            .fetch_optional(&*state.db)
            .await
            .unwrap();

            if let Some((id, nome, email)) = user_row {
                let is_leader = row.leader_id == Some(id);
                members.push(MemberWithUser {
                    user: User { id, nome, email },
                    leader: is_leader,
                });
            }
        }

        members.sort_by(|a, b| b.leader.cmp(&a.leader));

        teams.push(Team {
            id: row.id,
            team_name: row.team_name,
            description: row.description,
            leader_id: row.leader_id,
            created_at: row.created_at,
            members,
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

    let member_ids = team_row.members;
    let mut members: Vec<MemberWithUser> = Vec::new();

    for member_id in member_ids {
        let user_row: Option<(i32, String, String)> = sqlx::query_as(
            "SELECT id, nome, email FROM users WHERE id = $1"
        )
        .bind(member_id)
        .fetch_optional(&*state.db)
        .await
        .unwrap();

        if let Some((id, nome, email)) = user_row {
            let is_leader = team_row.leader_id == Some(id);
            members.push(MemberWithUser {
                user: User { id, nome, email },
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
        members,
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
            leader_id = $3,
            members = $4
        WHERE id = $5
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
    .bind(&payload.members)
    .bind(id)
    .fetch_one(&*state.db)
    .await
    .expect("Failed to update team");

    (StatusCode::OK, Json(row))
}

pub async fn add_team(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateTeam>
) -> (StatusCode, Json<TeamResponse>) {

    let row: TeamResponse = sqlx::query_as(
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

    (StatusCode::OK, Json(row))
}

pub async fn add_to_team(
    State(state): State<Arc<AppState>>,
    Path((team_id, user_id)): Path<(i32, i32)>
) -> (StatusCode, Json<TeamResponse>) {

    let row: TeamResponse = sqlx::query_as(
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

    (StatusCode::OK, Json(row))
}

pub async fn remove_from_team(
    State(state): State<Arc<AppState>>,
    Path((team_id, user_id)): Path<(i32, i32)>
) -> (StatusCode, Json<TeamResponse>) {

    let row: TeamResponse = sqlx::query_as(
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

    (StatusCode::OK, Json(row))
}

pub async fn remove_team(
    State(state): State<Arc<AppState>>,
    Path(team_id): Path<i32>
) -> StatusCode {
    sqlx::query(
        "UPDATE users SET team_id = 0 WHERE team_id = $1"
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
