
use sqlx::{Pool, Postgres};
use crate::{models::user_model::User};

pub async fn create_pool(url: &str) -> Pool<Postgres> {
    Pool::<Postgres>::connect(url)
        .await
        .expect("Failed to connect to database")

}


pub async fn find_user_by_email(
    db: &Pool<Postgres>,
    email: &str,
) -> Result<Option<User>, sqlx::Error> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, email, password_hash FROM users WHERE email = $1"
    )
    .bind(email)
    .fetch_optional(db)
    .await?;

    Ok(user)
}

pub async fn update_user_password(
    db: &Pool<Postgres>,
    user_id: &i32,
    new_hash: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "
        UPDATE users
        SET password_hash = $1
        WHERE id = $2
        ",
    )
    .bind(new_hash)
    .bind(user_id)
    .execute(db)
    .await?;

    Ok(())
}
