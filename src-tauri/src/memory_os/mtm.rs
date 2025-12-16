// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — MID-TERM MEMORY (MTM)
//   Super Prompt #12: Consolidation, sorting by importance × recency
//   Target: <3ms consolidation, 50-200 items
// ═══════════════════════════════════════════════════════════════

use std::sync::Arc;
use tokio::sync::RwLock;

use super::memory_state::{MemoryEntry, MemoryTier, MemoryType, TierSnapshot};

// Logging macro
macro_rules! log_warn {
    ($($arg:tt)*) => {
        log::warn!($($arg)*);
    };
}

/// Maximum MTM capacity
pub const MTM_MAX_SIZE: usize = 200;

/// Minimum MTM capacity before truncation
pub const MTM_MIN_SIZE: usize = 50;

/// Default retention time (7 days in ms)
pub const MTM_RETENTION_MS: u64 = 604_800_000;

/// Mid-Term Memory - Consolidation and prioritization
///
/// Characteristics:
/// - Size: 50-200 items
/// - Sorted by importance × recency
/// - Automatic consolidation
/// - Transfer from STM
#[derive(Debug)]
pub struct MidTermMemory {
    /// Entries stored in Vec for sorted access
    entries: Arc<RwLock<Vec<MemoryEntry>>>,
    /// Maximum capacity
    max_size: usize,
    /// Minimum size before truncation
    min_size: usize,
    /// Retention time in milliseconds
    retention_ms: u64,
    /// Consolidation weight for importance (0.0-1.0)
    importance_weight: f32,
    /// Consolidation weight for recency (0.0-1.0)
    recency_weight: f32,
}

impl MidTermMemory {
    /// Create new MTM with default settings
    pub fn new() -> Self {
        Self {
            entries: Arc::new(RwLock::new(Vec::with_capacity(MTM_MAX_SIZE))),
            max_size: MTM_MAX_SIZE,
            min_size: MTM_MIN_SIZE,
            retention_ms: MTM_RETENTION_MS,
            importance_weight: 0.6,
            recency_weight: 0.4,
        }
    }

    /// Create MTM with custom capacity
    pub fn with_capacity(max_size: usize, min_size: usize) -> Self {
        Self {
            entries: Arc::new(RwLock::new(Vec::with_capacity(max_size))),
            max_size,
            min_size: min_size.min(max_size),
            retention_ms: MTM_RETENTION_MS,
            importance_weight: 0.6,
            recency_weight: 0.4,
        }
    }

    /// Add entry to MTM
    pub async fn add(&self, mut entry: MemoryEntry) {
        entry.tier = MemoryTier::MTM;

        let mut entries = self.entries.write().await;
        entries.push(entry);
    }

    /// Add multiple entries at once (batch from STM)
    pub async fn add_batch(&self, mut new_entries: Vec<MemoryEntry>) {
        for entry in &mut new_entries {
            entry.tier = MemoryTier::MTM;
        }

        let mut entries = self.entries.write().await;
        entries.extend(new_entries);
    }

    /// Consolidate entries - sort by score and truncate
    /// Returns entries that were removed (for potential LTM promotion)
    pub async fn consolidate(&self) -> Vec<MemoryEntry> {
        let start = std::time::Instant::now();

        let mut entries = self.entries.write().await;
        let now = chrono::Utc::now().timestamp_millis();

        // Calculate consolidation score for each entry
        entries.sort_by(|a, b| {
            let score_a = self.consolidation_score(a, now);
            let score_b = self.consolidation_score(b, now);
            score_b
                .partial_cmp(&score_a)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        // Truncate to max size, returning removed entries
        let overflow = if entries.len() > self.max_size {
            entries.split_off(self.max_size)
        } else {
            Vec::new()
        };

        let duration = start.elapsed();
        if duration.as_millis() > super::targets::MTM_CONSOLIDATION_MS {
            log_warn!(
                "MTM consolidation exceeded target: {}ms",
                duration.as_millis()
            );
        }

        overflow
    }

    /// Calculate consolidation score
    fn consolidation_score(&self, entry: &MemoryEntry, now: i64) -> f32 {
        // Age factor: more recent = higher score
        let age_hours = (now - entry.timestamp) as f32 / 3_600_000.0;
        let recency_factor = 1.0 / (1.0 + age_hours * 0.1);

        // Access factor: more accessed = higher score
        let access_factor = (entry.access_count as f32).ln_1p() * 0.05;

        // Combine factors
        entry.importance * self.importance_weight
            + recency_factor * self.recency_weight
            + access_factor
    }

    /// Get all entries
    pub async fn get_all(&self) -> Vec<MemoryEntry> {
        self.entries.read().await.clone()
    }

    /// Get entry by ID
    pub async fn get(&self, id: &uuid::Uuid) -> Option<MemoryEntry> {
        let entries = self.entries.read().await;
        entries.iter().find(|e| &e.id == id).cloned()
    }

    /// Get and mark as accessed
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

        let mut results: Vec<_> = entries
            .iter()
            .filter(|e| {
                e.content.to_lowercase().contains(&query_lower)
                    || e.tags
                        .iter()
                        .any(|t| t.to_lowercase().contains(&query_lower))
            })
            .cloned()
            .collect();

        // Sort by relevance (importance)
        // FIX: Handle NaN values safely to prevent panic
        results.sort_by(|a, b| b.importance.partial_cmp(&a.importance).unwrap_or(std::cmp::Ordering::Equal));
        results.truncate(limit);
        results
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

    /// Get top N entries by importance
    pub async fn top_important(&self, n: usize) -> Vec<MemoryEntry> {
        let entries = self.entries.read().await;
        let mut sorted = entries.clone();
        // FIX: Handle NaN values safely to prevent panic
        sorted.sort_by(|a, b| b.importance.partial_cmp(&a.importance).unwrap_or(std::cmp::Ordering::Equal));
        sorted.truncate(n);
        sorted
    }

    /// Get entries above importance threshold
    pub async fn above_importance(&self, threshold: f32) -> Vec<MemoryEntry> {
        let entries = self.entries.read().await;
        entries
            .iter()
            .filter(|e| e.importance >= threshold)
            .cloned()
            .collect()
    }

    /// Remove entry by ID
    pub async fn remove(&self, id: &uuid::Uuid) -> Option<MemoryEntry> {
        let mut entries = self.entries.write().await;
        entries
            .iter()
            .position(|e| &e.id == id)
            .map(|pos| entries.remove(pos))
    }

    /// Remove and return all entries
    pub async fn drain(&self) -> Vec<MemoryEntry> {
        let mut entries = self.entries.write().await;
        std::mem::take(&mut *entries)
    }

    /// Remove entries older than retention time
    pub async fn cleanup_expired(&self) -> Vec<MemoryEntry> {
        let now = chrono::Utc::now().timestamp_millis();
        let threshold = now - self.retention_ms as i64;

        let mut entries = self.entries.write().await;
        let (keep, expired): (Vec<_>, Vec<_>) =
            entries.drain(..).partition(|e| e.timestamp >= threshold);

        *entries = keep;
        expired
    }

    /// Get entries ready for LTM promotion (high importance + old enough)
    pub async fn get_ltm_candidates(
        &self,
        importance_threshold: f32,
        age_threshold_ms: i64,
    ) -> Vec<MemoryEntry> {
        let now = chrono::Utc::now().timestamp_millis();
        let entries = self.entries.read().await;

        entries
            .iter()
            .filter(|e| {
                e.importance >= importance_threshold && (now - e.timestamp) >= age_threshold_ms
            })
            .cloned()
            .collect()
    }

    /// Promote entries to LTM tier (marks them but doesn't move)
    pub async fn mark_for_ltm(&self, ids: &[uuid::Uuid]) {
        let mut entries = self.entries.write().await;
        for entry in entries.iter_mut() {
            if ids.contains(&entry.id) {
                entry.tier = MemoryTier::LTM;
            }
        }
    }

    /// Remove entries marked for LTM
    pub async fn extract_ltm_marked(&self) -> Vec<MemoryEntry> {
        let mut entries = self.entries.write().await;
        let (keep, ltm): (Vec<_>, Vec<_>) =
            entries.drain(..).partition(|e| e.tier != MemoryTier::LTM);

        *entries = keep;
        ltm
    }

    /// Get current count
    pub async fn len(&self) -> usize {
        self.entries.read().await.len()
    }

    /// Check if empty
    pub async fn is_empty(&self) -> bool {
        self.entries.read().await.is_empty()
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

        let oldest_age_ms = entries.iter().map(|e| now - e.timestamp).max().unwrap_or(0);

        let newest_age_ms = entries.iter().map(|e| now - e.timestamp).min().unwrap_or(0);

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
            tier: MemoryTier::MTM,
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

    /// Update importance weight
    pub fn set_importance_weight(&mut self, weight: f32) {
        self.importance_weight = weight.clamp(0.0, 1.0);
        self.recency_weight = 1.0 - self.importance_weight;
    }
}

impl Default for MidTermMemory {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for MidTermMemory {
    fn clone(&self) -> Self {
        Self {
            entries: Arc::clone(&self.entries),
            max_size: self.max_size,
            min_size: self.min_size,
            retention_ms: self.retention_ms,
            importance_weight: self.importance_weight,
            recency_weight: self.recency_weight,
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
    async fn test_mtm_add() {
        let mtm = MidTermMemory::new();
        let entry = MemoryEntry::new("Test".to_string(), 0.5, MemoryType::Conversation);

        mtm.add(entry).await;
        assert_eq!(mtm.len().await, 1);
    }

    #[tokio::test]
    async fn test_mtm_batch_add() {
        let mtm = MidTermMemory::new();
        let entries: Vec<_> = (0..10)
            .map(|i| MemoryEntry::new(format!("Entry {}", i), 0.5, MemoryType::Conversation))
            .collect();

        mtm.add_batch(entries).await;
        assert_eq!(mtm.len().await, 10);
    }

    #[tokio::test]
    async fn test_mtm_consolidation() {
        let mtm = MidTermMemory::with_capacity(5, 3);

        // Add more than capacity
        for i in 0..10 {
            let importance = (10 - i) as f32 / 10.0;
            let entry =
                MemoryEntry::new(format!("Entry {}", i), importance, MemoryType::Conversation);
            mtm.add(entry).await;
        }

        let overflow = mtm.consolidate().await;

        // Should have truncated to max_size
        assert_eq!(mtm.len().await, 5);
        // Overflow should contain the less important entries
        assert_eq!(overflow.len(), 5);
    }

    #[tokio::test]
    async fn test_mtm_search() {
        let mtm = MidTermMemory::new();

        let entry1 = MemoryEntry::new("Hello world".to_string(), 0.5, MemoryType::Conversation);
        let entry2 = MemoryEntry::new("Test entry".to_string(), 0.5, MemoryType::Conversation);

        mtm.add(entry1).await;
        mtm.add(entry2).await;

        let results = mtm.search("world", 10).await;
        assert_eq!(results.len(), 1);
    }

    #[tokio::test]
    async fn test_mtm_top_important() {
        let mtm = MidTermMemory::new();

        for i in 0..5 {
            let importance = i as f32 / 5.0;
            let entry =
                MemoryEntry::new(format!("Entry {}", i), importance, MemoryType::Conversation);
            mtm.add(entry).await;
        }

        let top = mtm.top_important(2).await;
        assert_eq!(top.len(), 2);
        assert!(top[0].importance >= top[1].importance);
    }

    #[tokio::test]
    async fn test_mtm_ltm_candidates() {
        let mtm = MidTermMemory::new();

        let high_importance = MemoryEntry::new("Important".to_string(), 0.9, MemoryType::Decision);
        let low_importance = MemoryEntry::new("Normal".to_string(), 0.3, MemoryType::Conversation);

        mtm.add(high_importance).await;
        mtm.add(low_importance).await;

        let candidates = mtm.get_ltm_candidates(0.8, 0).await;
        assert_eq!(candidates.len(), 1);
        assert_eq!(candidates[0].content, "Important");
    }

    #[tokio::test]
    async fn test_mtm_snapshot() {
        let mtm = MidTermMemory::new();

        let entry = MemoryEntry::new("Test".to_string(), 0.7, MemoryType::Knowledge)
            .with_tags(vec!["tag1".to_string()]);

        mtm.add(entry).await;

        let snapshot = mtm.snapshot().await;
        assert_eq!(snapshot.tier, MemoryTier::MTM);
        assert_eq!(snapshot.count, 1);
        assert!(snapshot.avg_importance > 0.5);
    }
}
