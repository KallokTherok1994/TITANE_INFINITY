// engine_evolution_commands.rs — Tauri IPC wrappers for Auto-Evolution engine.
// Uses AutoEvolutionEngine managed state directly with default state collectors
// (legacy HeliosCore/NexusCore etc. are stub adapters — we bypass them and use
// the typed state structs' Default impls to keep the call simple and side-effect-free).

use tauri::State;
use titane_infinity::{
    engine::AutoEvolutionEngine,
    types::{EvolutionReport, EvolutionState, HealthStatus, HarmoniaState, HeliosState, NexusState, SentinelState},
    utils::AppResult,
};

/// Run one full evolution cycle using default-collected states.
#[tauri::command]
pub async fn run_evolution(
    evolution: State<'_, AutoEvolutionEngine>,
) -> AppResult<EvolutionReport> {
    let helios = HeliosState::default();
    let nexus = NexusState::default();
    let harmonia = HarmoniaState::default();
    let sentinel = SentinelState::default();
    evolution.evolve(&helios, &nexus, &harmonia, &sentinel).await
}

/// Get current evolution state snapshot.
#[tauri::command]
pub async fn get_evolution_state(
    evolution: State<'_, AutoEvolutionEngine>,
) -> AppResult<EvolutionState> {
    evolution.get_state().await
}

/// Quick health check using default-collected states.
#[tauri::command]
pub async fn quick_health_check(
    evolution: State<'_, AutoEvolutionEngine>,
) -> AppResult<HealthStatus> {
    let helios = HeliosState::default();
    let nexus = NexusState::default();
    let harmonia = HarmoniaState::default();
    let sentinel = SentinelState::default();
    evolution.quick_health_check(&helios, &nexus, &harmonia, &sentinel).await
}
