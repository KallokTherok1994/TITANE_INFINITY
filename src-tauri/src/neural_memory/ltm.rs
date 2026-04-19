// ═══════════════════════════════════════════════════════════════
//   NEURAL MEMORY — LTM (Long-Term Memory)
//   Persistent indexed storage, unlimited capacity
//   Migré et simplifié depuis memory_os/ltm.rs
// ═══════════════════════════════════════════════════════════════

use crate::unified_memory_v2::types::{
    MemoryEntry, MemoryError, MemoryResult, MemoryTier, MemoryType,
};
use std::collections::HashMap;
use std::path::{Component, Path, PathBuf};

/// LTM metadata for fast index lookup
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LTMMetadata {
    pub id: String,
    pub timestamp: i64,
    pub importance: f32,
    pub memory_type: MemoryType,
    pub tags: Vec<String>,
    pub content_preview: String,
    pub file_path: String,
    pub size_bytes: usize,
    pub access_count: u64,
}

impl LTMMetadata {
    pub fn from_entry(entry: &MemoryEntry, file_path: String) -> Self {
        Self {
            id: entry.id.clone(),
            timestamp: entry.created_at,
            importance: entry.importance,
            memory_type: entry.memory_type,
            tags: entry.tags.clone(),
            content_preview: entry.content.chars().take(100).collect(),
            file_path,
            size_bytes: entry.size_bytes(),
            access_count: entry.access_count,
        }
    }
}

/// Long-Term Memory (LTM)
///
/// Persistent disk-based storage with in-memory index for fast lookup.
/// Supports unlimited capacity through efficient file-based storage.
pub struct LongTermMemory {
    storage_path: PathBuf,
    index: HashMap<String, LTMMetadata>,
    index_dirty: bool,
}

impl LongTermMemory {
    fn validate_entry_id(id: &str) -> MemoryResult<()> {
        if id.is_empty() {
            return Err(MemoryError::ValidationError(
                "LTM entry id cannot be empty".to_string(),
            ));
        }

        if id.contains('\0') {
            return Err(MemoryError::ValidationError(
                "LTM entry id cannot contain NUL bytes".to_string(),
            ));
        }

        let id_path = Path::new(id);
        if id_path.is_absolute() {
            return Err(MemoryError::ValidationError(
                "LTM entry id cannot be absolute".to_string(),
            ));
        }

        if id.contains('/') || id.contains('\\') {
            return Err(MemoryError::ValidationError(
                "LTM entry id cannot contain path separators".to_string(),
            ));
        }

        if id_path.components().any(|component| {
            matches!(
                component,
                Component::ParentDir | Component::RootDir | Component::Prefix(_)
            )
        }) {
            return Err(MemoryError::ValidationError(
                "LTM entry id cannot escape entries directory".to_string(),
            ));
        }

        Ok(())
    }

    fn validate_metadata_file_path(id: &str, file_path: &str) -> MemoryResult<()> {
        if file_path.is_empty() {
            return Err(MemoryError::ValidationError(
                "LTM metadata file_path cannot be empty".to_string(),
            ));
        }

        if file_path.contains('\0') {
            return Err(MemoryError::ValidationError(
                "LTM metadata file_path cannot contain NUL bytes".to_string(),
            ));
        }

        let file_path_value = Path::new(file_path);
        if file_path_value.is_absolute() {
            return Err(MemoryError::ValidationError(
                "LTM metadata file_path cannot be absolute".to_string(),
            ));
        }

        if file_path.contains('/') || file_path.contains('\\') {
            return Err(MemoryError::ValidationError(
                "LTM metadata file_path cannot contain path separators".to_string(),
            ));
        }

        if file_path_value.components().any(|component| {
            matches!(
                component,
                Component::ParentDir | Component::RootDir | Component::Prefix(_)
            )
        }) {
            return Err(MemoryError::ValidationError(
                "LTM metadata file_path cannot escape entries directory".to_string(),
            ));
        }

        let expected = format!("{}.json", id);
        if file_path != expected {
            return Err(MemoryError::ValidationError(format!(
                "LTM metadata file_path must match expected entry file: {}",
                expected
            )));
        }

        Ok(())
    }

    /// Create new LTM with storage path
    pub fn new(storage_path: impl Into<PathBuf>) -> Self {
        Self {
            storage_path: storage_path.into(),
            index: HashMap::new(),
            index_dirty: false,
        }
    }

    /// Initialize (create directories, load index)
    pub async fn init(&mut self) -> MemoryResult<()> {
        let data_dir = self.storage_path.join("entries");
        tokio::fs::create_dir_all(&data_dir)
            .await
            .map_err(|e| MemoryError::StorageError(format!("Failed to create directory: {}", e)))?;

        self.load_index().await?;
        Ok(())
    }

    /// Load index from disk
    async fn load_index(&mut self) -> MemoryResult<()> {
        let index_path = self.storage_path.join("ltm_index.json");

        if index_path.exists() {
            let content = tokio::fs::read_to_string(&index_path)
                .await
                .map_err(|e| MemoryError::StorageError(format!("Failed to read index: {}", e)))?;

            self.index = serde_json::from_str(&content)
                .map_err(|e| MemoryError::StorageError(format!("Failed to parse index: {}", e)))?;
        }

        Ok(())
    }

    /// Save index to disk
    pub async fn save_index(&mut self) -> MemoryResult<()> {
        if !self.index_dirty {
            return Ok(());
        }

        let content = serde_json::to_string_pretty(&self.index)
            .map_err(|e| MemoryError::StorageError(format!("Failed to serialize index: {}", e)))?;

        let index_path = self.storage_path.join("ltm_index.json");
        tokio::fs::write(&index_path, content)
            .await
            .map_err(|e| MemoryError::StorageError(format!("Failed to write index: {}", e)))?;

        self.index_dirty = false;
        Ok(())
    }

    /// Store entry to LTM
    pub async fn store(&mut self, mut entry: MemoryEntry) -> MemoryResult<()> {
        Self::validate_entry_id(&entry.id)?;
        entry.tier = MemoryTier::LTM;

        let file_name = format!("{}.json", entry.id);
        let file_path = self.storage_path.join("entries").join(&file_name);

        let content = serde_json::to_string(&entry)
            .map_err(|e| MemoryError::StorageError(format!("Failed to serialize: {}", e)))?;

        tokio::fs::write(&file_path, &content)
            .await
            .map_err(|e| MemoryError::StorageError(format!("Failed to write file: {}", e)))?;

        let metadata = LTMMetadata::from_entry(&entry, file_name);
        self.index.insert(entry.id.clone(), metadata);
        self.index_dirty = true;

        Ok(())
    }

    /// Store batch of entries
    pub async fn store_batch(&mut self, entries: Vec<MemoryEntry>) -> MemoryResult<usize> {
        let mut stored = 0;

        for entry in entries {
            if self.store(entry).await.is_ok() {
                stored += 1;
            }
        }

        if stored > 0 {
            self.save_index().await?;
        }

        Ok(stored)
    }

    /// Load full entry from disk
    pub async fn load(&self, id: &str) -> MemoryResult<MemoryEntry> {
        let metadata = self
            .index
            .get(id)
            .ok_or_else(|| MemoryError::NotFound(format!("Entry not found: {}", id)))?;

        Self::validate_metadata_file_path(id, &metadata.file_path)?;
        let file_path = self.storage_path.join("entries").join(&metadata.file_path);
        let content = tokio::fs::read_to_string(&file_path)
            .await
            .map_err(|e| MemoryError::StorageError(format!("Failed to read file: {}", e)))?;

        serde_json::from_str(&content)
            .map_err(|e| MemoryError::StorageError(format!("Failed to deserialize: {}", e)))
    }

    /// Search index by keyword
    pub fn search(&self, query: &str) -> Vec<String> {
        let query_lower = query.to_lowercase();
        self.index
            .values()
            .filter(|m| m.content_preview.to_lowercase().contains(&query_lower))
            .map(|m| m.id.clone())
            .collect()
    }

    /// Get all IDs
    pub fn get_all_ids(&self) -> Vec<String> {
        self.index.keys().cloned().collect()
    }

    /// Remove entry
    pub async fn remove(&mut self, id: &str) -> MemoryResult<()> {
        if let Some(metadata) = self.index.remove(id) {
            Self::validate_metadata_file_path(id, &metadata.file_path)?;
            let file_path = self.storage_path.join("entries").join(&metadata.file_path);
            let _ = tokio::fs::remove_file(&file_path).await;
            self.index_dirty = true;
        }
        Ok(())
    }

    /// Get count
    pub fn count(&self) -> usize {
        self.index.len()
    }

    /// Get metadata
    pub fn get_metadata(&self, id: &str) -> Option<&LTMMetadata> {
        self.index.get(id)
    }

    /// Clear all
    pub async fn clear(&mut self) -> MemoryResult<()> {
        self.index.clear();
        self.index_dirty = true;
        self.save_index().await?;

        let entries_dir = self.storage_path.join("entries");
        let _ = tokio::fs::remove_dir_all(&entries_dir).await;
        tokio::fs::create_dir_all(&entries_dir).await.map_err(|e| {
            MemoryError::StorageError(format!("Failed to recreate directory: {}", e))
        })?;

        Ok(())
    }
}

impl Default for LongTermMemory {
    fn default() -> Self {
        Self::new("data/memory/ltm")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn create_test_entry(id: &str) -> MemoryEntry {
        let mut entry =
            MemoryEntry::new(format!("Content for {}", id), 0.8, MemoryType::Conversation);
        entry.id = id.to_string();
        entry
    }

    async fn create_test_ltm() -> (LongTermMemory, TempDir) {
        let temp_dir = TempDir::new().expect("TempDir should be created");
        let mut ltm = LongTermMemory::new(temp_dir.path());
        ltm.init().await.expect("LTM init should succeed");
        (ltm, temp_dir)
    }

    #[tokio::test]
    async fn test_ltm_store_rejects_path_traversal_id() {
        let (mut ltm, _temp_dir) = create_test_ltm().await;
        let entry = create_test_entry("../escape");

        let result = ltm.store(entry).await;

        assert!(matches!(result, Err(MemoryError::ValidationError(_))));
    }

    #[tokio::test]
    async fn test_ltm_load_rejects_traversal_metadata_file_path() {
        let (mut ltm, _temp_dir) = create_test_ltm().await;
        let entry = create_test_entry("entry-1");
        ltm.store(entry).await.expect("LTM store should succeed");

        let metadata = ltm
            .index
            .get_mut("entry-1")
            .expect("metadata should exist after store");
        metadata.file_path = "../escape.json".to_string();

        let result = ltm.load("entry-1").await;

        assert!(matches!(result, Err(MemoryError::ValidationError(_))));
    }

    #[tokio::test]
    async fn test_ltm_remove_rejects_absolute_metadata_file_path() {
        let (mut ltm, _temp_dir) = create_test_ltm().await;
        let entry = create_test_entry("entry-2");
        ltm.store(entry).await.expect("LTM store should succeed");

        let metadata = ltm
            .index
            .get_mut("entry-2")
            .expect("metadata should exist after store");
        metadata.file_path = "/tmp/escape.json".to_string();

        let result = ltm.remove("entry-2").await;

        assert!(matches!(result, Err(MemoryError::ValidationError(_))));
    }
}
