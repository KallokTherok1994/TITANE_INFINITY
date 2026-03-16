// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — RUNTIME CONFIGURATION BRIDGE
//   Fournit au frontend une configuration runtime sans secrets
// ═══════════════════════════════════════════════════════════════
//
// ENV FLAGS REFERENCE (all read at runtime):
//
//   OLLAMA_BASE_URL          (str)   default: "http://127.0.0.1:11434"
//   OLLAMA_DEFAULT_MODEL     (str)   default: "gemma2:2b"
//   TITANE_SECRETS_PASSPHRASE(str)   default: [INSECURE DEV DEFAULT — P0 REQUIRED IN PROD]
//   CONVOS_SEARCH            (bool)  default: true   — web search in OMEGA pipeline
//   CONVOS_SOURCES_STORE     (bool)  default: true   — store sources in memory
//   CONVOS_MEMORY_SNAPSHOTS  (bool)  default: true   — conversation snapshots
//   CONVOS_DEBUG_PANEL       (bool)  default: true   — debug panel data
//   CONVOS_MEMORY_LTM        (bool)  default: FALSE  — ⚠️ LTM disabled by default
//   TITANE_CONVOS_ALLOWLIST  (str)   default: ""     — comma-separated feature allowlist
//
// ═══════════════════════════════════════════════════════════════

use crate::security::secrets_engine::{SecretsMode, SecureSecretsEngine};
use serde::Serialize;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{State, Window};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeConfig {
    pub ollama_url: String,
    pub ollama_model: String,
    pub secrets_mode: String,
    pub gemini_configured: bool,
    /// Whether LTM (Long-Term Memory) is enabled (env: CONVOS_MEMORY_LTM, default: false)
    pub convos_ltm_enabled: bool,
    /// Whether conversation memory snapshots are enabled (env: CONVOS_MEMORY_SNAPSHOTS, default: true)
    pub convos_snapshots_enabled: bool,
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
        "gemma2:2b".to_string()
    } else {
        trimmed.to_string()
    }
}

fn collect_runtime_config(secrets: &SecureSecretsEngine) -> RuntimeConfig {
    // Prefer canonical names (OLLAMA_BASE_URL / OLLAMA_DEFAULT_MODEL), but keep
    // backward compatibility with legacy (OLLAMA_URL / OLLAMA_MODEL).
    let ollama_url = std::env::var("OLLAMA_BASE_URL")
        .or_else(|_| std::env::var("OLLAMA_URL"))
        .unwrap_or_else(|_| "http://127.0.0.1:11434".to_string());

    let ollama_model = std::env::var("OLLAMA_DEFAULT_MODEL")
        .or_else(|_| std::env::var("OLLAMA_MODEL"))
        .unwrap_or_else(|_| "gemma2:2b".to_string());

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
        convos_ltm_enabled: std::env::var("CONVOS_MEMORY_LTM")
            .map(|v| matches!(v.to_lowercase().trim(), "true" | "1" | "yes"))
            .unwrap_or(false),
        convos_snapshots_enabled: std::env::var("CONVOS_MEMORY_SNAPSHOTS")
            .map(|v| !matches!(v.to_lowercase().trim(), "false" | "0" | "no"))
            .unwrap_or(true),
        timestamp: now_ts(),
    }
}

#[tauri::command]
pub async fn get_runtime_config(
    secrets: State<'_, SecureSecretsEngine>,
) -> Result<RuntimeConfig, String> {
    log::info!("CMD:START get_runtime_config");
    let config = collect_runtime_config(&secrets);
    log::info!("CMD:END get_runtime_config ok");
    Ok(config)
}

#[tauri::command]
pub async fn boot_marker_log(window: Window, marker: String) -> Result<(), String> {
    let window_label = window.label();

    // Keep ENTRY_* markers authoritative to the main shell only.
    // Secondary windows (e.g. avatar-floating) can load in parallel and emit
    // non-blocking bootstrap noise that should not pollute release verdict logs.
    if window_label != "main" && marker.starts_with("BOOT:ENTRY_") {
        log::debug!(
            "UI_BOOT_MARKER_IGNORED label={} marker={}",
            window_label,
            marker
        );
        return Ok(());
    }

    log::info!("UI_BOOT_MARKER label={} {}", window_label, marker);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_collect_runtime_config_defaults() {
        let engine = SecureSecretsEngine::default();
        let config = collect_runtime_config(&engine);
        assert_eq!(config.ollama_url, "http://127.0.0.1:11434");
        assert_eq!(config.ollama_model, "gemma2:2b");
        assert_eq!(config.secrets_mode, "ephemeral");
        assert!(!config.gemini_configured);
        // LTM is disabled by default (P1 — must be explicitly enabled in prod)
        assert!(!config.convos_ltm_enabled);
        // Snapshots are enabled by default
        assert!(config.convos_snapshots_enabled);
    }
}
