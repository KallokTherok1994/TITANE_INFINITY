// ═══════════════════════════════════════════════════════════════
// TITANE∞ — IDENTITY COMMANDS
// Matrice d'identité: persona, préférences, configuration
// ═══════════════════════════════════════════════════════════════

use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentityMatrix {
    pub persona_name: String,
    pub avatar_style: String,
    pub language: String,
    pub theme: String,
    pub voice_enabled: bool,
    pub preferences: HashMap<String, serde_json::Value>,
}

/// Obtenir la matrice d'identité actuelle
#[tauri::command]
pub async fn identity_get_matrix() -> Result<IdentityMatrix, String> {
    PERMISSION_GUARD
        .require("system_read", Role::User, "identity_get_matrix")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let identity_path = std::path::Path::new("data/identity_matrix.json");

    if identity_path.exists() {
        let content = std::fs::read_to_string(identity_path)
            .map_err(|e| format!("Failed to read identity matrix: {}", e))?;
        let matrix: IdentityMatrix = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse identity matrix: {}", e))?;
        return Ok(matrix);
    }

    // Valeurs par défaut
    Ok(IdentityMatrix {
        persona_name: "TITANE∞".to_string(),
        avatar_style: "default".to_string(),
        language: "fr".to_string(),
        theme: "dark".to_string(),
        voice_enabled: true,
        preferences: HashMap::new(),
    })
}

/// Sauvegarder la matrice d'identité
#[tauri::command]
pub async fn identity_save_matrix(matrix: IdentityMatrix) -> Result<(), String> {
    PERMISSION_GUARD
        .require("system_write", Role::User, "identity_save_matrix")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let identity_path = std::path::Path::new("data/identity_matrix.json");

    if let Some(parent) = identity_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create data directory: {}", e))?;
    }

    let json = serde_json::to_string_pretty(&matrix)
        .map_err(|e| format!("Failed to serialize identity matrix: {}", e))?;
    std::fs::write(identity_path, json)
        .map_err(|e| format!("Failed to write identity matrix: {}", e))?;

    Ok(())
}

/// Mettre à jour une préférence spécifique
#[tauri::command]
pub async fn identity_update_preference(
    key: String,
    value: serde_json::Value,
) -> Result<(), String> {
    PERMISSION_GUARD
        .require("system_write", Role::User, "identity_update_preference")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    let mut matrix = identity_get_matrix().await?;
    matrix.preferences.insert(key, value);
    identity_save_matrix(matrix).await
}
