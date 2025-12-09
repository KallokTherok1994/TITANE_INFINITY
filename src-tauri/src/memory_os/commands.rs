// ═══════════════════════════════════════════════════════════════
//   MEMORY OS TAURI COMMANDS
//   SUPER PROMPTS #6-7-8: DevTools API Integration
// ═══════════════════════════════════════════════════════════════

use crate::core::modules::unified_memory::UnifiedMemory;
use crate::memory_os::{
    ClusterResult, MemoryOSBridge, MemoryOSBridgeConfig, MemoryOSBridgeStats, VectorSearchResult,
};
use std::sync::Arc;
use tauri::State;
use tokio::sync::RwLock;

/// Global Memory OS Bridge state
pub struct MemoryOSState {
    pub bridge: Arc<MemoryOSBridge>,
}

impl MemoryOSState {
    pub fn new(unified_memory: Arc<RwLock<UnifiedMemory>>) -> Self {
        let config = MemoryOSBridgeConfig::default();
        let bridge = Arc::new(MemoryOSBridge::new(unified_memory, config));
        Self { bridge }
    }
}

/// Get Memory OS statistics
#[tauri::command]
pub async fn memory_os_stats(
    state: State<'_, Arc<RwLock<MemoryOSState>>>,
) -> Result<MemoryOSBridgeStats, String> {
    let state = state.read().await;
    Ok(state.bridge.stats().await)
}

/// Semantic search
#[tauri::command]
pub async fn memory_semantic_search(
    query: String,
    k: usize,
    state: State<'_, Arc<RwLock<MemoryOSState>>>,
) -> Result<Vec<VectorSearchResult>, String> {
    let state = state.read().await;
    state
        .bridge
        .semantic_search(&query, k)
        .await
        .map_err(|e| e.to_string())
}

/// Get memories by tier
#[tauri::command]
pub async fn memory_get_by_tier(
    tier: String,
    limit: usize,
    state: State<'_, Arc<RwLock<MemoryOSState>>>,
) -> Result<Vec<crate::core::modules::unified_memory::MemoryItem>, String> {
    let state = state.read().await;
    
    // For now, use recall with tier-specific query
    let query = format!("tier:{}", tier);
    let all_memories = state
        .bridge
        .recall(&query, limit)
        .await
        .map_err(|e| e.to_string())?;
    
    // Filter by tier
    let filtered: Vec<_> = all_memories
        .into_iter()
        .filter(|m| match tier.as_str() {
            "STM" => matches!(m.tier, crate::core::modules::unified_memory::MemoryTier::ShortTerm),
            "MTM" => matches!(
                m.tier,
                crate::core::modules::unified_memory::MemoryTier::MediumTerm
            ),
            "LTM" => matches!(m.tier, crate::core::modules::unified_memory::MemoryTier::LongTerm),
            _ => false,
        })
        .take(limit)
        .collect();
    
    Ok(filtered)
}

/// Cluster memories
#[tauri::command]
pub async fn memory_cluster(
    state: State<'_, Arc<RwLock<MemoryOSState>>>,
) -> Result<ClusterResult, String> {
    let state = state.read().await;
    state.bridge.cluster().await.map_err(|e| e.to_string())
}

/// Compress similar memories
#[tauri::command]
pub async fn memory_compress_similar(
    threshold: f32,
    state: State<'_, Arc<RwLock<MemoryOSState>>>,
) -> Result<u32, String> {
    let state = state.read().await;
    state
        .bridge
        .compress_similar(threshold)
        .await
        .map_err(|e| e.to_string())
}

/// Get vector for memory ID
#[tauri::command]
pub async fn memory_get_vector(
    id: String,
    _state: State<'_, Arc<RwLock<MemoryOSState>>>,
) -> Result<Vec<f32>, String> {
    // TODO: Implement get_vector in MemoryOSBridge
    // For now, return empty vector
    Ok(Vec::new())
}

/// Store memory
#[tauri::command]
pub async fn memory_store(
    content: String,
    memory_type: String,
    importance: f32,
    tags: Vec<String>,
    state: State<'_, Arc<RwLock<MemoryOSState>>>,
) -> Result<String, String> {
    let state = state.read().await;
    
    let mem_type = match memory_type.as_str() {
        "Conversation" => crate::core::modules::unified_memory::MemoryType::Conversation,
        "Decision" => crate::core::modules::unified_memory::MemoryType::Decision,
        "Knowledge" => crate::core::modules::unified_memory::MemoryType::Knowledge,
        "Project" => crate::core::modules::unified_memory::MemoryType::Project,
        _ => crate::core::modules::unified_memory::MemoryType::Conversation,
    };
    
    state
        .bridge
        .store(content, mem_type, importance, tags)
        .await
        .map_err(|e| e.to_string())
}

/// Sync UnifiedMemory to Vector Index
#[tauri::command]
pub async fn memory_sync_to_vector(
    state: State<'_, Arc<RwLock<MemoryOSState>>>,
) -> Result<u32, String> {
    let state = state.read().await;
    state
        .bridge
        .sync_to_vector_index()
        .await
        .map_err(|e| e.to_string())
}
