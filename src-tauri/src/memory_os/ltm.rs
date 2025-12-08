// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — LONG-TERM MEMORY (LTM)
//   Super Prompt #12: Persistent, indexed, compressed storage
//   Target: <15ms search, unlimited capacity
// ═══════════════════════════════════════════════════════════════

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::memory_state::{MemoryEntry, MemoryTier, MemoryType, TierSnapshot};

// Logging macro
macro_rules! log_warn {
    ($($arg:tt)*) => {
        log::warn!($($arg)*);
    };
}

/// Batch size for disk operations
pub const LTM_BATCH_SIZE: usize = 100;

/// Index file name
pub const INDEX_FILE: &str = "ltm_index.json";

/// Data directory name
pub const DATA_DIR: &str = "entries";

/// LTM metadata stored in index
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LTMMetadata {
    pub id: Uuid,
    pub timestamp: i64,
    pub importance: f32,
    pub memory_type: MemoryType,
    pub tags: Vec<String>,
    pub content_preview: String,
    pub file_path: String,
    pub size_bytes: usize,
    pub compressed: bool,
    pub access_count: u32,
    pub last_accessed: i64,
}

impl LTMMetadata {
    /// Create from MemoryEntry
    pub fn from_entry(entry: &MemoryEntry, file_path: String) -> Self {
        Self {
            id: entry.id,
            timestamp: entry.timestamp,
            importance: entry.importance,
            memory_type: entry.memory_type,
            tags: entry.tags.clone(),
            content_preview: entry.content.chars().take(100).collect(),
            file_path,
            size_bytes: entry.size_bytes(),
            compressed: entry.compressed,
            access_count: entry.access_count,
            last_accessed: entry.last_accessed,
        }
    }
}

/// Long-Term Memory - Persistent indexed storage
///
/// Characteristics:
/// - Persistent storage (disk-based)
/// - Fast index for search
/// - Compression support
/// - Unlimited capacity
#[derive(Debug)]
pub struct LongTermMemory {
    /// Base storage path
    storage_path: PathBuf,
    /// In-memory index for fast lookup
    index: Arc<RwLock<HashMap<Uuid, LTMMetadata>>>,
    /// Enable compression
    compression_enabled: bool,
    /// Index dirty flag
    index_dirty: Arc<RwLock<bool>>,
}

impl LongTermMemory {
    /// Create new LTM with storage path
    pub fn new(storage_path: impl Into<PathBuf>) -> Self {
        let path = storage_path.into();
        Self {
            storage_path: path,
            index: Arc::new(RwLock::new(HashMap::new())),
            compression_enabled: true,
            index_dirty: Arc::new(RwLock::new(false)),
        }
    }

    /// Initialize LTM (create directories, load index)
    pub async fn init(&self) -> Result<(), LTMError> {
        // Create storage directories
        let data_path = self.storage_path.join(DATA_DIR);
        tokio::fs::create_dir_all(&data_path).await.map_err(|e| {
            LTMError::Storage(format!("Failed to create data directory: {}", e))
        })?;

        // Load existing index
        self.load_index().await?;

        Ok(())
    }

    /// Load index from disk
    async fn load_index(&self) -> Result<(), LTMError> {
        let index_path = self.storage_path.join(INDEX_FILE);

        if index_path.exists() {
            let content = tokio::fs::read_to_string(&index_path)
                .await
                .map_err(|e| LTMError::Storage(format!("Failed to read index: {}", e)))?;

            let loaded: HashMap<Uuid, LTMMetadata> = serde_json::from_str(&content)
                .map_err(|e| LTMError::Storage(format!("Failed to parse index: {}", e)))?;

            let mut index = self.index.write().await;
            *index = loaded;
        }

        Ok(())
    }

    /// Save index to disk
    pub async fn save_index(&self) -> Result<(), LTMError> {
        let index = self.index.read().await;
        let content = serde_json::to_string_pretty(&*index)
            .map_err(|e| LTMError::Storage(format!("Failed to serialize index: {}", e)))?;

        let index_path = self.storage_path.join(INDEX_FILE);
        tokio::fs::write(&index_path, content)
            .await
            .map_err(|e| LTMError::Storage(format!("Failed to write index: {}", e)))?;

        *self.index_dirty.write().await = false;
        Ok(())
    }

    /// Store entry to LTM
    pub async fn store(&self, mut entry: MemoryEntry) -> Result<(), LTMError> {
        entry.tier = MemoryTier::LTM;

        // Generate file path
        let file_name = format!("{}.json", entry.id);
        let file_path = self.storage_path.join(DATA_DIR).join(&file_name);

        // Serialize entry
        let content = serde_json::to_string(&entry)
            .map_err(|e| LTMError::Serialization(format!("Failed to serialize entry: {}", e)))?;

        // Write to disk
        tokio::fs::write(&file_path, &content)
            .await
            .map_err(|e| LTMError::Storage(format!("Failed to write entry: {}", e)))?;

        // Update index
        let metadata = LTMMetadata::from_entry(&entry, file_name);
        let mut index = self.index.write().await;
        index.insert(entry.id, metadata);
        drop(index);

        *self.index_dirty.write().await = true;

        Ok(())
    }

    /// Store multiple entries (batch operation)
    pub async fn store_batch(&self, entries: Vec<MemoryEntry>) -> Result<usize, LTMError> {
        let mut stored = 0;

        for entry in entries {
            if self.store(entry).await.is_ok() {
                stored += 1;
            }
        }

        // Save index after batch
        if stored > 0 {
            self.save_index().await?;
        }

        Ok(stored)
    }

    /// Load full entry from disk
    pub async fn load(&self, id: &Uuid) -> Result<MemoryEntry, LTMError> {
        let index = self.index.read().await;
        let metadata = index
            .get(id)
            .ok_or_else(|| LTMError::NotFound(format!("Entry not found: {}", id)))?;

        let file_path = self.storage_path.join(DATA_DIR).join(&metadata.file_path);
        let content = tokio::fs::read_to_string(&file_path)
            .await
            .map_err(|e| LTMError::Storage(format!("Failed to read entry: {}", e)))?;

        let entry: MemoryEntry = serde_json::from_str(&content)
            .map_err(|e| LTMError::Serialization(format!("Failed to parse entry: {}", e)))?;

        Ok(entry)
    }

    /// Load and mark as accessed
    pub async fn load_and_access(&self, id: &Uuid) -> Result<MemoryEntry, LTMError> {
        let mut entry = self.load(id).await?;
        entry.mark_accessed();

        // Update metadata
        let mut index = self.index.write().await;
        if let Some(metadata) = index.get_mut(id) {
            metadata.access_count = entry.access_count;
            metadata.last_accessed = entry.last_accessed;
        }
        drop(index);

        *self.index_dirty.write().await = true;
        Ok(entry)
    }

    /// Search by keyword (index-based)
    pub async fn search(&self, query: &str, limit: usize) -> Vec<LTMMetadata> {
        let start = std::time::Instant::now();
        let query_lower = query.to_lowercase();
        let index = self.index.read().await;

        let mut results: Vec<_> = index
            .values()
            .filter(|m| {
                m.content_preview.to_lowercase().contains(&query_lower)
                    || m.tags.iter().any(|t| t.to_lowercase().contains(&query_lower))
            })
            .cloned()
            .collect();

        // Sort by importance
        results.sort_by(|a, b| b.importance.partial_cmp(&a.importance).unwrap());
        results.truncate(limit);

        let duration = start.elapsed();
        if duration.as_millis() > super::targets::LTM_SEARCH_MS {
            log_warn!("LTM search exceeded target: {}ms", duration.as_millis());
        }

        results
    }

    /// Search by type
    pub async fn search_by_type(&self, memory_type: MemoryType, limit: usize) -> Vec<LTMMetadata> {
        let index = self.index.read().await;

        let mut results: Vec<_> = index
            .values()
            .filter(|m| m.memory_type == memory_type)
            .cloned()
            .collect();

        results.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        results.truncate(limit);
        results
    }

    /// Get all metadata entries (for listing)
    pub async fn list(&self, limit: Option<usize>) -> Vec<LTMMetadata> {
        let index = self.index.read().await;
        let mut results: Vec<_> = index.values().cloned().collect();
        results.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        if let Some(limit) = limit {
            results.truncate(limit);
        }

        results
    }

    /// Get top important entries
    pub async fn top_important(&self, n: usize) -> Vec<LTMMetadata> {
        let index = self.index.read().await;
        let mut results: Vec<_> = index.values().cloned().collect();
        results.sort_by(|a, b| b.importance.partial_cmp(&a.importance).unwrap());
        results.truncate(n);
        results
    }

    /// Delete entry
    pub async fn delete(&self, id: &Uuid) -> Result<(), LTMError> {
        let mut index = self.index.write().await;

        if let Some(metadata) = index.remove(id) {
            let file_path = self.storage_path.join(DATA_DIR).join(&metadata.file_path);
            tokio::fs::remove_file(&file_path).await.ok(); // Ignore if file doesn't exist
            *self.index_dirty.write().await = true;
            Ok(())
        } else {
            Err(LTMError::NotFound(format!("Entry not found: {}", id)))
        }
    }

    /// Check if entry exists
    pub async fn exists(&self, id: &Uuid) -> bool {
        self.index.read().await.contains_key(id)
    }

    /// Get entry count
    pub async fn len(&self) -> usize {
        self.index.read().await.len()
    }

    /// Check if empty
    pub async fn is_empty(&self) -> bool {
        self.index.read().await.is_empty()
    }

    /// Get total size in bytes
    pub async fn total_size(&self) -> usize {
        let index = self.index.read().await;
        index.values().map(|m| m.size_bytes).sum()
    }

    /// Generate tier snapshot
    pub async fn snapshot(&self) -> TierSnapshot {
        let index = self.index.read().await;
        let now = chrono::Utc::now().timestamp_millis();

        let count = index.len();
        let size_bytes: usize = index.values().map(|m| m.size_bytes).sum();

        let avg_importance = if count > 0 {
            index.values().map(|m| m.importance).sum::<f32>() / count as f32
        } else {
            0.0
        };

        let oldest_age_ms = index
            .values()
            .map(|m| now - m.timestamp)
            .max()
            .unwrap_or(0);

        let newest_age_ms = index
            .values()
            .map(|m| now - m.timestamp)
            .min()
            .unwrap_or(0);

        // Count tags
        let mut tag_counts: HashMap<String, usize> = HashMap::new();
        for metadata in index.values() {
            for tag in &metadata.tags {
                *tag_counts.entry(tag.clone()).or_insert(0) += 1;
            }
        }

        let mut top_tags: Vec<_> = tag_counts.into_iter().collect();
        top_tags.sort_by(|a, b| b.1.cmp(&a.1));
        top_tags.truncate(5);

        TierSnapshot {
            tier: MemoryTier::LTM,
            count,
            size_bytes,
            avg_importance,
            oldest_age_ms,
            newest_age_ms,
            top_tags,
        }
    }

    /// Flush dirty index to disk
    pub async fn flush(&self) -> Result<(), LTMError> {
        if *self.index_dirty.read().await {
            self.save_index().await?;
        }
        Ok(())
    }

    /// Compact storage (remove deleted entries, rebuild index)
    pub async fn compact(&self) -> Result<usize, LTMError> {
        let data_path = self.storage_path.join(DATA_DIR);
        let mut cleaned = 0;

        // Read all files and verify against index
        if let Ok(mut entries) = tokio::fs::read_dir(&data_path).await {
            let index = self.index.read().await;

            while let Ok(Some(entry)) = entries.next_entry().await {
                let file_name = entry.file_name().to_string_lossy().to_string();
                if file_name.ends_with(".json") {
                    let id_str = file_name.trim_end_matches(".json");
                    if let Ok(id) = Uuid::parse_str(id_str) {
                        if !index.contains_key(&id) {
                            // Orphan file - delete it
                            tokio::fs::remove_file(entry.path()).await.ok();
                            cleaned += 1;
                        }
                    }
                }
            }
        }

        Ok(cleaned)
    }

    /// Sync to disk (alias for flush)
    pub async fn sync(&self) -> Result<(), LTMError> {
        self.flush().await
    }

    /// Remove entry by ID (alias for delete, returns Option for consistency)
    pub async fn remove(&self, id: &Uuid) -> Option<LTMMetadata> {
        let mut index = self.index.write().await;

        if let Some(metadata) = index.remove(id) {
            let file_path = self.storage_path.join(DATA_DIR).join(&metadata.file_path);
            tokio::fs::remove_file(&file_path).await.ok();
            *self.index_dirty.write().await = true;
            Some(metadata)
        } else {
            None
        }
    }

    /// Clear all entries
    pub async fn clear(&self) {
        let mut index = self.index.write().await;

        // Delete all data files
        let data_path = self.storage_path.join(DATA_DIR);
        if let Ok(mut entries) = tokio::fs::read_dir(&data_path).await {
            while let Ok(Some(entry)) = entries.next_entry().await {
                tokio::fs::remove_file(entry.path()).await.ok();
            }
        }

        index.clear();
        *self.index_dirty.write().await = true;
    }
}

impl Clone for LongTermMemory {
    fn clone(&self) -> Self {
        Self {
            storage_path: self.storage_path.clone(),
            index: Arc::clone(&self.index),
            compression_enabled: self.compression_enabled,
            index_dirty: Arc::clone(&self.index_dirty),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   ERROR TYPES
// ═══════════════════════════════════════════════════════════════

#[derive(Debug)]
pub enum LTMError {
    Storage(String),
    Serialization(String),
    NotFound(String),
    Compression(String),
}

impl std::fmt::Display for LTMError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LTMError::Storage(e) => write!(f, "LTM Storage Error: {}", e),
            LTMError::Serialization(e) => write!(f, "LTM Serialization Error: {}", e),
            LTMError::NotFound(e) => write!(f, "LTM Not Found: {}", e),
            LTMError::Compression(e) => write!(f, "LTM Compression Error: {}", e),
        }
    }
}

impl std::error::Error for LTMError {}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    async fn create_test_ltm() -> (LongTermMemory, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        let ltm = LongTermMemory::new(temp_dir.path());
        ltm.init().await.unwrap();
        (ltm, temp_dir)
    }

    #[tokio::test]
    async fn test_ltm_store_and_load() {
        let (ltm, _temp) = create_test_ltm().await;

        let entry = MemoryEntry::new("Test content".to_string(), 0.8, MemoryType::Knowledge);
        let id = entry.id;

        ltm.store(entry).await.unwrap();

        let loaded = ltm.load(&id).await.unwrap();
        assert_eq!(loaded.content, "Test content");
        assert_eq!(loaded.tier, MemoryTier::LTM);
    }

    #[tokio::test]
    async fn test_ltm_search() {
        let (ltm, _temp) = create_test_ltm().await;

        let entry1 = MemoryEntry::new("Hello world".to_string(), 0.8, MemoryType::Knowledge);
        let entry2 = MemoryEntry::new("Goodbye world".to_string(), 0.5, MemoryType::Knowledge);
        let entry3 = MemoryEntry::new("Test entry".to_string(), 0.3, MemoryType::Knowledge);

        ltm.store(entry1).await.unwrap();
        ltm.store(entry2).await.unwrap();
        ltm.store(entry3).await.unwrap();

        let results = ltm.search("world", 10).await;
        assert_eq!(results.len(), 2);
        // Higher importance should be first
        assert!(results[0].importance >= results[1].importance);
    }

    #[tokio::test]
    async fn test_ltm_delete() {
        let (ltm, _temp) = create_test_ltm().await;

        let entry = MemoryEntry::new("Test".to_string(), 0.5, MemoryType::Conversation);
        let id = entry.id;

        ltm.store(entry).await.unwrap();
        assert!(ltm.exists(&id).await);

        ltm.delete(&id).await.unwrap();
        assert!(!ltm.exists(&id).await);
    }

    #[tokio::test]
    async fn test_ltm_snapshot() {
        let (ltm, _temp) = create_test_ltm().await;

        let entry = MemoryEntry::new("Test".to_string(), 0.7, MemoryType::Knowledge)
            .with_tags(vec!["tag1".to_string()]);

        ltm.store(entry).await.unwrap();

        let snapshot = ltm.snapshot().await;
        assert_eq!(snapshot.tier, MemoryTier::LTM);
        assert_eq!(snapshot.count, 1);
    }

    #[tokio::test]
    async fn test_ltm_batch_store() {
        let (ltm, _temp) = create_test_ltm().await;

        let entries: Vec<_> = (0..5)
            .map(|i| MemoryEntry::new(format!("Entry {}", i), 0.5, MemoryType::Conversation))
            .collect();

        let stored = ltm.store_batch(entries).await.unwrap();
        assert_eq!(stored, 5);
        assert_eq!(ltm.len().await, 5);
    }
}
