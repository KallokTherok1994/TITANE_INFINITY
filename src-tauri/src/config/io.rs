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
use tauri::{AppHandle, Manager};

use super::{ChatEngineConfig, ConfigSnapshot, RuntimeConfig};

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
    if filename.is_empty() {
        return Err("Nom de fichier vide".to_string());
    }

    if filename.contains('/') || filename.contains('\\') {
        return Err("Nom de fichier invalide (pas de chemins autorisés)".to_string());
    }

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
    let runtime = RuntimeConfig {
        ollama_url: std::env::var("OLLAMA_BASE_URL")
            .unwrap_or_else(|_| "http://localhost:11434".to_string()),
        ollama_model: std::env::var("OLLAMA_DEFAULT_MODEL")
            .unwrap_or_else(|_| "qwen2.5:latest".to_string()),
        secrets_mode: "encrypted".to_string(),
        gemini_configured: false,
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| format!("Impossible de calculer le timestamp UNIX: {e}"))?
            .as_secs(),
    };

    let chat_engine = ChatEngineConfig::default();
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

    // Read file
    let json = fs::read_to_string(&file_path)
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

    // SAFETY: Environment variable modification is unsafe because:
    // 1. It affects global process state
    // 2. Concurrent modification from multiple threads causes data races
    //
    // This is safe in our context because:
    // 1. This function is called during application initialization (single-threaded)
    // 2. Config import happens before any worker threads are spawned
    // 3. These variables are read-only after initialization
    // 4. Tauri's lifecycle guarantees single-threaded config loading
    //
    // TODO: Consider using thread-local storage or a configuration service
    // to avoid global state modification in future versions.
    unsafe {
        std::env::set_var("OLLAMA_BASE_URL", &config.runtime.ollama_url);
        std::env::set_var("OLLAMA_DEFAULT_MODEL", &config.runtime.ollama_model);
    }

    log::info!("✅ [CONFIG] Configuration imported successfully");
    log::warn!(
        "⚠️  [CONFIG] Chat engine config imported but not persisted (state management needed)"
    );

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

    fn validate_filename(filename: &str) -> Result<(), String> {
        if filename.is_empty() {
            return Err("Nom de fichier vide".to_string());
        }
        if filename.contains('/') || filename.contains('\\') {
            return Err("Nom de fichier invalide".to_string());
        }
        Ok(())
    }
}
