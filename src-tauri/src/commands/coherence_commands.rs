// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.0 — COHERENCE COMMANDS
//   Tauri commands for CoherenceEngine (Unified Coordination + Coherence)
//   Fusion: Nexus + ConsistencyEngine
// ═══════════════════════════════════════════════════════════════

#[allow(dead_code)]
use titane_infinity::core::state::SingularityState;
use titane_infinity::core::modules::coherence::{CoherenceReport, ConnectionReport};
use titane_infinity::cache::middleware::{cached_invoke, CacheStrategy};
use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Arc;
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════
//   TYPES — Serializable response structures
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoherenceStateResponse {
    pub health: String,
    pub coordination_count: u64,
    pub coherence_checks: u64,
    pub global_coherence: f64,
    pub active_connections: u32,
    pub last_update_ms: u64,
    pub initialized: bool,
}

// ═══════════════════════════════════════════════════════════════
//   COMMANDS — Tauri-invokable functions
// ═══════════════════════════════════════════════════════════════

/// Get unified coherence engine state (CACHED - 2s TTL)
/// Replaces: engine_get_nexus_state() + cognitive_check_coherence()
#[tauri::command]
pub async fn coherence_get_state(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<CoherenceStateResponse, String> {
    // Cache coherence state for 2s (fast refresh for real-time coordination)
    cached_invoke(
        "coherence_get_state",
        serde_json::json!({}),
        CacheStrategy::Fast,
        || async {
            let state = singularity.read().await;

            Ok(CoherenceStateResponse {
                health: format!("{:?}", state.coherence.health()),
                coordination_count: state.coherence.coordination_count,
                coherence_checks: state.coherence.coherence_checks,
                global_coherence: state.coherence.global_coherence,
                active_connections: state.coherence.active_connections,
                last_update_ms: state.coherence.last_coordination_ms,
                initialized: state.coherence.is_initialized(),
            })
        },
    )
    .await
}

/// Run full system coherence check
/// Replaces: cognitive_check_coherence()
#[tauri::command]
pub async fn coherence_check_system(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<CoherenceReport, String> {
    let mut state = singularity.write().await;

    // Clone state for coherence check (avoids borrow issues)
    let state_snapshot = state.clone();
    let report = state.coherence.check_coherence(&state_snapshot);

    Ok(report)
}

/// Validate module connections
/// Replaces: Part of engine_get_nexus_state()
#[tauri::command]
pub async fn coherence_validate_connections(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<ConnectionReport, String> {
    let mut state = singularity.write().await;

    // Clone state for validation
    let state_snapshot = state.clone();
    let report = state.coherence.validate_connections(&state_snapshot);

    Ok(report)
}

/// Get global coherence score (quick check)
#[tauri::command]
pub async fn coherence_get_score(singularity: State<'_, Arc<RwLock<SingularityState>>>) -> Result<f64, String> {
    let state = singularity.read().await;
    Ok(state.coherence.global_coherence())
}

/// Initialize coherence engine (if not already initialized)
#[tauri::command]
pub async fn coherence_initialize(singularity: State<'_, Arc<RwLock<SingularityState>>>) -> Result<String, String> {
    let mut state = singularity.write().await;

    match state.coherence.init() {
        Ok(_) => Ok("CoherenceEngine initialized ✅".to_string()),
        Err(e) => Err(format!("Failed to initialize CoherenceEngine: {:?}", e)),
    }
}
