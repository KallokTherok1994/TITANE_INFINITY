// ═══════════════════════════════════════════════════════════════════
// DEVTOOLS COMMANDS - TITANE∞ v21.5.3
// ═══════════════════════════════════════════════════════════════════

use std::sync::Mutex;
use lazy_static::lazy_static;
use crate::error::TitaneError;

lazy_static! {
    static ref DEVTOOLS_ENABLED: Mutex<bool> = Mutex::new(false);
    static ref DEBUG_BUFFER: Mutex<Vec<String>> = Mutex::new(Vec::new());
}

#[tauri::command]
pub async fn devtools_enable() -> Result<(), TitaneError> {
    log::info!("[DEVTOOLS] devtools_enable called");
    
    let mut enabled = DEVTOOLS_ENABLED.lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock DEVTOOLS_ENABLED: {}", e)))?;
    
    *enabled = true;
    
    log::info!("[DEVTOOLS] ✅ DevTools enabled");
    Ok(())
}

#[tauri::command]
pub async fn devtools_disable() -> Result<(), TitaneError> {
    log::info!("[DEVTOOLS] devtools_disable called");
    
    let mut enabled = DEVTOOLS_ENABLED.lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock DEVTOOLS_ENABLED: {}", e)))?;
    
    *enabled = false;
    
    log::info!("[DEVTOOLS] ✅ DevTools disabled");
    Ok(())
}

#[tauri::command]
pub async fn devtools_debug_clear() -> Result<(), TitaneError> {
    log::info!("[DEVTOOLS] devtools_debug_clear called");
    
    let mut buffer = DEBUG_BUFFER.lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock DEBUG_BUFFER: {}", e)))?;
    
    let count = buffer.len();
    buffer.clear();
    
    log::info!("[DEVTOOLS] ✅ Cleared {} debug entries", count);
    Ok(())
}
