use axum::extract::Path;
use axum::http::{StatusCode};
use axum::{Json};
use axum::{extract::State};
use crate::state::AppState;

use crate::models::request_type_model::RequestType;
use crate::models::request_model::Request;
use crate::models::request_model::Status;
use crate::models::request_model::RequestInput;


pub async fn fetch_requests(
    State(state): State<AppState>,
) -> Json<Vec<Request>> {

    let rows = sqlx::query!(
        r#"
        SELECT 
            r.id,
            r.user_id,
            r.reason,
            r.days,
            r.status as "status: Status",
            r.created_at,
            rt.id AS rt_id,
            rt.tipo AS rt_name
        FROM requests r
        JOIN request_types rt ON rt.id = r.request_type_id
        ORDER BY r.id
        "#
    )
    .fetch_all(&*state.db)
    .await
    .expect("Failed to fetch requests");

    let requests: Vec<Request> = rows
        .into_iter()
        .map(|r| Request {
            id: r.id,
            user: r.user_id,
            reason: r.reason,
            days: r.days.unwrap_or_default(),
            status: r.status,
            created_at: r.created_at,
            request_type: RequestType {
                id: r.rt_id,
                name: r.rt_name,
            },
        })
        .collect();

    Json(requests)
}


pub async fn fetch_user_requests(
    State(state): State<AppState>,
    Path(user_id): Path<i32>,
) -> Json<Vec<Request>> {

    let rows = sqlx::query!(
        r#"
        SELECT 
            r.id,
            r.user_id,
            r.reason,
            r.days,
            r.status as "status: Status",
            r.created_at,
            rt.id AS rt_id,
            rt.tipo AS rt_name
        FROM requests r
        JOIN request_types rt ON rt.id = r.request_type_id
        WHERE r.user_id = $1
        ORDER BY r.id
        "#,
        user_id
    )
    .fetch_all(&*state.db)
    .await
    .expect("Failed to fetch user requests");

    let requests: Vec<Request> = rows
        .into_iter()
        .map(|r| Request {
            id: r.id,
            user: r.user_id,
            reason: r.reason,
            days: r.days.unwrap_or_default(),
            status: r.status,
            created_at: r.created_at,
            request_type: RequestType {
                id: r.rt_id,
                name: r.rt_name,
            },
        })
        .collect();

    Json(requests)
}


pub async fn fetch_team_requests(
    State(state): State<AppState>,
    Path(team_id): Path<i32>,
) -> Result<Json<Vec<Request>>, (StatusCode, String)> {

    // 1. Fetch team members
    let team = sqlx::query!(
        r#"SELECT members FROM teams WHERE id = $1"#,
        team_id
    )
    .fetch_optional(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let Some(team) = team else {
        return Err((StatusCode::NOT_FOUND, "Team not found".into()));
    };

    let members = team.members.unwrap_or_default(); // Vec<i32>

    if members.is_empty() {
        return Ok(Json(vec![]));
    }

    // 2. Fetch all requests from those users
    let rows = sqlx::query!(
        r#"
        SELECT 
            r.id,
            r.user_id,
            r.reason,
            r.days,
            r.status as "status: Status",
            r.created_at,
            rt.id AS rt_id,
            rt.tipo AS rt_name
        FROM requests r
        JOIN request_types rt ON rt.id = r.request_type_id
        WHERE r.user_id = ANY($1)
        ORDER BY r.id
        "#,
        &members[..]  // &[i32]
    )
    .fetch_all(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // 3. Map into your Request struct
    let requests: Vec<Request> = rows
        .into_iter()
        .map(|r| Request {
            id: r.id,
            user: r.user_id,
            reason: r.reason,
            days: r.days.unwrap_or_default(),
            status: r.status,
            created_at: r.created_at,
            request_type: RequestType {
                id: r.rt_id,
                name: r.rt_name,
            },
        })
        .collect();

    Ok(Json(requests))
}


pub async fn fetch_request(
    State(state): State<AppState>,
    Path(request_id): Path<i32>,
) -> Result<Json<Request>, (StatusCode, String)> {

    let row = sqlx::query!(
        r#"
        SELECT 
            r.id,
            r.user_id,
            r.reason,
            r.days,
            r.status as "status: Status",
            r.created_at,
            rt.id AS rt_id,
            rt.tipo AS rt_name
        FROM requests r
        JOIN request_types rt ON rt.id = r.request_type_id
        WHERE r.id = $1
        "#,
        request_id
    )
    .fetch_optional(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let Some(r) = row else {
        return Err((StatusCode::NOT_FOUND, "Request not found".into()));
    };

    let request = Request {
        id: r.id,
        user: r.user_id,
        reason: r.reason,
        days: r.days.unwrap_or_default(),
        status: r.status,
        created_at: r.created_at,
        request_type: RequestType {
            id: r.rt_id,
            name: r.rt_name,
        },
    };

    Ok(Json(request))
}


pub async fn add_request(
    State(state): State<AppState>,
    Json(payload): Json<RequestInput>,
) -> Result<(StatusCode, Json<Request>), (StatusCode, String)> {

    // Insert request with default status = 'pending'
    let row = sqlx::query!(
        r#"
        INSERT INTO requests (user_id, request_type_id, reason, days, status)
        VALUES ($1, $2, $3, $4, 'Pending')
        RETURNING
            id,
            user_id,
            reason,
            days,
            status as "status: Status",
            created_at,
            request_type_id
        "#,
        payload.user,
        payload.request_type_id,
        payload.reason,
        payload.days.as_slice(),
    )
    .fetch_one(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Fetch request type info
    let rt = sqlx::query!(
        r#"SELECT id, tipo FROM request_types WHERE id = $1"#,
        row.request_type_id
    )
    .fetch_one(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let new_request = Request {
        id: row.id,
        user: row.user_id,
        reason: row.reason,
        days: row.days.unwrap_or_default(),
        status: row.status,
        created_at: row.created_at,
        request_type: RequestType {
            id: rt.id,
            name: rt.tipo,
        },
    };

    Ok((StatusCode::OK, Json(new_request)))
}



pub async fn accept_request(
    State(state): State<AppState>,
    Path(request_id): Path<i32>,
) -> Result<(StatusCode, Json<Request>), (StatusCode, String)> {

    // 1. Update the request status
    let row = sqlx::query!(
        r#"
        UPDATE requests
        SET status = 'Accepted'
        WHERE id = $1
        RETURNING
            id,
            user_id,
            reason,
            days,
            status as "status: Status",
            created_at,
            request_type_id
        "#,
        request_id
    )
    .fetch_optional(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let Some(r) = row else {
        return Err((StatusCode::NOT_FOUND, "Request not found".into()));
    };

    // 2. Fetch request type info
    let rt = sqlx::query!(
        r#"SELECT id, tipo FROM request_types WHERE id = $1"#,
        r.request_type_id
    )
    .fetch_one(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // 3. Build final response struct
    let request = Request {
        id: r.id,
        user: r.user_id,
        reason: r.reason,
        days: r.days.unwrap_or_default(),
        status: r.status,
        created_at: r.created_at,
        request_type: RequestType {
            id: rt.id,
            name: rt.tipo,
        },
    };

    Ok((StatusCode::OK, Json(request)))
}


pub async fn reject_request(
    State(state): State<AppState>,
    Path(request_id): Path<i32>,
) -> Result<(StatusCode, Json<Request>), (StatusCode, String)> {

    // 1. Update the request status to "Rejected"
    let row = sqlx::query!(
        r#"
        UPDATE requests
        SET status = 'Rejected'
        WHERE id = $1
        RETURNING
            id,
            user_id,
            reason,
            days,
            status as "status: Status",
            created_at,
            request_type_id
        "#,
        request_id
    )
    .fetch_optional(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let Some(r) = row else {
        return Err((StatusCode::NOT_FOUND, "Request not found".into()));
    };

    // 2. Fetch the request type
    let rt = sqlx::query!(
        r#"SELECT id, tipo FROM request_types WHERE id = $1"#,
        r.request_type_id
    )
    .fetch_one(&*state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // 3. Build the final response
    let request = Request {
        id: r.id,
        user: r.user_id,
        reason: r.reason,
        days: r.days.unwrap_or_default(),
        status: r.status,
        created_at: r.created_at,
        request_type: RequestType {
            id: rt.id,
            name: rt.tipo,
        },
    };

    Ok((StatusCode::OK, Json(request)))
}
