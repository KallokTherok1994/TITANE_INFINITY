// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — API: SYSTEM
//   Comprehensive System State Commands
// ═══════════════════════════════════════════════════════════════

use crate::{
    core::{HeliosCore, NexusCore, HarmoniaCore, SentinelCore},
    types::{HeliosState, NexusState, HarmoniaState, SentinelState},
    utils::AppResult,
};
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemState {
    pub helios: HeliosState,
    pub nexus: NexusState,
    pub harmonia: HarmoniaState,
    pub sentinel: SentinelState,
}

#[tauri::command]
pub async fn get_full_system_state(
    helios: tauri::State<'_, HeliosCore>,
    nexus: tauri::State<'_, NexusCore>,
    harmonia: tauri::State<'_, HarmoniaCore>,
    sentinel: tauri::State<'_, SentinelCore>,
) -> AppResult<SystemState> {
    let helios_state = helios.collect().await?;
    let nexus_state = nexus.validate().await?;
    let harmonia_state = harmonia.balance(&helios_state).await?;
    let sentinel_state = sentinel.scan(&helios_state).await?;
    
    Ok(SystemState {
        helios: helios_state,
        nexus: nexus_state,
        harmonia: harmonia_state,
        sentinel: sentinel_state,
    })
}

#[tauri::command]
pub async fn get_nexus_state(nexus: tauri::State<'_, NexusCore>) -> AppResult<NexusState> {
    nexus.validate().await
}

#[tauri::command]
pub async fn get_harmonia_state(
    harmonia: tauri::State<'_, HarmoniaCore>,
    helios: tauri::State<'_, HeliosCore>,
) -> AppResult<HarmoniaState> {
    let helios_state = helios.collect().await?;
    harmonia.balance(&helios_state).await
}

#[tauri::command]
pub async fn get_sentinel_state(
    sentinel: tauri::State<'_, SentinelCore>,
    helios: tauri::State<'_, HeliosCore>,
) -> AppResult<SentinelState> {
    let helios_state = helios.collect().await?;
    sentinel.scan(&helios_state).await
}
