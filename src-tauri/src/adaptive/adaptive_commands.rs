// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v21 — ADAPTIVE COMMANDS
//   Commandes Tauri pour l'optimisation adaptative
// ═══════════════════════════════════════════════════════════════════════════════

use crate::adaptive::{
    AdaptiveOptimizationEngine, AdaptiveSummary, PreferenceProfile, SystemBehaviorMode,
    SystemPerformanceSample,
};
use tauri::State;
use tokio::sync::Mutex;

/// État global du moteur adaptatif
pub struct AdaptiveEngineGlobal(pub Mutex<AdaptiveOptimizationEngine>);

impl AdaptiveEngineGlobal {
    pub fn new() -> Self {
        Self(Mutex::new(AdaptiveOptimizationEngine::new()))
    }
}

impl Default for AdaptiveEngineGlobal {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   COMMANDES TAURI
// ═══════════════════════════════════════════════════════════════════════════════

/// Récupère le profil d'adaptation actuel
#[tauri::command]
pub async fn adaptive_get_profile(
    state: State<'_, AdaptiveEngineGlobal>,
) -> Result<PreferenceProfile, String> {
    log::info!("[AdaptiveCommands] adaptive_get_profile called");

    let engine = state.0.lock().await;
    Ok(engine.preference_profile.clone())
}

/// Définit le mode système d'adaptation
#[tauri::command]
pub async fn adaptive_set_mode(
    state: State<'_, AdaptiveEngineGlobal>,
    mode: String,
) -> Result<(), String> {
    log::info!("[AdaptiveCommands] adaptive_set_mode called: {}", mode);

    let mut engine = state.0.lock().await;

    let behavior_mode = match mode.as_str() {
        "speed" => SystemBehaviorMode::Speed,
        "stability" => SystemBehaviorMode::Stability,
        "reliability" => SystemBehaviorMode::Reliability,
        "adaptive" => SystemBehaviorMode::Adaptive,
        _ => return Err(format!("Invalid mode: {}", mode)),
    };

    engine.preference_profile.system_mode = behavior_mode;
    Ok(())
}

/// Lance un cycle d'apprentissage manuel
#[tauri::command]
pub async fn adaptive_learn(state: State<'_, AdaptiveEngineGlobal>) -> Result<String, String> {
    log::info!("[AdaptiveCommands] adaptive_learn called");

    let mut engine = state.0.lock().await;
    engine.learn();

    Ok(format!(
        "Learning cycle complete. {} patterns detected.",
        engine.learning_state.patterns_detected.len()
    ))
}

/// Exécute une optimisation manuelle
#[tauri::command]
pub async fn adaptive_run_optimization(
    state: State<'_, AdaptiveEngineGlobal>,
) -> Result<Vec<String>, String> {
    log::info!("[AdaptiveCommands] adaptive_run_optimization called");

    let mut engine = state.0.lock().await;
    let actions = engine.evaluate_rules();

    let action_descriptions: Vec<String> = actions.iter().map(|a| format!("{:?}", a)).collect();

    Ok(action_descriptions)
}

/// Récupère l'historique de performance récent
#[tauri::command]
pub async fn adaptive_get_history(
    state: State<'_, AdaptiveEngineGlobal>,
    limit: Option<usize>,
) -> Result<Vec<SystemPerformanceSample>, String> {
    log::info!("[AdaptiveCommands] adaptive_get_history called");

    let engine = state.0.lock().await;
    let limit = limit.unwrap_or(100);

    let history: Vec<SystemPerformanceSample> = engine
        .performance_history
        .iter()
        .rev()
        .take(limit)
        .cloned()
        .collect();

    Ok(history)
}

/// Capture un échantillon de performance
#[tauri::command]
pub async fn adaptive_capture_sample(
    state: State<'_, AdaptiveEngineGlobal>,
    sample: SystemPerformanceSample,
) -> Result<(), String> {
    log::info!("[AdaptiveCommands] adaptive_capture_sample called");

    let mut engine = state.0.lock().await;
    engine.capture_sample(sample);

    Ok(())
}

/// Récupère un résumé de l'état adaptatif
#[tauri::command]
pub async fn adaptive_get_summary(
    state: State<'_, AdaptiveEngineGlobal>,
) -> Result<AdaptiveSummary, String> {
    log::info!("[AdaptiveCommands] adaptive_get_summary called");

    let engine = state.0.lock().await;
    Ok(engine.get_summary())
}
