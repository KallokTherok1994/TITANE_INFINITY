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
use tauri::State;

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
