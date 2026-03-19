mod models;
mod handlers;
mod routes;
mod database;
mod state;

use std::net::SocketAddr;
use std::sync::Arc;
use state::AppState;
use database::db::create_pool;
use dotenv::dotenv;

// Tokio makes main asynchronous
#[tokio::main]
async fn main() {

    // Load environment variables from .env file
    dotenv().ok();

    let db_url = std::env::var("DATABASE_URL")
    .expect("Database URL not found");

    // Create database connection pool
    let db_pool = create_pool(&db_url).await;


    // Run database migrations(Create tables if they dont exist, create new ones with `sqlx migrate add <migration_name>`)
    // Run `sqlx migrate run` in terminal to execute them

    // Test the database connection
    //database::db::test_query(&db_pool).await;
    let state = AppState { db: Arc::new(db_pool),};

    // Define Routes
    let app = routes::create_routes().with_state(state);

    // Start listening localhost:3000
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}