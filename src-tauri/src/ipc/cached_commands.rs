// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — IPC CACHED COMMANDS
//   Phase 1.1.2: IPC Cache Integration — Public Cache Instances
// ═══════════════════════════════════════════════════════════════

use crate::ipc::cache::IPCCache;
use lazy_static::lazy_static;

// ═══════════════════════════════════════════════════════════════
//   PUBLIC CACHE INSTANCES — Ready to use in commands
// ═══════════════════════════════════════════════════════════════

lazy_static! {
    /// Fast cache (2s TTL) — High-frequency UI reads
    /// Example: health_get_state, coherence_get_state
    pub static ref FAST_CACHE: IPCCache<String> = IPCCache::new(2);

    /// Medium cache (5s TTL) — Moderate-frequency state checks
    /// Example: health_get_report, coherence_check_system
    pub static ref MEDIUM_CACHE: IPCCache<String> = IPCCache::new(5);

    /// Slow cache (10s TTL) — Low-frequency expensive ops
    /// Example: memory_search_similar, diagnostic_run_full_check
    pub static ref SLOW_CACHE: IPCCache<String> = IPCCache::new(10);
}

// ═══════════════════════════════════════════════════════════════
//   USAGE EXAMPLE
// ═══════════════════════════════════════════════════════════════

/*
// In src-tauri/src/commands/system_health_commands.rs:

#[tauri::command]
pub async fn health_get_state(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<SystemHealthStateResponse, String> {
    use crate::ipc::cached_commands::FAST_CACHE;

    Ok(FAST_CACHE.get_or_compute_async("health_state", || async {
        let state = singularity.read().await;
        SystemHealthStateResponse {
            global_health: state.system_health.global_health,
            cpu_usage: state.system_health.cpu_usage,
            memory_usage: state.system_health.memory_usage,
            disk_usage: state.system_health.disk_usage,
            network_latency_ms: state.system_health.network_latency_ms,
            alert_count: state.system_health.alert_count,
            repairs_performed: state.system_health.repairs_performed,
            success_rate: state.system_health.success_rate,
            initialized: state.system_health.is_initialized(),
        }
    }).await)
}
*/
