// ═══════════════════════════════════════════════════════════════════
// UI THEME COMMANDS - TITANE∞ v21.5.3
// ═══════════════════════════════════════════════════════════════════

use crate::error::TitaneError;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UITheme {
    pub name: String,
    pub tokens: serde_json::Value,
    pub created_at: u64,
}

lazy_static! {
    static ref CURRENT_THEME: Mutex<Option<UITheme>> = Mutex::new(None);
}

#[tauri::command]
pub async fn save_ui_theme(tokens: serde_json::Value) -> Result<(), TitaneError> {
    log::info!("[UI_THEME] save_ui_theme called");

    let created_at = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| {
            TitaneError::InternalError(format!(
                "Failed to compute UNIX timestamp for UI theme: {e}"
            ))
        })?
        .as_secs();

    let mut theme = CURRENT_THEME
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock CURRENT_THEME: {}", e)))?;

    *theme = Some(UITheme {
        name: "custom".to_string(),
        tokens,
        created_at,
    });

    log::info!("[UI_THEME] ✅ Theme saved");
    Ok(())
}

#[tauri::command]
pub async fn load_ui_theme() -> Result<Option<UITheme>, TitaneError> {
    log::debug!("[UI_THEME] load_ui_theme called");

    let theme = CURRENT_THEME
        .lock()
        .map_err(|e| TitaneError::InternalError(format!("Failed to lock CURRENT_THEME: {}", e)))?
        .clone();

    Ok(theme)
}
