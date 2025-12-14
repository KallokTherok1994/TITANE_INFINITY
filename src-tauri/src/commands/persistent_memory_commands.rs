// ═══════════════════════════════════════════════════════════════════
// PERSISTENT MEMORY COMMANDS - TITANE∞ v21.5.3
// ═══════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use lazy_static::lazy_static;
use crate::error::TitaneError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersistentMemoryEntry {
    pub id: String,
    pub content: String,
    pub metadata: HashMap<String, String>,
    pub created_at: u64,
    pub archived: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryBundle {
    pub id: String,
    pub name: String,
    pub entry_ids: Vec<String>,
    pub created_at: u64,
}

lazy_static! {
    static ref PERSISTENT_ENTRIES: Mutex<Vec<PersistentMemoryEntry>> = Mutex::new(Vec::new());
    static ref MEMORY_BUNDLES: Mutex<Vec<MemoryBundle>> = Mutex::new(Vec::new());
}

#[tauri::command]
pub async fn persistent_memory_promote_entry(entry_id: String) -> Result<(), TitaneError> {
    log::info!("[PERSISTENT_MEMORY] promote_entry: {}", entry_id);
    
    let mut entries = PERSISTENT_ENTRIES.lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock PERSISTENT_ENTRIES: {}", e)))?;
    
    if let Some(entry) = entries.iter_mut().find(|e| e.id == entry_id) {
        entry.metadata.insert("promoted".to_string(), "true".to_string());
        log::info!("[PERSISTENT_MEMORY] ✅ Promoted entry '{}'", entry_id);
        Ok(())
    } else {
        Err(TitaneError::InternalError(format!("Entry not found: {}", entry_id)))
    }
}

#[tauri::command]
pub async fn persistent_memory_archive_entry(entry_id: String) -> Result<(), TitaneError> {
    log::info!("[PERSISTENT_MEMORY] archive_entry: {}", entry_id);
    
    let mut entries = PERSISTENT_ENTRIES.lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock PERSISTENT_ENTRIES: {}", e)))?;
    
    if let Some(entry) = entries.iter_mut().find(|e| e.id == entry_id) {
        entry.archived = true;
        log::info!("[PERSISTENT_MEMORY] ✅ Archived entry '{}'", entry_id);
        Ok(())
    } else {
        Err(TitaneError::InternalError(format!("Entry not found: {}", entry_id)))
    }
}

#[tauri::command]
pub async fn persistent_memory_delete_entry(entry_id: String) -> Result<(), TitaneError> {
    log::info!("[PERSISTENT_MEMORY] delete_entry: {}", entry_id);
    
    let mut entries = PERSISTENT_ENTRIES.lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock PERSISTENT_ENTRIES: {}", e)))?;
    
    entries.retain(|e| e.id != entry_id);
    
    log::info!("[PERSISTENT_MEMORY] ✅ Deleted entry '{}'", entry_id);
    Ok(())
}

#[tauri::command]
pub async fn persistent_memory_add_to_bundle(bundle_id: String, entry_ids: Vec<String>) -> Result<(), TitaneError> {
    log::info!("[PERSISTENT_MEMORY] add_to_bundle: {} entries → bundle {}", entry_ids.len(), bundle_id);
    
    let mut bundles = MEMORY_BUNDLES.lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock MEMORY_BUNDLES: {}", e)))?;
    
    if let Some(bundle) = bundles.iter_mut().find(|b| b.id == bundle_id) {
        for entry_id in entry_ids {
            if !bundle.entry_ids.contains(&entry_id) {
                bundle.entry_ids.push(entry_id);
            }
        }
        log::info!("[PERSISTENT_MEMORY] ✅ Added entries to bundle '{}'", bundle_id);
        Ok(())
    } else {
        Err(TitaneError::InternalError(format!("Bundle not found: {}", bundle_id)))
    }
}
