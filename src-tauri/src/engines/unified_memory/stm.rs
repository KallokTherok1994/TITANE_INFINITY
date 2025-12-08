// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Short-Term Memory (STM) v2
//   SUPER PROMPT #6 vΩ.8 — FIFO Bounded Memory
// ═══════════════════════════════════════════════════════════════

use super::models::{MemoryEntry, MemoryId};
use std::collections::VecDeque;

/// Short-Term Memory — FIFO bounded buffer
/// 
/// Holds the last N messages in conversation (default: 100)
/// - FIFO eviction (oldest first)
/// - O(1) push/pop operations
/// - No heavy allocations
/// - Thread-safe via ownership
pub struct ShortTermMemory {
    /// Bounded FIFO queue
    entries: VecDeque<MemoryEntry>,
    
    /// Maximum capacity (default: 100)
    max_size: usize,
    
    /// Total entries ever stored (for metrics)
    total_stored: u64,
    
    /// Total evictions (for metrics)
    total_evicted: u64,
}

impl ShortTermMemory {
    /// Create new STM with specified capacity
    pub fn new(max: usize) -> Self {
        Self {
            entries: VecDeque::with_capacity(max),
            max_size: max,
            total_stored: 0,
            total_evicted: 0,
        }
    }
    
    /// Create default STM (100 entries)
    pub fn default() -> Self {
        Self::new(100)
    }
    
    /// Push new memory entry (auto-evicts oldest if full)
    pub fn push(&mut self, entry: MemoryEntry) {
        // Evict oldest if at capacity
        if self.entries.len() >= self.max_size {
            let _ = self.entries.pop_front();
            self.total_evicted += 1;
        }
        
        // Add new entry at back (newest)
        self.entries.push_back(entry);
        self.total_stored += 1;
    }
    
    /// Get all entries (oldest to newest)
    pub fn list(&self) -> Vec<MemoryEntry> {
        self.entries.iter().cloned().collect()
    }
    
    /// Get recent N entries
    pub fn recent(&self, n: usize) -> Vec<MemoryEntry> {
        self.entries
            .iter()
            .rev()
            .take(n)
            .cloned()
            .collect::<Vec<_>>()
            .into_iter()
            .rev()
            .collect()
    }
    
    /// Get entry by ID
    pub fn get(&self, id: &MemoryId) -> Option<&MemoryEntry> {
        self.entries.iter().find(|e| &e.id == id)
    }
    
    /// Get mutable entry by ID
    pub fn get_mut(&mut self, id: &MemoryId) -> Option<&mut MemoryEntry> {
        self.entries.iter_mut().find(|e| &e.id == id)
    }
    
    /// Current count
    pub fn len(&self) -> usize {
        self.entries.len()
    }
    
    /// Check if empty
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
    
    /// Check if full
    pub fn is_full(&self) -> bool {
        self.entries.len() >= self.max_size
    }
    
    /// Clear all entries
    pub fn clear(&mut self) {
        self.entries.clear();
    }
    
    /// Get capacity
    pub fn capacity(&self) -> usize {
        self.max_size
    }
    
    /// Get usage ratio (0.0-1.0)
    pub fn usage(&self) -> f32 {
        self.entries.len() as f32 / self.max_size as f32
    }
    
    /// Get total stored (lifetime)
    pub fn total_stored(&self) -> u64 {
        self.total_stored
    }
    
    /// Get total evicted (lifetime)
    pub fn total_evicted(&self) -> u64 {
        self.total_evicted
    }
    
    /// Search entries by content substring
    pub fn search(&self, query: &str) -> Vec<MemoryEntry> {
        let query_lower = query.to_lowercase();
        self.entries
            .iter()
            .filter(|e| e.content.to_lowercase().contains(&query_lower))
            .cloned()
            .collect()
    }
    
    /// Filter by role
    pub fn filter_by_role(&self, role: &str) -> Vec<MemoryEntry> {
        self.entries
            .iter()
            .filter(|e| e.role == role)
            .cloned()
            .collect()
    }
    
    /// Remove specific entry by ID
    pub fn remove(&mut self, id: &MemoryId) -> Option<MemoryEntry> {
        if let Some(pos) = self.entries.iter().position(|e| &e.id == id) {
            self.entries.remove(pos)
        } else {
            None
        }
    }
    
    /// Promote entries matching predicate (returns removed entries)
    pub fn promote_if<F>(&mut self, predicate: F) -> Vec<MemoryEntry>
    where
        F: Fn(&MemoryEntry) -> bool,
    {
        let mut promoted = Vec::new();
        
        // Collect indices to remove (in reverse order for safe removal)
        let mut to_remove: Vec<usize> = self.entries
            .iter()
            .enumerate()
            .filter(|(_, e)| predicate(e))
            .map(|(i, _)| i)
            .collect();
        
        to_remove.reverse();
        
        // Remove and collect
        for idx in to_remove {
            if let Some(entry) = self.entries.remove(idx) {
                promoted.push(entry);
            }
        }
        
        promoted
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_stm_creation() {
        let stm = ShortTermMemory::new(10);
        assert_eq!(stm.len(), 0);
        assert_eq!(stm.capacity(), 10);
        assert!(stm.is_empty());
        assert!(!stm.is_full());
    }

    #[test]
    fn test_stm_push_fifo() {
        let mut stm = ShortTermMemory::new(3);
        
        for i in 0..5 {
            let entry = MemoryEntry {
                id: format!("msg_{}", i),
                content: format!("Message {}", i),
                ..Default::default()
            };
            stm.push(entry);
        }
        
        assert_eq!(stm.len(), 3); // Only last 3
        assert_eq!(stm.total_evicted(), 2); // First 2 evicted
        
        let list = stm.list();
        assert_eq!(list[0].id, "msg_2"); // Oldest remaining
        assert_eq!(list[2].id, "msg_4"); // Newest
    }

    #[test]
    fn test_stm_recent() {
        let mut stm = ShortTermMemory::new(10);
        
        for i in 0..5 {
            let entry = MemoryEntry {
                id: format!("msg_{}", i),
                content: format!("Message {}", i),
                ..Default::default()
            };
            stm.push(entry);
        }
        
        let recent = stm.recent(3);
        assert_eq!(recent.len(), 3);
        assert_eq!(recent[0].id, "msg_2");
        assert_eq!(recent[2].id, "msg_4");
    }

    #[test]
    fn test_stm_search() {
        let mut stm = ShortTermMemory::new(10);
        
        stm.push(MemoryEntry {
            id: "1".to_string(),
            content: "Hello world".to_string(),
            ..Default::default()
        });
        
        stm.push(MemoryEntry {
            id: "2".to_string(),
            content: "Goodbye world".to_string(),
            ..Default::default()
        });
        
        let results = stm.search("world");
        assert_eq!(results.len(), 2);
        
        let results = stm.search("hello");
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].id, "1");
    }

    #[test]
    fn test_stm_promote() {
        let mut stm = ShortTermMemory::new(10);
        
        for i in 0..5 {
            let entry = MemoryEntry {
                id: format!("msg_{}", i),
                content: format!("Message {}", i),
                importance: if i % 2 == 0 { 0.9 } else { 0.3 },
                ..Default::default()
            };
            stm.push(entry);
        }
        
        let promoted = stm.promote_if(|e| e.importance > 0.5);
        
        assert_eq!(promoted.len(), 3); // msg_0, msg_2, msg_4
        assert_eq!(stm.len(), 2); // msg_1, msg_3 remain
    }

    #[test]
    fn test_stm_remove() {
        let mut stm = ShortTermMemory::new(10);
        
        let entry = MemoryEntry {
            id: "test_id".to_string(),
            content: "Test".to_string(),
            ..Default::default()
        };
        stm.push(entry);
        
        assert_eq!(stm.len(), 1);
        
        let removed = stm.remove(&"test_id".to_string());
        assert!(removed.is_some());
        assert_eq!(stm.len(), 0);
        
        let not_found = stm.remove(&"missing".to_string());
        assert!(not_found.is_none());
    }
}
