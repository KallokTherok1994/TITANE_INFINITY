// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — MEMORY OS UNIFIED INTERFACE
//   Super Prompt #12: Neural Memory System Main Interface
//   Target: <20ms recall, <5ms store, <300MB RAM
// ═══════════════════════════════════════════════════════════════

use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::consolidator::{ConsolidationResult, Consolidator};
use super::forgetting::{ForgettingEngine, ForgettingResult};
use super::indexer::{IndexStats, MemoryIndexer};
use super::ltm::LongTermMemory;
use super::memory_signals::{MemorySignalBus, SearchType};
use super::memory_state::{MemoryEntry, MemorySnapshot, MemoryTier, MemoryType};
use super::mtm::MidTermMemory;
use super::stm::ShortTermMemory;
use super::vector_store::VectorStore;

// Allow unused for potential future use
#[allow(unused_imports)]
use super::consolidator::ConsolidatorConfig;
#[allow(unused_imports)]
use super::forgetting::ForgettingConfig;
#[allow(unused_imports)]
use super::vector_store::VectorSearchResult;

// Logging macros
macro_rules! log_info {
    ($($arg:tt)*) => {
        log::info!($($arg)*);
    };
}

macro_rules! log_warn {
    ($($arg:tt)*) => {
        log::warn!($($arg)*);
    };
}

/// Memory OS configuration
#[derive(Debug, Clone)]
pub struct MemoryOSConfig {
    /// STM maximum items
    pub stm_max_items: usize,
    /// MTM maximum items
    pub mtm_max_items: usize,
    /// MTM minimum items
    pub mtm_min_items: usize,
    /// Vector embedding dimension
    pub embedding_dim: usize,
    /// LTM storage path
    pub storage_path: PathBuf,
    /// Enable auto-consolidation
    pub auto_consolidate: bool,
    /// Consolidation interval (ms)
    pub consolidation_interval_ms: u64,
    /// Enable forgetting engine
    pub enable_forgetting: bool,
    /// Forgetting interval (ms)
    pub forgetting_interval_ms: u64,
}

impl Default for MemoryOSConfig {
    fn default() -> Self {
        Self {
            stm_max_items: super::limits::STM_MAX_ITEMS,
            mtm_max_items: super::limits::MTM_MAX_ITEMS,
            mtm_min_items: 50,
            embedding_dim: super::limits::EMBEDDING_DIM,
            storage_path: PathBuf::from("./data/memory"),
            auto_consolidate: true,
            consolidation_interval_ms: 60_000, // 1 minute
            enable_forgetting: true,
            forgetting_interval_ms: 300_000, // 5 minutes
        }
    }
}

/// Memory recall result
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RecallResult {
    pub entries: Vec<MemoryEntry>,
    pub query: String,
    pub recall_type: RecallType,
    pub duration_ms: u128,
    pub total_searched: usize,
}

/// Recall types
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum RecallType {
    Keyword,
    Semantic,
    ById,
    Recent,
    ByType,
    ByTag,
}

/// Memory OS statistics
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MemoryOSStats {
    pub stm_count: usize,
    pub mtm_count: usize,
    pub ltm_count: usize,
    pub vector_count: usize,
    pub total_entries: usize,
    pub index_stats: IndexStats,
    pub last_consolidation: Option<ConsolidationResult>,
    pub last_forgetting: Option<ForgettingResult>,
    pub uptime_ms: u64,
}

/// TITANE∞ Memory OS - Unified Neural Memory System
///
/// Provides a unified interface for all memory operations:
/// - Hierarchical storage: STM → MTM → LTM
/// - Semantic search with vector embeddings
/// - Automatic consolidation and forgetting
/// - Event signals for Kernel integration
///
/// Performance targets:
/// - Recall: <20ms
/// - Store: <5ms
/// - RAM: <300MB
#[derive(Debug)]
pub struct MemoryOS {
    /// Short-Term Memory
    stm: ShortTermMemory,
    /// Mid-Term Memory
    mtm: MidTermMemory,
    /// Long-Term Memory
    ltm: LongTermMemory,
    /// Vector Store for semantic search
    vector_store: VectorStore,
    /// Memory Indexer
    indexer: MemoryIndexer,
    /// Consolidator
    consolidator: Consolidator,
    /// Forgetting Engine
    forgetting_engine: ForgettingEngine,
    /// Signal Bus
    signal_bus: MemorySignalBus,
    /// Configuration
    config: Arc<RwLock<MemoryOSConfig>>,
    /// Initialization timestamp
    init_timestamp: i64,
    /// Running flag
    running: Arc<RwLock<bool>>,
}

impl MemoryOS {
    /// Create new Memory OS with default configuration
    pub fn new() -> Self {
        Self::with_config(MemoryOSConfig::default())
    }

    /// Create Memory OS with custom configuration
    pub fn with_config(config: MemoryOSConfig) -> Self {
        Self {
            stm: ShortTermMemory::with_capacity(config.stm_max_items),
            mtm: MidTermMemory::with_capacity(config.mtm_max_items, config.mtm_min_items),
            ltm: LongTermMemory::new(config.storage_path.clone()),
            vector_store: VectorStore::with_dim(config.embedding_dim),
            indexer: MemoryIndexer::new(),
            consolidator: Consolidator::new(),
            forgetting_engine: ForgettingEngine::new(),
            signal_bus: MemorySignalBus::new(),
            config: Arc::new(RwLock::new(config)),
            init_timestamp: chrono::Utc::now().timestamp_millis(),
            running: Arc::new(RwLock::new(false)),
        }
    }

    /// Initialize Memory OS (load LTM index, etc.)
    pub async fn init(&self) -> Result<(), MemoryOSError> {
        let start = std::time::Instant::now();

        // Initialize LTM (load index)
        self.ltm
            .init()
            .await
            .map_err(|e| MemoryOSError::InitError(e.to_string()))?;

        // Emit system event
        self.signal_bus
            .emit_system_event(super::memory_signals::SystemMemoryEvent::Initialized)
            .await;

        *self.running.write().await = true;

        log_info!("Memory OS initialized in {}ms", start.elapsed().as_millis());

        Ok(())
    }

    /// Shutdown Memory OS
    pub async fn shutdown(&self) -> Result<(), MemoryOSError> {
        *self.running.write().await = false;

        // Sync LTM to disk
        self.ltm
            .sync()
            .await
            .map_err(|e| MemoryOSError::StorageError(e.to_string()))?;

        // Emit shutdown signal
        self.signal_bus
            .emit_system_event(super::memory_signals::SystemMemoryEvent::Shutdown)
            .await;

        log_info!("Memory OS shutdown complete");
        Ok(())
    }

    // ═══════════════════════════════════════════════════════════════
    //   STORE OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    /// Store a new memory entry
    /// Automatically routes to appropriate tier based on importance
    pub async fn store(&self, mut entry: MemoryEntry) -> Result<Uuid, MemoryOSError> {
        let start = std::time::Instant::now();
        let id = entry.id;

        // Route based on importance
        if entry.importance >= 0.8 {
            // High importance → MTM directly
            entry.tier = MemoryTier::MTM;
            self.mtm.add(entry.clone()).await;
        } else {
            // Normal → STM first
            entry.tier = MemoryTier::STM;
            if let Some(overflow) = self.stm.push(entry.clone()).await {
                // STM overflow → MTM
                self.mtm.add(overflow).await;
            }
        }

        // Index the entry
        self.indexer.index(&entry).await;

        // Add to vector store if embedding present
        if entry.embedding.is_some() {
            let _ = self.vector_store.insert(&entry).await;
        }

        // Emit signal
        self.signal_bus.emit_stored(&entry).await;

        let duration = start.elapsed().as_millis();
        if duration > super::targets::MEMORY_STORE_MS {
            log_warn!("Store exceeded target: {}ms", duration);
        }

        Ok(id)
    }

    /// Store entry with embedding
    pub async fn store_with_embedding(
        &self,
        content: String,
        importance: f32,
        memory_type: MemoryType,
        embedding: Vec<f32>,
    ) -> Result<Uuid, MemoryOSError> {
        let entry = MemoryEntry::new(content, importance, memory_type).with_embedding(embedding);
        self.store(entry).await
    }

    /// Batch store multiple entries
    pub async fn store_batch(&self, entries: Vec<MemoryEntry>) -> Vec<Result<Uuid, MemoryOSError>> {
        let mut results = Vec::with_capacity(entries.len());
        for entry in entries {
            results.push(self.store(entry).await);
        }
        results
    }

    // ═══════════════════════════════════════════════════════════════
    //   RECALL OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    /// Recall entry by ID (searches all tiers)
    pub async fn recall_by_id(&self, id: &Uuid) -> Option<MemoryEntry> {
        let start = std::time::Instant::now();

        // Check STM first
        if let Some(entry) = self.stm.get_and_access(id).await {
            self.signal_bus.emit_accessed(&entry).await;
            self.check_recall_performance(start.elapsed().as_millis());
            return Some(entry);
        }

        // Check MTM
        if let Some(entry) = self.mtm.get_and_access(id).await {
            self.signal_bus.emit_accessed(&entry).await;
            self.check_recall_performance(start.elapsed().as_millis());
            return Some(entry);
        }

        // Check LTM
        if let Ok(entry) = self.ltm.load(id).await {
            self.signal_bus.emit_accessed(&entry).await;
            self.check_recall_performance(start.elapsed().as_millis());
            return Some(entry);
        }

        None
    }

    /// Recall by keyword search
    pub async fn recall_keyword(&self, query: &str, limit: usize) -> RecallResult {
        let start = std::time::Instant::now();
        let mut results = Vec::new();

        // Search STM
        results.extend(self.stm.search(query, limit).await);

        // Search MTM
        results.extend(self.mtm.search(query, limit).await);

        // Search LTM (metadata only)
        let ltm_matches = self.ltm.search(query, limit).await;
        for meta in ltm_matches {
            if let Ok(entry) = self.ltm.load(&meta.id).await {
                results.push(entry);
            }
        }

        // Sort by importance and deduplicate
        // FIX: Handle NaN values safely to prevent panic
        results.sort_by(|a, b| {
            b.importance
                .partial_cmp(&a.importance)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        results.dedup_by(|a, b| a.id == b.id);
        results.truncate(limit);

        let duration = start.elapsed().as_millis();
        self.signal_bus
            .emit_search(SearchType::Keyword, results.len(), duration)
            .await;
        self.check_recall_performance(duration);

        RecallResult {
            entries: results,
            query: query.to_string(),
            recall_type: RecallType::Keyword,
            duration_ms: duration,
            total_searched: self.total_entries().await,
        }
    }

    /// Recall by semantic search (KNN)
    pub async fn recall_semantic(&self, query_embedding: &[f32], k: usize) -> RecallResult {
        let start = std::time::Instant::now();

        let search_results = self.vector_store.search(query_embedding, k).await;
        let mut entries = Vec::new();

        for result in search_results {
            if let Some(entry) = self.recall_by_id(&result.id).await {
                entries.push(entry);
            }
        }

        let duration = start.elapsed().as_millis();
        self.signal_bus
            .emit_search(SearchType::Semantic, entries.len(), duration)
            .await;
        self.check_recall_performance(duration);

        RecallResult {
            entries,
            query: format!("embedding[{}]", query_embedding.len()),
            recall_type: RecallType::Semantic,
            duration_ms: duration,
            total_searched: self.vector_store.len().await,
        }
    }

    /// Recall recent entries
    pub async fn recall_recent(&self, n: usize) -> RecallResult {
        let start = std::time::Instant::now();

        let entries = self.stm.recent(n).await;
        let duration = start.elapsed().as_millis();

        RecallResult {
            entries,
            query: format!("recent:{}", n),
            recall_type: RecallType::Recent,
            duration_ms: duration,
            total_searched: self.stm.len().await,
        }
    }

    /// Recall by memory type
    pub async fn recall_by_type(&self, memory_type: MemoryType, limit: usize) -> RecallResult {
        let start = std::time::Instant::now();
        let mut results = Vec::new();

        // Get from MTM
        results.extend(self.mtm.get_by_type(memory_type).await);

        // Get from index (for all tiers)
        let ids = self.indexer.get_by_type(&memory_type).await;
        for id in ids.into_iter().take(limit) {
            if let Some(entry) = self.recall_by_id(&id).await {
                if !results.iter().any(|e| e.id == entry.id) {
                    results.push(entry);
                }
            }
        }

        results.truncate(limit);
        let duration = start.elapsed().as_millis();

        RecallResult {
            entries: results,
            query: format!("type:{:?}", memory_type),
            recall_type: RecallType::ByType,
            duration_ms: duration,
            total_searched: self.total_entries().await,
        }
    }

    /// Recall by tag
    pub async fn recall_by_tag(&self, tag: &str, limit: usize) -> RecallResult {
        let start = std::time::Instant::now();

        let ids = self.indexer.get_by_tag(tag).await;
        let mut results = Vec::new();

        for id in ids.into_iter().take(limit) {
            if let Some(entry) = self.recall_by_id(&id).await {
                results.push(entry);
            }
        }

        let duration = start.elapsed().as_millis();

        RecallResult {
            entries: results,
            query: format!("tag:{}", tag),
            recall_type: RecallType::ByTag,
            duration_ms: duration,
            total_searched: self.total_entries().await,
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //   MANAGEMENT OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    /// Run consolidation cycle
    pub async fn consolidate(&self) -> ConsolidationResult {
        let result = self
            .consolidator
            .consolidate(&self.stm, &self.mtm, &self.ltm, &self.vector_store)
            .await;

        self.signal_bus
            .emit_consolidation(result.stm_to_mtm, result.mtm_to_ltm, result.duration_ms)
            .await;

        result
    }

    /// Run forgetting cycle
    pub async fn forget(&self) -> ForgettingResult {
        // Process STM
        let stm_result = self.forgetting_engine.process_stm(&self.stm).await;

        // Process MTM
        let mtm_result = self
            .forgetting_engine
            .process_mtm(&self.mtm, &self.vector_store)
            .await;

        // Combine results
        ForgettingResult {
            decayed_count: mtm_result.decayed_count,
            deleted_count: stm_result.deleted_count + mtm_result.deleted_count,
            pruned_count: mtm_result.pruned_count,
            boosted_count: mtm_result.boosted_count,
            processed_count: stm_result.processed_count + mtm_result.processed_count,
            duration_ms: stm_result.duration_ms + mtm_result.duration_ms,
            timestamp: chrono::Utc::now().timestamp_millis(),
        }
    }

    /// Delete entry by ID
    pub async fn delete(&self, id: &Uuid) -> bool {
        let mut deleted = false;

        // Remove from all tiers
        if self.stm.remove(id).await.is_some() {
            deleted = true;
        }
        if self.mtm.remove(id).await.is_some() {
            deleted = true;
        }
        if self.ltm.remove(id).await.is_some() {
            deleted = true;
        }

        // Remove from index and vector store
        self.indexer.remove(id).await;
        self.vector_store.remove(id).await;

        if deleted {
            self.signal_bus
                .emit_forgotten(
                    *id,
                    MemoryTier::STM, // Approximate
                    super::memory_signals::ForgetReason::UserRequested,
                )
                .await;
        }

        deleted
    }

    /// Clear all memory
    pub async fn clear(&self) {
        self.stm.clear().await;
        self.mtm.clear().await;
        self.ltm.clear().await;
        self.vector_store.clear().await;
        self.indexer.clear().await;
    }

    // ═══════════════════════════════════════════════════════════════
    //   STATUS & STATISTICS
    // ═══════════════════════════════════════════════════════════════

    /// Get Memory OS statistics
    pub async fn stats(&self) -> MemoryOSStats {
        let now = chrono::Utc::now().timestamp_millis();

        MemoryOSStats {
            stm_count: self.stm.len().await,
            mtm_count: self.mtm.len().await,
            ltm_count: self.ltm.len().await,
            vector_count: self.vector_store.len().await,
            total_entries: self.total_entries().await,
            index_stats: self.indexer.stats().await,
            last_consolidation: self.consolidator.last_result().await,
            last_forgetting: self.forgetting_engine.last_result().await,
            uptime_ms: (now - self.init_timestamp) as u64,
        }
    }

    /// Get memory snapshot
    pub async fn snapshot(&self) -> MemorySnapshot {
        let stm_snap = self.stm.snapshot().await;
        let mtm_snap = self.mtm.snapshot().await;
        let ltm_snap = self.ltm.snapshot().await;

        MemorySnapshot {
            timestamp: chrono::Utc::now().timestamp_millis(),
            stm: stm_snap.clone(),
            mtm: mtm_snap.clone(),
            ltm: ltm_snap.clone(),
            total_entries: self.total_entries().await,
            total_size_bytes: stm_snap.size_bytes + mtm_snap.size_bytes + ltm_snap.size_bytes,
            embeddings_count: self.vector_store.len().await,
            index_healthy: true, // Simplified health check
            version: super::MEMORY_OS_VERSION.to_string(),
        }
    }

    /// Get total entry count
    pub async fn total_entries(&self) -> usize {
        self.stm.len().await + self.mtm.len().await + self.ltm.len().await
    }

    /// Check if running
    pub async fn is_running(&self) -> bool {
        *self.running.read().await
    }

    /// Get signal bus for external subscriptions
    pub fn signal_bus(&self) -> &MemorySignalBus {
        &self.signal_bus
    }

    // ═══════════════════════════════════════════════════════════════
    //   TIER ACCESS (for advanced usage)
    // ═══════════════════════════════════════════════════════════════

    /// Get STM reference
    pub fn stm(&self) -> &ShortTermMemory {
        &self.stm
    }

    /// Get MTM reference
    pub fn mtm(&self) -> &MidTermMemory {
        &self.mtm
    }

    /// Get LTM reference
    pub fn ltm(&self) -> &LongTermMemory {
        &self.ltm
    }

    /// Get vector store reference
    pub fn vector_store(&self) -> &VectorStore {
        &self.vector_store
    }

    /// Get indexer reference
    pub fn indexer(&self) -> &MemoryIndexer {
        &self.indexer
    }

    // ═══════════════════════════════════════════════════════════════
    //   INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════

    fn check_recall_performance(&self, duration_ms: u128) {
        if duration_ms > super::targets::MEMORY_RECALL_MS {
            log_warn!("Recall exceeded target: {}ms", duration_ms);
        }
    }
}

impl Default for MemoryOS {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for MemoryOS {
    fn clone(&self) -> Self {
        Self {
            stm: self.stm.clone(),
            mtm: self.mtm.clone(),
            ltm: self.ltm.clone(),
            vector_store: self.vector_store.clone(),
            indexer: self.indexer.clone(),
            consolidator: self.consolidator.clone(),
            forgetting_engine: self.forgetting_engine.clone(),
            signal_bus: self.signal_bus.clone(),
            config: Arc::clone(&self.config),
            init_timestamp: self.init_timestamp,
            running: Arc::clone(&self.running),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   ERROR TYPES
// ═══════════════════════════════════════════════════════════════

#[derive(Debug)]
pub enum MemoryOSError {
    InitError(String),
    StorageError(String),
    IndexError(String),
    NotFound(Uuid),
    InvalidEmbedding(String),
}

impl std::fmt::Display for MemoryOSError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MemoryOSError::InitError(e) => write!(f, "Memory OS init error: {}", e),
            MemoryOSError::StorageError(e) => write!(f, "Storage error: {}", e),
            MemoryOSError::IndexError(e) => write!(f, "Index error: {}", e),
            MemoryOSError::NotFound(id) => write!(f, "Entry not found: {}", id),
            MemoryOSError::InvalidEmbedding(e) => write!(f, "Invalid embedding: {}", e),
        }
    }
}

impl std::error::Error for MemoryOSError {}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_memory_os_creation() {
        let memory_os = MemoryOS::new();
        assert_eq!(memory_os.total_entries().await, 0);
    }

    #[tokio::test]
    async fn test_store_and_recall() {
        let memory_os = MemoryOS::new();

        let entry = MemoryEntry::new(
            "Test memory content".to_string(),
            0.5,
            MemoryType::Conversation,
        );
        let id = entry.id;

        let result = memory_os.store(entry).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), id);

        let recalled = memory_os.recall_by_id(&id).await;
        assert!(recalled.is_some());
        assert_eq!(recalled.unwrap().content, "Test memory content");
    }

    #[tokio::test]
    async fn test_keyword_search() {
        let memory_os = MemoryOS::new();

        let entry1 = MemoryEntry::new(
            "Hello world test".to_string(),
            0.5,
            MemoryType::Conversation,
        );
        let entry2 = MemoryEntry::new("Goodbye world".to_string(), 0.5, MemoryType::Conversation);

        memory_os.store(entry1).await.ok();
        memory_os.store(entry2).await.ok();

        let results = memory_os.recall_keyword("Hello", 10).await;
        assert_eq!(results.entries.len(), 1);
        assert!(results.entries[0].content.contains("Hello"));
    }

    #[tokio::test]
    async fn test_high_importance_routing() {
        let memory_os = MemoryOS::new();

        // High importance should go to MTM directly
        let entry = MemoryEntry::new(
            "Important decision".to_string(),
            0.9, // High importance
            MemoryType::Decision,
        );
        let id = entry.id;

        memory_os.store(entry).await.ok();

        // Should be in MTM, not STM
        assert_eq!(memory_os.stm.len().await, 0);
        assert_eq!(memory_os.mtm.len().await, 1);

        // Should still be recallable
        let recalled = memory_os.recall_by_id(&id).await;
        assert!(recalled.is_some());
    }

    #[tokio::test]
    async fn test_stats() {
        let memory_os = MemoryOS::new();

        for i in 0..5 {
            let entry = MemoryEntry::new(format!("Entry {}", i), 0.5, MemoryType::Conversation);
            memory_os.store(entry).await.ok();
        }

        let stats = memory_os.stats().await;
        assert_eq!(stats.total_entries, 5);
        assert_eq!(stats.stm_count, 5);
    }

    #[tokio::test]
    async fn test_delete() {
        let memory_os = MemoryOS::new();

        let entry = MemoryEntry::new("To delete".to_string(), 0.5, MemoryType::Conversation);
        let id = entry.id;

        memory_os.store(entry).await.ok();
        assert!(memory_os.recall_by_id(&id).await.is_some());

        let deleted = memory_os.delete(&id).await;
        assert!(deleted);
        assert!(memory_os.recall_by_id(&id).await.is_none());
    }

    #[tokio::test]
    async fn test_clear() {
        let memory_os = MemoryOS::new();

        for i in 0..10 {
            let entry = MemoryEntry::new(format!("Entry {}", i), 0.5, MemoryType::Conversation);
            memory_os.store(entry).await.ok();
        }

        assert!(memory_os.total_entries().await > 0);

        memory_os.clear().await;
        assert_eq!(memory_os.total_entries().await, 0);
    }
}
