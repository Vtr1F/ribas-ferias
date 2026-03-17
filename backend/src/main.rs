mod models;
mod handlers;
mod routes;

use std::net::SocketAddr;

// Tokio makes main asynchronous
#[tokio::main]
async fn main() {
    // Define Routes
    let app = routes::create_routes();

    // Start listening localhost:3000
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}