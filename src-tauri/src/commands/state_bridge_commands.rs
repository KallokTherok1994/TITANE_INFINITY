// ═══════════════════════════════════════════════════════════════════
//   TITANE∞ — State Bridge + System Compatibility Commands
//   Minimal, deterministic commands required by frontend OS bridges
// ═══════════════════════════════════════════════════════════════════

use crate::core::{HeliosCore, MemoryCore};
use crate::core::tapi_error::TAPIError;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::time::Instant;
use tauri::{AppHandle, Emitter, State};
use tokio::sync::RwLock;

lazy_static::lazy_static! {
    static ref APP_START: Instant = Instant::now();
}

// ────────────────────────────────────────────────────────────────
// STATE STORE (frontend StateBridge)
// ────────────────────────────────────────────────────────────────

#[derive(Debug)]
pub struct FrontendStateStore {
    inner: RwLock<HashMap<String, Value>>,
}

impl Default for FrontendStateStore {
    fn default() -> Self {
        Self {
            inner: RwLock::new(HashMap::new()),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct StateUpdateEvent {
    key: String,
    value: Value,
}

/// Simple connectivity check for Tauri bridge.
///
/// This is intentionally local-only (no network).
#[tauri::command]
pub async fn ping() -> Result<String, String> {
    Ok("pong".to_string())
}

/// Frontend OS compatibility: returns Helios-like system state.
///
/// Used by System Center + Visual Sync to read basic load metrics.
#[tauri::command]
pub async fn get_system_state(helios: State<'_, HeliosCore>) -> Result<crate::types::HeliosState, String> {
    let mut state = helios.collect().await.map_err(|e| e.to_string())?;

    state.uptime_seconds = APP_START.elapsed().as_secs();
    state.timestamp = chrono::Utc::now().timestamp();

    Ok(state)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleHealthSummary {
    pub all_healthy: bool,
    pub healthy_count: u64,
    pub total_count: u64,
    pub unhealthy_modules: Vec<String>,
}

/// Frontend OS compatibility: returns a lightweight module health summary.
///
/// The UI expects counts + list of unhealthy modules.
#[tauri::command]
pub async fn get_module_health(
    helios: State<'_, HeliosCore>,
    memory: State<'_, MemoryCore>,
    chat: State<'_, crate::overdrive::chat_orchestrator::ChatOrchestratorState>,
) -> Result<ModuleHealthSummary, String> {
    // Helios
    let helios_ok = helios.collect().await.is_ok();

    // Memory (consider issues as unhealthy)
    let memory_state = memory.get_state().await.map_err(|e| e.to_string())?;
    let memory_ok = memory_state.issues.is_empty();

    // AI (provider status is maintained by the orchestrator; treat presence as healthy)
    // chat_check_providers returns cached status; it should not block.
    let ai_ok = crate::overdrive::chat_orchestrator::chat_check_providers(chat)
        .await
        .map(|_| true)
        .unwrap_or(false);

    let mut unhealthy = Vec::new();
    if !helios_ok {
        unhealthy.push("helios".to_string());
    }
    if !memory_ok {
        unhealthy.push("memory".to_string());
    }
    if !ai_ok {
        unhealthy.push("ai".to_string());
    }

    let total_count = 3u64;
    let healthy_count = total_count.saturating_sub(unhealthy.len() as u64);

    Ok(ModuleHealthSummary {
        all_healthy: unhealthy.is_empty(),
        healthy_count,
        total_count,
        unhealthy_modules: unhealthy,
    })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreStatus {
    pub name: String,
    pub status: String,
    #[serde(rename = "lastActivity")]
    pub last_activity: String,
    pub metrics: CoreMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoreMetrics {
    pub requests: u64,
    pub errors: u64,
    pub latency: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemStatus {
    pub timestamp: String,
    pub uptime: u64,
    pub version: String,
    pub cores: SystemCores,
    pub resources: SystemResources,
    pub health: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemCores {
    pub helios: CoreStatus,
    pub nexus: CoreStatus,
    pub harmonia: CoreStatus,
    pub sentinel: CoreStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemResources {
    pub cpu: f64,
    pub memory: f64,
    pub disk: f64,
}

/// Legacy/compat command used by older SystemService.
///
/// Returns a stable shape expected by the frontend. Values are best-effort
/// based on currently-managed subsystems.
#[tauri::command]
pub async fn system_get_status(
    helios: State<'_, HeliosCore>,
    memory: State<'_, MemoryCore>,
    chat: State<'_, crate::overdrive::chat_orchestrator::ChatOrchestratorState>,
) -> Result<SystemStatus, TAPIError> {
    let helios_state = helios.collect().await.unwrap_or_default();
    let memory_state = memory.get_state().await.ok();
    let providers = crate::overdrive::chat_orchestrator::chat_get_providers_status(chat)
        .await
        .unwrap_or_default();

    let now = chrono::Utc::now();
    let uptime = APP_START.elapsed().as_secs();

    let memory_ok = memory_state
        .as_ref()
        .map(|s| s.issues.is_empty())
        .unwrap_or(false);

    let ai_ok = !providers.is_empty();

    let health = if !memory_ok {
        "degraded"
    } else if !ai_ok {
        "degraded"
    } else {
        "healthy"
    };

    let core_metrics = CoreMetrics {
        requests: 0,
        errors: 0,
        latency: 0,
    };

    let mk_core = |name: &str, status: &str| CoreStatus {
        name: name.to_string(),
        status: status.to_string(),
        last_activity: now.to_rfc3339(),
        metrics: core_metrics.clone(),
    };

    Ok(SystemStatus {
        timestamp: now.to_rfc3339(),
        uptime,
        version: env!("CARGO_PKG_VERSION").to_string(),
        cores: SystemCores {
            helios: mk_core("helios", "running"),
            nexus: mk_core("nexus", "running"),
            harmonia: mk_core("harmonia", "running"),
            sentinel: mk_core("sentinel", "running"),
        },
        resources: SystemResources {
            cpu: helios_state.cpu_usage,
            memory: helios_state.ram_used_gb,
            disk: helios_state.disk_used_gb,
        },
        health: health.to_string(),
    })
}

/// StateBridge: get complete KV state.
#[tauri::command]
pub async fn get_state(store: State<'_, FrontendStateStore>) -> Result<HashMap<String, Value>, String> {
    let map = store.inner.read().await;
    Ok(map.clone())
}

/// StateBridge: set a KV entry.
///
/// Returns `true` on success.
#[tauri::command]
pub async fn set_state(
    app: AppHandle,
    store: State<'_, FrontendStateStore>,
    key: String,
    value: Value,
) -> Result<bool, String> {
    {
        let mut map = store.inner.write().await;
        map.insert(key.clone(), value.clone());
    }

    let _ = app.emit(
        "state:update",
        StateUpdateEvent {
            key,
            value,
        },
    );

    Ok(true)
}

/// StateBridge: delete a KV entry.
///
/// Returns `true` on success.
#[tauri::command]
pub async fn delete_state(
    app: AppHandle,
    store: State<'_, FrontendStateStore>,
    key: String,
) -> Result<bool, String> {
    {
        let mut map = store.inner.write().await;
        map.remove(&key);
    }

    let _ = app.emit(
        "state:update",
        StateUpdateEvent {
            key,
            value: Value::Null,
        },
    );

    Ok(true)
}
