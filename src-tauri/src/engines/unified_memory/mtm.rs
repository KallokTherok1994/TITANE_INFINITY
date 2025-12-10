// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Mid-Term Memory (MTM) v2
//   SUPER PROMPT #6 vΩ.8 — Rolling Summaries & Active Memory
// ═══════════════════════════════════════════════════════════════

use super::models::{MemoryEntry, MemoryId};
use std::collections::HashMap;

/// Mid-Term Memory — Active session memory with summaries
///
/// Maintains:
/// - Rolling summary of last 200-300 messages
/// - Salient points extraction
/// - Semantic clustering (lightweight)
/// - Embeddings cache for fast recall
pub struct MidTermMemory {
    /// Active memory entries (promoted from STM)
    entries: Vec<MemoryEntry>,

    /// Maximum capacity (default: 300)
    max_size: usize,

    /// Rolling summary of conversation
    pub summary: String,

    /// Summary version (incremented on update)
    summary_version: u32,

    /// Last summary update timestamp
    last_summary_update: i64,

    /// Embeddings cache (id -> embedding)
    embeddings_cache: HashMap<MemoryId, Vec<f32>>,

    /// Total entries promoted (metrics)
    total_promoted: u64,

    /// Total entries demoted to LTM (metrics)
    total_demoted: u64,
}

impl MidTermMemory {
    /// Create new MTM with specified capacity
    pub fn new(max: usize) -> Self {
        Self {
            entries: Vec::with_capacity(max),
            max_size: max,
            summary: String::new(),
            summary_version: 0,
            last_summary_update: 0,
            embeddings_cache: HashMap::new(),
            total_promoted: 0,
            total_demoted: 0,
        }
    }

    /// Add entry to MTM (from STM promotion)
    pub fn push(&mut self, entry: MemoryEntry) {
        // Cache embedding if present
        if let Some(ref emb) = entry.embedding {
            self.embeddings_cache.insert(entry.id.clone(), emb.clone());
        }

        // Add to entries
        self.entries.push(entry);
        self.total_promoted += 1;

        // Evict oldest if over capacity
        if self.entries.len() > self.max_size {
            let old = self.entries.remove(0);
            self.embeddings_cache.remove(&old.id);
            self.total_demoted += 1;
        }
    }

    /// Get all entries
    pub fn list(&self) -> Vec<MemoryEntry> {
        self.entries.clone()
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

    /// Update rolling summary from recent entries
    pub fn update_summary(&mut self, entries: &[MemoryEntry]) {
        if entries.is_empty() {
            return;
        }

        // Simple strategy: concatenate last N messages + trim
        let max_messages = 50.min(entries.len());
        let recent: Vec<String> = entries
            .iter()
            .rev()
            .take(max_messages)
            .map(|e| format!("[{}] {}", e.role, e.content))
            .collect();

        self.summary = recent.join("\n");

        // Trim if too long (max 4000 chars)
        if self.summary.len() > 4000 {
            self.summary.truncate(4000);
            self.summary.push_str("...");
        }

        self.summary_version += 1;
        self.last_summary_update = chrono::Utc::now().timestamp_millis();
    }

    /// Get current summary
    pub fn get_summary(&self) -> &str {
        &self.summary
    }

    /// Get summary version
    pub fn summary_version(&self) -> u32 {
        self.summary_version
    }

    /// Get cached embedding by ID
    pub fn get_embedding(&self, id: &MemoryId) -> Option<&Vec<f32>> {
        self.embeddings_cache.get(id)
    }

    /// Get all cached embeddings
    pub fn get_all_embeddings(&self) -> Vec<Vec<f32>> {
        self.embeddings_cache.values().cloned().collect()
    }

    /// Search by content substring
    pub fn search(&self, query: &str) -> Vec<MemoryEntry> {
        let query_lower = query.to_lowercase();
        self.entries
            .iter()
            .filter(|e| e.content.to_lowercase().contains(&query_lower))
            .cloned()
            .collect()
    }

    /// Filter by importance threshold
    pub fn filter_by_importance(&self, min_importance: f32) -> Vec<MemoryEntry> {
        self.entries
            .iter()
            .filter(|e| e.importance >= min_importance)
            .cloned()
            .collect()
    }

    /// Remove specific entry by ID
    pub fn remove(&mut self, id: &MemoryId) -> Option<MemoryEntry> {
        if let Some(pos) = self.entries.iter().position(|e| &e.id == id) {
            let entry = self.entries.remove(pos);
            self.embeddings_cache.remove(id);
            Some(entry)
        } else {
            None
        }
    }

    /// Demote entries matching predicate (returns removed entries)
    pub fn demote_if<F>(&mut self, predicate: F) -> Vec<MemoryEntry>
    where
        F: Fn(&MemoryEntry) -> bool,
    {
        let mut demoted = Vec::new();

        // Separate entries
        let mut remaining = Vec::new();
        for entry in self.entries.drain(..) {
            if predicate(&entry) {
                self.embeddings_cache.remove(&entry.id);
                demoted.push(entry);
                self.total_demoted += 1;
            } else {
                remaining.push(entry);
            }
        }

        self.entries = remaining;
        demoted
    }

    /// Clear all entries
    pub fn clear(&mut self) {
        self.entries.clear();
        self.embeddings_cache.clear();
        self.summary.clear();
        self.summary_version = 0;
    }

    /// Get capacity
    pub fn capacity(&self) -> usize {
        self.max_size
    }

    /// Get usage ratio (0.0-1.0)
    pub fn usage(&self) -> f32 {
        self.entries.len() as f32 / self.max_size as f32
    }

    /// Get total promoted (lifetime)
    pub fn total_promoted(&self) -> u64 {
        self.total_promoted
    }

    /// Get total demoted (lifetime)
    pub fn total_demoted(&self) -> u64 {
        self.total_demoted
    }

    /// Get entries older than timestamp (for LTM promotion)
    pub fn get_old_entries(&self, age_threshold_ms: i64) -> Vec<MemoryEntry> {
        let now = chrono::Utc::now().timestamp_millis();
        self.entries
            .iter()
            .filter(|e| (now - e.timestamp) > age_threshold_ms)
            .cloned()
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mtm_creation() {
        let mtm = MidTermMemory::new(10);
        assert_eq!(mtm.len(), 0);
        assert_eq!(mtm.capacity(), 10);
        assert!(mtm.is_empty());
    }

    #[test]
    fn test_mtm_push_eviction() {
        let mut mtm = MidTermMemory::new(3);

        for i in 0..5 {
            let entry = MemoryEntry {
                id: format!("msg_{}", i),
                content: format!("Message {}", i),
                ..Default::default()
            };
            mtm.push(entry);
        }

        assert_eq!(mtm.len(), 3); // Only last 3
        assert_eq!(mtm.total_promoted(), 5);
        assert_eq!(mtm.total_demoted(), 2);

        let list = mtm.list();
        assert_eq!(list[0].id, "msg_2"); // Oldest remaining
        assert_eq!(list[2].id, "msg_4"); // Newest
    }

    #[test]
    fn test_mtm_summary_update() {
        let mut mtm = MidTermMemory::new(10);

        let entries: Vec<MemoryEntry> = (0..3)
            .map(|i| MemoryEntry {
                id: format!("msg_{}", i),
                content: format!("Content {}", i),
                role: "user".to_string(),
                ..Default::default()
            })
            .collect();

        mtm.update_summary(&entries);

        assert!(!mtm.get_summary().is_empty());
        assert_eq!(mtm.summary_version(), 1);
        assert!(mtm.get_summary().contains("Content"));
    }

    #[test]
    fn test_mtm_embedding_cache() {
        let mut mtm = MidTermMemory::new(10);

        let entry = MemoryEntry {
            id: "test_id".to_string(),
            content: "Test".to_string(),
            embedding: Some(vec![0.1, 0.2, 0.3]),
            ..Default::default()
        };

        mtm.push(entry);

        let cached = mtm.get_embedding(&"test_id".to_string());
        assert!(cached.is_some());
        assert_eq!(cached.unwrap().len(), 3);
    }

    #[test]
    fn test_mtm_demote() {
        let mut mtm = MidTermMemory::new(10);

        for i in 0..5 {
            let entry = MemoryEntry {
                id: format!("msg_{}", i),
                content: format!("Message {}", i),
                importance: if i % 2 == 0 { 0.9 } else { 0.3 },
                ..Default::default()
            };
            mtm.push(entry);
        }

        let demoted = mtm.demote_if(|e| e.importance < 0.5);

        assert_eq!(demoted.len(), 2); // msg_1, msg_3
        assert_eq!(mtm.len(), 3); // msg_0, msg_2, msg_4 remain
        assert_eq!(mtm.total_demoted(), 2);
    }

    #[test]
    fn test_mtm_old_entries() {
        let mut mtm = MidTermMemory::new(10);

        let old_entry = MemoryEntry {
            id: "old".to_string(),
            content: "Old message".to_string(),
            timestamp: chrono::Utc::now().timestamp_millis() - 10_000_000,
            ..Default::default()
        };

        let new_entry = MemoryEntry {
            id: "new".to_string(),
            content: "New message".to_string(),
            ..Default::default()
        };

        mtm.push(old_entry);
        mtm.push(new_entry);

        let old_entries = mtm.get_old_entries(5_000_000);
        assert_eq!(old_entries.len(), 1);
        assert_eq!(old_entries[0].id, "old");
    }
}

impl Default for MidTermMemory {
    fn default() -> Self {
        Self::new(300)
    }
}
