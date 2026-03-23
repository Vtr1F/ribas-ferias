use std::time::Instant;
use sqlx::{Pool, Postgres};

pub async fn create_pool(url: &str) -> Pool<Postgres> {
    Pool::<Postgres>::connect(url)
        .await
        .expect("Failed to connect to database")

}

// Example function to tes the database connection and query execution time
pub async fn test_query(db_pool: &Pool<Postgres>) {
    let start = Instant::now();

    let row = sqlx::query("SELECT * FROM users")
        .fetch_all(db_pool)
        .await
        .expect("Failed to execute query");

    let duration = start.elapsed();


    println!("{:#?}", row);
    println!("Query took: {:?}", duration);
}
