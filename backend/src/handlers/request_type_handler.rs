use crate::models::request_type_model::RequestType;
use axum::{Json, extract::State};
use crate::state::AppState;

pub async fn fetch_types(
    State(state): State<AppState>
) -> Json<Vec<RequestType>> {

    let types: Vec<RequestType> = sqlx::query_as(
        "SELECT id, name FROM request_types"
    )
    .fetch_all(&*state.db)
    .await
    .expect("Failed to fetch request types");

    Json(types)
}