/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v14 — SINGULARITY STATE COMMANDS
 * Commandes Tauri exposées au frontend React
 * ═══════════════════════════════════════════════════════════════════
 */
use super::layers::*;
use super::{SingularityEngine, SingularityState};
use serde::Serialize;
use std::sync::Arc;
use tauri::State;

#[derive(Debug, Clone, Serialize)]
pub struct SingularityUpdateAck {
    pub command: &'static str,
    pub status: &'static str,
    pub timestamp_ms: u64,
}

impl SingularityUpdateAck {
    fn new(command: &'static str) -> Self {
        Self {
            command,
            status: "ok",
            timestamp_ms: chrono::Utc::now().timestamp_millis() as u64,
        }
    }
}

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
) -> Result<SingularityUpdateAck, String> {
    engine.update_physical(physical).await?;
    Ok(SingularityUpdateAck::new("singularity_update_physical"))
}

/// Mettre à jour Cognitive Layer
#[tauri::command]
pub async fn singularity_update_cognitive(
    engine: State<'_, Arc<SingularityEngine>>,
    cognitive: CognitiveLayer,
) -> Result<SingularityUpdateAck, String> {
    engine.update_cognitive(cognitive).await?;
    Ok(SingularityUpdateAck::new("singularity_update_cognitive"))
}

/// Mettre à jour Symbolic Layer
#[tauri::command]
pub async fn singularity_update_symbolic(
    engine: State<'_, Arc<SingularityEngine>>,
    symbolic: SymbolicLayer,
) -> Result<SingularityUpdateAck, String> {
    engine.update_symbolic(symbolic).await?;
    Ok(SingularityUpdateAck::new("singularity_update_symbolic"))
}

/// Mettre à jour Adaptive Layer
#[tauri::command]
pub async fn singularity_update_adaptive(
    engine: State<'_, Arc<SingularityEngine>>,
    adaptive: AdaptiveLayer,
) -> Result<SingularityUpdateAck, String> {
    engine.update_adaptive(adaptive).await?;
    Ok(SingularityUpdateAck::new("singularity_update_adaptive"))
}

/// Mettre à jour Meta Layer
#[tauri::command]
pub async fn singularity_update_meta(
    engine: State<'_, Arc<SingularityEngine>>,
    meta: MetaLayer,
) -> Result<SingularityUpdateAck, String> {
    engine.update_meta(meta).await?;
    Ok(SingularityUpdateAck::new("singularity_update_meta"))
}

/// Mettre à jour état complet (full sync)
#[tauri::command]
pub async fn singularity_update_full_state(
    engine: State<'_, Arc<SingularityEngine>>,
    state: SingularityState,
) -> Result<SingularityUpdateAck, String> {
    engine.update_full_state(state).await?;
    Ok(SingularityUpdateAck::new("singularity_update_full_state"))
}

// ═══════════════════════════════════════════════════════════════════
// PERSISTENCE COMMANDS
// ═══════════════════════════════════════════════════════════════════

/// Sauvegarder manuellement l'état
#[tauri::command]
pub async fn singularity_save_state(
    engine: State<'_, Arc<SingularityEngine>>,
) -> Result<SingularityUpdateAck, String> {
    engine.save_state().await?;
    Ok(SingularityUpdateAck::new("singularity_save_state"))
}

/// Charger état depuis persistence
#[tauri::command]
pub async fn singularity_load_state(
    engine: State<'_, Arc<SingularityEngine>>,
) -> Result<SingularityUpdateAck, String> {
    engine.load_state().await?;
    Ok(SingularityUpdateAck::new("singularity_load_state"))
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
