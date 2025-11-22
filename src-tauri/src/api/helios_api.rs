// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — API: HELIOS
//   System Monitoring Commands
// ═══════════════════════════════════════════════════════════════

use crate::{
    core::HeliosCore,
    types::HeliosState,
    utils::AppResult,
};

#[tauri::command]
pub async fn get_helios_state(helios: tauri::State<'_, HeliosCore>) -> AppResult<HeliosState> {
    helios.collect().await
}

#[tauri::command]
pub async fn get_system_health(helios: tauri::State<'_, HeliosCore>) -> AppResult<crate::types::HealthStatus> {
    let state = helios.collect().await?;
    Ok(state.health_status())
}
