use std::path::PathBuf;
use std::sync::Arc;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response, Json},
    Extension,
};
use bytes::Bytes;
use tokio::fs;
use serde_json::json;
use uuid::Uuid;
use crate::models::auth_model::Claims;
use crate::state::AppState;

pub async fn get_image(Path(url): Path<String>) -> Result<Response, StatusCode> {
    let path = url.trim_start_matches('/');
    let file_path = PathBuf::from("images").join(path);

    let content = fs::read(&file_path)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    let mime = if path.ends_with(".svg") {
        "image/svg+xml"
    } else if path.ends_with(".png") {
        "image/png"
    } else if path.ends_with(".jpg") || path.ends_with(".jpeg") {
        "image/jpeg"
    } else if path.ends_with(".gif") {
        "image/gif"
    } else if path.ends_with(".webp") {
        "image/webp"
    } else {
        "application/octet-stream"
    };

    Ok((
        [(axum::http::header::CONTENT_TYPE, mime)],
        content,
    ).into_response())
}

pub async fn upload_image(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    mut multipart: axum::extract::Multipart,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let field = match multipart.next_field().await {
        Ok(Some(f)) => f,
        Ok(None) => return Err(StatusCode::BAD_REQUEST),
        Err(_) => return Err(StatusCode::BAD_REQUEST),
    };

    let filename = match field.file_name() {
        Some(name) => name.to_string(),
        None => return Err(StatusCode::BAD_REQUEST),
    };

    let content: Bytes = match field.bytes().await {
        Ok(bytes) => bytes,
        Err(_) => return Err(StatusCode::BAD_REQUEST),
    };

    let extension = filename.rsplit('.').next().unwrap_or("png").to_lowercase();
    
    let valid_extensions: [&str; 6] = ["png", "jpg", "jpeg", "gif", "svg", "webp"];
    if !valid_extensions.contains(&extension.as_str()) {
        return Err(StatusCode::UNSUPPORTED_MEDIA_TYPE);
    }

    let resized_content = if extension == "svg" {
        content.to_vec()
    } else {
        match image::load_from_memory(&content) {
            Ok(img) => {
                let resized = img.resize(200, 200, image::imageops::FilterType::Lanczos3);
                let mut buffer = Vec::new();
                let mut cursor = std::io::Cursor::new(&mut buffer);
                match extension.as_str() {
                    "png" => resized.write_to(&mut cursor, image::ImageFormat::Png),
                    "jpg" | "jpeg" => resized.write_to(&mut cursor, image::ImageFormat::Jpeg),
                    "gif" => resized.write_to(&mut cursor, image::ImageFormat::Gif),
                    "webp" => resized.write_to(&mut cursor, image::ImageFormat::WebP),
                    _ => resized.write_to(&mut cursor, image::ImageFormat::Png),
                }.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                buffer
            }
            Err(_) => content.to_vec(),
        }
    };

    let unique_filename = format!("{}.{}", Uuid::new_v4(), extension);
    let file_path = PathBuf::from("images").join(&unique_filename);

    fs::write(&file_path, &resized_content)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let url = format!("/api/images/{}", unique_filename);

    sqlx::query("UPDATE users SET avatar_url = $1 WHERE id = $2")
    .bind(&url)
    .bind(claims.sub)
    .execute(&*state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(json!({ "url": url })))
}

pub async fn get_user_image(
    State(state): State<Arc<AppState>>,
    Path(user_id): Path<i32>,
) -> Result<Response, StatusCode> {
    let row: Option<(Option<String>,)> = sqlx::query_as(
        "SELECT avatar_url FROM users WHERE id = $1"
    )
    .bind(user_id)
    .fetch_optional(&*state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let Some((avatar_url,)) = row else {
        return Err(StatusCode::NOT_FOUND);
    };

    let url = avatar_url.unwrap_or_else(|| "/images/default-avatar.svg".to_string());
    
    let filename = url.replace("/api/images/", "").replace("/images/", "");
    let file_path = PathBuf::from("images").join(&filename);

    let content = match fs::read(&file_path).await {
        Ok(c) => c,
        Err(_) => {
            let default_path = PathBuf::from("images").join("default-avatar.svg");
            fs::read(&default_path)
                .await
                .map_err(|_| StatusCode::NOT_FOUND)?
        }
    };

    let mime = if filename.ends_with(".svg") {
        "image/svg+xml"
    } else if filename.ends_with(".png") {
        "image/png"
    } else if filename.ends_with(".jpg") || filename.ends_with(".jpeg") {
        "image/jpeg"
    } else if filename.ends_with(".gif") {
        "image/gif"
    } else if filename.ends_with(".webp") {
        "image/webp"
    } else {
        "application/octet-stream"
    };

    Ok((
        [(axum::http::header::CONTENT_TYPE, mime)],
        content,
    ).into_response())
}