use axum::Json;

use crate::models::request_type_model::RequestType;

pub async fn fetch_types () -> Json<Vec<RequestType>> {
    let types: Vec<RequestType> = vec![
        RequestType{id: 1, name: "License".to_string()},
        RequestType{id: 2, name: "Sick Day".to_string()}, //Select in sqlx
        RequestType{id: 3, name: "Vacation".to_string()}
    ];

    Json(types)
}