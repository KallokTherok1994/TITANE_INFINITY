// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — SHORT-TERM MEMORY (STM)
//   Super Prompt #12: Ultra-fast, bounded, FIFO eviction
//   Target: <1ms push, max 20 items
// ═══════════════════════════════════════════════════════════════

use std::collections::VecDeque;
use std::sync::Arc;
use tokio::sync::RwLock;

use super::memory_state::{MemoryEntry, MemoryTier, MemoryType, TierSnapshot};

// Logging macro (use log crate)
macro_rules! log_warn {
    ($($arg:tt)*) => {
        log::warn!($($arg)*);
    };
}

/// Maximum STM capacity
pub const STM_MAX_SIZE: usize = 20;

/// Default retention time (1 hour in ms)
pub const STM_RETENTION_MS: u64 = 3_600_000;

/// Short-Term Memory - Ultra-fast, bounded storage
///
/// Characteristics:
/// - Fixed size: max 20 items
/// - FIFO eviction when full
/// - VecDeque for O(1) push/pop
/// - Priority to recent content
#[derive(Debug)]
pub struct ShortTermMemory {
    /// Entries stored in VecDeque for efficient FIFO
    entries: Arc<RwLock<VecDeque<MemoryEntry>>>,
    /// Maximum capacity
    max_size: usize,
    /// Retention time in milliseconds
    retention_ms: u64,
}

impl ShortTermMemory {
    /// Create new STM with default settings
    pub fn new() -> Self {
        Self {
            entries: Arc::new(RwLock::new(VecDeque::with_capacity(STM_MAX_SIZE))),
            max_size: STM_MAX_SIZE,
            retention_ms: STM_RETENTION_MS,
        }
    }

    /// Create STM with custom capacity
    pub fn with_capacity(max_size: usize) -> Self {
        Self {
            entries: Arc::new(RwLock::new(VecDeque::with_capacity(max_size))),
            max_size,
            retention_ms: STM_RETENTION_MS,
        }
    }

    /// Push a new entry (O(1) operation)
    /// Returns evicted entry if capacity was reached
    pub async fn push(&self, mut entry: MemoryEntry) -> Option<MemoryEntry> {
        let start = std::time::Instant::now();

        // Ensure tier is set to STM
        entry.tier = MemoryTier::STM;

        let mut entries = self.entries.write().await;
        let evicted = if entries.len() >= self.max_size {
            entries.pop_front()
        } else {
            None
        };

        entries.push_back(entry);

        let duration = start.elapsed();
        if duration.as_millis() > super::targets::STM_PUSH_MS {
            log_warn!("STM push exceeded target: {}ms", duration.as_millis());
        }

        evicted
    }

    /// Get all entries (cloned)
    pub async fn get_all(&self) -> Vec<MemoryEntry> {
        let entries = self.entries.read().await;
        entries.iter().cloned().collect()
    }

    /// Get entry by ID
    pub async fn get(&self, id: &uuid::Uuid) -> Option<MemoryEntry> {
        let entries = self.entries.read().await;
        entries.iter().find(|e| &e.id == id).cloned()
    }

    /// Get entry by ID and mark as accessed
    pub async fn get_and_access(&self, id: &uuid::Uuid) -> Option<MemoryEntry> {
        let mut entries = self.entries.write().await;
        if let Some(entry) = entries.iter_mut().find(|e| &e.id == id) {
            entry.mark_accessed();
            Some(entry.clone())
        } else {
            None
        }
    }

    /// Search entries by keyword
    pub async fn search(&self, query: &str, limit: usize) -> Vec<MemoryEntry> {
        let query_lower = query.to_lowercase();
        let entries = self.entries.read().await;

        entries
            .iter()
            .filter(|e| {
                e.content.to_lowercase().contains(&query_lower)
                    || e.tags
                        .iter()
                        .any(|t| t.to_lowercase().contains(&query_lower))
            })
            .take(limit)
            .cloned()
            .collect()
    }

    /// Get entries by type
    pub async fn get_by_type(&self, memory_type: MemoryType) -> Vec<MemoryEntry> {
        let entries = self.entries.read().await;
        entries
            .iter()
            .filter(|e| e.memory_type == memory_type)
            .cloned()
            .collect()
    }

    /// Get the N most recent entries
    pub async fn recent(&self, n: usize) -> Vec<MemoryEntry> {
        let entries = self.entries.read().await;
        entries.iter().rev().take(n).cloned().collect()
    }

    /// Get the N most important entries
    pub async fn top_important(&self, n: usize) -> Vec<MemoryEntry> {
        let entries = self.entries.read().await;
        let mut sorted: Vec<_> = entries.iter().cloned().collect();
        // FIX: Handle NaN values safely to prevent panic
        sorted.sort_by(|a, b| {
            b.importance
                .partial_cmp(&a.importance)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        sorted.truncate(n);
        sorted
    }

    /// Remove entry by ID
    pub async fn remove(&self, id: &uuid::Uuid) -> Option<MemoryEntry> {
        let mut entries = self.entries.write().await;
        if let Some(pos) = entries.iter().position(|e| &e.id == id) {
            entries.remove(pos)
        } else {
            None
        }
    }

    /// Remove and return all entries (drain)
    pub async fn drain(&self) -> Vec<MemoryEntry> {
        let mut entries = self.entries.write().await;
        entries.drain(..).collect()
    }

    /// Remove entries older than retention time
    pub async fn cleanup_expired(&self) -> Vec<MemoryEntry> {
        let now = chrono::Utc::now().timestamp_millis();
        let threshold = now - self.retention_ms as i64;

        let mut entries = self.entries.write().await;
        let mut expired = Vec::new();

        // Collect expired entries (from front since they're oldest)
        while let Some(entry) = entries.front() {
            if entry.timestamp < threshold {
                if let Some(e) = entries.pop_front() {
                    expired.push(e);
                }
            } else {
                break;
            }
        }

        expired
    }

    /// Get current count
    pub async fn len(&self) -> usize {
        self.entries.read().await.len()
    }

    /// Check if empty
    pub async fn is_empty(&self) -> bool {
        self.entries.read().await.is_empty()
    }

    /// Check if at capacity
    pub async fn is_full(&self) -> bool {
        self.entries.read().await.len() >= self.max_size
    }

    /// Get capacity
    pub fn capacity(&self) -> usize {
        self.max_size
    }

    /// Generate tier snapshot
    pub async fn snapshot(&self) -> TierSnapshot {
        let entries = self.entries.read().await;
        let now = chrono::Utc::now().timestamp_millis();

        let count = entries.len();
        let size_bytes: usize = entries.iter().map(|e| e.size_bytes()).sum();

        let avg_importance = if count > 0 {
            entries.iter().map(|e| e.importance).sum::<f32>() / count as f32
        } else {
            0.0
        };

        let oldest_age_ms = entries.front().map(|e| now - e.timestamp).unwrap_or(0);

        let newest_age_ms = entries.back().map(|e| now - e.timestamp).unwrap_or(0);

        // Count tags
        let mut tag_counts: std::collections::HashMap<String, usize> =
            std::collections::HashMap::new();
        for entry in entries.iter() {
            for tag in &entry.tags {
                *tag_counts.entry(tag.clone()).or_insert(0) += 1;
            }
        }

        let mut top_tags: Vec<_> = tag_counts.into_iter().collect();
        top_tags.sort_by(|a, b| b.1.cmp(&a.1));
        top_tags.truncate(5);

        TierSnapshot {
            tier: MemoryTier::STM,
            count,
            size_bytes,
            avg_importance,
            oldest_age_ms,
            newest_age_ms,
            top_tags,
        }
    }

    /// Clear all entries
    pub async fn clear(&self) {
        self.entries.write().await.clear();
    }
}

impl Default for ShortTermMemory {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for ShortTermMemory {
    fn clone(&self) -> Self {
        Self {
            entries: Arc::clone(&self.entries),
            max_size: self.max_size,
            retention_ms: self.retention_ms,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_stm_push_basic() {
        let stm = ShortTermMemory::new();
        let entry = MemoryEntry::new("Test content".to_string(), 0.5, MemoryType::Conversation);

        let evicted = stm.push(entry.clone()).await;
        assert!(evicted.is_none());
        assert_eq!(stm.len().await, 1);
    }

    #[tokio::test]
    async fn test_stm_fifo_eviction() {
        let stm = ShortTermMemory::with_capacity(3);

        for i in 0..4 {
            let entry = MemoryEntry::new(format!("Entry {}", i), 0.5, MemoryType::Conversation);
            let evicted = stm.push(entry).await;

            if i < 3 {
                assert!(evicted.is_none());
            } else {
                assert!(evicted.is_some());
                assert!(evicted
                    .expect("oldest entry should be evicted at capacity")
                    .content
                    .contains("Entry 0"));
            }
        }

        assert_eq!(stm.len().await, 3);
    }

    #[tokio::test]
    async fn test_stm_search() {
        let stm = ShortTermMemory::new();

        let entry1 = MemoryEntry::new("Hello world".to_string(), 0.5, MemoryType::Conversation);
        let entry2 = MemoryEntry::new("Goodbye world".to_string(), 0.5, MemoryType::Conversation);
        let entry3 = MemoryEntry::new("Test entry".to_string(), 0.5, MemoryType::Conversation);

        stm.push(entry1).await;
        stm.push(entry2).await;
        stm.push(entry3).await;

        let results = stm.search("world", 10).await;
        assert_eq!(results.len(), 2);
    }

    #[tokio::test]
    async fn test_stm_recent() {
        let stm = ShortTermMemory::new();

        for i in 0..5 {
            let entry = MemoryEntry::new(format!("Entry {}", i), 0.5, MemoryType::Conversation);
            stm.push(entry).await;
        }

        let recent = stm.recent(3).await;
        assert_eq!(recent.len(), 3);
        assert!(recent[0].content.contains("Entry 4"));
    }

    #[tokio::test]
    async fn test_stm_get_by_id() {
        let stm = ShortTermMemory::new();
        let entry = MemoryEntry::new("Test".to_string(), 0.5, MemoryType::Conversation);
        let id = entry.id;

        stm.push(entry).await;

        let found = stm.get(&id).await;
        assert!(found.is_some());
        assert_eq!(found.expect("should retrieve entry by id").id, id);
    }

    #[tokio::test]
    async fn test_stm_remove() {
        let stm = ShortTermMemory::new();
        let entry = MemoryEntry::new("Test".to_string(), 0.5, MemoryType::Conversation);
        let id = entry.id;

        stm.push(entry).await;
        assert_eq!(stm.len().await, 1);

        let removed = stm.remove(&id).await;
        assert!(removed.is_some());
        assert_eq!(stm.len().await, 0);
    }

    #[tokio::test]
    async fn test_stm_snapshot() {
        let stm = ShortTermMemory::new();

        let entry = MemoryEntry::new("Test".to_string(), 0.8, MemoryType::Conversation)
            .with_tags(vec!["tag1".to_string(), "tag2".to_string()]);

        stm.push(entry).await;

        let snapshot = stm.snapshot().await;
        assert_eq!(snapshot.tier, MemoryTier::STM);
        assert_eq!(snapshot.count, 1);
        assert!(snapshot.avg_importance > 0.0);
    }
}
