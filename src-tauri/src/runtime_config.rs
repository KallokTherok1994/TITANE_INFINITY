// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — RUNTIME CONFIGURATION BRIDGE
//   Fournit au frontend une configuration runtime sans secrets
// ═══════════════════════════════════════════════════════════════

use crate::security::secrets_engine::{SecretsMode, SecureSecretsEngine};
use serde::Serialize;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeConfig {
    pub ollama_url: String,
    pub ollama_model: String,
    pub secrets_mode: String,
    pub gemini_configured: bool,
    pub timestamp: u64,
}

fn now_ts() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn sanitize_url(url: &str) -> String {
    // Ne pas retourner de chaîne vide (frontend attend un URL)
    let trimmed = url.trim();
    if trimmed.is_empty() {
        "http://127.0.0.1:11434".to_string()
    } else {
        trimmed.to_string()
    }
}

fn sanitize_model(model: &str) -> String {
    let trimmed = model.trim();
    if trimmed.is_empty() {
        "llama3.1".to_string()
    } else {
        trimmed.to_string()
    }
}

fn collect_runtime_config(secrets: &SecureSecretsEngine) -> RuntimeConfig {
    let ollama_url = std::env::var("OLLAMA_URL")
        .or_else(|_| std::env::var("OLLAMA_BASE_URL"))
        .unwrap_or_else(|_| "http://127.0.0.1:11434".to_string());

    let ollama_model = std::env::var("OLLAMA_MODEL")
        .or_else(|_| std::env::var("OLLAMA_DEFAULT_MODEL"))
        .unwrap_or_else(|_| "llama3.1".to_string());

    let secrets_mode = match secrets.mode() {
        SecretsMode::Encrypted { .. } => "encrypted".to_string(),
        SecretsMode::Ephemeral => "ephemeral".to_string(),
    };

    let gemini_configured = match secrets.has_secret("gemini_api_key") {
        Ok(exists) => exists,
        Err(err) => {
            log::warn!("[RuntimeConfig] Failed to inspect secrets store: {}", err);
            false
        }
    };

    RuntimeConfig {
        ollama_url: sanitize_url(&ollama_url),
        ollama_model: sanitize_model(&ollama_model),
        secrets_mode,
        gemini_configured,
        timestamp: now_ts(),
    }
}

#[tauri::command]
pub async fn get_runtime_config(
    secrets: State<'_, SecureSecretsEngine>,
) -> Result<RuntimeConfig, String> {
    Ok(collect_runtime_config(&secrets))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_collect_runtime_config_defaults() {
        let engine = SecureSecretsEngine::default();
        let config = collect_runtime_config(&engine);
        assert_eq!(config.ollama_url, "http://127.0.0.1:11434");
        assert_eq!(config.ollama_model, "llama3.1");
        assert_eq!(config.secrets_mode, "ephemeral");
        assert!(!config.gemini_configured);
    }
}
