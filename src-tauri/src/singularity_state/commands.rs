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

/// Synchroniser la singularité (auto-sync depuis frontend)
/// ✅ v∞.FIX - Nouvelle commande pour auto-audit engine
#[tauri::command]
pub async fn sync_singularity(
    engine: State<'_, Arc<SingularityEngine>>,
) -> Result<SingularityUpdateAck, String> {
    // Récupérer l'état actuel et le renvoyer (pas de modification)
    let _state = engine.get_full_state().await;
    Ok(SingularityUpdateAck::new("sync_singularity"))
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

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // SingularityUpdateAck Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_singularity_update_ack_new() {
        let ack = SingularityUpdateAck::new("test_command");
        assert_eq!(ack.command, "test_command");
        assert_eq!(ack.status, "ok");
        assert!(ack.timestamp_ms > 0);
    }

    #[test]
    fn test_singularity_update_ack_debug() {
        let ack = SingularityUpdateAck::new("test");
        let debug_str = format!("{:?}", ack);
        assert!(debug_str.contains("SingularityUpdateAck"));
    }

    #[test]
    fn test_singularity_update_ack_clone() {
        let ack = SingularityUpdateAck::new("clone_test");
        let cloned = ack.clone();
        assert_eq!(cloned.command, "clone_test");
        assert_eq!(cloned.status, ack.status);
    }

    #[test]
    fn test_singularity_update_ack_serialize() {
        let ack = SingularityUpdateAck::new("serialize_test");
        let json = serde_json::to_string(&ack).expect("SingularityUpdateAck should serialize");
        assert!(json.contains("serialize_test"));
        assert!(json.contains("ok"));
    }

    #[test]
    fn test_singularity_update_ack_timestamp_increases() {
        let ack1 = SingularityUpdateAck::new("test1");
        std::thread::sleep(std::time::Duration::from_millis(1));
        let ack2 = SingularityUpdateAck::new("test2");
        assert!(ack2.timestamp_ms >= ack1.timestamp_ms);
    }

    // ─────────────────────────────────────────────────────────────
    // get_all_commands Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_get_all_commands_not_empty() {
        let commands = get_all_commands();
        assert!(!commands.is_empty());
    }

    #[test]
    fn test_get_all_commands_count() {
        let commands = get_all_commands();
        assert_eq!(commands.len(), 16);
    }

    #[test]
    fn test_get_all_commands_contains_query_commands() {
        let commands = get_all_commands();
        assert!(commands.contains(&"singularity_get_full_state"));
        assert!(commands.contains(&"singularity_get_physical"));
        assert!(commands.contains(&"singularity_get_cognitive"));
        assert!(commands.contains(&"singularity_get_symbolic"));
        assert!(commands.contains(&"singularity_get_adaptive"));
        assert!(commands.contains(&"singularity_get_meta"));
        assert!(commands.contains(&"singularity_get_global_coherence"));
        assert!(commands.contains(&"singularity_is_critical"));
    }

    #[test]
    fn test_get_all_commands_contains_mutation_commands() {
        let commands = get_all_commands();
        assert!(commands.contains(&"singularity_update_physical"));
        assert!(commands.contains(&"singularity_update_cognitive"));
        assert!(commands.contains(&"singularity_update_symbolic"));
        assert!(commands.contains(&"singularity_update_adaptive"));
        assert!(commands.contains(&"singularity_update_meta"));
        assert!(commands.contains(&"singularity_update_full_state"));
    }

    #[test]
    fn test_get_all_commands_contains_persistence_commands() {
        let commands = get_all_commands();
        assert!(commands.contains(&"singularity_save_state"));
        assert!(commands.contains(&"singularity_load_state"));
    }

    #[test]
    fn test_get_all_commands_no_duplicates() {
        let commands = get_all_commands();
        let mut sorted = commands.clone();
        sorted.sort();
        sorted.dedup();
        assert_eq!(sorted.len(), commands.len());
    }

    #[test]
    fn test_get_all_commands_all_start_with_singularity() {
        let commands = get_all_commands();
        for cmd in commands {
            assert!(cmd.starts_with("singularity_"), "Command '{}' should start with 'singularity_'", cmd);
        }
    }
}
