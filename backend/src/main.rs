mod models;
mod handlers;
mod routes;

use std::{env, net::SocketAddr, sync::Arc};
use dotenvy::dotenv;

use crate::models::auth_model::AppState;

// Tokio makes main asynchronous
#[tokio::main]
async fn main() {

    dotenv().ok();

    let jwt_secret = env::var("JWT_KEY")
        .expect("JWT_KEY should be on .env file");

    let state = Arc::new(AppState {
        jwt_secret: jwt_secret.clone()
    });

    // Define Routes
    let app = routes::create_routes(state);

    // Start listening localhost:3000
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

