// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — SERVICES: STORAGE
//   JSON persistence abstraction
// ═══════════════════════════════════════════════════════════════

#![allow(dead_code)] // Storage service - used by memory persistence

use crate::utils::{AppResult, AppError};
use serde::{Serialize, de::DeserializeOwned};
use std::path::PathBuf;
use tokio::fs;

pub struct StorageService {
    base_path: PathBuf,
}

impl StorageService {
    pub fn new(base_path: PathBuf) -> AppResult<Self> {
        if !base_path.exists() {
            std::fs::create_dir_all(&base_path)
                .map_err(|e| AppError::Io(format!("Failed to create storage dir: {}", e)))?;
        }

        Ok(Self { base_path })
    }

    /// Save object as JSON
    pub async fn save<T: Serialize>(&self, key: &str, data: &T) -> AppResult<()> {
        let path = self.base_path.join(format!("{}.json", key));

        let json = serde_json::to_string_pretty(data)
            .map_err(|e| AppError::Parse(format!("Failed to serialize: {}", e)))?;

        fs::write(path, json).await
            .map_err(|e| AppError::Io(format!("Failed to write storage: {}", e)))?;

        Ok(())
    }

    /// Load object from JSON
    pub async fn load<T: DeserializeOwned>(&self, key: &str) -> AppResult<T> {
        let path = self.base_path.join(format!("{}.json", key));

        let json = fs::read_to_string(path).await
            .map_err(|e| AppError::Io(format!("Failed to read storage: {}", e)))?;

        let data = serde_json::from_str(&json)
            .map_err(|e| AppError::Parse(format!("Failed to deserialize: {}", e)))?;

        Ok(data)
    }

    /// Check if key exists
    pub fn exists(&self, key: &str) -> bool {
        self.base_path.join(format!("{}.json", key)).exists()
    }

    /// Delete key
    pub async fn delete(&self, key: &str) -> AppResult<()> {
        let path = self.base_path.join(format!("{}.json", key));

        if path.exists() {
            fs::remove_file(path).await
                .map_err(|e| AppError::Io(format!("Failed to delete storage: {}", e)))?;
        }

        Ok(())
    }

    /// List all keys
    pub async fn list_keys(&self) -> AppResult<Vec<String>> {
        let mut entries = fs::read_dir(&self.base_path).await
            .map_err(|e| AppError::Io(format!("Failed to read storage dir: {}", e)))?;

        let mut keys = Vec::new();
        while let Some(entry) = entries.next_entry().await
            .map_err(|e| AppError::Io(format!("Failed to read entry: {}", e)))? {

            if let Some(name) = entry.file_name().to_str() {
                if name.ends_with(".json") {
                    keys.push(name.trim_end_matches(".json").to_string());
                }
            }
        }

        Ok(keys)
    }
}
