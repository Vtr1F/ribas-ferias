use std::sync::Arc;
use sqlx::{Pool, Postgres};
use crate::mailer::mailer::MailService;


#[derive(Clone)]
pub struct AppState {
    pub jwt_secret: String,
    pub db: Arc<Pool<Postgres>>,
    pub mail_service: Arc<MailService>,
}
