// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.1 — LEGACY COMMANDS COMPATIBILITY
//   Temporary bridge for old commands until full migration
// ═══════════════════════════════════════════════════════════════

use serde::{Serialize, Deserialize};

// ═══════════════════════════════════════════════════════════════
// MEMORY COMMANDS (Legacy)
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn memory_save_entry(entry: String) -> Result<(), String> {
    // Placeholder: Save to memory system
    println!("[Legacy] memory_save_entry called: {}", entry);
    Ok(())
}

#[tauri::command]
pub async fn memory_clear() -> Result<(), String> {
    // Placeholder: Clear memory
    println!("[Legacy] memory_clear called");
    Ok(())
}

#[tauri::command]
pub async fn delete_conversation(conversation_id: String) -> Result<(), String> {
    // Placeholder: Delete conversation
    println!("[Legacy] delete_conversation called: {}", conversation_id);
    Ok(())
}

#[tauri::command]
pub async fn clear_all_memory() -> Result<(), String> {
    // Placeholder: Clear all memory
    println!("[Legacy] clear_all_memory called");
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// META MODE COMMANDS (Legacy)
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn meta_mode_reset() -> Result<(), String> {
    // Placeholder: Reset meta mode
    println!("[Legacy] meta_mode_reset called");
    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// VOICE/TTS COMMANDS (Legacy)
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TTSParams {
    pub text: String,
    #[serde(rename = "useOnline")]
    pub use_online: Option<bool>,
}

#[tauri::command]
pub async fn speak(params: TTSParams) -> Result<(), String> {
    // Placeholder: Text-to-speech
    println!("[Legacy] speak called: {} (online: {:?})", params.text, params.use_online);
    Ok(())
}

#[tauri::command]
pub async fn start_recording() -> Result<(), String> {
    // Placeholder: Start audio recording
    println!("[Legacy] start_recording called");
    Ok(())
}

#[tauri::command]
pub async fn stop_recording() -> Result<String, String> {
    // Placeholder: Stop recording and return transcript
    println!("[Legacy] stop_recording called");
    Ok("Placeholder transcript".to_string())
}

// ═══════════════════════════════════════════════════════════════
// ADDITIONAL LEGACY COMMANDS
// ═══════════════════════════════════════════════════════════════

#[tauri::command]
pub async fn get_system_status() -> Result<String, String> {
    // Placeholder: Get system status
    Ok("System operational (legacy)".to_string())
}

#[tauri::command]
pub async fn harmonia_get_flows() -> Result<String, String> {
    // Placeholder: Get harmonia flows
    Ok("Harmonia flows placeholder".to_string())
}

#[tauri::command]
pub async fn nexus_get_graph() -> Result<String, String> {
    // Placeholder: Get nexus graph
    Ok("Nexus graph placeholder".to_string())
}

#[tauri::command]
pub async fn helios_get_metrics() -> Result<String, String> {
    // Placeholder: Get helios metrics
    Ok("Helios metrics placeholder".to_string())
}

#[tauri::command]
pub async fn memory_get_state() -> Result<String, String> {
    // Placeholder: Get memory state
    Ok("Memory state placeholder".to_string())
}
