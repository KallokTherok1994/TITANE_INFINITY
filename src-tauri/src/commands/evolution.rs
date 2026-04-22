// 🎯 Evolution Commands — Commandes Tauri pour l'auto-évolution
// Expose le superviseur d'évolution au frontend

use crate::auto_evolution_v15::{
    pattern_learning::PatternType, supervisor::EvolutionSupervisor, KevinMetrics,
};
use tauri::State;
use tokio::sync::RwLock;

/// État global du superviseur d'évolution
pub struct EvolutionState {
    pub supervisor: RwLock<EvolutionSupervisor>,
}

impl Default for EvolutionState {
    fn default() -> Self {
        Self {
            supervisor: RwLock::new(EvolutionSupervisor::new()),
        }
    }
}

/// Métriques de test pour Kevin
fn get_test_metrics() -> KevinMetrics {
    KevinMetrics {
        emotional_state: 0.7,
        cognitive_load: 0.5,
        energy_level: 0.8,
        clarity_level: 0.85,
        creativity_level: 0.75,
        stress_level: 0.3,
        focus_level: 0.9,
        interaction_context: "Test evolution cycle".to_string(),
    }
}

pub async fn evolution_run_cycle(state: State<'_, EvolutionState>) -> Result<String, String> {
    let mut supervisor: tokio::sync::RwLockWriteGuard<'_, EvolutionSupervisor> =
        state.supervisor.write().await;
    let metrics = get_test_metrics();
    Ok(supervisor.run_evolution_cycle(&metrics))
}

pub async fn evolution_safe_reset(state: State<'_, EvolutionState>) -> Result<String, String> {
    let mut supervisor: tokio::sync::RwLockWriteGuard<'_, EvolutionSupervisor> =
        state.supervisor.write().await;
    Ok(supervisor.perform_safe_reset())
}

pub async fn evolution_emergency_heal(state: State<'_, EvolutionState>) -> Result<String, String> {
    let mut supervisor: tokio::sync::RwLockWriteGuard<'_, EvolutionSupervisor> =
        state.supervisor.write().await;
    Ok(supervisor.emergency_intervention())
}

pub async fn evolution_auto_correct(
    state: State<'_, EvolutionState>,
) -> Result<Vec<String>, String> {
    let mut supervisor: tokio::sync::RwLockWriteGuard<'_, EvolutionSupervisor> =
        state.supervisor.write().await;
    Ok(supervisor.auto_correct_system())
}

pub async fn evolution_store_memory(
    state: State<'_, EvolutionState>,
    key: String,
    value: String,
) -> Result<(), String> {
    let mut supervisor: tokio::sync::RwLockWriteGuard<'_, EvolutionSupervisor> =
        state.supervisor.write().await;
    supervisor.store_memory(key, value);
    Ok(())
}

pub async fn evolution_recall_memory(
    state: State<'_, EvolutionState>,
    key: String,
) -> Result<Option<String>, String> {
    let mut supervisor: tokio::sync::RwLockWriteGuard<'_, EvolutionSupervisor> =
        state.supervisor.write().await;
    Ok(supervisor.recall_memory(&key))
}

pub async fn evolution_get_stats(state: State<'_, EvolutionState>) -> Result<String, String> {
    let supervisor: tokio::sync::RwLockReadGuard<'_, EvolutionSupervisor> =
        state.supervisor.read().await;
    Ok(supervisor.get_stats())
}

pub async fn evolution_get_pattern(
    state: State<'_, EvolutionState>,
    pattern_type: String,
) -> Result<Option<String>, String> {
    let supervisor: tokio::sync::RwLockReadGuard<'_, EvolutionSupervisor> =
        state.supervisor.read().await;

    let pattern_type = match pattern_type.as_str() {
        "CommunicationStyle" => PatternType::CommunicationStyle,
        "DecisionLogic" => PatternType::DecisionLogic,
        "WorkingRhythm" => PatternType::WorkingRhythm,
        "EmotionalCycle" => PatternType::EmotionalCycle,
        "PreferredDepth" => PatternType::PreferredDepth,
        "InteractionTone" => PatternType::InteractionTone,
        "CreativeHabits" => PatternType::CreativeHabits,
        _ => return Err("Invalid pattern type".to_string()),
    };

    Ok(supervisor.get_pattern(pattern_type))
}

pub async fn evolution_detect_inconsistencies(
    state: State<'_, EvolutionState>,
) -> Result<Vec<String>, String> {
    let supervisor: tokio::sync::RwLockReadGuard<'_, EvolutionSupervisor> =
        state.supervisor.read().await;
    Ok(supervisor.detect_all_inconsistencies())
}

pub async fn evolution_record_prediction(
    state: State<'_, EvolutionState>,
    prediction: String,
) -> Result<(), String> {
    let mut supervisor: tokio::sync::RwLockWriteGuard<'_, EvolutionSupervisor> =
        state.supervisor.write().await;
    supervisor.record_prediction(prediction);
    Ok(())
}

pub async fn evolution_get_prediction_history(
    state: State<'_, EvolutionState>,
) -> Result<Vec<String>, String> {
    let supervisor: tokio::sync::RwLockReadGuard<'_, EvolutionSupervisor> =
        state.supervisor.read().await;
    Ok(supervisor.get_prediction_history())
}

pub async fn evolution_adjust_emotional_sensitivity(
    state: State<'_, EvolutionState>,
    target: f32,
) -> Result<(), String> {
    let mut supervisor: tokio::sync::RwLockWriteGuard<'_, EvolutionSupervisor> =
        state.supervisor.write().await;
    supervisor.adjust_emotional_sensitivity(target);
    Ok(())
}

pub async fn evolution_get_emotional_recommendations(
    state: State<'_, EvolutionState>,
) -> Result<Vec<String>, String> {
    let supervisor: tokio::sync::RwLockReadGuard<'_, EvolutionSupervisor> =
        state.supervisor.read().await;
    let metrics = get_test_metrics();
    Ok(supervisor.get_emotional_recommendations(&metrics))
}

pub async fn evolution_should_be_proactive(
    state: State<'_, EvolutionState>,
) -> Result<bool, String> {
    let supervisor: tokio::sync::RwLockReadGuard<'_, EvolutionSupervisor> =
        state.supervisor.read().await;
    let metrics = get_test_metrics();
    Ok(supervisor.should_be_proactive(&metrics))
}

pub async fn evolution_auto_detect_mode(
    state: State<'_, EvolutionState>,
) -> Result<String, String> {
    let supervisor: tokio::sync::RwLockReadGuard<'_, EvolutionSupervisor> =
        state.supervisor.read().await;
    let metrics = get_test_metrics();
    Ok(supervisor.auto_detect_optimal_mode(&metrics))
}
