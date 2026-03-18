use sqlx::{Pool, Postgres};

pub async fn create_pool(url: &str) -> Pool<Postgres> {
    Pool::<Postgres>::connect(url)
        .await
        .expect("Failed to connect to database")
        
}
