// TITANE_INFINITY v∞.19.5.2 — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

#![allow(dead_code)]
/**
 * ═══════════════════════════════════════════════════════════════
 *   CONFIG PRESETS MODULE - Named Configuration Presets
 *   Phase 2: Configuration Management UI (Day 7-8)
 * ═══════════════════════════════════════════════════════════════
 */
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::{AppHandle, Manager};

use super::ConfigSnapshot;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigPreset {
    pub name: String,
    pub description: String,
    pub config: ConfigSnapshot,
    pub created_at: String,
    pub last_used: Option<String>,
}

/**
 * Save Config as Preset
 *
 * Commande Tauri: save_config_preset
 */
#[tauri::command]
pub async fn save_config_preset(
    app: AppHandle,
    name: String,
    description: String,
) -> Result<String, String> {
    log::info!("💾 [PRESETS] Saving config preset: {}", name);

    // Validate name
    if name.is_empty() {
        return Err("Nom du preset vide".to_string());
    }
    if name.contains('/') || name.contains('\\') {
        return Err("Nom invalide (pas de chemins)".to_string());
    }

    // Get presets directory
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Impossible d'obtenir le dossier de données: {}", e))?;

    let presets_dir = data_dir.join("config_presets");
    fs::create_dir_all(&presets_dir)
        .map_err(|e| format!("Impossible de créer le dossier presets: {}", e))?;

    // Get current config
    let (ollama_url, ollama_model) = super::update::current_runtime_values();
    let runtime = super::RuntimeConfig {
        ollama_url,
        ollama_model,
        secrets_mode: "encrypted".to_string(),
        gemini_configured: false,
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or_else(|_| crate::core::utils::now_ms() / 1000),
    };

    let chat_bundle = super::update::current_chat_bundle().await;
    let chat_engine = super::ChatEngineConfig {
        timeout_ms: chat_bundle.engine.response_timeout_ms,
        chunk_size: chat_bundle.engine.stream_chunk_size as usize,
        max_tokens: chat_bundle.request_defaults.max_output_tokens as usize,
        temperature: chat_bundle.request_defaults.temperature,
    };
    let snapshot = super::ConfigSnapshot::new(runtime, chat_engine);

    // Create preset
    let preset = ConfigPreset {
        name: name.clone(),
        description,
        config: snapshot,
        created_at: chrono::Utc::now().to_rfc3339(),
        last_used: None,
    };

    // Save to file
    let file_path = presets_dir.join(format!("{}.json", name));
    let json = serde_json::to_string_pretty(&preset)
        .map_err(|e| format!("Échec de sérialisation: {}", e))?;

    fs::write(&file_path, json).map_err(|e| format!("Échec d'écriture: {}", e))?;

    log::info!("✅ [PRESETS] Preset saved: {}", name);
    Ok(name)
}

/**
 * Load Config Preset
 *
 * Commande Tauri: load_config_preset
 */
#[tauri::command]
pub async fn load_config_preset(app: AppHandle, name: String) -> Result<ConfigSnapshot, String> {
    log::info!("📥 [PRESETS] Loading preset: {}", name);

    // Get presets directory
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Impossible d'obtenir le dossier de données: {}", e))?;

    let file_path = data_dir
        .join("config_presets")
        .join(format!("{}.json", name));

    // Read file
    let json = fs::read_to_string(&file_path).map_err(|e| format!("Preset introuvable: {}", e))?;

    // Parse
    let mut preset: ConfigPreset =
        serde_json::from_str(&json).map_err(|e| format!("JSON invalide: {}", e))?;

    // Update last_used
    preset.last_used = Some(chrono::Utc::now().to_rfc3339());
    let updated_json = serde_json::to_string_pretty(&preset)
        .map_err(|e| format!("Échec de sérialisation: {}", e))?;
    fs::write(&file_path, updated_json).ok(); // Ignore errors for last_used update

    // Apply config
    super::update::persist_runtime_values(
        &preset.config.runtime.ollama_url,
        &preset.config.runtime.ollama_model,
    )?;
    super::update::apply_chat_engine_snapshot(&preset.config.chat_engine).await?;

    log::info!("✅ [PRESETS] Preset loaded: {}", name);
    Ok(preset.config)
}

/**
 * List Config Presets
 *
 * Commande Tauri: list_config_presets
 */
#[tauri::command]
pub async fn list_config_presets(app: AppHandle) -> Result<Vec<ConfigPreset>, String> {
    log::info!("📋 [PRESETS] Listing presets...");

    // Get presets directory
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Impossible d'obtenir le dossier de données: {}", e))?;

    let presets_dir = data_dir.join("config_presets");

    // If directory doesn't exist, return empty list
    if !presets_dir.exists() {
        return Ok(vec![]);
    }

    // Read directory
    let entries =
        fs::read_dir(&presets_dir).map_err(|e| format!("Impossible de lire le dossier: {}", e))?;

    let mut presets = Vec::new();
    for entry in entries.flatten() {
        if let Some(filename) = entry.file_name().to_str() {
            if filename.ends_with(".json") {
                if let Ok(json) = fs::read_to_string(entry.path()) {
                    if let Ok(preset) = serde_json::from_str::<ConfigPreset>(&json) {
                        presets.push(preset);
                    }
                }
            }
        }
    }

    // Sort by name
    presets.sort_by(|a, b| a.name.cmp(&b.name));

    log::info!("✅ [PRESETS] Found {} preset(s)", presets.len());
    Ok(presets)
}

/**
 * Delete Config Preset
 *
 * Commande Tauri: delete_config_preset
 */
#[tauri::command]
pub async fn delete_config_preset(app: AppHandle, name: String) -> Result<(), String> {
    log::info!("🗑️  [PRESETS] Deleting preset: {}", name);

    // Get presets directory
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Impossible d'obtenir le dossier de données: {}", e))?;

    let file_path = data_dir
        .join("config_presets")
        .join(format!("{}.json", name));

    // Delete file
    fs::remove_file(&file_path).map_err(|e| format!("Impossible de supprimer le preset: {}", e))?;

    log::info!("✅ [PRESETS] Preset deleted: {}", name);
    Ok(())
}
