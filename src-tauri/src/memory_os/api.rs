// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — MEMORY OS API COMMANDS
//   Super Prompt #12: Tauri IPC commands for Memory OS
//   Frontend integration for React DevTools
// ═══════════════════════════════════════════════════════════════

use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use uuid::Uuid;

use super::consolidator::ConsolidationResult;
use super::core::{MemoryOS, MemoryOSConfig, MemoryOSStats, RecallResult};
use super::forgetting::ForgettingResult;
use super::memory_signals::SignalStats;
use super::memory_state::{MemoryEntry, MemorySnapshot, MemoryType, TierSnapshot};

#[allow(unused_imports)]
use super::memory_state::MemoryTier;

// ═══════════════════════════════════════════════════════════════
//   GLOBAL MEMORY OS INSTANCE
// ═══════════════════════════════════════════════════════════════

/// Global Memory OS instance
pub static MEMORY_OS: Lazy<Arc<MemoryOS>> = Lazy::new(|| {
    let config = MemoryOSConfig {
        storage_path: PathBuf::from("./data/memory_os"),
        ..Default::default()
    };
    Arc::new(MemoryOS::with_config(config))
});

// ═══════════════════════════════════════════════════════════════
//   RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

/// Generic API response wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub timestamp: i64,
}

impl<T> MemoryResponse<T> {
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            timestamp: chrono::Utc::now().timestamp_millis(),
        }
    }

    pub fn err(error: impl Into<String>) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error.into()),
            timestamp: chrono::Utc::now().timestamp_millis(),
        }
    }
}

/// Store request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoreRequest {
    pub content: String,
    pub importance: f32,
    pub memory_type: String,
    pub tags: Option<Vec<String>>,
    pub embedding: Option<Vec<f32>>,
    pub source: Option<String>,
}

/// Entry response (serializable)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntryResponse {
    pub id: String,
    pub timestamp: i64,
    pub content: String,
    pub importance: f32,
    pub tier: String,
    pub memory_type: String,
    pub tags: Vec<String>,
    pub access_count: u32,
    pub last_accessed: i64,
    pub source: Option<String>,
    pub has_embedding: bool,
}

impl From<MemoryEntry> for MemoryEntryResponse {
    fn from(entry: MemoryEntry) -> Self {
        Self {
            id: entry.id.to_string(),
            timestamp: entry.timestamp,
            content: entry.content,
            importance: entry.importance,
            tier: format!("{:?}", entry.tier),
            memory_type: format!("{:?}", entry.memory_type),
            tags: entry.tags,
            access_count: entry.access_count,
            last_accessed: entry.last_accessed,
            source: entry.source,
            has_embedding: entry.embedding.is_some(),
        }
    }
}

/// Recall result response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecallResponse {
    pub entries: Vec<MemoryEntryResponse>,
    pub query: String,
    pub recall_type: String,
    pub duration_ms: u128,
    pub total_searched: usize,
}

impl From<RecallResult> for RecallResponse {
    fn from(result: RecallResult) -> Self {
        Self {
            entries: result.entries.into_iter().map(Into::into).collect(),
            query: result.query,
            recall_type: format!("{:?}", result.recall_type),
            duration_ms: result.duration_ms,
            total_searched: result.total_searched,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   TAURI COMMANDS — STORE
// ═══════════════════════════════════════════════════════════════

/// Store a new memory entry
#[tauri::command]
pub async fn memory_os_store(request: StoreRequest) -> MemoryResponse<String> {
    let memory_type = match request.memory_type.as_str() {
        "Conversation" => MemoryType::Conversation,
        "Decision" => MemoryType::Decision,
        "Knowledge" => MemoryType::Knowledge,
        "Project" => MemoryType::Project,
        "Ritual" => MemoryType::Ritual,
        "Event" => MemoryType::Event,
        "System" => MemoryType::System,
        _ => MemoryType::Custom,
    };

    let mut entry = MemoryEntry::new(request.content, request.importance, memory_type);

    if let Some(tags) = request.tags {
        entry = entry.with_tags(tags);
    }

    if let Some(embedding) = request.embedding {
        entry = entry.with_embedding(embedding);
    }

    if let Some(source) = request.source {
        entry = entry.with_source(source);
    }

    match MEMORY_OS.store(entry).await {
        Ok(id) => MemoryResponse::ok(id.to_string()),
        Err(e) => MemoryResponse::err(e.to_string()),
    }
}

/// Batch store multiple entries
#[tauri::command]
pub async fn memory_os_store_batch(requests: Vec<StoreRequest>) -> MemoryResponse<Vec<String>> {
    let mut ids = Vec::new();

    for request in requests {
        let response = memory_os_store(request).await;
        if let Some(id) = response.data {
            ids.push(id);
        }
    }

    MemoryResponse::ok(ids)
}

// ═══════════════════════════════════════════════════════════════
//   TAURI COMMANDS — RECALL
// ═══════════════════════════════════════════════════════════════

/// Recall entry by ID
#[tauri::command]
pub async fn memory_recall_by_id(id: String) -> MemoryResponse<MemoryEntryResponse> {
    let uuid = match Uuid::parse_str(&id) {
        Ok(u) => u,
        Err(_) => return MemoryResponse::err("Invalid UUID format"),
    };

    match MEMORY_OS.recall_by_id(&uuid).await {
        Some(entry) => MemoryResponse::ok(entry.into()),
        None => MemoryResponse::err("Entry not found"),
    }
}

/// Recall by keyword search
#[tauri::command]
pub async fn memory_recall_keyword(
    query: String,
    limit: Option<usize>,
) -> MemoryResponse<RecallResponse> {
    let limit = limit.unwrap_or(10);
    let result = MEMORY_OS.recall_keyword(&query, limit).await;
    MemoryResponse::ok(result.into())
}

/// Recall by semantic search (KNN)
#[tauri::command]
pub async fn memory_recall_semantic(
    embedding: Vec<f32>,
    k: Option<usize>,
) -> MemoryResponse<RecallResponse> {
    let k = k.unwrap_or(10);
    let result = MEMORY_OS.recall_semantic(&embedding, k).await;
    MemoryResponse::ok(result.into())
}

/// Recall recent entries
#[tauri::command]
pub async fn memory_recall_recent(n: Option<usize>) -> MemoryResponse<RecallResponse> {
    let n = n.unwrap_or(10);
    let result = MEMORY_OS.recall_recent(n).await;
    MemoryResponse::ok(result.into())
}

/// Recall by memory type
#[tauri::command]
pub async fn memory_recall_by_type(
    memory_type: String,
    limit: Option<usize>,
) -> MemoryResponse<RecallResponse> {
    let limit = limit.unwrap_or(10);
    let mt = match memory_type.as_str() {
        "Conversation" => MemoryType::Conversation,
        "Decision" => MemoryType::Decision,
        "Knowledge" => MemoryType::Knowledge,
        "Project" => MemoryType::Project,
        "Ritual" => MemoryType::Ritual,
        "Event" => MemoryType::Event,
        "System" => MemoryType::System,
        _ => MemoryType::Custom,
    };

    let result = MEMORY_OS.recall_by_type(mt, limit).await;
    MemoryResponse::ok(result.into())
}

/// Recall by tag
#[tauri::command]
pub async fn memory_recall_by_tag(
    tag: String,
    limit: Option<usize>,
) -> MemoryResponse<RecallResponse> {
    let limit = limit.unwrap_or(10);
    let result = MEMORY_OS.recall_by_tag(&tag, limit).await;
    MemoryResponse::ok(result.into())
}

// ═══════════════════════════════════════════════════════════════
//   TAURI COMMANDS — MANAGEMENT
// ═══════════════════════════════════════════════════════════════

/// Delete entry by ID
#[tauri::command]
pub async fn memory_os_delete(id: String) -> MemoryResponse<bool> {
    let uuid = match Uuid::parse_str(&id) {
        Ok(u) => u,
        Err(_) => return MemoryResponse::err("Invalid UUID format"),
    };

    let deleted = MEMORY_OS.delete(&uuid).await;
    MemoryResponse::ok(deleted)
}

/// Clear all memory
#[tauri::command]
pub async fn memory_clear() -> MemoryResponse<bool> {
    MEMORY_OS.clear().await;
    MemoryResponse::ok(true)
}

/// Run consolidation
#[tauri::command]
pub async fn memory_consolidate() -> MemoryResponse<ConsolidationResult> {
    let result = MEMORY_OS.consolidate().await;
    MemoryResponse::ok(result)
}

/// Run forgetting cycle
#[tauri::command]
pub async fn memory_forget() -> MemoryResponse<ForgettingResult> {
    let result = MEMORY_OS.forget().await;
    MemoryResponse::ok(result)
}

// ═══════════════════════════════════════════════════════════════
//   TAURI COMMANDS — STATUS
// ═══════════════════════════════════════════════════════════════

/// Get Memory OS statistics
#[tauri::command]
pub async fn memory_stats() -> MemoryResponse<MemoryOSStats> {
    let stats = MEMORY_OS.stats().await;
    MemoryResponse::ok(stats)
}

/// Get memory snapshot
#[tauri::command]
pub async fn memory_snapshot() -> MemoryResponse<MemorySnapshot> {
    let snapshot = MEMORY_OS.snapshot().await;
    MemoryResponse::ok(snapshot)
}

/// Get STM snapshot
#[tauri::command]
pub async fn memory_stm_snapshot() -> MemoryResponse<TierSnapshot> {
    let snapshot = MEMORY_OS.stm().snapshot().await;
    MemoryResponse::ok(snapshot)
}

/// Get MTM snapshot
#[tauri::command]
pub async fn memory_mtm_snapshot() -> MemoryResponse<TierSnapshot> {
    let snapshot = MEMORY_OS.mtm().snapshot().await;
    MemoryResponse::ok(snapshot)
}

/// Get LTM snapshot
#[tauri::command]
pub async fn memory_ltm_snapshot() -> MemoryResponse<TierSnapshot> {
    let snapshot = MEMORY_OS.ltm().snapshot().await;
    MemoryResponse::ok(snapshot)
}

/// Get signal statistics
#[tauri::command]
pub async fn memory_signal_stats() -> MemoryResponse<SignalStats> {
    let stats = MEMORY_OS.signal_bus().get_stats().await;
    MemoryResponse::ok(stats)
}

/// Get STM entries
#[tauri::command]
pub async fn memory_stm_entries() -> MemoryResponse<Vec<MemoryEntryResponse>> {
    let entries = MEMORY_OS.stm().get_all().await;
    let responses: Vec<MemoryEntryResponse> = entries.into_iter().map(Into::into).collect();
    MemoryResponse::ok(responses)
}

/// Get MTM entries
#[tauri::command]
pub async fn memory_mtm_entries() -> MemoryResponse<Vec<MemoryEntryResponse>> {
    let entries = MEMORY_OS.mtm().get_all().await;
    let responses: Vec<MemoryEntryResponse> = entries.into_iter().map(Into::into).collect();
    MemoryResponse::ok(responses)
}

/// Get all tags
#[tauri::command]
pub async fn memory_all_tags() -> MemoryResponse<std::collections::HashMap<String, usize>> {
    let tags = MEMORY_OS.indexer().get_all_tags().await;
    MemoryResponse::ok(tags)
}

// ═══════════════════════════════════════════════════════════════
//   TAURI COMMANDS — SYSTEM
// ═══════════════════════════════════════════════════════════════

/// Initialize Memory OS
#[tauri::command]
pub async fn memory_init() -> MemoryResponse<bool> {
    match MEMORY_OS.init().await {
        Ok(()) => MemoryResponse::ok(true),
        Err(e) => MemoryResponse::err(e.to_string()),
    }
}

/// Shutdown Memory OS
#[tauri::command]
pub async fn memory_shutdown() -> MemoryResponse<bool> {
    match MEMORY_OS.shutdown().await {
        Ok(()) => MemoryResponse::ok(true),
        Err(e) => MemoryResponse::err(e.to_string()),
    }
}

/// Check if Memory OS is running
#[tauri::command]
pub async fn memory_is_running() -> MemoryResponse<bool> {
    let running = MEMORY_OS.is_running().await;
    MemoryResponse::ok(running)
}

/// Get Memory OS version info
#[tauri::command]
pub async fn memory_version() -> MemoryResponse<VersionInfo> {
    MemoryResponse::ok(VersionInfo {
        version: super::MEMORY_OS_VERSION.to_string(),
        name: super::MEMORY_OS_NAME.to_string(),
        targets: TargetsInfo {
            stm_push_ms: super::targets::STM_PUSH_MS as u64,
            mtm_consolidation_ms: super::targets::MTM_CONSOLIDATION_MS as u64,
            ltm_search_ms: super::targets::LTM_SEARCH_MS as u64,
            vector_query_ms: super::targets::VECTOR_QUERY_MS as u64,
            memory_recall_ms: super::targets::MEMORY_RECALL_MS as u64,
            memory_store_ms: super::targets::MEMORY_STORE_MS as u64,
        },
        limits: LimitsInfo {
            stm_max_items: super::limits::STM_MAX_ITEMS,
            mtm_max_items: super::limits::MTM_MAX_ITEMS,
            embedding_dim: super::limits::EMBEDDING_DIM,
        },
    })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionInfo {
    pub version: String,
    pub name: String,
    pub targets: TargetsInfo,
    pub limits: LimitsInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TargetsInfo {
    pub stm_push_ms: u64,
    pub mtm_consolidation_ms: u64,
    pub ltm_search_ms: u64,
    pub vector_query_ms: u64,
    pub memory_recall_ms: u64,
    pub memory_store_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LimitsInfo {
    pub stm_max_items: usize,
    pub mtm_max_items: usize,
    pub embedding_dim: usize,
}

// ═══════════════════════════════════════════════════════════════
//   COMMAND LIST
// ═══════════════════════════════════════════════════════════════

/// Get all Memory OS command names for Tauri registration
pub fn get_command_names() -> Vec<&'static str> {
    vec![
        "memory_os_store",
        "memory_os_store_batch",
        "memory_recall_by_id",
        "memory_recall_keyword",
        "memory_recall_semantic",
        "memory_recall_recent",
        "memory_recall_by_type",
        "memory_recall_by_tag",
        "memory_os_delete",
        "memory_clear",
        "memory_consolidate",
        "memory_forget",
        "memory_stats",
        "memory_snapshot",
        "memory_stm_snapshot",
        "memory_mtm_snapshot",
        "memory_ltm_snapshot",
        "memory_signal_stats",
        "memory_stm_entries",
        "memory_mtm_entries",
        "memory_all_tags",
        "memory_init",
        "memory_shutdown",
        "memory_is_running",
        "memory_version",
    ]
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_store_command() {
        let request = StoreRequest {
            content: "Test memory".to_string(),
            importance: 0.5,
            memory_type: "Conversation".to_string(),
            tags: Some(vec!["test".to_string()]),
            embedding: None,
            source: Some("test".to_string()),
        };

        let response = memory_os_store(request).await;
        assert!(response.success);
        assert!(response.data.is_some());
    }

    #[tokio::test]
    async fn test_stats_command() {
        let response = memory_stats().await;
        assert!(response.success);
        assert!(response.data.is_some());
    }

    #[tokio::test]
    async fn test_version_command() {
        let response = memory_version().await;
        assert!(response.success);

        let info = response
            .data
            .expect("memory_version should include version info");
        assert_eq!(info.version, super::super::MEMORY_OS_VERSION);
    }

    #[tokio::test]
    async fn test_recall_keyword() {
        // Store something first
        let store_request = StoreRequest {
            content: "Unique test phrase for search".to_string(),
            importance: 0.5,
            memory_type: "Conversation".to_string(),
            tags: None,
            embedding: None,
            source: None,
        };
        memory_os_store(store_request).await;

        // Search for it
        let response = memory_recall_keyword("Unique test phrase".to_string(), Some(10)).await;
        assert!(response.success);
    }
}
