/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v14 — SINGULARITY STATE COMMANDS
 * Commandes Tauri exposées au frontend React
 * ═══════════════════════════════════════════════════════════════════
 */
use crate::singularity_state::layers::*;
use crate::singularity_state::{SingularityEngine, SingularityState};
use std::sync::Arc;
use tauri::State;

// ═══════════════════════════════════════════════════════════════════
// QUERY COMMANDS (Read-only)
// ═══════════════════════════════════════════════════════════════════

/// Obtenir l'état complet de la singularité
#[tauri::command]
pub async fn singularity_get_full_state(
    engine: State<'_, Arc<SingularityEngine>>,
) -> Result<SingularityState, String> {
    Ok(engine.get_full_state().await)
}

/// Obtenir Physical Layer uniquement
#[tauri::command]
pub async fn singularity_get_physical(
    engine: State<'_, Arc<SingularityEngine>>,
) -> Result<PhysicalLayer, String> {
    let state = engine.get_full_state().await;
    Ok(state.physical)
}

/// Obtenir Cognitive Layer uniquement
#[tauri::command]
pub async fn singularity_get_cognitive(
    engine: State<'_, Arc<SingularityEngine>>,
) -> Result<CognitiveLayer, String> {
    let state = engine.get_full_state().await;
    Ok(state.cognitive)
}

/// Obtenir Symbolic Layer uniquement
#[tauri::command]
pub async fn singularity_get_symbolic(
    engine: State<'_, Arc<SingularityEngine>>,
) -> Result<SymbolicLayer, String> {
    let state = engine.get_full_state().await;
    Ok(state.symbolic)
}

/// Obtenir Adaptive Layer uniquement
#[tauri::command]
pub async fn singularity_get_adaptive(
    engine: State<'_, Arc<SingularityEngine>>,
) -> Result<AdaptiveLayer, String> {
    let state = engine.get_full_state().await;
    Ok(state.adaptive)
}

/// Obtenir Meta Layer uniquement
#[tauri::command]
pub async fn singularity_get_meta(
    engine: State<'_, Arc<SingularityEngine>>,
) -> Result<MetaLayer, String> {
    let state = engine.get_full_state().await;
    Ok(state.meta)
}

/// Obtenir cohérence globale (0-1)
#[tauri::command]
pub async fn singularity_get_global_coherence(
    engine: State<'_, Arc<SingularityEngine>>,
) -> Result<f32, String> {
    Ok(engine.get_global_coherence().await)
}

/// Vérifier si système en état critique
#[tauri::command]
pub async fn singularity_is_critical(
    engine: State<'_, Arc<SingularityEngine>>,
) -> Result<bool, String> {
    Ok(engine.is_critical().await)
}

// ═══════════════════════════════════════════════════════════════════
// MUTATION COMMANDS (Write)
// ═══════════════════════════════════════════════════════════════════

/// Mettre à jour Physical Layer
#[tauri::command]
pub async fn singularity_update_physical(
    engine: State<'_, Arc<SingularityEngine>>,
    physical: PhysicalLayer,
) -> Result<(), String> {
    engine.update_physical(physical).await
}

/// Mettre à jour Cognitive Layer
#[tauri::command]
pub async fn singularity_update_cognitive(
    engine: State<'_, Arc<SingularityEngine>>,
    cognitive: CognitiveLayer,
) -> Result<(), String> {
    engine.update_cognitive(cognitive).await
}

/// Mettre à jour Symbolic Layer
#[tauri::command]
pub async fn singularity_update_symbolic(
    engine: State<'_, Arc<SingularityEngine>>,
    symbolic: SymbolicLayer,
) -> Result<(), String> {
    engine.update_symbolic(symbolic).await
}

/// Mettre à jour Adaptive Layer
#[tauri::command]
pub async fn singularity_update_adaptive(
    engine: State<'_, Arc<SingularityEngine>>,
    adaptive: AdaptiveLayer,
) -> Result<(), String> {
    engine.update_adaptive(adaptive).await
}

/// Mettre à jour Meta Layer
#[tauri::command]
pub async fn singularity_update_meta(
    engine: State<'_, Arc<SingularityEngine>>,
    meta: MetaLayer,
) -> Result<(), String> {
    engine.update_meta(meta).await
}

/// Mettre à jour état complet (full sync)
#[tauri::command]
pub async fn singularity_update_full_state(
    engine: State<'_, Arc<SingularityEngine>>,
    state: SingularityState,
) -> Result<(), String> {
    engine.update_full_state(state).await
}

// ═══════════════════════════════════════════════════════════════════
// PERSISTENCE COMMANDS
// ═══════════════════════════════════════════════════════════════════

/// Sauvegarder manuellement l'état
#[tauri::command]
pub async fn singularity_save_state(
    engine: State<'_, Arc<SingularityEngine>>,
) -> Result<(), String> {
    engine.save_state().await
}

/// Charger état depuis persistence
#[tauri::command]
pub async fn singularity_load_state(
    engine: State<'_, Arc<SingularityEngine>>,
) -> Result<(), String> {
    engine.load_state().await
}

// ═══════════════════════════════════════════════════════════════════
// HELPER: Register all commands
// ═══════════════════════════════════════════════════════════════════

/// Macro pour enregistrer toutes les commandes dans main.rs
///
/// Usage dans main.rs:
/// ```rust
/// .invoke_handler(tauri::generate_handler![
///     singularity_state::commands::singularity_get_full_state,
///     singularity_state::commands::singularity_update_physical,
///     // ... etc
/// ])
/// ```
pub fn get_all_commands() -> Vec<&'static str> {
    vec![
        // Query commands
        "singularity_get_full_state",
        "singularity_get_physical",
        "singularity_get_cognitive",
        "singularity_get_symbolic",
        "singularity_get_adaptive",
        "singularity_get_meta",
        "singularity_get_global_coherence",
        "singularity_is_critical",
        // Mutation commands
        "singularity_update_physical",
        "singularity_update_cognitive",
        "singularity_update_symbolic",
        "singularity_update_adaptive",
        "singularity_update_meta",
        "singularity_update_full_state",
        // Persistence commands
        "singularity_save_state",
        "singularity_load_state",
    ]
}
