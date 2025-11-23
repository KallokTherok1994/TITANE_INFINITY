// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.3.0 — SERVICES: STORAGE (SECURED)
//   JSON persistence with StorageGuard protection
// ═══════════════════════════════════════════════════════════════

#![allow(dead_code)] // Storage service - used by memory persistence

use crate::utils::{AppResult, AppError};
use crate::security::storage_guard::StorageGuard;
use serde::{Serialize, de::DeserializeOwned};
use std::path::PathBuf;

pub struct StorageService {
    storage_guard: StorageGuard,
}

impl StorageService {
    pub fn new(base_path: PathBuf) -> AppResult<Self> {
        if !base_path.exists() {
            std::fs::create_dir_all(&base_path)
                .map_err(|e| AppError::Io(format!("Failed to create storage dir: {}", e)))?;
        }

        Ok(Self {
            storage_guard: StorageGuard::new(base_path),
        })
    }

    /// Save object as JSON
    pub async fn save<T: Serialize>(&self, key: &str, data: &T) -> AppResult<()> {
        // ✅ SECURED: Validate key through StorageGuard
        let safe_key = StorageGuard::sanitize_filename(key);
        let file_path = format!("{}.json", safe_key);

        let json = serde_json::to_string_pretty(data)
            .map_err(|e| AppError::Parse(format!("Failed to serialize: {}", e)))?;

        self.storage_guard.safe_write_string(&file_path, &json).await
            .map_err(|e| AppError::Io(e))?;

        Ok(())
    }

    /// Load object from JSON
    pub async fn load<T: DeserializeOwned>(&self, key: &str) -> AppResult<T> {
        // ✅ SECURED: Validate key through StorageGuard
        let safe_key = StorageGuard::sanitize_filename(key);
        let file_path = format!("{}.json", safe_key);

        let json = self.storage_guard.safe_read_string(&file_path).await
            .map_err(|e| AppError::Io(e))?;

        let data = serde_json::from_str(&json)
            .map_err(|e| AppError::Parse(format!("Failed to deserialize: {}", e)))?;

        Ok(data)
    }

    /// Check if key exists
    pub fn exists(&self, key: &str) -> bool {
        let safe_key = StorageGuard::sanitize_filename(key);
        let file_path = format!("{}.json", safe_key);
        self.storage_guard.exists(&file_path)
    }

    /// Delete key
    pub async fn delete(&self, key: &str) -> AppResult<()> {
        // ✅ SECURED: Validate key through StorageGuard
        let safe_key = StorageGuard::sanitize_filename(key);
        let file_path = format!("{}.json", safe_key);

        self.storage_guard.safe_delete(&file_path).await
            .map_err(|e| AppError::Io(e))?;

        Ok(())
    }

    /// List all keys
    pub async fn list_keys(&self) -> AppResult<Vec<String>> {
        // ✅ SECURED: Use StorageGuard list_dir
        let files = self.storage_guard.safe_list_dir("").await
            .map_err(|e| AppError::Io(e))?;

        let keys: Vec<String> = files.iter()
            .filter(|name| name.ends_with(".json"))
            .map(|name| name.trim_end_matches(".json").to_string())
            .collect();

        Ok(keys)
    }
}
