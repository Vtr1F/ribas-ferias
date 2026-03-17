use serde::{Serialize, Deserialize};
use crate::models::role_model::Role;

pub struct UserPrivate { // For DB
    pub id: u64,
    pub name: String,
    pub email: String,
    pub password_hash: String,
    pub birthday: String,
    pub phone: String,
    pub role: Role,
    pub superior: u64,
    pub created_at: String,
}

#[derive(Serialize, Deserialize)] 
pub struct CreateUser {
    pub name: String,
    pub email: String,
    pub birthday: String,
    pub phone: String,
}

#[derive(Serialize, Deserialize)] // For API
pub struct UserPublic {
    pub id: u64,
    pub username: String,
    pub email: String,
    pub birthday: String,
    pub phone: String,
    pub role: Role,
    pub superior: u64,
}

