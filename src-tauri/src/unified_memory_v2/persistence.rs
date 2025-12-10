// ═══════════════════════════════════════════════════════════════
//   UNIFIED MEMORY V2 — PERSISTENCE
//   Disk I/O operations (migré depuis memory_persistence.rs)
// ═══════════════════════════════════════════════════════════════

use std::path::{Path, PathBuf};
use tokio::fs;

use super::encryption::MemoryEncryption;
use super::types::{MemoryEntry, MemoryError, MemoryResult};

/// Memory persistence manager
pub struct MemoryPersistence {
    data_dir: PathBuf,
    encryption: Option<MemoryEncryption>,
}

impl MemoryPersistence {
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
            fs::create_dir_all(&tier_dir)
                .await
                .map_err(|e| MemoryError::StorageError(format!("Failed to create {} dir: {}", tier, e)))?;
        }

        Ok(())
    }

    /// Save memory entry to disk
    pub async fn save(&self, entry: &MemoryEntry) -> MemoryResult<()> {
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
        let file_path = self.data_dir.join(tier).join(format!("{}.json", id));

        fs::remove_file(&file_path)
            .await
            .map_err(|e| MemoryError::StorageError(format!("Delete error: {}", e)))?;

        Ok(())
    }

    /// List all memory IDs in a tier
    pub async fn list_tier(&self, tier: &str) -> MemoryResult<Vec<String>> {
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
