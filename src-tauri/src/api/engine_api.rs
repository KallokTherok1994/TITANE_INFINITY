// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — API: ENGINE
//   Auto-Evolution Commands
// ═══════════════════════════════════════════════════════════════

use crate::{
    core::{HeliosCore, NexusCore, HarmoniaCore, SentinelCore},
    engine::AutoEvolutionEngine,
    types::{EvolutionReport, EvolutionState, HealthStatus},
    utils::AppResult,
};

#[tauri::command]
pub async fn run_evolution(
    helios: tauri::State<'_, HeliosCore>,
    nexus: tauri::State<'_, NexusCore>,
    harmonia: tauri::State<'_, HarmoniaCore>,
    sentinel: tauri::State<'_, SentinelCore>,
    evolution: tauri::State<'_, AutoEvolutionEngine>,
) -> AppResult<EvolutionReport> {
    let helios_state = helios.collect().await?;
    let nexus_state = nexus.validate().await?;
    let harmonia_state = harmonia.balance(&helios_state).await?;
    let sentinel_state = sentinel.scan(&helios_state).await?;
    
    evolution.evolve(&helios_state, &nexus_state, &harmonia_state, &sentinel_state).await
}

#[tauri::command]
pub async fn get_evolution_state(
    evolution: tauri::State<'_, AutoEvolutionEngine>,
) -> AppResult<EvolutionState> {
    evolution.get_state().await
}

#[tauri::command]
pub async fn quick_health_check(
    helios: tauri::State<'_, HeliosCore>,
    nexus: tauri::State<'_, NexusCore>,
    harmonia: tauri::State<'_, HarmoniaCore>,
    sentinel: tauri::State<'_, SentinelCore>,
    evolution: tauri::State<'_, AutoEvolutionEngine>,
) -> AppResult<HealthStatus> {
    let helios_state = helios.collect().await?;
    let nexus_state = nexus.validate().await?;
    let harmonia_state = harmonia.balance(&helios_state).await?;
    let sentinel_state = sentinel.scan(&helios_state).await?;
    
    evolution.quick_health_check(&helios_state, &nexus_state, &harmonia_state, &sentinel_state).await
}
