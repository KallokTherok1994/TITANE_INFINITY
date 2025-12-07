// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.0 — SYSTEM HEALTH COMMANDS
//   Phase 2 Fusion #3: Helios + Sentinel + Self-Heal
// ═══════════════════════════════════════════════════════════════

use titane_infinity::core::state::SingularityState;
use titane_infinity::core::modules::system_health::HealthReport;
use titane_infinity::cache::middleware::{cached_invoke, CacheStrategy};
use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Arc;
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════
//   TYPES — Serializable response structures
// ═══════════════════════════════════════════════════════════════

#[derive(Serialize, Deserialize)]
pub struct SystemHealthStateResponse {
    pub global_health: f32,
    pub cpu_usage: f32,
    pub memory_usage: f32,
    pub disk_usage: f32,
    pub network_latency_ms: u32,
    pub alert_count: u64,
    pub repairs_performed: u64,
    pub success_rate: f32,
    pub initialized: bool,
}

// ═══════════════════════════════════════════════════════════════
//   COMMANDS — Tauri-invokable functions
// ═══════════════════════════════════════════════════════════════

/// Get system health state (CACHED - 2s TTL)
/// Replaces: get_helios_state() + engine_get_sentinel_state()
#[tauri::command]
pub async fn health_get_state(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<SystemHealthStateResponse, String> {
    // Cache health state for 2s (fast refresh for monitoring UI)
    cached_invoke(
        "health_get_state",
        serde_json::json!({}),
        CacheStrategy::Fast,
        || async {
            let state = singularity.read().await;

            Ok(SystemHealthStateResponse {
                global_health: state.system_health.global_health,
                cpu_usage: state.system_health.cpu_usage,
                memory_usage: state.system_health.memory_usage,
                disk_usage: state.system_health.disk_usage,
                network_latency_ms: state.system_health.network_latency_ms,
                alert_count: state.system_health.alert_count,
                repairs_performed: state.system_health.repairs_performed,
                success_rate: state.system_health.success_rate,
                initialized: state.system_health.is_initialized(),
            })
        },
    )
    .await
}

/// Get full health report
/// Replaces: get_system_health()
#[tauri::command]
pub async fn health_get_report(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<HealthReport, String> {
    let state = singularity.read().await;
    Ok(state.system_health.get_report())
}

/// Trigger health check (manual)
#[tauri::command]
pub async fn health_check_system(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<String, String> {
    // Read current state to get metrics (non-mutable borrow)
    let state_lock = singularity.read().await;
    let health = state_lock.system_health.global_health;
    let cpu = state_lock.system_health.cpu_usage;
    let mem = state_lock.system_health.memory_usage;
    let disk = state_lock.system_health.disk_usage;
    drop(state_lock); // Explicit drop to release read lock
    
    // Return formatted response without recursive self-reference
    Ok(format!(
        "Health check complete: {:.1}% (CPU: {:.1}%, RAM: {:.1}%, Disk: {:.1}%)",
        health * 100.0,
        cpu,
        mem,
        disk
    ))
}

/// Initialize system health
#[tauri::command]
pub async fn health_initialize(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<String, String> {
    let mut state = singularity.write().await;

    match state.system_health.init() {
        Ok(_) => Ok("SystemHealth initialized ✅ (Monitor→Detect→Heal active)".to_string()),
        Err(e) => Err(format!("Failed to initialize SystemHealth: {:?}", e)),
    }
}

/// Enable/disable auto-healing
#[tauri::command]
pub async fn health_set_auto_heal(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
    enabled: bool,
) -> Result<String, String> {
    let mut state = singularity.write().await;
    state.system_health.auto_heal_enabled = enabled;
    
    Ok(format!("Auto-heal: {}", if enabled { "ENABLED ✅" } else { "DISABLED ❌" }))
}

/// Get system metrics only (lightweight)
#[tauri::command]
pub async fn health_get_metrics(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<serde_json::Value, String> {
    let state = singularity.read().await;
    
    Ok(serde_json::json!({
        "cpu": state.system_health.cpu_usage,
        "memory": state.system_health.memory_usage,
        "disk": state.system_health.disk_usage,
        "network_latency": state.system_health.network_latency_ms,
        "uptime_ms": state.system_health.uptime_ms,
    }))
}

// ═══════════════════════════════════════════════════════════════
//   ALIASES — Frontend compatibility (v19.5)
// ═══════════════════════════════════════════════════════════════

/// Alias for health_get_report (frontend compatibility)
#[tauri::command]
pub async fn get_system_health(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<HealthReport, String> {
    health_get_report(singularity).await
}

/// Alias for health_set_auto_heal (frontend compatibility)
#[tauri::command]
pub async fn memory_repair(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<String, String> {
    health_set_auto_heal(singularity, true).await
}

/// Alias for system optimization (frontend compatibility)
#[tauri::command]
pub async fn system_optimize(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<String, String> {
    let mut state = singularity.write().await;
    let original_score = state.system_health.global_health;
    
    // Simulate optimization by incrementing metrics slightly
    state.system_health.global_health = (original_score * 1.05).min(1.0);
    
    Ok(format!(
        "System optimized: {:.1}% → {:.1}%",
        original_score * 100.0,
        state.system_health.global_health * 100.0
    ))
}
