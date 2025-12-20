// ═══════════════════════════════════════════════════════════════
//   UNIFIED MEMORY V2 — BRIDGE
//   Bridge vers neural_memory/ (implémentation privée)
// ═══════════════════════════════════════════════════════════════

use super::types::{MemoryEntry, MemoryResult, MemoryTier};
use crate::neural_memory::{
    Consolidator, LongTermMemory, MidTermMemory, ShortTermMemory, VectorStore,
};

/// Bridge to neural_memory implementation
///
/// Coordinates between public API and private neural implementation
pub struct MemoryBridge {
    stm: ShortTermMemory,
    mtm: MidTermMemory,
    ltm: LongTermMemory,
    vector: VectorStore,
    consolidator: Consolidator,
}

impl MemoryBridge {
    /// Create new bridge
    pub fn new() -> Self {
        Self {
            stm: ShortTermMemory::default(),
            mtm: MidTermMemory::default(),
            ltm: LongTermMemory::default(),
            vector: VectorStore::default(),
            consolidator: Consolidator::default(),
        }
    }

    /// Initialize bridge (must be called before use)
    pub async fn init(&mut self) -> MemoryResult<()> {
        self.ltm.init().await?;
        Ok(())
    }

    /// Store in STM
    pub async fn store_stm(&mut self, entry: MemoryEntry) -> MemoryResult<()> {
        self.stm.push(entry)?;
        Ok(())
    }

    /// Get entry by ID from any tier
    pub async fn get(&self, id: &str) -> MemoryResult<MemoryEntry> {
        // Try STM first
        if let Some(entry) = self.stm.get(id) {
            return Ok(entry);
        }

        // Then MTM
        if let Some(entry) = self.mtm.get(id) {
            return Ok(entry);
        }

        // Finally LTM
        self.ltm.load(id).await
    }

    /// Search across all tiers
    pub async fn search(&self, query: &str, limit: usize) -> MemoryResult<Vec<MemoryEntry>> {
        let mut results: Vec<MemoryEntry> = Vec::new();

        // Search STM
        results.extend(self.stm.search(query));

        // Search MTM
        results.extend(self.mtm.search(query));

        // Search LTM
        let ltm_ids = self.ltm.search(query);
        for id in ltm_ids {
            if let Ok(entry) = self.ltm.load(&id).await {
                results.push(entry);
            }
        }

        // Sort by relevance and limit
        results.sort_by(|a, b| b.relevance_score().total_cmp(&a.relevance_score()));
        results.truncate(limit);

        Ok(results)
    }

    /// Get by tier
    pub async fn get_by_tier(
        &self,
        tier: MemoryTier,
        limit: usize,
    ) -> MemoryResult<Vec<MemoryEntry>> {
        match tier {
            MemoryTier::STM => Ok(self.stm.get_recent(limit)),
            MemoryTier::MTM => Ok(self.mtm.get_top(limit)),
            MemoryTier::LTM => {
                let ids = self.ltm.get_all_ids();
                let mut entries = Vec::new();
                for id in ids.into_iter().take(limit) {
                    if let Ok(entry) = self.ltm.load(&id).await {
                        entries.push(entry);
                    }
                }
                Ok(entries)
            }
        }
    }

    /// Run consolidation
    pub async fn consolidate(&mut self) -> MemoryResult<()> {
        let _result = self
            .consolidator
            .consolidate(&mut self.stm, &mut self.mtm, &mut self.ltm)
            .await;
        Ok(())
    }

    /// Get statistics
    pub fn stats(&self) -> MemoryBridgeStats {
        MemoryBridgeStats {
            stm_count: self.stm.count(),
            mtm_count: self.mtm.count(),
            ltm_count: self.ltm.count(),
            vector_count: self.vector.count(),
        }
    }

    /// Clear all tiers
    pub async fn clear(&mut self) -> MemoryResult<()> {
        self.stm.clear();
        self.mtm.clear();
        self.ltm.clear().await?;
        self.vector.clear();
        Ok(())
    }

    /// Remove entry from all tiers
    pub async fn remove(&mut self, id: &str) -> MemoryResult<()> {
        self.stm.remove(id);
        self.mtm.remove(id);
        self.ltm.remove(id).await?;
        self.vector.remove(id);
        Ok(())
    }
}

impl Default for MemoryBridge {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone)]
pub struct MemoryBridgeStats {
    pub stm_count: usize,
    pub mtm_count: usize,
    pub ltm_count: usize,
    pub vector_count: usize,
}
