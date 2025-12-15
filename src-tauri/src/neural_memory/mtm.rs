// ═══════════════════════════════════════════════════════════════
//   NEURAL MEMORY — MTM (Mid-Term Memory)
//   Priority-sorted, 200 items max, hours-days lifespan
// ═══════════════════════════════════════════════════════════════

use crate::unified_memory_v2::types::{MemoryEntry, MemoryResult, MemoryTier};

/// Mid-Term Memory (MTM)
///
/// Priority-sorted storage for working memory.
/// Entries are sorted by relevance score (importance + recency + access count).
pub struct MidTermMemory {
    entries: Vec<MemoryEntry>,
    max_capacity: usize,
}

impl MidTermMemory {
    /// Create new MTM with capacity limit
    pub fn new(max_capacity: usize) -> Self {
        Self {
            entries: Vec::with_capacity(max_capacity),
            max_capacity,
        }
    }

    /// Add entry (auto-sorted by relevance)
    pub fn push(&mut self, mut entry: MemoryEntry) -> MemoryResult<()> {
        entry.tier = MemoryTier::MTM;

        self.entries.push(entry);
        self.sort_by_relevance();

        // Evict lowest relevance if over capacity
        if self.entries.len() > self.max_capacity {
            self.entries.truncate(self.max_capacity);
        }

        Ok(())
    }

    /// Sort entries by relevance score (highest first)
    fn sort_by_relevance(&mut self) {
        self.entries.sort_by(|a, b| {
            b.relevance_score()
                .partial_cmp(&a.relevance_score())
                .unwrap()
        });
    }

    /// Get all entries (sorted by relevance)
    pub fn get_all(&self) -> Vec<MemoryEntry> {
        self.entries.clone()
    }

    /// Find entry by ID
    pub fn get(&self, id: &str) -> Option<MemoryEntry> {
        self.entries.iter().find(|e| e.id == id).cloned()
    }

    /// Remove entry by ID
    pub fn remove(&mut self, id: &str) -> Option<MemoryEntry> {
        if let Some(pos) = self.entries.iter().position(|e| e.id == id) {
            Some(self.entries.remove(pos))
        } else {
            None
        }
    }

    /// Get top N most relevant
    pub fn get_top(&self, limit: usize) -> Vec<MemoryEntry> {
        self.entries.iter().take(limit).cloned().collect()
    }

    /// Search by keyword
    pub fn search(&self, query: &str) -> Vec<MemoryEntry> {
        let query_lower = query.to_lowercase();
        self.entries
            .iter()
            .filter(|e| e.content.to_lowercase().contains(&query_lower))
            .cloned()
            .collect()
    }

    /// Apply decay to all entries (age-based importance reduction)
    pub fn apply_decay(&mut self, decay_rate: f32) {
        for entry in &mut self.entries {
            entry.importance *= 1.0 - decay_rate;
        }
        self.sort_by_relevance();
    }

    /// Remove entries below importance threshold
    pub fn prune(&mut self, min_importance: f32) -> usize {
        let before = self.entries.len();
        self.entries.retain(|e| e.importance >= min_importance);
        before - self.entries.len()
    }

    /// Clear all entries
    pub fn clear(&mut self) {
        self.entries.clear();
    }

    /// Get current count
    pub fn count(&self) -> usize {
        self.entries.len()
    }

    /// Check if full
    pub fn is_full(&self) -> bool {
        self.entries.len() >= self.max_capacity
    }

    /// Get capacity
    pub fn capacity(&self) -> usize {
        self.max_capacity
    }
}

impl Default for MidTermMemory {
    fn default() -> Self {
        Self::new(200) // Default: 200 items
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::unified_memory_v2::types::MemoryType;

    #[test]
    fn test_mtm_relevance_sorting() {
        let mut mtm = MidTermMemory::new(10);

        for i in 0..5 {
            let entry = MemoryEntry::new(
                format!("Entry {}", i),
                i as f32 * 0.2,
                MemoryType::Conversation,
            );
            mtm.push(entry).unwrap();
        }

        let all = mtm.get_all();
        // Highest importance first
        assert!(all[0].importance > all[1].importance);
    }

    #[test]
    fn test_mtm_decay() {
        let mut mtm = MidTermMemory::new(10);

        let entry = MemoryEntry::new("Test".to_string(), 1.0, MemoryType::Conversation);
        mtm.push(entry).unwrap();

        mtm.apply_decay(0.1); // 10% decay

        let all = mtm.get_all();
        assert!(all[0].importance < 1.0);
        assert!(all[0].importance > 0.8);
    }

    #[test]
    fn test_mtm_prune() {
        let mut mtm = MidTermMemory::new(10);

        for i in 0..5 {
            let entry = MemoryEntry::new(
                format!("Entry {}", i),
                i as f32 * 0.2,
                MemoryType::Conversation,
            );
            mtm.push(entry).unwrap();
        }

        let pruned = mtm.prune(0.5);
        assert!(pruned > 0);
        assert!(mtm.count() < 5);
    }
}
