// TITANE_INFINITY v∞.19.5.2 — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

#![allow(dead_code)]
pub mod io;
pub mod presets;
/**
 * ═══════════════════════════════════════════════════════════════
 *   CONFIG MODULE - Unified Configuration Management
 *   Phase 2: Configuration Management UI
 * ═══════════════════════════════════════════════════════════════
 */
pub mod update;

use crate::security::secrets_engine::{SecretsMode, SecureSecretsEngine};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager, State};

/**
 * Runtime Configuration (serializable version)
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeConfig {
    pub ollama_url: String,
    pub ollama_model: String,
    pub secrets_mode: String,
    pub gemini_configured: bool,
    pub timestamp: u64,
}

/**
 * Audio Device Configuration
 *
 * Canonical audio device settings — single source of truth.
 * Both Admin Audio page and ConfigurationHub read/write here.
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioDeviceConfig {
    pub input_device_id: String,
    pub input_device_label: String,
    pub output_device_id: String,
    pub output_device_label: String,
    pub volume: f32,
    pub noise_reduction: bool,
    pub echo_cancellation: bool,
    pub auto_gain_control: bool,
}

impl Default for AudioDeviceConfig {
    fn default() -> Self {
        Self {
            input_device_id: String::new(),
            input_device_label: String::new(),
            output_device_id: String::new(),
            output_device_label: String::new(),
            volume: 1.0,
            noise_reduction: false,
            echo_cancellation: false,
            auto_gain_control: false,
        }
    }
}

/**
 * Chat Engine Configuration (serializable version)
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatEngineConfig {
    pub timeout_ms: u64,
    pub chunk_size: usize,
    pub max_tokens: usize,
    pub temperature: f32,
}

impl Default for ChatEngineConfig {
    fn default() -> Self {
        Self {
            timeout_ms: 45000,
            chunk_size: 480,
            max_tokens: 2048,
            temperature: 0.7,
        }
    }
}

/**
 * Configuration Snapshot
 *
 * Représente l'état complet de toutes les configurations du système
 * à un instant T. Utilisé pour l'affichage dans le Configuration Hub.
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigSnapshot {
    pub runtime: RuntimeConfig,
    pub chat_engine: ChatEngineConfig,
    pub timestamp: u64,
    pub version: String,
}

impl ConfigSnapshot {
    /**
     * Crée un nouveau snapshot avec les configs actuelles
     */
    pub fn new(runtime: RuntimeConfig, chat_engine: ChatEngineConfig) -> Self {
        Self {
            runtime,
            chat_engine,
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0),
            version: env!("CARGO_PKG_VERSION").to_string(),
        }
    }
}

fn build_runtime_config(
    ollama_url: String,
    ollama_model: String,
    secrets: &SecureSecretsEngine,
) -> RuntimeConfig {
    let secrets_mode = match secrets.mode() {
        SecretsMode::Encrypted { .. } => "encrypted".to_string(),
        SecretsMode::Ephemeral => "ephemeral".to_string(),
    };

    let gemini_configured = match secrets.has_secret("gemini_api_key") {
        Ok(exists) => exists,
        Err(err) => {
            log::warn!("[CONFIG] Failed to inspect Gemini secret status: {}", err);
            false
        }
    };

    RuntimeConfig {
        ollama_url,
        ollama_model,
        secrets_mode,
        gemini_configured,
        timestamp: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0),
    }
}

/**
 * Récupère un snapshot complet de toutes les configurations
 *
 * Commande Tauri: get_all_configs
 *
 * Cette commande collecte toutes les configurations du système
 * et les retourne dans un snapshot unique pour affichage dans l'UI.
 *
 * # Returns
 * - Ok(ConfigSnapshot) : Snapshot de toutes les configs
 * - Err(String) : Message d'erreur si échec
 */
#[tauri::command]
pub async fn get_all_configs(
    secrets: State<'_, SecureSecretsEngine>,
) -> Result<ConfigSnapshot, String> {
    log::info!("🎯 [CONFIG] Loading all configurations...");

    let (ollama_url, ollama_model) = update::current_runtime_values();

    // Runtime config must reflect live secrets/runtime state, not placeholders.
    let runtime = build_runtime_config(ollama_url, ollama_model, &secrets);

    let bundle = update::current_chat_bundle().await;
    let chat_engine = ChatEngineConfig {
        timeout_ms: bundle.engine.response_timeout_ms,
        chunk_size: bundle.engine.stream_chunk_size as usize,
        max_tokens: bundle.request_defaults.max_output_tokens as usize,
        temperature: bundle.request_defaults.temperature,
    };

    let snapshot = ConfigSnapshot::new(runtime, chat_engine);

    log::info!(
        "✅ [CONFIG] Configuration snapshot created (version: {})",
        snapshot.version
    );

    Ok(snapshot)
}

/**
 * Returns the persisted audio device configuration.
 * File: <app_data_dir>/audio_device_config.json
 * Returns default values if file does not exist.
 */
#[tauri::command]
pub async fn get_audio_device_config(app: AppHandle) -> Result<AudioDeviceConfig, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app_data_dir error: {}", e))?;

    let config_path = data_dir.join("audio_device_config.json");

    if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Read error: {}", e))?;
        serde_json::from_str::<AudioDeviceConfig>(&content)
            .map_err(|e| format!("Parse error: {}", e))
    } else {
        Ok(AudioDeviceConfig::default())
    }
}

/**
 * Persists the audio device configuration to disk.
 * File: <app_data_dir>/audio_device_config.json
 */
#[tauri::command]
pub async fn save_audio_device_config(
    app: AppHandle,
    config: AudioDeviceConfig,
) -> Result<(), String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app_data_dir error: {}", e))?;

    std::fs::create_dir_all(&data_dir)
        .map_err(|e| format!("mkdir error: {}", e))?;

    let config_path = data_dir.join("audio_device_config.json");
    let content = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Serialize error: {}", e))?;

    std::fs::write(&config_path, content)
        .map_err(|e| format!("Write error: {}", e))?;

    log::info!(
        "[CONFIG] audio_device_config saved: input={} output={}",
        config.input_device_id, config.output_device_id
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_runtime_config_uses_live_secrets_state() {
        let secrets = SecureSecretsEngine::default();
        let runtime = build_runtime_config(
            "http://127.0.0.1:11434".to_string(),
            "gemma2:2b".to_string(),
            &secrets,
        );

        assert!(!runtime.ollama_url.is_empty());
        assert!(!runtime.ollama_model.is_empty());
        assert!(!runtime.secrets_mode.is_empty());
    }

    #[test]
    fn test_config_snapshot_creation() {
        let runtime = RuntimeConfig {
            ollama_url: "http://test:11434".to_string(),
            ollama_model: "test-model".to_string(),
            secrets_mode: "ephemeral".to_string(),
            gemini_configured: true,
            timestamp: 0,
        };

        let chat = ChatEngineConfig::default();
        let snapshot = ConfigSnapshot::new(runtime.clone(), chat);

        assert_eq!(snapshot.runtime.ollama_url, runtime.ollama_url);
        assert_eq!(snapshot.version, env!("CARGO_PKG_VERSION"));
        assert!(snapshot.timestamp > 0);
    }
}
