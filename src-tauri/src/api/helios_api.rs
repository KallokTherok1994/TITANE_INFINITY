// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — API: HELIOS
//   System Monitoring Commands
// ═══════════════════════════════════════════════════════════════

use crate::core::{HeliosCore};
use crate::types::HeliosState;
use crate::utils::AppResult;

#[tauri::command]
pub async fn get_helios_state(helios: tauri::State<'_, HeliosCore>) -> AppResult<HeliosState> {
    helios.collect().await
}

