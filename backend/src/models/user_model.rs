use serde::{Serialize, Deserialize};
use crate::models::role_model::Role;
use sqlx::FromRow;
use chrono::{DateTime, Utc};

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

#[derive(Serialize, Deserialize,FromRow)] 
pub struct CreateUser {
    pub nome: String,
    pub email: String,
}

#[derive(Serialize, Deserialize, FromRow)] // For API
pub struct UserPublic {
    pub id: i32,
    pub nome: String,
    pub email: String,
    pub role: Role,
    pub superior_id: Option<i32>,
    pub dias_ferias_disponiveis: i32,
    pub created_at: String,
}

impl UserPrivate {
    pub fn into_public(self, role: Role) -> UserPublic {
        UserPublic {
            id: self.id,
            nome: self.nome,
            email: self.email,
            role,
            superior_id: self.superior_id,
            dias_ferias_disponiveis: self.dias_ferias_disponiveis,
            created_at: self.created_at.to_rfc3339(),
        }
    }
}


