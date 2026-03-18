mod models;
mod handlers;
mod routes;
mod database;

use std::net::SocketAddr;
use dotenv::dotenv;
use sqlx::Row;

// Tokio makes main asynchronous
#[tokio::main]
async fn main() {

    // Load environment variables from .env file
    dotenv().ok();

    let db_pool = database::db::create_pool(&std::env::var("DB_CONNECTION_STRING")
    .expect("DB_CONNECTION_STRING must be set"))
    .await;

    // Define Routes
    let app = routes::create_routes();

    // Start listening localhost:3000
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}