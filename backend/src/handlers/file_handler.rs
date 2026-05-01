use std::path::PathBuf;
use std::sync::Arc;
use axum::body::Body;
use axum::extract::Path;
use axum::http::{Response, header};
use axum::response::IntoResponse;
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

pub async fn download_file(
    Extension(claims): Extension<Claims>,
    Path(filename): Path<String>, // The filename sent from the frontend
) -> Result<impl IntoResponse, StatusCode> {
    
    let upload_dir = "uploads";

    // 1. Reconstruct the exact path used during upload
    // Note: In a production app, you'd usually pull this path from the DB 
    // using a Request ID to ensure the user is authorized for THIS specific file.
    let path = std::path::Path::new(upload_dir)
        .join(format!("{}", filename));

    // Check if the file exists and read it
    let content = match fs::read(&path).await {
        Ok(bytes) => bytes,
        Err(_) => return Err(StatusCode::NOT_FOUND), // File not found or permission issue
    };

    // Guess the MIME type (optional but recommended)
    // You can use the 'mime_guess' crate or hardcode it if you only allow PDFs
    let content_type = "application/octet-stream"; 

    let response = Response::builder()
        .header(header::CONTENT_TYPE, content_type)
        // 'attachment' forces the browser to download. 
        // 'filename' is what the user will see in their "Downloads" folder.
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{}\"", filename),
        )
        .body(Body::from(content))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(response)
}