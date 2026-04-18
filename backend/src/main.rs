mod models;
mod handlers;
mod routes;
mod database;
mod state;
mod mailer;
mod utils;
mod tests;

use axum::http::Method;
use database::db::create_pool;
use dotenv::dotenv;
use tower_http::cors::CorsLayer;
use std::{env, net::SocketAddr, sync::Arc};
use mailer::mailer::MailService;

use crate::{state::AppState};

// Tokio makes main asynchronous
#[tokio::main]
async fn main() {

    // Load environment variables from .env file
    dotenv().ok();

    let cors = CorsLayer::new()
        .allow_credentials(true)
        .allow_origin("http://localhost:5173".parse::<axum::http::HeaderValue>().unwrap())// .allow_origin(Any) para aceitar qualquer origem
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([axum::http::header::CONTENT_TYPE, axum::http::header::AUTHORIZATION]);

    let db_url = std::env::var("DATABASE_URL")
    .expect("Database URL not found");

    // Create database connection pool
    let db_pool = create_pool(&db_url).await;

    // Run database migrations(Create tables if they dont exist, create new ones with `sqlx migrate add <migration_name>`)
    // Run `sqlx migrate run` in terminal to execute them

    // Test the database connection
    //database::db::test_query(&db_pool).await;

    let jwt_secret = env::var("JWT_KEY")
        .expect("JWT_KEY should be on .env file");

        
    let state = Arc::new( AppState { 
        db: Arc::new(db_pool),
        jwt_secret: jwt_secret.clone(),
        mail_service: Arc::new(MailService::new()),
    });

    // Define Routes    
    let app = routes::create_routes(state);
    let app_with_cors = app.layer(cors);

    // Start listening localhost:3000
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server listening on {}", addr);


    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app_with_cors).await.unwrap();
}





