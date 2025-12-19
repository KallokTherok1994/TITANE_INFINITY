// ═══════════════════════════════════════════════════════════════════
// MEMORY KV COMMANDS (legacy surface helper)
// ═══════════════════════════════════════════════════════════════════
//
// This module was restored as part of a local-first compatibility layer.
// It is intentionally self-contained and safe-by-default.
//
// Note: This file may not be wired into the active command surface yet.

use crate::error::TitaneError;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::Manager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryKVEntry {
    pub key: String,
    pub value: serde_json::Value,
    pub updated_at_ms: u64,
}

#[derive(Debug, Default)]
pub struct MemoryKVStore {
    entries: Mutex<HashMap<String, MemoryKVEntry>>,
}

impl MemoryKVStore {
    fn now_ms() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }

    fn path(app: &tauri::AppHandle) -> Result<PathBuf, TitaneError> {
        let dir = app
            .path()
            .app_data_dir()
            .map_err(|e| TitaneError::InternalError(format!("Failed to resolve app_data_dir: {e}")))?;
        Ok(dir.join("memory_kv_store.json"))
    }

    fn load_from_disk(app: &tauri::AppHandle) -> Result<HashMap<String, MemoryKVEntry>, TitaneError> {
        let path = Self::path(app)?;
        if !path.exists() {
            return Ok(HashMap::new());
        }
        let text = std::fs::read_to_string(&path)
            .map_err(|e| TitaneError::InternalError(format!("Failed to read KV store: {e}")))?;
        let parsed: HashMap<String, MemoryKVEntry> = serde_json::from_str(&text)
            .map_err(|e| TitaneError::InternalError(format!("Failed to parse KV store JSON: {e}")))?;
        Ok(parsed)
    }

    fn save_to_disk(app: &tauri::AppHandle, data: &HashMap<String, MemoryKVEntry>) -> Result<(), TitaneError> {
        let path = Self::path(app)?;
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| TitaneError::InternalError(format!("Failed to create KV store dir: {e}")))?;
        }
        let text = serde_json::to_string_pretty(data)
            .map_err(|e| TitaneError::InternalError(format!("Failed to serialize KV store: {e}")))?;
        std::fs::write(&path, text)
            .map_err(|e| TitaneError::InternalError(format!("Failed to write KV store: {e}")))?;
        Ok(())
    }

    pub fn ensure_loaded(&self, app: &tauri::AppHandle) -> Result<(), TitaneError> {
        let mut guard = self
            .entries
            .lock()
            .map_err(|e| TitaneError::InternalError(format!("Failed to lock KV store: {e}")))?;
        if guard.is_empty() {
            *guard = Self::load_from_disk(app)?;
        }
        Ok(())
    }

    pub fn set(&self, app: &tauri::AppHandle, key: String, value: serde_json::Value) -> Result<(), TitaneError> {
        self.ensure_loaded(app)?;
        let mut guard = self
            .entries
            .lock()
            .map_err(|e| TitaneError::InternalError(format!("Failed to lock KV store: {e}")))?;

        let entry = MemoryKVEntry {
            key: key.clone(),
            value,
            updated_at_ms: Self::now_ms(),
        };
        guard.insert(key, entry);
        Self::save_to_disk(app, &guard)
    }

    pub fn get(&self, app: &tauri::AppHandle, key: &str) -> Result<Option<MemoryKVEntry>, TitaneError> {
        self.ensure_loaded(app)?;
        let guard = self
            .entries
            .lock()
            .map_err(|e| TitaneError::InternalError(format!("Failed to lock KV store: {e}")))?;
        Ok(guard.get(key).cloned())
    }

    pub fn delete(&self, app: &tauri::AppHandle, key: &str) -> Result<bool, TitaneError> {
        self.ensure_loaded(app)?;
        let mut guard = self
            .entries
            .lock()
            .map_err(|e| TitaneError::InternalError(format!("Failed to lock KV store: {e}")))?;
        let existed = guard.remove(key).is_some();
        if existed {
            Self::save_to_disk(app, &guard)?;
        }
        Ok(existed)
    }
}

// Minimal commands (namespaced) — safe helper surface.

#[tauri::command]
pub async fn memory_kv_set(
    app: tauri::AppHandle,
    state: tauri::State<'_, MemoryKVStore>,
    key: String,
    value: serde_json::Value,
) -> Result<serde_json::Value, TitaneError> {
    state.set(&app, key.clone(), value)?;
    Ok(json!({"status":"ok","key":key}))
}

#[tauri::command]
pub async fn memory_kv_get(
    app: tauri::AppHandle,
    state: tauri::State<'_, MemoryKVStore>,
    key: String,
) -> Result<serde_json::Value, TitaneError> {
    let entry = state.get(&app, &key)?;
    Ok(json!({"status":"ok","entry":entry}))
}

#[tauri::command]
pub async fn memory_kv_delete(
    app: tauri::AppHandle,
    state: tauri::State<'_, MemoryKVStore>,
    key: String,
) -> Result<serde_json::Value, TitaneError> {
    let deleted = state.delete(&app, &key)?;
    Ok(json!({"status":"ok","deleted":deleted,"key":key}))
}
