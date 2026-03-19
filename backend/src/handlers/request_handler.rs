use axum::extract::Path;
use axum::http::{StatusCode};
use axum::{Json};

use crate::models::request_model::Request;
use crate::models::request_model::Status::{Pending, Accepted, Rejected};
use crate::models::request_type_model::RequestType;


pub async fn fetch_requests() -> Json<Vec<Request>> {
    let requests = vec![
        Request {id: 1, user: 1,
            request_type: RequestType{id: 1, name:"Férias".to_string()}, reason: None,
            days: [1,2,3].to_vec(), status: Some(Pending), created_at: None},
    ];
    Json(requests)
}

pub async fn fetch_user_requests(Path(_id): Path<i64>) -> Json<Vec<Request>> {
    let requests = vec![
        Request {id: 1, user: _id,
            request_type: RequestType{id: 1, name:"Férias".to_string()}, reason: None,
            days: [1,2,3].to_vec(), status: Some(Pending), created_at: None},
    ];

    Json(requests)
}

pub async fn fetch_team_requests(Path(team_id): Path<i64>) -> Json<Vec<Request>> {
    let requests = vec![
        Request {id: 1, user: 2,
            request_type: RequestType{id: 1, name:"Férias".to_string()}, reason: None,
            days: [1,2,3].to_vec(), status: Some(Pending), created_at: Some("2/12/2012".to_string())},
    ];

    Json(requests)
}

pub async fn fetch_request(Path(_id): Path<i64>) -> Json<Request> {
    let request =
        Request {id: 1, user: _id,
            request_type: RequestType{id: 1, name:"Férias".to_string()}, reason: None,
            days: [1,2,3].to_vec(), status: Some(Pending), created_at: None};

    Json(request)
}

pub async fn add_request(Json(payload): Json<Request>) -> (StatusCode, Json<Request>) {
    //save request to db + error handling
    let new_request = Request {id: 1, user: 2,
            request_type: RequestType{id: 1, name:"Férias".to_string()}, reason: None,
            days: [1,2,3].to_vec(), status: Some(Pending), created_at: Some("2/12/2012".to_string())};
        

    (StatusCode::OK, Json(new_request))
}

pub async fn accept_request(Path(_id): Path<i64>) -> (StatusCode, Json<Request>) {
    let request =
        Request {id: 1, user: _id,
            request_type: RequestType{id: 1, name:"Férias".to_string()}, reason: None,
            days: [1,2,3].to_vec(), status: Some(Accepted), created_at: None};

    (StatusCode::OK, Json(request))
}

pub async fn reject_request(Path(_id): Path<i64>) -> (StatusCode, Json<Request>) {
    let request =
        Request {id: 1, user: _id,
            request_type: RequestType{id: 1, name:"Férias".to_string()}, reason: None,
            days: [1,2,3].to_vec(), status: Some(Rejected), created_at: None};

    (StatusCode::OK, Json(request))
}