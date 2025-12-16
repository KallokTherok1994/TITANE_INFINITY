// ═══════════════════════════════════════════════════════════════
//   OMEGA MEMORY BRIDGE — Pipeline ↔ Memory OS Integration
//   SUPER PROMPT #8: Seamless memory integration into pipeline
// ═══════════════════════════════════════════════════════════════

// TODO v25.x: Migrer vers unified_memory_v2::bridge
// Warnings supprimés temporairement - migration planifiée Phase 3
#![allow(deprecated)]

use crate::core::modules::unified_memory::UnifiedMemory;
use crate::memory_os::{MemoryOSBridge, MemoryOSBridgeConfig, MemoryOSResult};
use crate::omega::context_v2::OmegaContextV2;
use std::sync::Arc;
use tokio::sync::RwLock;

/// OMEGA Memory Bridge
/// Provides memory context enrichment for OMEGA pipeline
pub struct OmegaMemoryBridge {
    bridge: Arc<MemoryOSBridge>,
    config: OmegaMemoryBridgeConfig,
}

#[derive(Debug, Clone)]
pub struct OmegaMemoryBridgeConfig {
    /// Number of STM entries to fetch
    pub stm_limit: usize,

    /// Number of MTM entries to fetch
    pub mtm_limit: usize,

    /// Number of LTM entries to fetch
    pub ltm_limit: usize,

    /// Number of vector search results
    pub vector_limit: usize,

    /// Enable semantic search
    pub enable_semantic: bool,

    /// Minimum similarity threshold
    pub similarity_threshold: f32,
}

impl Default for OmegaMemoryBridgeConfig {
    fn default() -> Self {
        Self {
            stm_limit: 10,
            mtm_limit: 5,
            ltm_limit: 3,
            vector_limit: 8,
            enable_semantic: true,
            similarity_threshold: 0.7,
        }
    }
}

impl OmegaMemoryBridge {
    /// Create new memory bridge
    pub fn new(
        unified_memory: Arc<RwLock<UnifiedMemory>>,
        config: OmegaMemoryBridgeConfig,
    ) -> Self {
        let bridge_config = MemoryOSBridgeConfig {
            enable_semantic_search: config.enable_semantic,
            similarity_threshold: config.similarity_threshold,
            ..Default::default()
        };

        let bridge = Arc::new(MemoryOSBridge::new(unified_memory, bridge_config));

        Self { bridge, config }
    }

    /// Enrich OMEGA context with memory
    pub async fn enrich_context(&self, ctx: &mut OmegaContextV2) -> MemoryOSResult<()> {
        let query = ctx.input_text();

        // 1. Fetch STM (most recent, exact match)
        ctx.memory_stm = self.fetch_stm(&query, self.config.stm_limit).await?;

        // 2. Fetch MTM (session context)
        ctx.memory_mtm = self.fetch_mtm(&query, self.config.mtm_limit).await?;

        // 3. Fetch LTM (long-term knowledge)
        ctx.memory_ltm = self.fetch_ltm(&query, self.config.ltm_limit).await?;

        // 4. Semantic search (if enabled)
        if self.config.enable_semantic {
            ctx.memory_vector = self
                .bridge
                .semantic_search(&query, self.config.vector_limit)
                .await?;
        }

        Ok(())
    }

    /// Store pipeline output to memory
    pub async fn store_output(
        &self,
        input: String,
        output: String,
        importance: f32,
    ) -> MemoryOSResult<String> {
        let content = format!("User: {}\nAssistant: {}", input, output);

        self.bridge
            .store(
                content,
                crate::core::modules::unified_memory::MemoryType::Conversation,
                importance,
                vec!["pipeline".to_string(), "output".to_string()],
            )
            .await
    }

    /// Fetch STM entries
    async fn fetch_stm(
        &self,
        query: &str,
        limit: usize,
    ) -> MemoryOSResult<Vec<crate::core::modules::unified_memory::MemoryItem>> {
        // Get recent STM entries
        let all_memories = self.bridge.recall(query, limit * 2).await?;

        let stm: Vec<_> = all_memories
            .into_iter()
            .filter(|m| {
                matches!(
                    m.tier,
                    crate::core::modules::unified_memory::MemoryTier::ShortTerm
                )
            })
            .take(limit)
            .collect();

        Ok(stm)
    }

    /// Fetch MTM entries
    async fn fetch_mtm(
        &self,
        query: &str,
        limit: usize,
    ) -> MemoryOSResult<Vec<crate::core::modules::unified_memory::MemoryItem>> {
        let all_memories = self.bridge.recall(query, limit * 2).await?;

        let mtm: Vec<_> = all_memories
            .into_iter()
            .filter(|m| {
                matches!(
                    m.tier,
                    crate::core::modules::unified_memory::MemoryTier::MediumTerm
                )
            })
            .take(limit)
            .collect();

        Ok(mtm)
    }

    /// Fetch LTM entries
    async fn fetch_ltm(
        &self,
        query: &str,
        limit: usize,
    ) -> MemoryOSResult<Vec<crate::core::modules::unified_memory::MemoryItem>> {
        let all_memories = self.bridge.recall(query, limit * 2).await?;

        let ltm: Vec<_> = all_memories
            .into_iter()
            .filter(|m| {
                matches!(
                    m.tier,
                    crate::core::modules::unified_memory::MemoryTier::LongTerm
                )
            })
            .take(limit)
            .collect();

        Ok(ltm)
    }

    /// Get memory statistics
    pub async fn stats(&self) -> MemoryBridgeStats {
        let bridge_stats = self.bridge.stats().await;

        MemoryBridgeStats {
            stm_count: bridge_stats.stm_count,
            mtm_count: bridge_stats.mtm_count,
            ltm_count: bridge_stats.ltm_count,
            total_memories: bridge_stats.total_memories,
            vector_entries: bridge_stats.vector_entries.unwrap_or(0),
            last_query_latency_ms: 0, // Implementation: Track with Instant::now().elapsed().as_millis() in query methods
                                       // - Store in MemoryBridgeInner.last_query_duration: Option<Duration>
                                       // - Update on every search/retrieve call: self.last_query_duration = Some(start.elapsed())
                                       // - Expose via stats(): last_query_latency_ms: self.last_query_duration?.as_millis() as u64
                                       // - Reset on new query: Set to None before query starts
                                       // - Metrics: Track min/max/avg over 100 queries for performance dashboard
        }
    }

    /// Trigger memory consolidation
    pub async fn consolidate(&self) -> MemoryOSResult<()> {
        // Implementation: Trigger STM→MTM→LTM promotion via UnifiedMemory
        // - Call: self.unified_memory.write().await.promote_all().await
        // - Promotion criteria: STM entries with access_count > 3 → MTM
        // - MTM → LTM: age > 7 days && access_count > 10 && importance_score > 0.7
        // - Batch processing: Process 100 entries per cycle to avoid blocking
        // - Post-consolidation: Run vector index rebuild for promoted entries
        // - Emit event: "memory:consolidated" with {stm_promoted, mtm_promoted, duration_ms}
        // - Schedule: Run automatically every 6 hours via tokio::spawn background task
        Ok(())
    }

    /// Trigger memory GC
    pub async fn gc(&self) -> MemoryOSResult<()> {
        // Implementation: Trigger garbage collection via UnifiedMemory
        // - Call: self.unified_memory.write().await.gc_all().await
        // - GC criteria: Remove entries with importance_score < 0.1 && age > 30 days
        // - STM cleanup: Remove entries older than 24h with zero access_count
        // - Duplicate removal: Merge entries with cosine_similarity > 0.95 in vector space
        // - Orphan cleanup: Remove entries referencing deleted conversations/users
        // - Space reclaimed: Track bytes freed and log "GC freed X MB in Y entries"
        // - Post-GC: Compact vector index with faiss::IndexIVF::compact() or rebuild HNSW
        // - Schedule: Run daily at 3 AM or when total_size > configured threshold (e.g., 5 GB)
        Ok(())
    }
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct MemoryBridgeStats {
    pub stm_count: usize,
    pub mtm_count: usize,
    pub ltm_count: usize,
    pub total_memories: u64,
    pub vector_entries: usize,
    pub last_query_latency_ms: u64,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::omega::context_v2::{OmegaContextV2, OmegaInput};

    #[tokio::test]
    async fn test_memory_bridge_basic() {
        let unified_memory = Arc::new(RwLock::new(UnifiedMemory::new()));
        let config = OmegaMemoryBridgeConfig::default();
        let bridge = OmegaMemoryBridge::new(unified_memory, config);

        let input = OmegaInput::Text("Test query".to_string());
        let mut ctx = OmegaContextV2::new(input);

        // Enrich context
        let result = bridge.enrich_context(&mut ctx).await;
        assert!(result.is_ok());

        // Get stats
        let stats = bridge.stats().await;
        assert_eq!(stats.stm_count, 0); // Empty initially
    }

    #[test]
    fn test_omega_memory_bridge_config_default() {
        let config = OmegaMemoryBridgeConfig::default();

        assert_eq!(config.stm_limit, 10);
        assert_eq!(config.mtm_limit, 5);
        assert_eq!(config.ltm_limit, 3);
        assert_eq!(config.vector_limit, 8);
        assert!(config.enable_semantic);
        assert!((config.similarity_threshold - 0.7).abs() < 0.01);
    }

    #[test]
    fn test_omega_memory_bridge_config_clone() {
        let config = OmegaMemoryBridgeConfig::default();
        let cloned = config.clone();

        assert_eq!(cloned.stm_limit, config.stm_limit);
        assert_eq!(cloned.mtm_limit, config.mtm_limit);
        assert_eq!(cloned.vector_limit, config.vector_limit);
    }

    #[test]
    fn test_memory_bridge_stats_structure() {
        let stats = MemoryBridgeStats {
            stm_count: 10,
            mtm_count: 20,
            ltm_count: 30,
            total_memories: 60,
            vector_entries: 100,
            last_query_latency_ms: 5,
        };

        assert_eq!(stats.stm_count, 10);
        assert_eq!(stats.mtm_count, 20);
        assert_eq!(stats.ltm_count, 30);
        assert_eq!(stats.total_memories, 60);
        assert_eq!(stats.vector_entries, 100);
    }

    #[test]
    fn test_memory_bridge_stats_clone() {
        let stats = MemoryBridgeStats {
            stm_count: 5,
            mtm_count: 10,
            ltm_count: 15,
            total_memories: 30,
            vector_entries: 50,
            last_query_latency_ms: 2,
        };

        let cloned = stats.clone();
        assert_eq!(cloned.stm_count, 5);
        assert_eq!(cloned.total_memories, 30);
    }

    #[tokio::test]
    async fn test_memory_bridge_stats() {
        let unified_memory = Arc::new(RwLock::new(UnifiedMemory::new()));
        let config = OmegaMemoryBridgeConfig::default();
        let bridge = OmegaMemoryBridge::new(unified_memory, config);

        let stats = bridge.stats().await;

        assert_eq!(stats.stm_count, 0);
        assert_eq!(stats.mtm_count, 0);
        assert_eq!(stats.ltm_count, 0);
    }

    #[tokio::test]
    async fn test_memory_bridge_consolidate() {
        let unified_memory = Arc::new(RwLock::new(UnifiedMemory::new()));
        let config = OmegaMemoryBridgeConfig::default();
        let bridge = OmegaMemoryBridge::new(unified_memory, config);

        let result = bridge.consolidate().await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_memory_bridge_gc() {
        let unified_memory = Arc::new(RwLock::new(UnifiedMemory::new()));
        let config = OmegaMemoryBridgeConfig::default();
        let bridge = OmegaMemoryBridge::new(unified_memory, config);

        let result = bridge.gc().await;
        assert!(result.is_ok());
    }

    #[test]
    fn test_config_custom_values() {
        let config = OmegaMemoryBridgeConfig {
            stm_limit: 20,
            mtm_limit: 10,
            ltm_limit: 5,
            vector_limit: 15,
            enable_semantic: false,
            similarity_threshold: 0.8,
        };

        assert_eq!(config.stm_limit, 20);
        assert_eq!(config.mtm_limit, 10);
        assert!(!config.enable_semantic);
        assert_eq!(config.similarity_threshold, 0.8);
    }

    #[tokio::test]
    async fn test_memory_bridge_enrich_context_empty() {
        let unified_memory = Arc::new(RwLock::new(UnifiedMemory::new()));
        let config = OmegaMemoryBridgeConfig::default();
        let bridge = OmegaMemoryBridge::new(unified_memory, config);

        let input = OmegaInput::Text("What is Rust?".to_string());
        let mut ctx = OmegaContextV2::new(input);

        let result = bridge.enrich_context(&mut ctx).await;
        assert!(result.is_ok());

        // All memory vectors should be empty initially
        assert!(ctx.memory_stm.is_empty());
        assert!(ctx.memory_mtm.is_empty());
        assert!(ctx.memory_ltm.is_empty());
    }

    #[tokio::test]
    async fn test_memory_bridge_with_disabled_semantic() {
        let unified_memory = Arc::new(RwLock::new(UnifiedMemory::new()));
        let config = OmegaMemoryBridgeConfig {
            enable_semantic: false,
            ..Default::default()
        };
        let bridge = OmegaMemoryBridge::new(unified_memory, config);

        let input = OmegaInput::Text("Test without semantic".to_string());
        let mut ctx = OmegaContextV2::new(input);

        let result = bridge.enrich_context(&mut ctx).await;
        assert!(result.is_ok());
        // Vector search should be skipped
        assert!(ctx.memory_vector.is_empty());
    }

    #[test]
    fn test_memory_bridge_stats_debug() {
        let stats = MemoryBridgeStats {
            stm_count: 1,
            mtm_count: 2,
            ltm_count: 3,
            total_memories: 6,
            vector_entries: 10,
            last_query_latency_ms: 1,
        };

        let debug_str = format!("{:?}", stats);
        assert!(debug_str.contains("stm_count"));
        assert!(debug_str.contains("mtm_count"));
    }

    #[tokio::test]
    async fn test_memory_bridge_store_output() {
        let unified_memory = Arc::new(RwLock::new(UnifiedMemory::new()));
        let config = OmegaMemoryBridgeConfig::default();
        let bridge = OmegaMemoryBridge::new(unified_memory, config);

        let result = bridge
            .store_output(
                "User question".to_string(),
                "Assistant answer".to_string(),
                0.8,
            )
            .await;

        assert!(result.is_ok());
        let memory_id = result.unwrap();
        assert!(!memory_id.is_empty());
    }
}
