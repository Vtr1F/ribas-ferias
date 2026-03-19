use axum::{routing::{get, post}, Router};
use crate::handlers::{team_handler};
use crate::state::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", get(team_handler::fetch_teams)
            .post(team_handler::add_team))
        .route("/{id}",get(team_handler::fetch_team)
            .put(team_handler::alter_team)
            .delete(team_handler::remove_team))
        .route("/{id}/{user_id}", post(team_handler::add_to_team)
            .delete(team_handler::remove_from_team)
            .put(team_handler::alter_team_lead))
}