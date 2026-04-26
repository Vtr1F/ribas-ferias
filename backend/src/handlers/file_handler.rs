use std::path::PathBuf;
use std::sync::Arc;
use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    Extension,
};
use bytes::Bytes;
use crate::models::auth_model::Claims;
use crate::state::AppState;
use tokio::fs; // For async file writing
use serde_json::json;

pub async fn upload_file(
    State(_state): State<Arc<AppState>>, // Prefix with _ if unused
    Extension(claims): Extension<Claims>,
    mut multipart: axum::extract::Multipart,
) -> Result<Json<serde_json::Value>, StatusCode> {
    
    // Get the field from multipart
    let field = match multipart.next_field().await {
        Ok(Some(f)) => f,
        Ok(None) => return Err(StatusCode::BAD_REQUEST),
        Err(_) => return Err(StatusCode::BAD_REQUEST),
    };

    // Extract filename
    let filename = match field.file_name() {
        Some(name) => name.to_string(),
        None => return Err(StatusCode::BAD_REQUEST),
    };

    // Extract content
    let content: Bytes = match field.bytes().await {
        Ok(bytes) => bytes,
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    };

    // Define the upload directory
    let upload_dir = "uploads";
    let user_id = claims.sub;

    // Ensure the directory exists
    if let Err(e) = fs::create_dir_all(upload_dir).await {
        eprintln!("Failed to create directory: {}", e);
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    // Build a safe path (preventing path traversal)
    // We only take the actual filename, ignoring any paths the user might have sent
    let path = std::path::Path::new(upload_dir)
        .join(format!("{}_{}", user_id, filename));

    // 7. Write the file to disk
    match fs::write(&path, content).await {
        Ok(_) => {
            println!("File saved to: {:?}", path);
            Ok(Json(json!({
                "message": "File uploaded successfully",
                "filename": filename,
                "path": path.to_string_lossy()
            })))
        }
        Err(e) => {
            eprintln!("Failed to save file: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}