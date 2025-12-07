// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.0 — COHERENCE COMMANDS
//   Tauri commands for CoherenceEngine (Unified Coordination + Coherence)
//   Fusion: Nexus + ConsistencyEngine
// ═══════════════════════════════════════════════════════════════

use titane_infinity::ai_chat::AIChatState;
use titane_infinity::core::modules::coherence::{CoherenceReport, ConnectionReport};
use serde::{Deserialize, Serialize};
use tauri::State;

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

/// Get unified coherence engine state
/// Replaces: engine_get_nexus_state() + cognitive_check_coherence()
#[tauri::command]
pub async fn coherence_get_state(
    ai_chat: State<'_, AIChatState>,
) -> Result<CoherenceStateResponse, String> {
    let state = ai_chat.singularity_state.read().await;

    Ok(CoherenceStateResponse {
        health: format!("{:?}", state.coherence.health()),
        coordination_count: state.coherence.coordination_count,
        coherence_checks: state.coherence.coherence_checks,
        global_coherence: state.coherence.global_coherence,
        active_connections: state.coherence.active_connections,
        last_update_ms: state.coherence.last_coordination_ms,
        initialized: state.coherence.is_initialized(),
    })
}

/// Run full system coherence check
/// Replaces: cognitive_check_coherence()
#[tauri::command]
pub async fn coherence_check_system(
    ai_chat: State<'_, AIChatState>,
) -> Result<CoherenceReport, String> {
    let mut state = ai_chat.singularity_state.write().await;

    // Clone state for coherence check (avoids borrow issues)
    let state_snapshot = state.clone();
    let report = state.coherence.check_coherence(&state_snapshot);

    Ok(report)
}

/// Validate module connections
/// Replaces: Part of engine_get_nexus_state()
#[tauri::command]
pub async fn coherence_validate_connections(
    ai_chat: State<'_, AIChatState>,
) -> Result<ConnectionReport, String> {
    let mut state = ai_chat.singularity_state.write().await;

    // Clone state for validation
    let state_snapshot = state.clone();
    let report = state.coherence.validate_connections(&state_snapshot);

    Ok(report)
}

/// Get global coherence score (quick check)
#[tauri::command]
pub async fn coherence_get_score(ai_chat: State<'_, AIChatState>) -> Result<f64, String> {
    let state = ai_chat.singularity_state.read().await;
    Ok(state.coherence.global_coherence())
}

/// Initialize coherence engine (if not already initialized)
#[tauri::command]
pub async fn coherence_initialize(ai_chat: State<'_, AIChatState>) -> Result<String, String> {
    let mut state = ai_chat.singularity_state.write().await;

    match state.coherence.init() {
        Ok(_) => Ok("CoherenceEngine initialized ✅".to_string()),
        Err(e) => Err(format!("Failed to initialize CoherenceEngine: {:?}", e)),
    }
}
