use axum::{routing::{get}, Router};

use crate::handlers::user_handler::{
    list_users,
    fetch_user,
    add_user,
    alter_user,
    remove_user,
};
use crate::state::AppState;

pub fn routes() -> Router<AppState> { // Added <()>
    Router::new()
        .route("/", get(list_users)
            .post(add_user))
        .route("/{id}",get(fetch_user)
            .put(alter_user)
            .delete(remove_user)
        )
}