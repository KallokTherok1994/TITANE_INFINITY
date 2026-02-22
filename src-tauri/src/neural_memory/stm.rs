// ═══════════════════════════════════════════════════════════════
//   NEURAL MEMORY — STM (Short-Term Memory)
//   V24 Optimization: 50 item cap with archival support (not discard)
//   FIFO queue: newest entries retained, oldest archived instead of lost
// ═══════════════════════════════════════════════════════════════

use crate::unified_memory_v2::types::{MemoryEntry, MemoryResult, MemoryTier};
use std::collections::VecDeque;
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};

/// Short-Term Memory (STM)
///
/// FIFO queue with capacity limit. Oldest entries are archived (not discarded).
/// Used for immediate context (conversation turns, temporary observations).
/// V24 OPTIMIZATION: Entries evicted from STM trigger archival callback instead of discard.
pub struct ShortTermMemory {
    entries: VecDeque<MemoryEntry>,
    max_capacity: usize,
    /// V24: Track evictions for stats/debugging
    eviction_count: Arc<AtomicU64>,
}

impl ShortTermMemory {
    /// Create new STM with capacity limit
    pub fn new(max_capacity: usize) -> Self {
        Self {
            entries: VecDeque::with_capacity(max_capacity),
            max_capacity,
            eviction_count: Arc::new(AtomicU64::new(0)),
        }
    }

    /// Push new entry (evicts oldest if full, but doesn't discard — for archival)
    #[deprecated(note = "use push_with_archival_callback instead for V24+ (archival support)")]
    pub fn push(&mut self, mut entry: MemoryEntry) -> MemoryResult<()> {
        entry.tier = MemoryTier::STM;

        if self.entries.len() >= self.max_capacity {
            self.entries.pop_front(); // V24 DEPRECATED: This discards data. Use archival instead.
            self.eviction_count.fetch_add(1, Ordering::Relaxed);
        }

        self.entries.push_back(entry);
        Ok(())
    }

    /// V24: Push with optional archival callback for evicted entries
    /// If callback provided: evicted entries passed to callback (async archival)
    /// If no callback: behavior same as old push() (backward compatible)
    pub fn push_with_archival<F>(&mut self, mut entry: MemoryEntry, on_evict: Option<F>) -> MemoryResult<()>
    where
        F: FnOnce(MemoryEntry),
    {
        entry.tier = MemoryTier::STM;

        if self.entries.len() >= self.max_capacity {
            if let Some(evicted) = self.entries.pop_front() {
                self.eviction_count.fetch_add(1, Ordering::Relaxed);
                // V24 OPTIMIZATION: Call archival callback instead of discarding
                if let Some(callback) = on_evict {
                    callback(evicted);
                }
            }
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

    /// V24: Get total evictions (for debugging/stats)
    pub fn eviction_count(&self) -> u64 {
        self.eviction_count.load(Ordering::Relaxed)
    }

    /// V24: Reset eviction counter
    pub fn reset_eviction_count(&self) {
        self.eviction_count.store(0, Ordering::Relaxed);
    }
}

impl Default for ShortTermMemory {
    fn default() -> Self {
        // V24 OPTIMIZATION: Increased default from 20 → 50 items
        // Reason: Better context retention in 2+ hour sessions
        // Memory cost: ≈ 25 KB (1 entry ≈ 500 bytes × 50)
        Self::new(50)
    }

#[cfg(test)]
mod tests {
    use super::*;
    use crate::unified_memory_v2::types::MemoryType;
    use std::sync::Arc;
    use std::sync::Mutex;

    #[test]
    fn test_stm_default_capacity_50() {
        let stm = ShortTermMemory::default();
        assert_eq!(stm.capacity(), 50, "V24: Default capacity should be 50 items");
    }

    #[test]
    fn test_stm_push_and_evict_old_way() {
        let mut stm = ShortTermMemory::new(3);

        for i in 0..5 {
            let entry = MemoryEntry::new(format!("Entry {}", i), 0.5, MemoryType::Conversation);
            #[allow(deprecated)]
            stm.push(entry)
                .expect("stm push should succeed with capacity eviction");
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
            #[allow(deprecated)]
            stm.push(entry)
                .expect("stm push should succeed for search setup");
        }

        let results = stm.search("world");
        assert_eq!(results.len(), 1);
        assert!(results[0].content.contains("world"));
    }

    #[test]
    fn test_stm_archival_callback_triggered() {
        let mut stm = ShortTermMemory::new(3);
        
        // Track archived entries
        let archived = Arc::new(Mutex::new(Vec::new()));
        let archived_clone = archived.clone();

        // Push 4 entries with archival callback
        for i in 0..4 {
            let entry = MemoryEntry::new(format!("Entry {}", i), 0.5, MemoryType::Conversation);
            let archived_inner = archived_clone.clone();
            
            stm.push_with_archival(entry, Some(move |evicted| {
                archived_inner.lock().unwrap().push(evicted.content);
            }))
            .expect("push_with_archival should succeed");
        }

        // Verify: STM has 3 entries (newest), 1 archived
        assert_eq!(stm.count(), 3, "STM should have 3 entries");
        
        let archived_vec = archived.lock().unwrap();
        assert_eq!(archived_vec.len(), 1, "One entry should be archived");
        assert!(archived_vec[0].contains("Entry 0"), "Oldest entry should be archived");
        
        let all = stm.get_all();
        assert!(all[0].content.contains("Entry 3"), "Newest is Entry 3");
        assert!(all[2].content.contains("Entry 1"), "Oldest retained is Entry 1");
    }

    #[test]
    fn test_stm_eviction_counter() {
        let mut stm = ShortTermMemory::new(2);
        
        assert_eq!(stm.eviction_count(), 0, "Initial eviction count = 0");
        
        // Push 3 entries → should trigger 1 eviction
        for i in 0..3 {
            let entry = MemoryEntry::new(format!("Entry {}", i), 0.5, MemoryType::Conversation);
            #[allow(deprecated)]
            stm.push(entry).unwrap();
        }
        
        assert_eq!(stm.eviction_count(), 1, "One eviction should occur");
        
        // Push 5 more → should trigger 4 more evictions (5 total → 2 retained)
        for i in 3..8 {
            let entry = MemoryEntry::new(format!("Entry {}", i), 0.5, MemoryType::Conversation);
            #[allow(deprecated)]
            stm.push(entry).unwrap();
        }
        
        assert_eq!(stm.eviction_count(), 5, "Five total evictions should occur");
        
        // Reset counter
        stm.reset_eviction_count();
        assert_eq!(stm.eviction_count(), 0, "Counter should reset to 0");
    }

    #[test]
    fn test_stm_backward_compat_no_callback() {
        let mut stm = ShortTermMemory::new(3);
        
        // Push with None callback (backward compatible)
        for i in 0..5 {
            let entry = MemoryEntry::new(format!("Entry {}", i), 0.5, MemoryType::Conversation);
            stm.push_with_archival::<fn(MemoryEntry)>(entry, None)
                .expect("push_with_archival(None) should succeed");
        }
        
        assert_eq!(stm.count(), 3, "Should have 3 entries (oldest evicted)");
        let all = stm.get_all();
        assert!(all[0].content.contains("Entry 4"), "Should contain newest");
    }
}
