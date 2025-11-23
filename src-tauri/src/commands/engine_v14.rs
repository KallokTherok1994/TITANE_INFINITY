// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — TAURI COMMANDS
//   Tauri commands for SingularityEngine v14
// ═══════════════════════════════════════════════════════════════

use crate::core::{SingularityEngine, EngineHealth, EngineMetrics, ModuleInfo, SingularityState};
use std::sync::Arc;
use tauri::State;
use tokio::sync::Mutex;

/// Global engine state for Tauri
pub type EngineState = Arc<Mutex<SingularityEngine>>;

/// Initialize the SingularityEngine
#[tauri::command]
pub async fn engine_init(engine: State<'_, EngineState>) -> Result<String, String> {
    let mut engine = engine.lock().await;

    engine.init().await
        .map_err(|e| format!("Engine initialization failed: {}", e))?;

    Ok("SingularityEngine v14 initialized successfully".to_string())
}

/// Execute one engine tick
#[tauri::command]
pub async fn engine_tick(engine: State<'_, EngineState>) -> Result<EngineHealth, String> {
    let mut engine = engine.lock().await;

    engine.tick().await
        .map_err(|e| format!("Engine tick failed: {}", e))?;

    Ok(engine.health())
}

/// Synchronize engine state
#[tauri::command]
pub async fn engine_sync(engine: State<'_, EngineState>) -> Result<String, String> {
    let mut engine = engine.lock().await;

    engine.sync().await
        .map_err(|e| format!("Engine sync failed: {}", e))?;

    Ok("Engine state synchronized".to_string())
}

/// Get engine health status
#[tauri::command]
pub async fn engine_health(engine: State<'_, EngineState>) -> Result<EngineHealth, String> {
    let engine = engine.lock().await;
    Ok(engine.health())
}

/// Get engine metrics
#[tauri::command]
pub async fn engine_metrics(engine: State<'_, EngineState>) -> Result<EngineMetrics, String> {
    let engine = engine.lock().await;
    Ok(engine.metrics().clone())
}

/// Get all module info
#[tauri::command]
pub async fn engine_modules(engine: State<'_, EngineState>) -> Result<Vec<ModuleInfo>, String> {
    let engine = engine.lock().await;
    Ok(engine.module_info())
}

/// Get full state snapshot
#[tauri::command]
pub async fn engine_snapshot(engine: State<'_, EngineState>) -> Result<SingularityState, String> {
    let engine = engine.lock().await;
    Ok(engine.snapshot().clone())
}

/// Stop the engine
#[tauri::command]
pub async fn engine_stop(engine: State<'_, EngineState>) -> Result<String, String> {
    let mut engine = engine.lock().await;

    engine.stop().await
        .map_err(|e| format!("Engine stop failed: {}", e))?;

    Ok("Engine stopped successfully".to_string())
}

/// Check if engine is running
#[tauri::command]
pub async fn engine_status(engine: State<'_, EngineState>) -> Result<bool, String> {
    let engine = engine.lock().await;
    Ok(engine.is_running())
}
