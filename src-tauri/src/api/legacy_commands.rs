// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.3.0 — LEGACY COMMANDS COMPATIBILITY (DEPRECATED)
//   ⚠️  Ces commandes sont DEPRECATED et seront supprimées en v18.0
//   ⚠️  Utiliser les commandes v17.2+ (helios_api, memory_api, etc.)
// ═══════════════════════════════════════════════════════════════

use serde::{Serialize, Deserialize};

// ═══════════════════════════════════════════════════════════════
// MEMORY COMMANDS (Legacy) - DEPRECATED
// ═══════════════════════════════════════════════════════════════

/// ⚠️ DEPRECATED v17.3.0: Use `write_log` command instead
#[tauri::command]
pub async fn memory_save_entry(entry: String) -> Result<(), String> {
    Err("DEPRECATED: This command is no longer supported. Use 'write_log' instead.".to_string())
}

/// ⚠️ DEPRECATED v17.3.0: Use Memory Core API
#[tauri::command]
pub async fn memory_clear() -> Result<(), String> {
    Err("DEPRECATED: This command is no longer supported. Manage memory via MemoryCore.".to_string())
}

/// ⚠️ DEPRECATED v17.3.0: Use Memory Core API
#[tauri::command]
pub async fn delete_conversation(conversation_id: String) -> Result<(), String> {
    Err(format!("DEPRECATED: This command is no longer supported (conversation_id: {}).", conversation_id))
}

/// ⚠️ DEPRECATED v17.3.0: Use Memory Core API
#[tauri::command]
pub async fn clear_all_memory() -> Result<(), String> {
    Err("DEPRECATED: This command is no longer supported. Contact admin to reset memory.".to_string())
}

// ═══════════════════════════════════════════════════════════════
// META MODE COMMANDS (Legacy) - DEPRECATED
// ═══════════════════════════════════════════════════════════════

/// ⚠️ DEPRECATED v17.3.0: Meta mode removed
#[tauri::command]
pub async fn meta_mode_reset() -> Result<(), String> {
    Err("DEPRECATED: Meta mode has been removed in v17.0.".to_string())
}

// ═══════════════════════════════════════════════════════════════
// VOICE/TTS COMMANDS (Legacy) - DEPRECATED
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TTSParams {
    pub text: String,
    #[serde(rename = "useOnline")]
    pub use_online: Option<bool>,
}

/// ⚠️ DEPRECATED v17.3.0: TTS not yet implemented
#[tauri::command]
pub async fn speak(params: TTSParams) -> Result<(), String> {
    Err(format!("DEPRECATED: TTS is not yet implemented. Text was: '{}'", params.text))
}

/// ⚠️ DEPRECATED v17.3.0: Voice recording not yet implemented
#[tauri::command]
pub async fn start_recording() -> Result<(), String> {
    Err("DEPRECATED: Voice recording is not yet implemented.".to_string())
}

/// ⚠️ DEPRECATED v17.3.0: Voice recording not yet implemented
#[tauri::command]
pub async fn stop_recording() -> Result<String, String> {
    Err("DEPRECATED: Voice recording is not yet implemented.".to_string())
}

// ═══════════════════════════════════════════════════════════════
// ADDITIONAL LEGACY COMMANDS - DEPRECATED
// ═══════════════════════════════════════════════════════════════

/// ⚠️ DEPRECATED v17.3.0: Use `get_full_system_state` instead
#[tauri::command]
pub async fn get_system_status() -> Result<String, String> {
    Err("DEPRECATED: Use 'get_full_system_state' command instead.".to_string())
}

/// ⚠️ DEPRECATED v17.3.0: Use `get_harmonia_state` instead
#[tauri::command]
pub async fn harmonia_get_flows() -> Result<String, String> {
    Err("DEPRECATED: Use 'get_harmonia_state' command instead.".to_string())
}

/// ⚠️ DEPRECATED v17.3.0: Use `get_nexus_state` instead
#[tauri::command]
pub async fn nexus_get_graph() -> Result<String, String> {
    Err("DEPRECATED: Use 'get_nexus_state' command instead.".to_string())
}

/// ⚠️ DEPRECATED v17.3.0: Use `get_helios_state` instead
#[tauri::command]
pub async fn helios_get_metrics() -> Result<String, String> {
    Err("DEPRECATED: Use 'get_helios_state' command instead.".to_string())
}

/// ⚠️ DEPRECATED v17.3.0: Use `get_memory_state` (from memory_api) instead
#[tauri::command]
pub async fn memory_get_state() -> Result<String, String> {
    Err("DEPRECATED: Use 'get_memory_state' from memory_api instead.".to_string())
}
