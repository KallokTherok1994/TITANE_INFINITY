// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v20 — SINGULARITY COMMANDS v∞
//   API Tauri pour l'état global SingularityState v∞
// ═══════════════════════════════════════════════════════════════════════════════

use crate::singularity::singularity_state_vinfinity::{
    collect_all_engines_state, DiffResult, IntegrityCheckResult, MetaCognitiveReport,
    SingularityStateVInfinity,
};
use std::sync::Arc;
use tauri::State;
use tokio::sync::Mutex;

// ═══════════════════════════════════════════════════════════════════════════════
//   ÉTAT GLOBAL PARTAGÉ
// ═══════════════════════════════════════════════════════════════════════════════

/// État global du système TITANE∞ v20
///
/// Accessible depuis toutes les commandes Tauri via State<SingularityStateGlobal>
pub struct SingularityStateGlobal {
    pub state: Arc<Mutex<SingularityStateVInfinity>>,
}

impl Default for SingularityStateGlobal {
    fn default() -> Self {
        Self::new()
    }
}

impl SingularityStateGlobal {
    pub fn new() -> Self {
        Self {
            state: Arc::new(Mutex::new(SingularityStateVInfinity::init())),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   COMMANDES TAURI
// ═══════════════════════════════════════════════════════════════════════════════

/// Récupère l'état global complet du système
///
/// # Returns
/// `SingularityStateVInfinity` - État complet sérialisé en JSON
#[tauri::command]
pub async fn singularity_get(
    state: State<'_, SingularityStateGlobal>,
) -> Result<SingularityStateVInfinity, String> {
    log::info!("[Command] singularity_get");

    let state_lock = state.state.lock().await;
    Ok(state_lock.clone())
}

/// Définit un nouvel état global (fusion complète)
///
/// # Arguments
/// * `new_state` - Nouvel état à fusionner
///
/// # Returns
/// `String` - Hash du nouvel état
#[tauri::command]
pub async fn singularity_set(
    state: State<'_, SingularityStateGlobal>,
    new_state: SingularityStateVInfinity,
) -> Result<String, String> {
    log::info!("[Command] singularity_set");

    let mut state_lock = state.state.lock().await;

    // Vérifier intégrité du nouvel état
    if !new_state.verify_integrity() {
        return Err("Invalid state: integrity check failed".to_string());
    }

    // Remplacer l'état
    *state_lock = new_state;

    Ok(state_lock.global_hash.clone())
}

/// Calcule la différence entre l'état actuel et un nouvel état
///
/// # Arguments
/// * `next_state` - État suivant à comparer
///
/// # Returns
/// `DiffResult` - Résultat du diff avec modules modifiés
#[tauri::command]
pub async fn singularity_diff(
    state: State<'_, SingularityStateGlobal>,
    next_state: SingularityStateVInfinity,
) -> Result<DiffResult, String> {
    log::info!("[Command] singularity_diff");

    let state_lock = state.state.lock().await;
    Ok(state_lock.diff(&next_state))
}

/// Récupère le hash global de l'état actuel
///
/// # Returns
/// `String` - Hash SHA-256 hexadécimal
#[tauri::command]
pub async fn singularity_hash(state: State<'_, SingularityStateGlobal>) -> Result<String, String> {
    log::info!("[Command] singularity_hash");

    let state_lock = state.state.lock().await;
    Ok(state_lock.global_hash.clone())
}

/// Exécute un Deep Sync complet du système
///
/// Harmonise tous les moteurs et résout les conflits
///
/// # Returns
/// `SingularityStateVInfinity` - État après synchronisation
#[tauri::command]
pub async fn singularity_sync(
    state: State<'_, SingularityStateGlobal>,
) -> Result<SingularityStateVInfinity, String> {
    log::info!("[Command] singularity_sync - Starting Deep Sync");

    let mut state_lock = state.state.lock().await;

    // Collecter l'état de tous les moteurs
    let engines = collect_all_engines_state();

    // Fusionner
    state_lock.merge(engines)?;

    // Deep Sync
    state_lock.deep_sync()?;

    log::info!("[Command] singularity_sync - Complete");
    Ok(state_lock.clone())
}

/// Génère un rapport de méta-évaluation cognitive
///
/// # Returns
/// `MetaCognitiveReport` - Analyse complète de la cohérence globale
#[tauri::command]
pub async fn singularity_meta(
    state: State<'_, SingularityStateGlobal>,
) -> Result<MetaCognitiveReport, String> {
    log::info!("[Command] singularity_meta");

    let state_lock = state.state.lock().await;
    Ok(state_lock.meta_evaluate())
}

/// Vérifie l'intégrité de l'état global
///
/// # Returns
/// `IntegrityCheckResult` - Rapport d'intégrité détaillé
#[tauri::command]
pub async fn singularity_integrity(
    state: State<'_, SingularityStateGlobal>,
) -> Result<IntegrityCheckResult, String> {
    log::info!("[Command] singularity_integrity");

    let state_lock = state.state.lock().await;
    Ok(state_lock.integrity_check())
}

/// Tente de réparer l'état si corrompu
///
/// # Returns
/// `SingularityStateVInfinity` - État après réparation
#[tauri::command]
pub async fn singularity_repair(
    state: State<'_, SingularityStateGlobal>,
) -> Result<SingularityStateVInfinity, String> {
    log::warn!("[Command] singularity_repair - Starting auto-repair");

    let mut state_lock = state.state.lock().await;
    state_lock.repair_if_corrupted();

    log::info!("[Command] singularity_repair - Complete");
    Ok(state_lock.clone())
}

/// Exporte l'état complet en JSON
///
/// # Returns
/// `String` - État complet sérialisé en JSON formaté
#[tauri::command]
pub async fn singularity_export_json(
    state: State<'_, SingularityStateGlobal>,
) -> Result<String, String> {
    log::info!("[Command] singularity_export_json");

    let state_lock = state.state.lock().await;
    state_lock.export_json()
}

/// Récupère un snapshot résumé de l'état (léger)
///
/// # Returns
/// `HashMap<String, String>` - Résumé avec version, hash, cohérence, etc.
#[tauri::command]
pub async fn singularity_snapshot(
    state: State<'_, SingularityStateGlobal>,
) -> Result<std::collections::HashMap<String, String>, String> {
    log::info!("[Command] singularity_snapshot");

    let state_lock = state.state.lock().await;
    Ok(state_lock.snapshot_summary())
}
