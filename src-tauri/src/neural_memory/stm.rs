// ═══════════════════════════════════════════════════════════════
//   NEURAL MEMORY — STM (Short-Term Memory)
//   FIFO queue, 20 items max, <1min lifespan
// ═══════════════════════════════════════════════════════════════

use crate::unified_memory_v2::types::{MemoryEntry, MemoryResult, MemoryTier};
use std::collections::VecDeque;

/// Short-Term Memory (STM)
///
/// FIFO queue with capacity limit. Oldest entries are evicted when full.
/// Used for immediate context (conversation turns, temporary observations).
pub struct ShortTermMemory {
    entries: VecDeque<MemoryEntry>,
    max_capacity: usize,
}

impl ShortTermMemory {
    /// Create new STM with capacity limit
    pub fn new(max_capacity: usize) -> Self {
        Self {
            entries: VecDeque::with_capacity(max_capacity),
            max_capacity,
        }
    }

    /// Push new entry (evicts oldest if full)
    pub fn push(&mut self, mut entry: MemoryEntry) -> MemoryResult<()> {
        entry.tier = MemoryTier::STM;

        if self.entries.len() >= self.max_capacity {
            self.entries.pop_front(); // Evict oldest
        }

        self.entries.push_back(entry);
        Ok(())
    }

    /// Get all entries (newest first)
    pub fn get_all(&self) -> Vec<MemoryEntry> {
        self.entries.iter().rev().cloned().collect()
    }

    /// Find entry by ID
    pub fn get(&self, id: &str) -> Option<MemoryEntry> {
        self.entries.iter().find(|e| e.id == id).cloned()
    }

    /// Remove entry by ID
    pub fn remove(&mut self, id: &str) -> Option<MemoryEntry> {
        if let Some(pos) = self.entries.iter().position(|e| e.id == id) {
            self.entries.remove(pos)
        } else {
            None
        }
    }

    /// Get recent entries (last N)
    pub fn get_recent(&self, limit: usize) -> Vec<MemoryEntry> {
        self.entries.iter().rev().take(limit).cloned().collect()
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

impl Default for ShortTermMemory {
    fn default() -> Self {
        Self::new(20) // Default: 20 items
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::unified_memory_v2::types::MemoryType;

    #[test]
    fn test_stm_push_and_evict() {
        let mut stm = ShortTermMemory::new(3);

        for i in 0..5 {
            let entry = MemoryEntry::new(format!("Entry {}", i), 0.5, MemoryType::Conversation);
            stm.push(entry).unwrap();
        }

        assert_eq!(stm.count(), 3);
        let all = stm.get_all();
        assert!(all[0].content.contains("Entry 4")); // Newest first
    }

    #[test]
    fn test_stm_search() {
        let mut stm = ShortTermMemory::new(10);

        for word in &["hello", "world", "test"] {
            let entry = MemoryEntry::new(word.to_string(), 0.5, MemoryType::Conversation);
            stm.push(entry).unwrap();
        }

        let results = stm.search("world");
        assert_eq!(results.len(), 1);
        assert!(results[0].content.contains("world"));
    }
}
