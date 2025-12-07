// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.0 — UNIFIED MEMORY COMMANDS
//   Phase 2 Fusion #2: Memory #5 + MemoryModule + Singularity Memory
// ═══════════════════════════════════════════════════════════════

use titane_infinity::core::state::SingularityState;
use titane_infinity::core::modules::unified_memory::{
    MemoryStats, MemoryItem, MemoryType, MemoryTier,
};
use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Arc;
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════
//   TYPES — Serializable response structures
// ═══════════════════════════════════════════════════════════════

#[derive(Serialize, Deserialize)]
pub struct UnifiedMemoryStateResponse {
    pub stm_count: usize,
    pub mtm_count: usize,
    pub ltm_count: usize,
    pub total_memories: u64,
    pub capacity_usage: f32,
    pub compression_ratio: f32,
    pub initialized: bool,
}

#[derive(Serialize, Deserialize)]
pub struct StoreMemoryRequest {
    pub content: String,
    pub memory_type: String, // "conversation", "decision", "knowledge", etc.
    pub importance: f32,
    pub tags: Vec<String>,
}

// ═══════════════════════════════════════════════════════════════
//   COMMANDS — Tauri-invokable functions
// ═══════════════════════════════════════════════════════════════

/// Get unified memory state
/// Replaces: engine_get_memory_state() + cognitive_get_memory()
#[tauri::command]
pub async fn memory_get_state(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<UnifiedMemoryStateResponse, String> {
    let state = singularity.read().await;
    let stats = state.memory.stats();

    Ok(UnifiedMemoryStateResponse {
        stm_count: stats.stm_count,
        mtm_count: stats.mtm_count,
        ltm_count: stats.ltm_count,
        total_memories: stats.total_memories,
        capacity_usage: stats.capacity_usage,
        compression_ratio: stats.compression_ratio,
        initialized: state.memory.is_initialized(),
    })
}

/// Store new memory
/// Replaces: cognitive_store_memory()
#[tauri::command]
pub async fn memory_store(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
    request: StoreMemoryRequest,
) -> Result<String, String> {
    let mut state = singularity.write().await;

    // Parse memory type
    let memory_type = match request.memory_type.to_lowercase().as_str() {
        "conversation" => MemoryType::Conversation,
        "decision" => MemoryType::Decision,
        "knowledge" => MemoryType::Knowledge,
        "project" => MemoryType::Project,
        "ritual" => MemoryType::Ritual,
        "event" => MemoryType::Event,
        "system" => MemoryType::System,
        _ => MemoryType::Conversation, // Default
    };

    let memory_id = state.memory.store(
        request.content,
        memory_type,
        request.importance,
        request.tags,
    ).map_err(|e| format!("Failed to store memory: {:?}", e))?;

    Ok(memory_id)
}

/// Recall memories by query
/// Replaces: cognitive_get_memory()
#[tauri::command]
pub async fn memory_recall(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
    query: String,
    max_results: usize,
) -> Result<Vec<MemoryItem>, String> {
    let mut state = singularity.write().await;

    let results = state.memory.recall(&query, max_results);
    Ok(results)
}

/// Get memory statistics
#[tauri::command]
pub async fn memory_get_stats(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<MemoryStats, String> {
    let state = singularity.read().await;
    Ok(state.memory.stats())
}

/// Initialize unified memory system
#[tauri::command]
pub async fn memory_initialize(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<String, String> {
    let mut state = singularity.write().await;

    match state.memory.init() {
        Ok(_) => Ok("UnifiedMemory initialized ✅ (STM/MTM/LTM ready)".to_string()),
        Err(e) => Err(format!("Failed to initialize UnifiedMemory: {:?}", e)),
    }
}

/// Trigger memory tick (promotion + cleanup)
#[tauri::command]
pub async fn memory_tick(
    singularity: State<'_, Arc<RwLock<SingularityState>>>,
) -> Result<String, String> {
    let mut state = singularity.write().await;

    match state.memory.tick().await {
        Ok(_) => {
            let stats = state.memory.stats();
            Ok(format!(
                "Memory tick complete: STM:{} MTM:{} LTM:{}",
                stats.stm_count, stats.mtm_count, stats.ltm_count
            ))
        }
        Err(e) => Err(format!("Memory tick failed: {:?}", e)),
    }
}
