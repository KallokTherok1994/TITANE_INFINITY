// TITANE∞ v15 — MEMORY COMMANDS
// Frontend-accessible memory management commands
// Architecture v15: Clean, documented, tech-ready (dev)

use crate::commands::ai_chat::AIChatState;
use serde::{Deserialize, Serialize};
use tauri::State;

/// Macro for safe mutex locking with auto-recovery
macro_rules! lock_or_recover {
    ($mutex:expr) => {
        $mutex.lock().unwrap_or_else(|poisoned| {
            log::error!("[MemoryCommands] CRITICAL: Mutex poisoned, recovering...");
            poisoned.into_inner()
        })
    };
}


/// Memory key-value entry v15
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    pub key: String,
    pub value: String,
    pub timestamp: i64,
}

/// Get memory value by key (v15)
#[tauri::command]
pub async fn memory_get(
    state: State<'_, AIChatState>,
    key: String,
) -> Result<Option<String>, String> {
    log::info!("[Memory v15] memory_get: key={}", key);

    let storage = state.lock_or_recover!(memory_storage);

    // Check if key exists as conversation metadata
    match storage.list_conversations() {
        Ok(conversations) => {
            // Search for conversation with matching title or ID
            for conv in conversations {
                if conv.id == key || conv.title == key {
                    return Ok(Some(serde_json::to_string(&conv).unwrap_or_default()));
                }
            }
            Ok(None)
        }
        Err(e) => Err(format!("Failed to access memory: {}", e)),
    }
}

/// Set memory value by key (v15)
#[tauri::command]
pub async fn memory_set(
    state: State<'_, AIChatState>,
    key: String,
    value: String,
) -> Result<(), String> {
    log::info!("[Memory v15] memory_set: key={}, value_len={}", key, value.len());

    // Store as conversation with key as title
    let mut conversation = crate::memory::model::Conversation::new(key.clone());
    conversation.add_entry(
        crate::memory::model::MessageRole::System,
        value,
        0,
    );

    let storage = state.lock_or_recover!(memory_storage);
    storage.save_conversation(&conversation)
        .map_err(|e| format!("Failed to save memory: {}", e))
}

/// Get memory statistics (v15)
#[tauri::command]
pub async fn memory_get_stats(
    state: State<'_, AIChatState>,
) -> Result<String, String> {
    log::info!("[Memory v15] memory_get_stats");

    let storage = state.lock_or_recover!(memory_storage);

    match storage.get_stats() {
        Ok((total_conversations, total_messages)) => {
            let stats = serde_json::json!({
                "total_conversations": total_conversations,
                "total_messages": total_messages,
                "storage_type": "encrypted",
                "compactor_enabled": true,
            });
            Ok(stats.to_string())
        }
        Err(e) => Err(format!("Failed to get stats: {}", e)),
    }
}

/// Get all conversations list
#[tauri::command]
pub async fn memory_list_all(
    state: State<'_, AIChatState>,
) -> Result<String, String> {
    log::info!("[Memory v14] memory_list_all");

    let storage = state.lock_or_recover!(memory_storage);

    match storage.list_conversations() {
        Ok(conversations) => {
            serde_json::to_string(&conversations)
                .map_err(|e| format!("Failed to serialize: {}", e))
        }
        Err(e) => Err(format!("Failed to list conversations: {}", e)),
    }
}

/// Clear all memory
#[tauri::command]
pub async fn memory_clear_all(
    state: State<'_, AIChatState>,
) -> Result<(), String> {
    log::info!("[Memory v14] memory_clear_all");

    let storage = state.lock_or_recover!(memory_storage);
    storage.clear_all()
        .map_err(|e| format!("Failed to clear memory: {}", e))
}

/// Export conversation to JSON
#[tauri::command]
pub async fn memory_export_conversation(
    state: State<'_, AIChatState>,
    conversation_id: String,
) -> Result<String, String> {
    log::info!("[Memory v14] memory_export_conversation: id={}", conversation_id);

    let storage = state.lock_or_recover!(memory_storage);
    storage.export_conversation(&conversation_id)
        .map_err(|e| format!("Failed to export: {}", e))
}

/// Compact storage (remove duplicates, optimize)
#[tauri::command]
pub async fn memory_compact(
    state: State<'_, AIChatState>,
) -> Result<String, String> {
    log::info!("[Memory v14] memory_compact");

    let storage = state.lock_or_recover!(memory_storage);

    match storage.compact_storage() {
        Ok(results) => {
            serde_json::to_string(&results)
                .map_err(|e| format!("Failed to serialize results: {}", e))
        }
        Err(e) => Err(format!("Compaction failed: {}", e)),
    }
}
