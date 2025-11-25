// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — API: ENGINE
//   Auto-Evolution Commands
// ═══════════════════════════════════════════════════════════════

use crate::{
    core::{HarmoniaCore, HeliosCore, NexusCore, SentinelCore},
    engine::AutoEvolutionEngine,
    types::{EvolutionReport, EvolutionState, HealthStatus},
    utils::AppResult,
};
use std::time::Duration;

#[tauri::command]
pub async fn run_evolution(
    helios: tauri::State<'_, HeliosCore>,
    nexus: tauri::State<'_, NexusCore>,
    harmonia: tauri::State<'_, HarmoniaCore>,
    sentinel: tauri::State<'_, SentinelCore>,
    evolution: tauri::State<'_, AutoEvolutionEngine>,
) -> AppResult<EvolutionReport> {
    let start = crate::core::utils::now_ms();
    log::info!("[Engine] Starting evolution cycle...");

    let helios_state = helios.collect().await?;
    let nexus_state = nexus.validate().await?;
    let harmonia_state = harmonia.balance(&helios_state).await?;
    let sentinel_state = sentinel.scan(&helios_state).await?;

    // Add timeout to prevent hanging (30 seconds)
    let evolution_future = evolution.evolve(
        &helios_state,
        &nexus_state,
        &harmonia_state,
        &sentinel_state,
    );
    let result = tokio::time::timeout(Duration::from_secs(30), evolution_future).await;

    let report = match result {
        Ok(Ok(report)) => {
            let duration = crate::core::utils::elapsed_ms(start);
            log::info!("[Perf] Evolution cycle completed in {}ms", duration);
            report
        }
        Ok(Err(e)) => {
            log::error!("[Engine] Evolution failed: {}", e);
            return Err(e);
        }
        Err(_) => {
            log::error!("[Engine] Evolution timeout after 30s");
            return Err(crate::types::AppError::Timeout(
                "Evolution cycle exceeded 30s".into(),
            ));
        }
    };

    Ok(report)
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

    evolution
        .quick_health_check(
            &helios_state,
            &nexus_state,
            &harmonia_state,
            &sentinel_state,
        )
        .await
}
