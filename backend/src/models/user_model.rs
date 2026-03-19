use serde::{Serialize, Deserialize};
use crate::models::role_model::Role;
use sqlx::FromRow;
use chrono::{DateTime, Utc};
use validator::Validate;

#[derive(Serialize, Deserialize, FromRow)] 
pub struct UserPrivate { // For DB
    pub id: i32,
    pub nome: String,
    pub email: String,
    pub password_hash: String,
    pub role_id: i32,
    pub superior_id: Option<i32>,
    pub dias_ferias_disponiveis: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Deserialize,FromRow,Validate)] 
pub struct CreateUser {
   #[validate(length(min = 2, message = "Nome must have at least 2 characters"))]
    pub nome: String,

    #[validate(email(message = "Invalid email format"))]
    pub email: String,

    #[validate(length(min = 8, message = "Password must be at least 8 characters"))]
    pub password: String,

    pub role_id: i32,
    pub superior_id: Option<i32>,

    #[validate(range(min = 0, message = "Dias de férias must be non-negative"))]
    pub dias_ferias_disponiveis: i32,
}

#[derive(Serialize, Deserialize, FromRow)] // For API
pub struct UserPublic {
    pub id: i32,
    pub nome: String,
    pub email: String,
    pub role: String,
    pub superior_id: Option<i32>,
    pub dias_ferias_disponiveis: i32,
}

#[derive(Deserialize, Validate,FromRow)]
pub struct UpdateUser {
    #[validate(length(min = 2))]
    pub nome: String,

    #[validate(email)]
    pub email: String,

    #[validate(range(min = 0))]
    pub dias_ferias_disponiveis: i32,

    pub role_id: i32,
    pub superior_id: Option<i32>,
}

impl UserPrivate {
    pub fn into_public(self, role: Role) -> UserPublic {
        UserPublic {
            id: self.id,
            nome: self.nome,
            email: self.email,
            role : role.name,
            superior_id: self.superior_id,
            dias_ferias_disponiveis: self.dias_ferias_disponiveis,
        }
    }
}


