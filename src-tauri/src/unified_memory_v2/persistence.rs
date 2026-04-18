// ═══════════════════════════════════════════════════════════════
//   UNIFIED MEMORY V2 — PERSISTENCE
//   Disk I/O operations (migré depuis memory_persistence.rs)
// ═══════════════════════════════════════════════════════════════

use std::path::{Component, Path, PathBuf};
use tokio::fs;

use super::encryption::MemoryEncryption;
use super::types::{MemoryEntry, MemoryError, MemoryResult};

#[cfg(test)]
use super::types::{MemoryTier, MemoryType};

/// Memory persistence manager
pub struct MemoryPersistence {
    data_dir: PathBuf,
    encryption: Option<MemoryEncryption>,
}

impl MemoryPersistence {
    fn validate_entry_id(id: &str) -> MemoryResult<()> {
        if id.is_empty() {
            return Err(MemoryError::ValidationError(
                "Memory id cannot be empty".to_string(),
            ));
        }

        if id.contains('\0') {
            return Err(MemoryError::ValidationError(
                "Memory id contains null byte".to_string(),
            ));
        }

        let path = Path::new(id);
        if path.is_absolute()
            || path.has_root()
            || path
                .components()
                .any(|component| matches!(component, Component::ParentDir | Component::RootDir))
            || id.contains('/')
            || id.contains('\\')
        {
            return Err(MemoryError::ValidationError(
                "Memory id contains invalid path components".to_string(),
            ));
        }

        Ok(())
    }

    fn validate_tier_name(tier: &str) -> MemoryResult<()> {
        match tier {
            "stm" | "mtm" | "ltm" => Ok(()),
            _ => Err(MemoryError::ValidationError(format!(
                "Unsupported memory tier: {}",
                tier
            ))),
        }
    }

    /// Create new persistence manager
    pub fn new(data_dir: impl AsRef<Path>, encryption: Option<MemoryEncryption>) -> Self {
        Self {
            data_dir: data_dir.as_ref().to_path_buf(),
            encryption,
        }
    }

    /// Initialize persistence (create directories)
    pub async fn init(&self) -> MemoryResult<()> {
        fs::create_dir_all(&self.data_dir)
            .await
            .map_err(|e| MemoryError::StorageError(format!("Failed to create data dir: {}", e)))?;

        // Create tier-specific directories
        for tier in &["stm", "mtm", "ltm"] {
            let tier_dir = self.data_dir.join(tier);
            fs::create_dir_all(&tier_dir).await.map_err(|e| {
                MemoryError::StorageError(format!("Failed to create {} dir: {}", tier, e))
            })?;
        }

        Ok(())
    }

    /// Save memory entry to disk
    pub async fn save(&self, entry: &MemoryEntry) -> MemoryResult<()> {
        Self::validate_entry_id(&entry.id)?;
        let tier_dir = self.data_dir.join(entry.tier.name().to_lowercase());
        let file_path = tier_dir.join(format!("{}.json", entry.id));

        let json = serde_json::to_string_pretty(entry)
            .map_err(|e| MemoryError::StorageError(format!("Serialization error: {}", e)))?;

        let data = if let Some(enc) = &self.encryption {
            enc.encrypt_string(&json)?
        } else {
            json
        };

        fs::write(&file_path, data)
            .await
            .map_err(|e| MemoryError::StorageError(format!("Write error: {}", e)))?;

        Ok(())
    }

    /// Load memory entry from disk
    pub async fn load(&self, id: &str, tier: &str) -> MemoryResult<MemoryEntry> {
        Self::validate_entry_id(id)?;
        Self::validate_tier_name(tier)?;
        let file_path = self.data_dir.join(tier).join(format!("{}.json", id));

        let data = fs::read_to_string(&file_path)
            .await
            .map_err(|e| MemoryError::NotFound(format!("File not found: {}", e)))?;

        let json = if let Some(enc) = &self.encryption {
            enc.decrypt_string(&data)?
        } else {
            data
        };

        serde_json::from_str(&json)
            .map_err(|e| MemoryError::StorageError(format!("Deserialization error: {}", e)))
    }

    /// Delete memory entry from disk
    pub async fn delete(&self, id: &str, tier: &str) -> MemoryResult<()> {
        Self::validate_entry_id(id)?;
        Self::validate_tier_name(tier)?;
        let file_path = self.data_dir.join(tier).join(format!("{}.json", id));

        fs::remove_file(&file_path)
            .await
            .map_err(|e| MemoryError::StorageError(format!("Delete error: {}", e)))?;

        Ok(())
    }

    /// List all memory IDs in a tier
    pub async fn list_tier(&self, tier: &str) -> MemoryResult<Vec<String>> {
        Self::validate_tier_name(tier)?;
        let tier_dir = self.data_dir.join(tier);

        let mut entries = fs::read_dir(&tier_dir)
            .await
            .map_err(|e| MemoryError::StorageError(format!("Read dir error: {}", e)))?;

        let mut ids = Vec::new();

        while let Some(entry) = entries
            .next_entry()
            .await
            .map_err(|e| MemoryError::StorageError(format!("Entry error: {}", e)))?
        {
            if let Some(name) = entry.file_name().to_str() {
                if let Some(id) = name.strip_suffix(".json") {
                    ids.push(id.to_string());
                }
            }
        }

        Ok(ids)
    }

    /// Load all memories from a tier
    pub async fn load_tier(&self, tier: &str) -> MemoryResult<Vec<MemoryEntry>> {
        Self::validate_tier_name(tier)?;
        let ids = self.list_tier(tier).await?;
        let mut memories = Vec::new();

        for id in ids {
            match self.load(&id, tier).await {
                Ok(entry) => memories.push(entry),
                Err(e) => {
                    eprintln!("[PERSISTENCE] Failed to load {}/{}: {}", tier, id, e);
                }
            }
        }

        Ok(memories)
    }

    /// Clear all memories in a tier
    pub async fn clear_tier(&self, tier: &str) -> MemoryResult<usize> {
        Self::validate_tier_name(tier)?;
        let ids = self.list_tier(tier).await?;
        let count = ids.len();

        for id in ids {
            if let Err(e) = self.delete(&id, tier).await {
                eprintln!("[PERSISTENCE] Failed to delete {}/{}: {}", tier, id, e);
            }
        }

        Ok(count)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    async fn load_rejects_path_traversal_id() {
        let dir = tempdir().expect("temp dir");
        let persistence = MemoryPersistence::new(dir.path(), None);

        let err = persistence
            .load("../escape", "stm")
            .await
            .expect_err("traversal id must be rejected");

        assert!(err.to_string().contains("invalid path components"));
    }

    #[tokio::test]
    async fn list_tier_rejects_absolute_tier() {
        let dir = tempdir().expect("temp dir");
        let persistence = MemoryPersistence::new(dir.path(), None);

        let err = persistence
            .list_tier("/tmp")
            .await
            .expect_err("absolute tier must be rejected");

        assert!(err.to_string().contains("Unsupported memory tier"));
    }

    #[tokio::test]
    async fn save_and_load_round_trip_with_valid_id() {
        let dir = tempdir().expect("temp dir");
        let persistence = MemoryPersistence::new(dir.path(), None);
        persistence.init().await.expect("init should succeed");

        let mut entry = MemoryEntry::new("hello memory".to_string(), 0.8, MemoryType::Conversation);
        entry.id = "entry-1".to_string();
        entry.tier = MemoryTier::STM;

        persistence.save(&entry).await.expect("save should succeed");
        let loaded = persistence
            .load("entry-1", "stm")
            .await
            .expect("load should succeed");

        assert_eq!(loaded.id, entry.id);
        assert_eq!(loaded.content, entry.content);
        assert_eq!(loaded.tier, entry.tier);
    }
}
