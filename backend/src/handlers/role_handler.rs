use axum::Json;

use crate::models::role_model::Role;

pub async fn fetch_roles () -> Json<Vec<Role>> {
    let roles = vec![
        Role {id: 1, name: "Admin".to_string() }, //Select da base de dados sqlx
        Role {id: 2, name: "Worker".to_string() },
        Role {id: 3, name: "Superior".to_string()}
    ];

    Json(roles)
} 