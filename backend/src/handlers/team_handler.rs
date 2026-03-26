use std::sync::Arc;

use crate::models::{role_model::Role, team_model::TeamWithUsers, user_model::{CreateUser, UserPublic}};
use axum::{Json, extract::Path,extract::State, http::StatusCode};
use crate::state::AppState;
use crate::models::team_model::{Team, MemberWithUser, User};


pub async fn fetch_teams(
    State(state): State<Arc<AppState>>,
) -> Json<Vec<Team>> {

    let teams = sqlx::query!(
        r#"
        SELECT
            t.id,
            t.team_name,
            t.description,
            t.leader_id,
            t.created_at,
            COALESCE(
                json_agg(
                    json_build_object(
                        'user', json_build_object(
                            'id', u.id,
                            'nome', u.nome,
                            'email', u.email
                        ),
                        'leader', tm.leader
                    )
                    ORDER BY tm.leader DESC, u.id
                ) FILTER (WHERE u.id IS NOT NULL),
                '[]'
            ) AS members
        FROM teams t
        LEFT JOIN team_members tm ON tm.team_id = t.id
        LEFT JOIN users u ON u.id = tm.user_id
        WHERE t.deleted_at IS NULL
        GROUP BY t.id
        ORDER BY t.id
        "#
    )
    .fetch_all(&*state.db)
    .await
    .expect("Failed to fetch teams");

    // Convert JSON into Rust structs
    let teams: Vec<Team> = teams.into_iter().map(|row| {
        Team {
            id: row.id,
            team_name: row.team_name,
            description: row.description,
            leader_id: row.leader_id,
            created_at: row.created_at,
            members: serde_json::from_value(row.members.unwrap()).unwrap(),
        }
    }).collect();

    Json(teams)
}

pub async fn fetch_team(
    State(state): State<Arc<AppState>>,
    Path(team_id): Path<i32>,
) -> Result<Json<TeamWithUsers>, (StatusCode, String)> {

    // 1. Fetch team base info
    let team_row = sqlx::query!(
        r#"
        SELECT id, team_name, description, leader_id, created_at
        FROM teams
        WHERE id = $1 AND deleted_at IS NULL
        "#,
        team_id
    )
    .fetch_optional(&*state.db)
    .await
    .map_err(internal_error)?;

    let Some(team_row) = team_row else {
        return Err((StatusCode::NOT_FOUND, "Team not found".into()));
    };

    // 2. Fetch members + user info
    let rows = sqlx::query!(
        r#"
        SELECT 
            tm.user_id,
            tm.leader,
            u.nome,
            u.email
        FROM team_members tm
        JOIN users u ON u.id = tm.user_id
        WHERE tm.team_id = $1
        ORDER BY tm.leader DESC, tm.user_id
        "#,
        team_id
    )
    .fetch_all(&*state.db)
    .await
    .map_err(internal_error)?;

    let members: Vec<MemberWithUser> = rows
        .into_iter()
        .map(|r| MemberWithUser {
            user: User {
                id: r.user_id,
                nome: r.nome,
                email: r.email,
            },
            leader: r.leader,
        })
        .collect();

    // 3. Build final response
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
    Json(payload): Json<Team>,
) -> (StatusCode, Json<Team>) {
    // DB returns Option<Vec<i32>> for members
    let row = sqlx::query!(
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
        payload.team_name,
        payload.description,
        payload.leader_id,
        payload.members.as_slice(), // &[i32]
        payload.id
    )
    .fetch_one(&*state.db)
    .await
    .expect("Failed to update team");

    // Manually map Option<Vec<i32>> → Vec<i32>
    let updated_team = Team {
        id: row.id,
        team_name: row.team_name,
        description: row.description,
        leader_id: row.leader_id,
        members: row.members.unwrap_or_default(), // <-- key line
        created_at: row.created_at,
    };

    (StatusCode::OK, Json(updated_team))
}




pub async fn add_team(
    State(state): State<Arc<AppState>>,
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
    State(state): State<Arc<AppState>>,
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
    State(state): State<Arc<AppState>>,
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
    State(state): State<Arc<AppState>>,
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
    State(state): State<Arc<AppState>>,
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

fn internal_error<E: std::fmt::Display>(err: E) -> (axum::http::StatusCode, String) {
    (
        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        format!("Internal server error: {}", err),
    )
}