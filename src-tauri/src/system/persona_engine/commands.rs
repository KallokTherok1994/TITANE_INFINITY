// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v24 — PERSONA ENGINE COMMANDS (Tauri API)
// Tauri commands to expose Persona Engine to frontend
// ═══════════════════════════════════════════════════════════════════════════

use tauri::State;
use std::sync::Mutex;
use super::{PersonaEngine, PersonaState, SystemMetrics};

// ═══════════════════════════════════════════════════════════════════════════
// TAURI COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

/// Initialize Persona Engine
#[tauri::command]
pub async fn persona_initialize() -> Result<String, String> {
    Ok("Persona Engine initialized".to_string())
}

/// Get current Persona state
#[tauri::command]
pub async fn persona_get_state(
    engine: State<'_, Mutex<PersonaEngine>>
) -> Result<PersonaState, String> {
    let engine = engine.lock().map_err(|e| e.to_string())?;
    Ok(engine.get_state())
}

/// Update Persona Engine with system state
#[tauri::command]
pub async fn persona_update(
    engine: State<'_, Mutex<PersonaEngine>>,
    system_state: String,
    cpu: f32,
    memory: f32,
    errors: u32,
) -> Result<PersonaState, String> {
    let engine = engine.lock().map_err(|e| e.to_string())?;
    
    let metrics = SystemMetrics {
        cpu,
        memory,
        errors,
    };
    
    engine.update(&system_state, metrics);
    Ok(engine.get_state())
}

/// Trigger a reaction
#[tauri::command]
pub async fn persona_react(
    engine: State<'_, Mutex<PersonaEngine>>,
    reaction_type: String,
) -> Result<PersonaState, String> {
    let engine = engine.lock().map_err(|e| e.to_string())?;
    engine.react(&reaction_type);
    Ok(engine.get_state())
}

/// Reset Persona state
#[tauri::command]
pub async fn persona_reset(
    engine: State<'_, Mutex<PersonaEngine>>
) -> Result<PersonaState, String> {
    let engine = engine.lock().map_err(|e| e.to_string())?;
    engine.reset();
    Ok(engine.get_state())
}

/// Get visual multipliers
#[tauri::command]
pub async fn persona_get_multipliers(
    engine: State<'_, Mutex<PersonaEngine>>
) -> Result<serde_json::Value, String> {
    let engine = engine.lock().map_err(|e| e.to_string())?;
    let state = engine.get_state();
    
    Ok(serde_json::json!({
        "glow": state.visual_multipliers.glow,
        "motion": state.visual_multipliers.motion,
        "sound": state.visual_multipliers.sound,
        "depth": state.visual_multipliers.depth,
    }))
}
