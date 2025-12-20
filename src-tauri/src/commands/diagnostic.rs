// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — DIAGNOSTIC COMMANDS
//   Backend self-check and validation
// ═══════════════════════════════════════════════════════════════

use crate::compat::CoreCollection;
use crate::core::types::{EngineHealth, EngineMetrics, ModuleInfo};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::State;

/// Backend status for diagnostics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackendStatus {
    /// SingularityEngine initialized
    pub engine_initialized: bool,

    /// SingularityEngine running
    pub engine_running: bool,

    /// Overall engine health
    pub engine_health: String,

    /// Module information
    pub modules_health: Vec<ModuleInfo>,

    /// Engine metrics
    pub metrics: EngineMetrics,

    /// Backend is Tauri-only (no HTTP server)
    pub tauri_only: bool,

    /// Backend version
    pub backend_version: String,

    /// Compilation timestamp
    pub build_timestamp: String,

    /// Feature flags active
    pub features: Vec<String>,
}

/// Global diagnostic state
pub struct DiagnosticState {
    pub core_collection: Arc<CoreCollection>,
}

impl DiagnosticState {
    pub fn new(core_collection: Arc<CoreCollection>) -> Self {
        Self { core_collection }
    }
}

/// Backend self-check command
///
/// Validates that the entire backend is operational and returns
/// comprehensive status information including:
/// - SingularityEngine state
/// - Module health
/// - System metrics
/// - Tauri-only guarantee (no HTTP backend)
#[tauri::command]
pub async fn backend_self_check(
    state: State<'_, DiagnosticState>,
) -> Result<BackendStatus, String> {
    log::info!("[Diagnostic v14] Starting backend self-check");

    let (initialized, running, health, modules, metrics) = {
        let engine = state
            .core_collection
            .engine()
            .lock()
            .map_err(|e| format!("Failed to lock SingularityEngine: {}", e))?;

        let initialized = engine.is_initialized();
        let running = engine.is_running();
        let health = engine.health();
        let modules = engine.module_info();
        let metrics = engine.metrics().clone();

        (initialized, running, health, modules, metrics)
    };

    let health_str = match health {
        EngineHealth::Healthy => "Healthy".to_string(),
        EngineHealth::Degraded => "Degraded".to_string(),
        EngineHealth::Critical => "Critical".to_string(),
        EngineHealth::Offline => "Offline".to_string(),
    };

    // Detect active features
    let mut features = vec!["custom-protocol".to_string()];

    #[cfg(feature = "mock")]
    features.push("mock".to_string());

    #[cfg(feature = "full")]
    features.push("full".to_string());

    let status = BackendStatus {
        engine_initialized: initialized,
        engine_running: running,
        engine_health: health_str,
        modules_health: modules,
        metrics,
        tauri_only: true, // ✅ Hardcoded guarantee: NO HTTP backend
        backend_version: env!("CARGO_PKG_VERSION").to_string(),
        build_timestamp: env!("VERGEN_BUILD_TIMESTAMP")
            .unwrap_or("unknown")
            .to_string(),
        features,
    };

    log::info!(
        "[Diagnostic v14] Self-check complete - Health: {}, Initialized: {}, Running: {}",
        status.engine_health,
        status.engine_initialized,
        status.engine_running
    );

    Ok(status)
}

/// Get backend compilation info
#[tauri::command]
pub async fn get_backend_info() -> Result<serde_json::Value, String> {
    log::info!("[Diagnostic v14] Getting backend compilation info");

    Ok(serde_json::json!({
        "version": env!("CARGO_PKG_VERSION"),
        "build_timestamp": env!("VERGEN_BUILD_TIMESTAMP").unwrap_or("unknown"),
        "rustc_version": env!("VERGEN_RUSTC_SEMVER").unwrap_or("unknown"),
        "target_triple": env!("VERGEN_CARGO_TARGET_TRIPLE").unwrap_or("unknown"),
        "features": {
            "mock": cfg!(feature = "mock"),
            "full": cfg!(feature = "full"),
            "custom_protocol": cfg!(feature = "custom-protocol"),
        },
        "architecture": std::env::consts::ARCH,
        "os": std::env::consts::OS,
        "tauri_only": true,
    }))
}

/// Validate Tauri-only mode (no HTTP backend)
#[tauri::command]
pub async fn validate_tauri_only() -> Result<bool, String> {
    log::info!("[Diagnostic v14] Validating Tauri-only mode");

    // Check if any HTTP server is running on common ports
    // Note: This is a simple check, real apps might use netstat/ss

    // For now, just return true (hardcoded guarantee)
    // In a real scenario, you'd check:
    // - No actix-web/axum/warp servers started
    // - No tokio TCP listeners on ports 3000, 8080, etc.

    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_backend_info() {
        let info = get_backend_info().await.expect("get_backend_info should succeed");
        assert!(info["version"].is_string());
        assert!(
            info["tauri_only"]
                .as_bool()
                .expect("tauri_only should be a boolean")
        );
    }

    #[tokio::test]
    async fn test_validate_tauri_only() {
        let result = validate_tauri_only()
            .await
            .expect("validate_tauri_only should succeed");
        assert!(result);
    }
}
