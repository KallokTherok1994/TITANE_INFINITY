// ═══════════════════════════════════════════════════════════════
// TITANE∞ — AVATAR ASSET COMMANDS
// Chargement de modèles 3D pour l'avatar
// ═══════════════════════════════════════════════════════════════

use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AvatarAssetRequest {
    pub cache_key: String,
    pub format: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AvatarAssetData {
    pub mesh_path: String,
    pub texture_path: Option<String>,
    pub material_type: String,
    pub file_size: u64,
    pub checksum: String,
}

/// Charger un asset 3D pour l'avatar
#[tauri::command]
pub async fn avatar_load_asset(request: AvatarAssetRequest) -> Result<AvatarAssetData, String> {
    // Permission check
    PERMISSION_GUARD
        .require("system_read", Role::User, "avatar_load_asset")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // Validate cache_key (prevent path traversal)
    if request.cache_key.contains("..") || request.cache_key.starts_with('/') {
        return Err("Invalid cache_key: path traversal detected".to_string());
    }

    // Build asset path
    let assets_dir = PathBuf::from("assets/avatar");
    let mesh_path = assets_dir.join(format!("{}.glb", request.cache_key));
    let texture_path = assets_dir.join(format!("{}.png", request.cache_key));

    // Check if mesh exists
    if !mesh_path.exists() {
        return Err(format!(
            "Asset not found: {}. Available assets must be placed in assets/avatar/",
            request.cache_key
        ));
    }

    // Get file metadata
    let metadata = std::fs::metadata(&mesh_path)
        .map_err(|e| format!("Failed to read asset metadata: {}", e))?;

    // Compute checksum
    let content =
        std::fs::read(&mesh_path).map_err(|e| format!("Failed to read asset file: {}", e))?;
    let checksum = format!("{:x}", md5::compute(&content));

    let texture_exists = texture_path.exists();

    Ok(AvatarAssetData {
        mesh_path: mesh_path.to_string_lossy().to_string(),
        texture_path: if texture_exists {
            Some(texture_path.to_string_lossy().to_string())
        } else {
            None
        },
        material_type: request.format.unwrap_or_else(|| "pbr".to_string()),
        file_size: metadata.len(),
        checksum,
    })
}

/// Lister les assets disponibles
#[tauri::command]
pub async fn avatar_list_assets() -> Result<Vec<String>, String> {
    PERMISSION_GUARD
        .require("system_read", Role::User, "avatar_list_assets")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let assets_dir = PathBuf::from("assets/avatar");

    if !assets_dir.exists() {
        return Ok(vec![]);
    }

    let entries = std::fs::read_dir(&assets_dir)
        .map_err(|e| format!("Failed to read assets directory: {}", e))?;

    let mut assets = Vec::new();
    for entry in entries {
        if let Ok(entry) = entry {
            if let Some(name) = entry.file_name().to_str() {
                if name.ends_with(".glb") || name.ends_with(".gltf") {
                    assets.push(name.to_string());
                }
            }
        }
    }

    Ok(assets)
}
