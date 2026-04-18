// TITANE_INFINITY v∞.19.5.2 — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

#![allow(dead_code)]
/**
 * ═══════════════════════════════════════════════════════════════
 *   CONFIG I/O MODULE - Import/Export Configuration
 *   Phase 2: Configuration Management UI (Day 5-6)
 * ═══════════════════════════════════════════════════════════════
 */
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Component, Path, PathBuf};
use tauri::{AppHandle, Manager};

use super::{ChatEngineConfig, ConfigSnapshot, RuntimeConfig};

const MAX_IMPORTED_CONFIG_BYTES: u64 = 1024 * 1024;

fn validate_filename(filename: &str) -> Result<(), String> {
    if filename.is_empty() {
        return Err("Nom de fichier vide".to_string());
    }
    if filename.contains('/') || filename.contains('\\') {
        return Err("Nom de fichier invalide".to_string());
    }
    Ok(())
}

fn validate_import_file_path(file_path: &str) -> Result<PathBuf, String> {
    let trimmed = file_path.trim();

    if trimmed.is_empty() {
        return Err("Chemin d'import vide".to_string());
    }

    if trimmed.contains('\0') {
        return Err("Chemin d'import contient un NUL".to_string());
    }

    if trimmed.contains("://") {
        return Err("Chemin d'import ne peut pas utiliser de scheme".to_string());
    }

    let path = Path::new(trimmed);
    if path
        .components()
        .any(|component| matches!(component, Component::ParentDir))
    {
        return Err("Path traversal interdit pour l'import de configuration".to_string());
    }

    let resolved = if path.is_absolute() {
        path.to_path_buf()
    } else {
        std::env::current_dir()
            .map_err(|e| format!("Impossible de lire le cwd: {}", e))?
            .join(path)
    };

    let metadata = fs::symlink_metadata(&resolved)
        .map_err(|e| format!("Impossible de lire le fichier d'import: {}", e))?;

    if metadata.file_type().is_symlink() {
        return Err("Import de configuration refuse pour les symlinks".to_string());
    }

    if !metadata.is_file() {
        return Err("Import de configuration reserve aux fichiers JSON locaux".to_string());
    }

    let is_json_file = resolved
        .extension()
        .and_then(|extension| extension.to_str())
        .map(|extension| extension.eq_ignore_ascii_case("json"))
        .unwrap_or(false);
    if !is_json_file {
        return Err("Import de configuration reserve aux fichiers .json".to_string());
    }

    if metadata.len() > MAX_IMPORTED_CONFIG_BYTES {
        return Err(format!(
            "Fichier d'import trop volumineux (max {} bytes)",
            MAX_IMPORTED_CONFIG_BYTES
        ));
    }

    resolved
        .canonicalize()
        .map_err(|e| format!("Impossible de resoudre le fichier d'import: {}", e))
}

/**
 * Export Configuration to JSON File
 *
 * Commande Tauri: export_config
 *
 * Exporte la configuration actuelle vers un fichier JSON.
 * Le fichier est créé dans le dossier de données de l'application.
 *
 * # Arguments
 * * `app` - Handle de l'application Tauri
 * * `filename` - Nom du fichier (sans extension, .json sera ajouté)
 *
 * # Returns
 * * Ok(String) : Chemin complet du fichier créé
 * * Err(String) : Message d'erreur
 */
#[tauri::command]
pub async fn export_config(app: AppHandle, filename: String) -> Result<String, String> {
    log::info!("📤 [CONFIG] Exporting configuration to file: {}", filename);

    // Validate filename
    validate_filename(&filename)
        .map_err(|_| "Nom de fichier invalide (pas de chemins autorisés)".to_string())?;

    // Get app data directory
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Impossible d'obtenir le dossier de données: {}", e))?;

    // Create config exports directory
    let exports_dir = data_dir.join("config_exports");
    fs::create_dir_all(&exports_dir)
        .map_err(|e| format!("Impossible de créer le dossier d'export: {}", e))?;

    // Get current config
    let (ollama_url, ollama_model) = super::update::current_runtime_values();
    let runtime = RuntimeConfig {
        ollama_url,
        ollama_model,
        secrets_mode: "encrypted".to_string(),
        gemini_configured: false,
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| format!("Impossible de calculer le timestamp UNIX: {e}"))?
            .as_secs(),
    };

    let chat_bundle = super::update::current_chat_bundle().await;
    let chat_engine = ChatEngineConfig {
        timeout_ms: chat_bundle.engine.response_timeout_ms,
        chunk_size: chat_bundle.engine.stream_chunk_size as usize,
        max_tokens: chat_bundle.request_defaults.max_output_tokens as usize,
        temperature: chat_bundle.request_defaults.temperature,
    };
    let snapshot = ConfigSnapshot::new(runtime, chat_engine);

    // Add metadata
    #[derive(Serialize)]
    struct ExportedConfig {
        config: ConfigSnapshot,
        exported_at: String,
        exported_by: String,
    }

    let exported = ExportedConfig {
        config: snapshot,
        exported_at: chrono::Utc::now().to_rfc3339(),
        exported_by: "TITANE∞ Configuration Hub".to_string(),
    };

    // Build file path
    let mut file_path = exports_dir.join(&filename);
    if !filename.ends_with(".json") {
        file_path.set_extension("json");
    }

    // Write to file
    let json = serde_json::to_string_pretty(&exported)
        .map_err(|e| format!("Échec de sérialisation JSON: {}", e))?;

    fs::write(&file_path, json).map_err(|e| format!("Échec d'écriture du fichier: {}", e))?;

    let path_str = file_path.to_string_lossy().to_string();
    log::info!("✅ [CONFIG] Configuration exported to: {}", path_str);

    Ok(path_str)
}

/**
 * Import Configuration from JSON File
 *
 * Commande Tauri: import_config
 *
 * Importe une configuration depuis un fichier JSON et l'applique.
 *
 * # Arguments
 * * `file_path` - Chemin complet du fichier JSON à importer
 *
 * # Returns
 * * Ok(ConfigSnapshot) : Configuration importée et appliquée
 * * Err(String) : Message d'erreur
 */
#[tauri::command]
pub async fn import_config(file_path: String) -> Result<ConfigSnapshot, String> {
    log::info!("📥 [CONFIG] Importing configuration from: {}", file_path);

    let resolved_path = validate_import_file_path(&file_path)?;

    // Read file
    let json = fs::read_to_string(&resolved_path)
        .map_err(|e| format!("Impossible de lire le fichier: {}", e))?;

    // Parse JSON
    #[derive(Deserialize)]
    struct ImportedConfig {
        config: ConfigSnapshot,
    }

    let imported: ImportedConfig =
        serde_json::from_str(&json).map_err(|e| format!("JSON invalide: {}", e))?;

    let config = imported.config;

    // Validate imported config
    super::update::validate_ollama_url(&config.runtime.ollama_url)?;
    super::update::validate_ollama_model(&config.runtime.ollama_model)?;
    super::update::validate_timeout_ms(config.chat_engine.timeout_ms)?;
    super::update::validate_chunk_size(config.chat_engine.chunk_size)?;
    super::update::validate_max_tokens(config.chat_engine.max_tokens)?;
    super::update::validate_temperature(config.chat_engine.temperature)?;

    super::update::persist_runtime_values(
        &config.runtime.ollama_url,
        &config.runtime.ollama_model,
    )?;
    super::update::apply_chat_engine_snapshot(&config.chat_engine).await?;

    log::info!("✅ [CONFIG] Configuration imported successfully");

    Ok(config)
}

/**
 * List Available Config Exports
 *
 * Commande Tauri: list_config_exports
 *
 * Liste tous les fichiers de configuration exportés disponibles.
 *
 * # Arguments
 * * `app` - Handle de l'application Tauri
 *
 * # Returns
 * * Ok(Vec<String>) : Liste des noms de fichiers
 * * Err(String) : Message d'erreur
 */
#[tauri::command]
pub async fn list_config_exports(app: AppHandle) -> Result<Vec<String>, String> {
    log::info!("📋 [CONFIG] Listing config exports...");

    // Get app data directory
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Impossible d'obtenir le dossier de données: {}", e))?;

    let exports_dir = data_dir.join("config_exports");

    // If directory doesn't exist, return empty list
    if !exports_dir.exists() {
        return Ok(vec![]);
    }

    // Read directory
    let entries = fs::read_dir(&exports_dir)
        .map_err(|e| format!("Impossible de lire le dossier d'export: {}", e))?;

    let mut exports = Vec::new();
    for entry in entries.flatten() {
        if let Some(filename) = entry.file_name().to_str() {
            if filename.ends_with(".json") {
                exports.push(filename.to_string());
            }
        }
    }

    exports.sort();
    log::info!("✅ [CONFIG] Found {} config export(s)", exports.len());

    Ok(exports)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_filename_validation() {
        // Valid filenames
        assert!(validate_filename("config").is_ok());
        assert!(validate_filename("my-config-2024").is_ok());
        assert!(validate_filename("backup_v1.2.3").is_ok());

        // Invalid filenames
        assert!(validate_filename("").is_err());
        assert!(validate_filename("../config").is_err());
        assert!(validate_filename("folder/config").is_err());
        assert!(validate_filename("C:\\config").is_err());
    }

    #[test]
    fn test_validate_import_file_path_accepts_local_json_file() {
        let dir = tempdir().expect("temp dir");
        let file_path = dir.path().join("config-import.json");
        fs::write(&file_path, r#"{"config":{"runtime":{"ollama_url":"http://127.0.0.1:11434","ollama_model":"gemma2:2b","secrets_mode":"encrypted","gemini_configured":false,"timestamp":1},"chat_engine":{"timeout_ms":1000,"chunk_size":256,"max_tokens":1024,"temperature":0.7}}}"#)
            .expect("config fixture should be written");

        let validated = validate_import_file_path(file_path.to_string_lossy().as_ref())
            .expect("local json import file should be accepted");

        assert_eq!(validated, file_path.canonicalize().expect("canonical file path"));
    }

    #[test]
    fn test_validate_import_file_path_rejects_path_traversal() {
        let err = validate_import_file_path("../config.json")
            .expect_err("path traversal should be rejected");

        assert!(err.contains("Path traversal"));
    }

    #[test]
    fn test_validate_import_file_path_rejects_symlink() {
        #[cfg(unix)]
        {
            use std::os::unix::fs::symlink;

            let dir = tempdir().expect("temp dir");
            let target = dir.path().join("target.json");
            let symlink_path = dir.path().join("config-link.json");
            fs::write(&target, "{}").expect("target should exist");
            symlink(&target, &symlink_path).expect("symlink should be created");

            let err = validate_import_file_path(symlink_path.to_string_lossy().as_ref())
                .expect_err("symlink should be rejected");

            assert!(err.contains("symlinks"));
        }
    }

    #[test]
    fn test_validate_import_file_path_rejects_large_file() {
        let dir = tempdir().expect("temp dir");
        let file_path = dir.path().join("oversized.json");
        fs::write(&file_path, "x".repeat((MAX_IMPORTED_CONFIG_BYTES as usize) + 1))
            .expect("oversized fixture should be written");

        let err = validate_import_file_path(file_path.to_string_lossy().as_ref())
            .expect_err("oversized file should be rejected");

        assert!(err.contains("trop volumineux"));
    }
}
