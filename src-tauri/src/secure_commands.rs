// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   SECURE COMMANDS — Super-Prompts H, I, J, K
//   Commandes Tauri avec permissions, validation et chiffrement
// ═══════════════════════════════════════════════════════════════

use crate::security::permission_guard::PERMISSION_GUARD;
use crate::security::permissions::Role;
use crate::security::pre_boot_validation::validate_pre_boot;
use crate::security::sandbox::FileImportSandbox;
use crate::security::validation::PayloadValidator;
use serde::{Deserialize, Serialize};

/// Response format uniforme
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecureResponse<T> {
    pub ok: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> SecureResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            ok: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            ok: false,
            data: None,
            error: Some(message),
        }
    }
}

/// Import fichier sécurisé
#[tauri::command]
pub async fn secure_import_file(
    filename: String,
    data: Vec<u8>,
) -> Result<SecureResponse<String>, String> {
    // 1. Vérifier permission
    PERMISSION_GUARD
        .require("file_import", Role::User, "secure_import_file")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // 2. Valider filename
    if let Err(e) = PayloadValidator::validate_string(&filename, "filename", true) {
        return Ok(SecureResponse::error(format!("Invalid filename: {}", e)));
    }

    // 3. Import dans sandbox
    let sandbox = FileImportSandbox::new();
    match sandbox.import_file(&filename, data).await {
        Ok(imported) => {
            log::info!("✅ File imported: {} → {}", filename, imported.safe_name);
            Ok(SecureResponse::success(imported.safe_name))
        }
        Err(e) => Ok(SecureResponse::error(format!("Import failed: {}", e))),
    }
}

/// Lire fichier depuis sandbox
#[tauri::command]
pub async fn secure_read_file(safe_name: String) -> Result<SecureResponse<Vec<u8>>, String> {
    // 1. Vérifier permission
    PERMISSION_GUARD
        .require("file_read", Role::User, "secure_read_file")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // 2. Valider nom
    if let Err(e) = PayloadValidator::validate_path(&safe_name) {
        return Ok(SecureResponse::error(format!("Invalid filename: {}", e)));
    }

    // 3. Lire depuis sandbox
    let sandbox = FileImportSandbox::new();
    match sandbox.read_file(&safe_name).await {
        Ok(data) => Ok(SecureResponse::success(data)),
        Err(e) => Ok(SecureResponse::error(format!("Read failed: {}", e))),
    }
}

/// Lister fichiers sandbox
#[tauri::command]
pub async fn secure_list_files() -> Result<SecureResponse<Vec<String>>, String> {
    // 1. Vérifier permission
    PERMISSION_GUARD
        .require("file_read", Role::User, "secure_list_files")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // 2. Lister
    let sandbox = FileImportSandbox::new();
    match sandbox.list_files().await {
        Ok(files) => Ok(SecureResponse::success(files)),
        Err(e) => Ok(SecureResponse::error(format!("List failed: {}", e))),
    }
}

/// Supprimer fichier sandbox
#[tauri::command]
pub async fn secure_delete_file(safe_name: String) -> Result<SecureResponse<()>, String> {
    // 1. Vérifier permission
    PERMISSION_GUARD
        .require("file_delete", Role::System, "secure_delete_file")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // 2. Valider nom
    if let Err(e) = PayloadValidator::validate_path(&safe_name) {
        return Ok(SecureResponse::error(format!("Invalid filename: {}", e)));
    }

    // 3. Supprimer
    let sandbox = FileImportSandbox::new();
    match sandbox.delete_file(&safe_name).await {
        Ok(_) => Ok(SecureResponse::success(())),
        Err(e) => Ok(SecureResponse::error(format!("Delete failed: {}", e))),
    }
}

/// Obtenir audit log permissions
#[tauri::command]
pub async fn get_permission_audit() -> Result<SecureResponse<String>, String> {
    // 1. Vérifier permission (ROOT uniquement)
    PERMISSION_GUARD
        .require("permission_view", Role::Root, "get_permission_audit")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // 2. Exporter audit
    match PERMISSION_GUARD.export_audit(Role::Root).await {
        Ok(json) => Ok(SecureResponse::success(json)),
        Err(e) => Ok(SecureResponse::error(format!("Export failed: {}", e))),
    }
}

/// Valider message chat (anti-XSS, taille)
#[tauri::command]
pub async fn validate_chat_message(message: String) -> Result<SecureResponse<String>, String> {
    // 1. Vérifier permission
    PERMISSION_GUARD
        .require("ia_generate", Role::User, "validate_chat_message")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // 2. Valider taille
    if let Err(e) = PayloadValidator::validate_string(&message, "message", true) {
        return Ok(SecureResponse::error(format!("Invalid message: {}", e)));
    }

    // 3. Sanitize HTML
    let sanitized = PayloadValidator::sanitize_html(&message);

    Ok(SecureResponse::success(sanitized))
}

/// Vérifier intégrité système (pre-boot check)
#[tauri::command]
pub async fn check_system_integrity() -> Result<SecureResponse<String>, String> {
    use crate::security::pre_boot_validation::validate_pre_boot;

    // 1. Vérifier permission
    PERMISSION_GUARD
        .require("system_audit", Role::System, "check_system_integrity")
        .await
        .map_err(|e| format!("Permission denied: {}", e))?;

    // 2. Effectuer validation
    match validate_pre_boot().await {
        Ok(validation) => Ok(SecureResponse::success(validation.report())),
        Err(e) => Ok(SecureResponse::error(format!(
            "Integrity check failed: {}",
            e
        ))),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_secure_commands() {
        // Test validation message
        let result = validate_chat_message("Hello <script>alert('xss')</script>".to_string()).await;
        assert!(result.is_ok());

        let response = result.unwrap();
        assert!(response.ok);
        assert!(response.data.is_some());

        let sanitized = response.data.unwrap();
        assert!(!sanitized.contains("<script>"));
    }
}
