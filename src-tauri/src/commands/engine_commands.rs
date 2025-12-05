// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — ENGINE COMMANDS
//   Frontend-accessible commands for engine states & modules
// ═══════════════════════════════════════════════════════════════

use tauri::State;
use serde::{Serialize, Deserialize};
use crate::ai::ai_chat::AIChatState;

// ═══════════════════════════════════════════════════════════════
//   TYPES — Serializable state structures
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NexusStateResponse {
    pub health: String,
    pub coordination_count: u64,
    pub active_connections: u32,
    pub last_coordination_ms: u64,
    pub initialized: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarmoniaStateResponse {
    pub health: String,
    pub harmony_index: f32,
    pub balance_score: f32,
    pub last_check_ms: u64,
    pub initialized: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SentinelStateResponse {
    pub health: String,
    pub alert_count: u64,
    pub active_monitors: u32,
    pub protection_level: u8,
    pub last_check_ms: u64,
    pub initialized: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitionStateResponse {
    pub load: f32,
    pub active_thoughts: u32,
    pub depth: u8,
    pub last_update_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SingularityStateResponse {
    pub nexus: NexusStateResponse,
    pub harmonia: HarmoniaStateResponse,
    pub sentinel: SentinelStateResponse,
    pub cognition: CognitionStateResponse,
    pub timeline_events: u64,
    pub init_timestamp_ms: u64,
    pub last_sync_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionStateResponse {
    pub is_running: bool,
    pub evolution_count: u64,
    pub last_evolution_ms: u64,
    pub status: String,
}

// ═══════════════════════════════════════════════════════════════
//   COMMANDS — Tauri-invokable functions
// ═══════════════════════════════════════════════════════════════

/// Get Nexus module state
#[tauri::command]
pub async fn engine_get_nexus_state(
    ai_chat: State<'_, AIChatState>,
) -> Result<NexusStateResponse, String> {
    let state = ai_chat.singularity_state.read().await;

    Ok(NexusStateResponse {
        health: format!("{:?}", state.nexus.health()),
        coordination_count: state.nexus.coordination_count,
        active_connections: state.nexus.active_connections,
        last_coordination_ms: state.nexus.last_coordination_ms,
        initialized: state.nexus.is_initialized(),
    })
}

/// Get Harmonia module state
#[tauri::command]
pub async fn engine_get_harmonia_state(
    ai_chat: State<'_, AIChatState>,
) -> Result<HarmoniaStateResponse, String> {
    let state = ai_chat.singularity_state.read().await;

    Ok(HarmoniaStateResponse {
        health: format!("{:?}", state.harmonia.health()),
        harmony_index: state.harmonia.harmony_index,
        balance_score: state.harmonia.balance_score,
        last_check_ms: state.harmonia.last_check_ms,
        initialized: state.harmonia.is_initialized(),
    })
}

/// Get Sentinel module state
#[tauri::command]
pub async fn engine_get_sentinel_state(
    ai_chat: State<'_, AIChatState>,
) -> Result<SentinelStateResponse, String> {
    let state = ai_chat.singularity_state.read().await;

    Ok(SentinelStateResponse {
        health: format!("{:?}", state.sentinel.health()),
        alert_count: state.sentinel.alert_count,
        active_monitors: state.sentinel.active_monitors,
        protection_level: state.sentinel.protection_level,
        last_check_ms: state.sentinel.last_check_ms,
        initialized: state.sentinel.is_initialized(),
    })
}

/// Get Cognition state
#[tauri::command]
pub async fn engine_get_cognition_state(
    ai_chat: State<'_, AIChatState>,
) -> Result<CognitionStateResponse, String> {
    let state = ai_chat.singularity_state.read().await;

    Ok(CognitionStateResponse {
        load: state.cognition.load,
        active_thoughts: state.cognition.active_thoughts,
        depth: state.cognition.depth,
        last_update_ms: state.cognition.last_update_ms,
    })
}

/// Get full Singularity state (unified OS cognitif state)
#[tauri::command]
pub async fn engine_get_singularity_state(
    ai_chat: State<'_, AIChatState>,
) -> Result<SingularityStateResponse, String> {
    let state = ai_chat.singularity_state.read().await;

    Ok(SingularityStateResponse {
        nexus: NexusStateResponse {
            health: format!("{:?}", state.nexus.health()),
            coordination_count: state.nexus.coordination_count,
            active_connections: state.nexus.active_connections,
            last_coordination_ms: state.nexus.last_coordination_ms,
            initialized: state.nexus.is_initialized(),
        },
        harmonia: HarmoniaStateResponse {
            health: format!("{:?}", state.harmonia.health()),
            harmony_index: state.harmonia.harmony_index,
            balance_score: state.harmonia.balance_score,
            last_check_ms: state.harmonia.last_check_ms,
            initialized: state.harmonia.is_initialized(),
        },
        sentinel: SentinelStateResponse {
            health: format!("{:?}", state.sentinel.health()),
            alert_count: state.sentinel.alert_count,
            active_monitors: state.sentinel.active_monitors,
            protection_level: state.sentinel.protection_level,
            last_check_ms: state.sentinel.last_check_ms,
            initialized: state.sentinel.is_initialized(),
        },
        cognition: CognitionStateResponse {
            load: state.cognition.load,
            active_thoughts: state.cognition.active_thoughts,
            depth: state.cognition.depth,
            last_update_ms: state.cognition.last_update_ms,
        },
        timeline_events: state.timeline.event_count,
        init_timestamp_ms: state.init_timestamp_ms,
        last_sync_ms: state.last_sync_ms,
    })
}

/// Initialize Singularity Engine (idempotent)
#[tauri::command]
pub async fn engine_init_singularity(
    ai_chat: State<'_, AIChatState>,
) -> Result<String, String> {
    let mut state = ai_chat.singularity_state.write().await;

    // Initialize all modules
    state.nexus.init(&mut *state).await
        .map_err(|e| format!("Nexus init error: {:?}", e))?;

    state.harmonia.init(&mut *state).await
        .map_err(|e| format!("Harmonia init error: {:?}", e))?;

    state.sentinel.init(&mut *state).await
        .map_err(|e| format!("Sentinel init error: {:?}", e))?;

    Ok("Singularity Engine initialized ✅".to_string())
}

/// Execute engine tick (update all modules)
#[tauri::command]
pub async fn engine_tick(
    ai_chat: State<'_, AIChatState>,
) -> Result<String, String> {
    let mut state = ai_chat.singularity_state.write().await;

    // Tick all modules
    state.nexus.tick(&mut *state).await
        .map_err(|e| format!("Nexus tick error: {:?}", e))?;

    state.harmonia.tick(&mut *state).await
        .map_err(|e| format!("Harmonia tick error: {:?}", e))?;

    state.sentinel.tick(&mut *state).await
        .map_err(|e| format!("Sentinel tick error: {:?}", e))?;

    state.last_sync_ms = chrono::Utc::now().timestamp_millis() as u64;

    Ok("Engine tick complete ✅".to_string())
}

/// Get Evolution Engine state (stub for now, full implementation in Phase 5.2)
#[tauri::command]
pub async fn engine_get_evolution_state() -> Result<EvolutionStateResponse, String> {
    // For now, return a stub - will be implemented with AutoEvolutionEngine integration
    Ok(EvolutionStateResponse {
        is_running: false,
        evolution_count: 0,
        last_evolution_ms: 0,
        status: "Ready".to_string(),
    })
}
