use crate::models::role_model::Role;
use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use validator::Validate;

#[derive(Serialize, Deserialize, FromRow)]
pub struct UserPrivate {
    pub id: i32,
    pub nome: String,
    pub email: String,
    pub password_hash: String,
    pub role_id: i32,
    pub superior_id: Option<i32>,
    pub dias_ferias_disponiveis: i32,
    pub team_id: Option<i32>,
    pub birthday: Option<NaiveDate>,
    pub phone_number: Option<String>,
    pub headquarter: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Deserialize, FromRow, Validate)]
pub struct CreateUser {
    #[validate(length(min = 2, message = "Nome must have at least 2 characters"))]
    pub nome: String,

    #[validate(
        email(message = "Invalid email format"),
        custom(function = "validate_ribas_email")
    )]
    pub email: String,
    pub role_id: i32,
    pub superior_id: Option<i32>,
    pub team_id: Option<i32>,
    pub birthday: Option<NaiveDate>,
    pub phone_number: Option<String>,
    pub headquarter: Option<String>,
}

#[derive(Serialize, Deserialize, FromRow)]
pub struct UserPublic {
    pub id: i32,
    pub nome: String,
    pub email: String,
    pub role_id: i32,
    pub superior_id: Option<i32>,
    pub team_id: Option<i32>,
    pub dias_ferias_disponiveis: i32,
    pub birthday: Option<NaiveDate>,
    pub phone_number: Option<String>,
    pub headquarter: Option<String>,
}

#[derive(Deserialize, Validate, FromRow)]
pub struct UpdateUser {
    #[validate(length(min = 2))]
    pub nome: Option<String>,
    #[validate(email)]
    pub email: Option<String>,
    #[validate(range(min = 0))]
    pub dias_ferias_disponiveis: Option<i32>,
    pub role_id: Option<i32>,
    pub superior_id: Option<i32>,
    pub team_id: Option<i32>,
    pub birthday: Option<NaiveDate>,
    pub phone_number: Option<String>,
    pub headquarter: Option<String>,
}

impl UserPrivate {
    pub fn into_public(self) -> UserPublic {
        UserPublic {
            id: self.id,
            nome: self.nome,
            email: self.email,
            role_id: self.role_id,
            superior_id: self.superior_id,
            team_id: self.team_id,
            dias_ferias_disponiveis: self.dias_ferias_disponiveis,
            birthday: self.birthday,
            phone_number: self.phone_number,
            headquarter: self.headquarter,
        }
    }
}

fn validate_ribas_email(email: &str) -> Result<(), validator::ValidationError> {
    if email.ends_with("@ribas.pt") {
        Ok(())
    } else {
        Err(validator::ValidationError::new(
            "Domain must end with @ribas.pt",
        ))
    }
}

#[derive(Debug, FromRow, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub email: String,
    pub password_hash: String,
}
