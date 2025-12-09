// ═══════════════════════════════════════════════════════════════
//   OMEGA MEMORY BRIDGE — Pipeline ↔ Memory OS Integration
//   SUPER PROMPT #8: Seamless memory integration into pipeline
// ═══════════════════════════════════════════════════════════════

use crate::core::modules::unified_memory::UnifiedMemory;
use crate::memory_os::{MemoryOSBridge, MemoryOSBridgeConfig, MemoryOSError, MemoryOSResult};
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
    pub fn new(unified_memory: Arc<RwLock<UnifiedMemory>>, config: OmegaMemoryBridgeConfig) -> Self {
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
            .filter(|m| matches!(m.tier, crate::core::modules::unified_memory::MemoryTier::ShortTerm))
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
            .filter(|m| matches!(m.tier, crate::core::modules::unified_memory::MemoryTier::MediumTerm))
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
            .filter(|m| matches!(m.tier, crate::core::modules::unified_memory::MemoryTier::LongTerm))
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
            last_query_latency_ms: 0, // TODO: Track
        }
    }
    
    /// Trigger memory consolidation
    pub async fn consolidate(&self) -> MemoryOSResult<()> {
        // Trigger STM→MTM→LTM promotion
        // TODO: Call UnifiedMemory::promote_all()
        Ok(())
    }
    
    /// Trigger memory GC
    pub async fn gc(&self) -> MemoryOSResult<()> {
        // Trigger garbage collection
        // TODO: Call UnifiedMemory::gc_all()
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
}
