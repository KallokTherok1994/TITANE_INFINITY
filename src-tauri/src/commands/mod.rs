// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v20.0 - Tauri Commands Central Hub (Phase 2 Fusion #1)             ║
// ║ Unified command handlers for frontend-backend communication                 ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

pub mod ai_chat;        // ✅ v∞: AI Chat commands (NOT re-exported - uses State<AIChatState>)
pub mod automations;    // ✅ v19.2Ω: Automation System
pub mod chat_modes;     // ✅ v19.2Ω: Chat Modes System
pub mod coherence_commands; // ✅ NEW v20.0: Unified Coherence Engine (Nexus + Consistency fusion)
pub mod cognitive_center; // ✅ v19.3: Centre d'Évolution Cognitive (OPUS #4)
pub mod cognitive_commands; // ✅ NEW v16: Cognitive Layer
pub mod devops; // ✅ v19: DevOps Commands for Dashboard
pub mod devtools;
pub mod diagnostic; // ✅ Phase 9: Backend diagnostics & validation
pub mod engine_v14; // ✅ NEW: SingularityEngine v14 commands
pub mod engines_commands; // ✅ v∞: Unified Engines Commands (OPUS #7/#9/#10)
pub mod evolution;
pub mod evolution_v14; // ✅ Phase 6: Auto-Evolution v14 commands
pub mod exp_fusion;
pub mod harmonia_commands;
pub mod ia_commands; // ✅ v∞.19.3Ω: IA Commands (OpenAI + Claude + Unified)
pub mod memory_compactor_commands; // ✅ v14 Phase 4: Memory Compactor
pub mod meta_mode; // ✅ v14 Phase 5: Harmonia Engine
pub mod one_core; // ✅ v19.6: TITANE∞ ONE CORE - Unified Command Center (OPUS #6)
pub mod orchestration_center; // ✅ v19.5: Centre d'Orchestration Cognitive (OPUS #5/6/7)
pub mod persistent_memory; // ✅ v19.2Ω: Persistent Memory 3-Level System
pub mod qa_monitoring; // ✅ v19.7: QA Monitoring Center - OPUS #7

// Re-export engine commands
// NOTE: ai_chat NOT re-exported because it requires State<AIChatState>
// Voice commands come from audio::commands instead
pub use coherence_commands::*; // ✅ v20.0: Export coherence commands (Fusion #1)
pub use cognitive_center::*; // ✅ v19.3: Export cognitive center commands
pub use cognitive_commands::*; // ✅ v16: Export cognitive commands
pub use devops::*; // ✅ v19: Export devops commands
pub use diagnostic::*; // ✅ Phase 9: Export diagnostic commands
pub use engine_v14::*;
pub use engines_commands::*; // ✅ v∞: Export unified engines commands
pub use evolution_v14::*; // ✅ Phase 6: Export evolution commands
pub use harmonia_commands::*;
pub use ia_commands::*; // ✅ v∞.19.3Ω: Export IA commands
pub use memory_compactor_commands::*;
pub use one_core::*; // ✅ v19.6: Export ONE CORE commands
pub use orchestration_center::*; // ✅ v19.5: Export orchestration center commands
pub use persistent_memory::*; // ✅ v19.2Ω: Export persistent memory commands
pub use qa_monitoring::*; // ✅ v19.7: Export QA monitoring commands

use crate::shared::types::ModuleHealth;
use crate::TitaneCore;
use std::sync::{Arc, Mutex};
use tauri::State;

// ═════════════════════════════════════════════════════════════════════════════
// SYSTEM COMMANDS
// ═════════════════════════════════════════════════════════════════════════════

/// Get system status with all module health information
///
/// Returns a vector of ModuleHealth structs containing status, uptime, and metrics
/// for each of the 8 core modules.
///
/// # Errors
/// Returns an error if the global state cannot be locked.
#[tauri::command]
pub async fn get_system_status(
    state: State<'_, Arc<Mutex<TitaneCore>>>,
) -> Result<Vec<ModuleHealth>, String> {
    log::debug!("📊 Command: get_system_status");
    let core = state
        .lock()
        .map_err(|e| format!("Failed to lock core state: {}", e))?;
    Ok(core.health())
}

// ═════════════════════════════════════════════════════════════════════════════
// HELIOS MODULE COMMANDS
// ═════════════════════════════════════════════════════════════════════════════

/// Get Helios metrics (BPM, vitality score, system load)
///
/// Returns a JSON string containing:
/// - `cpu_usage`: Current CPU usage percentage
/// - `memory_usage`: Memory usage percentage
/// - `disk_usage`: Disk usage percentage
/// - `uptime`: System uptime in milliseconds
///
/// # Errors
/// Returns an error if the state cannot be locked or serialization fails.
#[tauri::command]
pub async fn helios_get_metrics(
    state: State<'_, Arc<Mutex<TitaneCore>>>,
) -> Result<String, String> {
    log::debug!("☀️  Command: helios_get_metrics");
    let core = state
        .lock()
        .map_err(|e| format!("Failed to lock core state: {}", e))?;
    let helios = core
        .helios
        .lock()
        .map_err(|e| format!("Failed to lock Helios module: {}", e))?;
    Ok(helios.get_metrics())
}

// ═════════════════════════════════════════════════════════════════════════════
// NEXUS MODULE COMMANDS
// ═════════════════════════════════════════════════════════════════════════════

/// Get Nexus cognitive graph structure
///
/// Returns a JSON string containing:
/// - `nodes`: Array of cognitive nodes with id, type, connections, and weight
/// - `connections`: Total number of connections in the graph
///
/// # Errors
/// Returns an error if the state cannot be locked or serialization fails.
#[tauri::command]
pub async fn nexus_get_graph(state: State<'_, Arc<Mutex<TitaneCore>>>) -> Result<String, String> {
    log::debug!("🔗 Command: nexus_get_graph");
    let core = state
        .lock()
        .map_err(|e| format!("Failed to lock core state: {}", e))?;
    let nexus = core
        .nexus
        .lock()
        .map_err(|e| format!("Failed to lock Nexus module: {}", e))?;
    Ok(nexus.get_graph())
}

// ═════════════════════════════════════════════════════════════════════════════
// HARMONIA MODULE COMMANDS
// ═════════════════════════════════════════════════════════════════════════════

/// Get Harmonia flows and balance information
///
/// Returns a JSON string with module health serialized.
///
/// # Errors
/// Returns an error if the state cannot be locked or serialization fails.
#[tauri::command]
pub async fn harmonia_get_flows(
    state: State<'_, Arc<Mutex<TitaneCore>>>,
) -> Result<String, String> {
    log::debug!("🎼 Command: harmonia_get_flows");
    let core = state
        .lock()
        .map_err(|e| format!("Failed to lock core state: {}", e))?;
    let harmonia = core
        .harmonia
        .lock()
        .map_err(|e| format!("Failed to lock Harmonia module: {}", e))?;
    serde_json::to_string(&harmonia.health())
        .map_err(|e| format!("Failed to serialize Harmonia health: {}", e))
}

// ═════════════════════════════════════════════════════════════════════════════
// SENTINEL MODULE COMMANDS
// ═════════════════════════════════════════════════════════════════════════════

/// Get Sentinel security alerts and integrity score
///
/// Returns a JSON string containing:
/// - `alert_count`: Number of security alerts detected
/// - `integrity_score`: System integrity score (0.0-100.0)
///
/// # Errors
/// Returns an error if the state cannot be locked.
#[tauri::command]
pub async fn sentinel_get_alerts(
    state: State<'_, Arc<Mutex<TitaneCore>>>,
) -> Result<String, String> {
    log::debug!("🛡️  Command: sentinel_get_alerts");
    let core = state
        .lock()
        .map_err(|e| format!("Failed to lock core state: {}", e))?;
    let sentinel = core
        .sentinel
        .lock()
        .map_err(|e| format!("Failed to lock Sentinel module: {}", e))?;
    Ok(format!(
        "{{\"alert_count\": {}, \"integrity_score\": {:.2}}}",
        sentinel.alert_count, sentinel.integrity_score
    ))
}

// ═════════════════════════════════════════════════════════════════════════════
// WATCHDOG MODULE COMMANDS
// ═════════════════════════════════════════════════════════════════════════════

/// Get Watchdog logs and monitoring data
///
/// Returns an array of formatted log strings.
///
/// # Errors
/// Returns an error if the state cannot be locked.
#[tauri::command]
pub async fn watchdog_get_logs(
    state: State<'_, Arc<Mutex<TitaneCore>>>,
) -> Result<Vec<String>, String> {
    log::debug!("🐕 Command: watchdog_get_logs");
    let core = state
        .lock()
        .map_err(|e| format!("Failed to lock core state: {}", e))?;
    let watchdog = core
        .watchdog
        .lock()
        .map_err(|e| format!("Failed to lock Watchdog module: {}", e))?;
    Ok(watchdog.get_logs())
}

/// Get Watchdog metrics (tick misses, anomalies detected)
///
/// Returns a JSON string containing:
/// - `tick_misses`: Number of missed ticks
/// - `module_health`: Overall modules health score (0.0-100.0)
/// - `last_check`: Timestamp of last health check
///
/// # Errors
/// Returns an error if the state cannot be locked.
#[tauri::command]
pub async fn watchdog_get_data(state: State<'_, Arc<Mutex<TitaneCore>>>) -> Result<String, String> {
    log::debug!("🐕 Command: watchdog_get_data");
    let core = state
        .lock()
        .map_err(|e| format!("Failed to lock core state: {}", e))?;
    let watchdog = core
        .watchdog
        .lock()
        .map_err(|e| format!("Failed to lock Watchdog module: {}", e))?;
    Ok(format!(
        "{{\"tick_misses\": {}, \"module_health\": {:.2}, \"last_check\": {}}}",
        watchdog.tick_misses, watchdog.module_health, watchdog.last_check
    ))
}

// ═════════════════════════════════════════════════════════════════════════════
// SELFHEAL MODULE COMMANDS
// ═════════════════════════════════════════════════════════════════════════════

/// Get SelfHeal repair statistics
///
/// Returns a JSON string containing:
/// - `corrections_applied`: Total number of successful repairs
/// - `anomalies_detected`: Total number of anomalies detected
/// - `heal_efficiency`: Repair success rate (0.0-100.0)
///
/// # Errors
/// Returns an error if the state cannot be locked.
#[tauri::command]
pub async fn selfheal_get_data(state: State<'_, Arc<Mutex<TitaneCore>>>) -> Result<String, String> {
    log::debug!("🔧 Command: selfheal_get_data");
    let core = state
        .lock()
        .map_err(|e| format!("Failed to lock core state: {}", e))?;
    let self_heal = core
        .self_heal
        .lock()
        .map_err(|e| format!("Failed to lock SelfHeal module: {}", e))?;
    Ok(format!(
        "{{\"corrections_applied\": {}, \"anomalies_detected\": {}, \"heal_efficiency\": {:.2}}}",
        self_heal.corrections_applied, self_heal.anomalies_detected, self_heal.heal_efficiency
    ))
}

// ═════════════════════════════════════════════════════════════════════════════
// ADAPTIVEENGINE MODULE COMMANDS
// ═════════════════════════════════════════════════════════════════════════════

/// Get AdaptiveEngine optimization metrics
///
/// Returns a JSON string containing:
/// - `adaptability`: Current adaptability coefficient (0.0-1.0)
/// - `stability`: System stability score (0.0-100.0)
/// - `trend`: Performance trend indicator (-1.0 to +1.0)
///
/// # Errors
/// Returns an error if the state cannot be locked.
#[tauri::command]
pub async fn adaptive_get_data(state: State<'_, Arc<Mutex<TitaneCore>>>) -> Result<String, String> {
    log::debug!("🧠 Command: adaptive_get_data");
    let core = state
        .lock()
        .map_err(|e| format!("Failed to lock core state: {}", e))?;
    let adaptive = core
        .adaptive_engine
        .lock()
        .map_err(|e| format!("Failed to lock AdaptiveEngine module: {}", e))?;
    Ok(format!(
        "{{\"adaptability\": {:.2}, \"stability\": {:.2}, \"trend\": {:+.2}}}",
        adaptive.adaptability, adaptive.stability, adaptive.trend
    ))
}

// ═════════════════════════════════════════════════════════════════════════════
// MEMORY MODULE COMMANDS
// ═════════════════════════════════════════════════════════════════════════════

/// Save an encrypted entry to persistent memory
///
/// Accepts a string entry, encrypts it with AES-256-GCM, and stores it in
/// the encrypted storage file. Each entry is automatically assigned a unique ID
/// and timestamp.
///
/// # Arguments
/// * `entry` - The string content to save
///
/// # Errors
/// Returns an error if encryption or file operations fail.
#[tauri::command]
pub async fn memory_save_entry(entry: String) -> Result<(), String> {
    log::debug!("💾 Command: memory_save_entry (length: {})", entry.len());
    crate::system::memory::save_entry(entry)
}

/// Load all encrypted entries from persistent memory
///
/// Decrypts and returns all stored entries as a JSON string containing
/// a MemoryCollection with entries array and metadata.
///
/// # Errors
/// Returns an error if decryption or deserialization fails.
#[tauri::command]
pub async fn memory_load_entries() -> Result<String, String> {
    log::debug!("💾 Command: memory_load_entries");
    crate::system::memory::load_entries()
}

/// Clear all entries from encrypted memory storage
///
/// Permanently deletes the encrypted storage file and all its contents.
/// This operation cannot be undone.
///
/// # Errors
/// Returns an error if file deletion fails.
#[tauri::command]
pub async fn memory_clear() -> Result<(), String> {
    log::debug!("💾 Command: memory_clear");
    crate::system::memory::clear_memory()
}

/// Get current memory system state
///
/// Returns a JSON string containing:
/// - `initialized`: Whether the memory system is initialized
/// - `entries_count`: Number of stored entries
/// - `checksum`: SHA-256 checksum of the current data
/// - `last_update`: Timestamp of last modification
///
/// # Errors
/// Returns an error if state retrieval or serialization fails.
#[tauri::command]
pub async fn memory_get_state() -> Result<String, String> {
    log::debug!("💾 Command: memory_get_state");
    crate::system::memory::get_memory_state()
}

// ═════════════════════════════════════════════════════════════════════════════
// NOTE: Command handlers are exported for use in main.rs with tauri::generate_handler!
// See main.rs for the invoke_handler registration
// ═════════════════════════════════════════════════════════════════════════════
