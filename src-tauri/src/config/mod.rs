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

use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

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
pub async fn get_all_configs() -> Result<ConfigSnapshot, String> {
    log::info!("🎯 [CONFIG] Loading all configurations...");

    // Récupérer runtime config (déjà implémenté)
    let runtime = RuntimeConfig {
        ollama_url: std::env::var("OLLAMA_BASE_URL")
            .unwrap_or_else(|_| "http://localhost:11434".to_string()),
        ollama_model: std::env::var("OLLAMA_DEFAULT_MODEL")
            .unwrap_or_else(|_| "qwen2.5:latest".to_string()),
        secrets_mode: "encrypted".to_string(), // Implementation: Get from SecureSecretsEngine.get_mode()
                                                // - Query: SecureSecretsEngine::get_encryption_mode() → "encrypted"/"plaintext"/"keyring"
                                                // - Fallback: "encrypted" if SecureSecretsEngine not initialized
        gemini_configured: false,              // Implementation: Check if Gemini API key exists in SecureSecretsEngine
                                               // - Check: SecureSecretsEngine::has_secret("gemini_api_key").await
                                               // - Validation: Optionally ping Gemini API to verify key validity
                                               // - Return: true if key exists and valid, false otherwise
        timestamp: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0),
    };

    // Récupérer chat engine config (hardcoded defaults pour l'instant)
    let chat_engine = ChatEngineConfig::default();

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

    #[tokio::test]
    async fn test_get_all_configs() {
        let result = get_all_configs().await;
        assert!(result.is_ok());

        let snapshot = result.unwrap();
        assert_eq!(snapshot.version, env!("CARGO_PKG_VERSION"));
        assert!(!snapshot.runtime.ollama_url.is_empty());
        assert!(!snapshot.runtime.ollama_model.is_empty());
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
