// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — MEMORY INDEXER
//   Super Prompt #12: Fast lookup indices for memory system
//   Target: <5ms index lookup
// ═══════════════════════════════════════════════════════════════

use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::memory_state::{MemoryEntry, MemoryTier, MemoryType};

/// Index entry metadata (lightweight)
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct IndexEntry {
    pub id: Uuid,
    pub tier: MemoryTier,
    pub memory_type: MemoryType,
    pub importance: f32,
    pub timestamp: i64,
    pub content_hash: u64,
}

impl From<&MemoryEntry> for IndexEntry {
    fn from(entry: &MemoryEntry) -> Self {
        Self {
            id: entry.id,
            tier: entry.tier.clone(),
            memory_type: entry.memory_type.clone(),
            importance: entry.importance,
            timestamp: entry.timestamp,
            content_hash: Self::hash_content(&entry.content),
        }
    }
}

impl IndexEntry {
    fn hash_content(content: &str) -> u64 {
        use std::hash::{Hash, Hasher};
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        content.hash(&mut hasher);
        hasher.finish()
    }
}

/// Index statistics
#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct IndexStats {
    pub total_entries: usize,
    pub by_tier: HashMap<String, usize>,
    pub by_type: HashMap<String, usize>,
    pub tag_count: usize,
    pub unique_sources: usize,
}

/// Memory Indexer - Fast lookups across all memory tiers
///
/// Maintains multiple indices for efficient querying:
/// - By ID (primary index)
/// - By tier (STM, MTM, LTM)
/// - By type (Conversation, Decision, etc.)
/// - By tag
/// - By source
/// - By content hash (for deduplication)
#[derive(Debug)]
pub struct MemoryIndexer {
    /// Primary index: ID → IndexEntry
    primary: Arc<RwLock<HashMap<Uuid, IndexEntry>>>,
    /// Tier index: Tier → Set<ID>
    by_tier: Arc<RwLock<HashMap<MemoryTier, HashSet<Uuid>>>>,
    /// Type index: Type → Set<ID>
    by_type: Arc<RwLock<HashMap<MemoryType, HashSet<Uuid>>>>,
    /// Tag index: Tag → Set<ID>
    by_tag: Arc<RwLock<HashMap<String, HashSet<Uuid>>>>,
    /// Source index: Source → Set<ID>
    by_source: Arc<RwLock<HashMap<String, HashSet<Uuid>>>>,
    /// Content hash index (for deduplication)
    by_hash: Arc<RwLock<HashMap<u64, HashSet<Uuid>>>>,
}

impl MemoryIndexer {
    /// Create new indexer
    pub fn new() -> Self {
        Self {
            primary: Arc::new(RwLock::new(HashMap::new())),
            by_tier: Arc::new(RwLock::new(HashMap::new())),
            by_type: Arc::new(RwLock::new(HashMap::new())),
            by_tag: Arc::new(RwLock::new(HashMap::new())),
            by_source: Arc::new(RwLock::new(HashMap::new())),
            by_hash: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Index a memory entry
    pub async fn index(&self, entry: &MemoryEntry) {
        let index_entry = IndexEntry::from(entry);

        // Primary index
        self.primary
            .write()
            .await
            .insert(entry.id, index_entry.clone());

        // Tier index
        self.by_tier
            .write()
            .await
            .entry(entry.tier.clone())
            .or_default()
            .insert(entry.id);

        // Type index
        self.by_type
            .write()
            .await
            .entry(entry.memory_type.clone())
            .or_default()
            .insert(entry.id);

        // Tag index
        for tag in &entry.tags {
            self.by_tag
                .write()
                .await
                .entry(tag.clone())
                .or_default()
                .insert(entry.id);
        }

        // Source index
        if let Some(ref source) = entry.source {
            self.by_source
                .write()
                .await
                .entry(source.clone())
                .or_default()
                .insert(entry.id);
        }

        // Hash index
        self.by_hash
            .write()
            .await
            .entry(index_entry.content_hash)
            .or_default()
            .insert(entry.id);
    }

    /// Index multiple entries at once
    pub async fn index_batch(&self, entries: &[MemoryEntry]) {
        for entry in entries {
            self.index(entry).await;
        }
    }

    /// Remove entry from all indices
    pub async fn remove(&self, id: &Uuid) -> Option<IndexEntry> {
        let entry = self.primary.write().await.remove(id)?;

        // Remove from tier index
        if let Some(set) = self.by_tier.write().await.get_mut(&entry.tier) {
            set.remove(id);
        }

        // Remove from type index
        if let Some(set) = self.by_type.write().await.get_mut(&entry.memory_type) {
            set.remove(id);
        }

        // Remove from hash index
        if let Some(set) = self.by_hash.write().await.get_mut(&entry.content_hash) {
            set.remove(id);
        }

        // Note: Tag and source indices would need the original entry to clean up
        // For now, they'll have stale references that are filtered on lookup

        Some(entry)
    }

    /// Get entry by ID
    pub async fn get(&self, id: &Uuid) -> Option<IndexEntry> {
        self.primary.read().await.get(id).cloned()
    }

    /// Check if entry exists
    pub async fn exists(&self, id: &Uuid) -> bool {
        self.primary.read().await.contains_key(id)
    }

    /// Get IDs by tier
    pub async fn get_by_tier(&self, tier: &MemoryTier) -> Vec<Uuid> {
        self.by_tier
            .read()
            .await
            .get(tier)
            .map(|s| s.iter().cloned().collect())
            .unwrap_or_default()
    }

    /// Get IDs by type
    pub async fn get_by_type(&self, memory_type: &MemoryType) -> Vec<Uuid> {
        self.by_type
            .read()
            .await
            .get(memory_type)
            .map(|s| s.iter().cloned().collect())
            .unwrap_or_default()
    }

    /// Get IDs by tag
    pub async fn get_by_tag(&self, tag: &str) -> Vec<Uuid> {
        let primary = self.primary.read().await;
        self.by_tag
            .read()
            .await
            .get(tag)
            .map(|s| {
                s.iter()
                    .filter(|id| primary.contains_key(id)) // Filter stale refs
                    .cloned()
                    .collect()
            })
            .unwrap_or_default()
    }

    /// Get IDs by source
    pub async fn get_by_source(&self, source: &str) -> Vec<Uuid> {
        let primary = self.primary.read().await;
        self.by_source
            .read()
            .await
            .get(source)
            .map(|s| {
                s.iter()
                    .filter(|id| primary.contains_key(id)) // Filter stale refs
                    .cloned()
                    .collect()
            })
            .unwrap_or_default()
    }

    /// Find potential duplicates by content hash
    pub async fn find_duplicates(&self, content: &str) -> Vec<Uuid> {
        let hash = IndexEntry::hash_content(content);
        self.by_hash
            .read()
            .await
            .get(&hash)
            .map(|s| s.iter().cloned().collect())
            .unwrap_or_default()
    }

    /// Get entries above importance threshold
    pub async fn get_important(&self, threshold: f32) -> Vec<IndexEntry> {
        self.primary
            .read()
            .await
            .values()
            .filter(|e| e.importance >= threshold)
            .cloned()
            .collect()
    }

    /// Get recent entries (within time window)
    pub async fn get_recent(&self, window_ms: i64) -> Vec<IndexEntry> {
        let now = chrono::Utc::now().timestamp_millis();
        let threshold = now - window_ms;

        self.primary
            .read()
            .await
            .values()
            .filter(|e| e.timestamp >= threshold)
            .cloned()
            .collect()
    }

    /// Get all tags with their counts
    pub async fn get_all_tags(&self) -> HashMap<String, usize> {
        let primary = self.primary.read().await;
        self.by_tag
            .read()
            .await
            .iter()
            .map(|(tag, ids)| {
                let valid_count = ids.iter().filter(|id| primary.contains_key(id)).count();
                (tag.clone(), valid_count)
            })
            .filter(|(_, count)| *count > 0)
            .collect()
    }

    /// Get index statistics
    pub async fn stats(&self) -> IndexStats {
        let primary = self.primary.read().await;
        let by_tier = self.by_tier.read().await;
        let by_type = self.by_type.read().await;
        let by_tag = self.by_tag.read().await;
        let by_source = self.by_source.read().await;

        IndexStats {
            total_entries: primary.len(),
            by_tier: by_tier
                .iter()
                .map(|(k, v)| (format!("{:?}", k), v.len()))
                .collect(),
            by_type: by_type
                .iter()
                .map(|(k, v)| (format!("{:?}", k), v.len()))
                .collect(),
            tag_count: by_tag.len(),
            unique_sources: by_source.len(),
        }
    }

    /// Clear all indices
    pub async fn clear(&self) {
        self.primary.write().await.clear();
        self.by_tier.write().await.clear();
        self.by_type.write().await.clear();
        self.by_tag.write().await.clear();
        self.by_source.write().await.clear();
        self.by_hash.write().await.clear();
    }

    /// Rebuild indices from entries
    pub async fn rebuild(&self, entries: &[MemoryEntry]) {
        self.clear().await;
        self.index_batch(entries).await;
    }

    /// Update tier for an entry
    pub async fn update_tier(&self, id: &Uuid, new_tier: MemoryTier) {
        let mut primary = self.primary.write().await;
        let mut by_tier = self.by_tier.write().await;

        if let Some(entry) = primary.get_mut(id) {
            // Remove from old tier
            if let Some(set) = by_tier.get_mut(&entry.tier) {
                set.remove(id);
            }

            // Update entry
            entry.tier = new_tier.clone();

            // Add to new tier
            by_tier.entry(new_tier).or_default().insert(*id);
        }
    }

    /// Update importance for an entry
    pub async fn update_importance(&self, id: &Uuid, importance: f32) {
        if let Some(entry) = self.primary.write().await.get_mut(id) {
            entry.importance = importance;
        }
    }
}

impl Default for MemoryIndexer {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for MemoryIndexer {
    fn clone(&self) -> Self {
        Self {
            primary: Arc::clone(&self.primary),
            by_tier: Arc::clone(&self.by_tier),
            by_type: Arc::clone(&self.by_type),
            by_tag: Arc::clone(&self.by_tag),
            by_source: Arc::clone(&self.by_source),
            by_hash: Arc::clone(&self.by_hash),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_entry(content: &str, importance: f32, tier: MemoryTier) -> MemoryEntry {
        let mut entry = MemoryEntry::new(content.to_string(), importance, MemoryType::Conversation);
        entry.tier = tier;
        entry
    }

    #[tokio::test]
    async fn test_indexer_basic() {
        let indexer = MemoryIndexer::new();
        let entry = create_test_entry("Test content", 0.5, MemoryTier::STM);
        let id = entry.id;

        indexer.index(&entry).await;

        assert!(indexer.exists(&id).await);
        let retrieved = indexer.get(&id).await.unwrap();
        assert_eq!(retrieved.id, id);
    }

    #[tokio::test]
    async fn test_indexer_by_tier() {
        let indexer = MemoryIndexer::new();

        let stm_entry = create_test_entry("STM", 0.5, MemoryTier::STM);
        let mtm_entry = create_test_entry("MTM", 0.5, MemoryTier::MTM);
        let ltm_entry = create_test_entry("LTM", 0.5, MemoryTier::LTM);

        indexer.index(&stm_entry).await;
        indexer.index(&mtm_entry).await;
        indexer.index(&ltm_entry).await;

        let stm_ids = indexer.get_by_tier(&MemoryTier::STM).await;
        assert_eq!(stm_ids.len(), 1);
        assert!(stm_ids.contains(&stm_entry.id));
    }

    #[tokio::test]
    async fn test_indexer_by_tag() {
        let indexer = MemoryIndexer::new();

        let mut entry = create_test_entry("Tagged", 0.5, MemoryTier::STM);
        entry.tags = vec!["important".to_string(), "work".to_string()];

        indexer.index(&entry).await;

        let by_tag = indexer.get_by_tag("important").await;
        assert_eq!(by_tag.len(), 1);
        assert!(by_tag.contains(&entry.id));
    }

    #[tokio::test]
    async fn test_find_duplicates() {
        let indexer = MemoryIndexer::new();

        let entry1 = create_test_entry("Same content", 0.5, MemoryTier::STM);
        let entry2 = create_test_entry("Same content", 0.6, MemoryTier::MTM);

        indexer.index(&entry1).await;
        indexer.index(&entry2).await;

        let duplicates = indexer.find_duplicates("Same content").await;
        assert_eq!(duplicates.len(), 2);
    }

    #[tokio::test]
    async fn test_remove_entry() {
        let indexer = MemoryIndexer::new();
        let entry = create_test_entry("To remove", 0.5, MemoryTier::STM);
        let id = entry.id;

        indexer.index(&entry).await;
        assert!(indexer.exists(&id).await);

        indexer.remove(&id).await;
        assert!(!indexer.exists(&id).await);
    }

    #[tokio::test]
    async fn test_stats() {
        let indexer = MemoryIndexer::new();

        for i in 0..5 {
            let entry = create_test_entry(&format!("Entry {}", i), 0.5, MemoryTier::STM);
            indexer.index(&entry).await;
        }

        let stats = indexer.stats().await;
        assert_eq!(stats.total_entries, 5);
    }
}
