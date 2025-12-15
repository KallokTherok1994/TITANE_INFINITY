// ═══════════════════════════════════════════════════════════════════
// SELF-HEALING COMMANDS - TITANE∞ v21.5.3
// ═══════════════════════════════════════════════════════════════════

use crate::error::TitaneError;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SelfHealingStatus {
    pub enabled: bool,
    pub last_action: Option<String>,
    pub last_action_time: u64,
    pub actions_count: u32,
}

lazy_static! {
    static ref HEALING_STATUS: Mutex<SelfHealingStatus> = Mutex::new(SelfHealingStatus {
        enabled: false,
        last_action: None,
        last_action_time: 0,
        actions_count: 0,
    });
}

#[tauri::command]
pub async fn self_healing_trigger(action: String) -> Result<(), TitaneError> {
    log::info!("[SELF_HEALING] trigger: {}", action);

    let mut status = HEALING_STATUS
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock HEALING_STATUS: {}", e)))?;

    if !status.enabled {
        return Err(TitaneError::NotSupported(
            "Self-healing is disabled".to_string(),
        ));
    }

    status.last_action = Some(action.clone());
    status.last_action_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    status.actions_count += 1;

    log::info!("[SELF_HEALING] ✅ Triggered action: {}", action);
    Ok(())
}

#[tauri::command]
pub async fn self_healing_get_status() -> Result<SelfHealingStatus, TitaneError> {
    log::debug!("[SELF_HEALING] get_status called");

    let status = HEALING_STATUS
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock HEALING_STATUS: {}", e)))?
        .clone();

    Ok(status)
}

#[tauri::command]
pub async fn self_healing_enable() -> Result<(), TitaneError> {
    log::info!("[SELF_HEALING] enable called");

    let mut status = HEALING_STATUS
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock HEALING_STATUS: {}", e)))?;

    status.enabled = true;

    log::info!("[SELF_HEALING] ✅ Self-healing enabled");
    Ok(())
}

#[tauri::command]
pub async fn self_healing_disable() -> Result<(), TitaneError> {
    log::info!("[SELF_HEALING] disable called");

    let mut status = HEALING_STATUS
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock HEALING_STATUS: {}", e)))?;

    status.enabled = false;

    log::info!("[SELF_HEALING] ✅ Self-healing disabled");
    Ok(())
}
