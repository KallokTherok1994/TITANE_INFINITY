// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Singularity API v∞
//   SUPER PROMPT #7 — Commandes Tauri pour Singularity OS
// ═══════════════════════════════════════════════════════════════

use crate::singularity_os::{SingularityOS, state::CognitiveMode};
use crate::engines::unified_memory::UnifiedMemoryEngine;
use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Arc;
use tokio::sync::RwLock;

/// État global Singularity OS (partagé Tauri)
pub struct SingularityState {
    pub os: Arc<RwLock<SingularityOS>>,
}

impl SingularityState {
    pub fn new() -> Self {
        Self {
            os: Arc::new(RwLock::new(SingularityOS::new())),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   COMMANDES TAURI — Inspection État
// ═══════════════════════════════════════════════════════════════

/// Obtenir l'état complet Singularity
#[tauri::command]
pub async fn singularity_get_state(
    singularity: State<'_, SingularityState>,
) -> Result<crate::singularity_os::state::SingularityState, String> {
    let os = singularity.os.read().await;
    Ok(os.get_state().await)
}

/// Obtenir les statistiques Singularity
#[tauri::command]
pub async fn singularity_get_stats(
    singularity: State<'_, SingularityState>,
) -> Result<crate::singularity_os::state::SingularityStats, String> {
    let os = singularity.os.read().await;
    Ok(os.get_stats().await)
}

/// Obtenir le contexte récent
#[tauri::command]
pub async fn singularity_get_context(
    singularity: State<'_, SingularityState>,
    count: usize,
) -> Result<Vec<String>, String> {
    let os = singularity.os.read().await;
    Ok(os.get_recent_context(count).await)
}

// ═══════════════════════════════════════════════════════════════
//   COMMANDES TAURI — Contrôle Mode
// ═══════════════════════════════════════════════════════════════

/// Changer le mode cognitif
#[tauri::command]
pub async fn singularity_set_mode(
    singularity: State<'_, SingularityState>,
    mode: String,
) -> Result<(), String> {
    let os = singularity.os.read().await;
    
    let cognitive_mode = match mode.to_lowercase().as_str() {
        "coach" => CognitiveMode::Coach,
        "architect" => CognitiveMode::Architect,
        "analyst" => CognitiveMode::Analyst,
        "meta" => CognitiveMode::Meta,
        "observer" => CognitiveMode::Observer,
        "expert" => CognitiveMode::Expert,
        _ => return Err(format!("Mode invalide: {}", mode)),
    };
    
    os.set_mode(cognitive_mode).await;
    Ok(())
}

/// Obtenir le mode cognitif actuel
#[tauri::command]
pub async fn singularity_get_mode(
    singularity: State<'_, SingularityState>,
) -> Result<String, String> {
    let os = singularity.os.read().await;
    let state = os.get_state().await;
    Ok(format!("{}", state.global_mode))
}

// ═══════════════════════════════════════════════════════════════
//   COMMANDES TAURI — Cycle Vie
// ═══════════════════════════════════════════════════════════════

/// Enregistrer une interaction
#[tauri::command]
pub async fn singularity_record_interaction(
    singularity: State<'_, SingularityState>,
) -> Result<(), String> {
    let os = singularity.os.read().await;
    os.record_interaction().await;
    Ok(())
}

/// Ajouter élément au contexte
#[tauri::command]
pub async fn singularity_push_context(
    singularity: State<'_, SingularityState>,
    content: String,
) -> Result<(), String> {
    let os = singularity.os.read().await;
    os.push_context(content).await;
    Ok(())
}

/// Réinitialiser l'état
#[tauri::command]
pub async fn singularity_reset(
    singularity: State<'_, SingularityState>,
) -> Result<(), String> {
    let os = singularity.os.read().await;
    os.reset().await;
    Ok(())
}

/// Vérifier si réinitialisation recommandée
#[tauri::command]
pub async fn singularity_should_reset(
    singularity: State<'_, SingularityState>,
) -> Result<bool, String> {
    let os = singularity.os.read().await;
    Ok(os.should_reset().await)
}

// ═══════════════════════════════════════════════════════════════
//   COMMANDES TAURI — Pipeline Integration
// ═══════════════════════════════════════════════════════════════

/// Construire contexte pour génération (Phase PRE)
#[tauri::command]
pub async fn singularity_build_context(
    singularity: State<'_, SingularityState>,
    memory: State<'_, crate::engines::unified_memory::api::MemoryState>,
    query: String,
) -> Result<crate::singularity_os::context_manager::ContextBundle, String> {
    let os = singularity.os.read().await;
    let memory_engine = memory.engine.read().await;
    
    os.pre_generation_context(&memory_engine, &query).await
}

/// Valider cohérence réponse (Phase POST)
#[tauri::command]
pub async fn singularity_validate_response(
    singularity: State<'_, SingularityState>,
    response: String,
    context: String,
) -> Result<crate::singularity_os::coherence_supervisor::CoherenceReport, String> {
    let os = singularity.os.read().await;
    os.post_generation_validation(&response, &context).await
}

/// Synchroniser mémoire (Phase END)
#[tauri::command]
pub async fn singularity_sync_memory(
    singularity: State<'_, SingularityState>,
    memory: State<'_, crate::engines::unified_memory::api::MemoryState>,
) -> Result<crate::singularity_os::memory_bridge::SyncResult, String> {
    let os = singularity.os.read().await;
    let memory_engine = memory.engine.read().await;
    
    os.end_cycle_sync(&memory_engine, None).await
}

/// Évoluer état global (Phase EVOLUTION)
#[tauri::command]
pub async fn singularity_evolve(
    singularity: State<'_, SingularityState>,
) -> Result<crate::singularity_os::evolution_loop::EvolutionResult, String> {
    let os = singularity.os.read().await;
    os.evolve(None).await
}

/// Synchroniser depuis mémoire (enrichissement)
#[tauri::command]
pub async fn singularity_sync_from_memory(
    singularity: State<'_, SingularityState>,
    memory: State<'_, crate::engines::unified_memory::api::MemoryState>,
) -> Result<crate::singularity_os::memory_bridge::SyncResult, String> {
    let os = singularity.os.read().await;
    let memory_engine = memory.engine.read().await;
    
    os.sync_from_memory(&memory_engine).await
}

/// Promouvoir mémoires importantes
#[tauri::command]
pub async fn singularity_promote_memories(
    singularity: State<'_, SingularityState>,
    memory: State<'_, crate::engines::unified_memory::api::MemoryState>,
) -> Result<usize, String> {
    let os = singularity.os.read().await;
    let memory_engine = memory.engine.read().await;
    
    os.promote_important_memories(&memory_engine).await
}

// ═══════════════════════════════════════════════════════════════
//   EXPORT ALL COMMANDS
// ═══════════════════════════════════════════════════════════════

/// Liste complète des commandes Singularity pour enregistrement Tauri
pub fn get_singularity_commands() -> Vec<&'static str> {
    vec![
        // Inspection
        "singularity_get_state",
        "singularity_get_stats",
        "singularity_get_context",
        // Contrôle
        "singularity_set_mode",
        "singularity_get_mode",
        // Cycle vie
        "singularity_record_interaction",
        "singularity_push_context",
        "singularity_reset",
        "singularity_should_reset",
        // Pipeline
        "singularity_build_context",
        "singularity_validate_response",
        "singularity_sync_memory",
        "singularity_evolve",
        "singularity_sync_from_memory",
        "singularity_promote_memories",
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_singularity_state_creation() {
        let state = SingularityState::new();
        // Should not panic
    }

    #[test]
    fn test_command_list() {
        let commands = get_singularity_commands();
        assert_eq!(commands.len(), 15);
        assert!(commands.contains(&"singularity_get_state"));
        assert!(commands.contains(&"singularity_evolve"));
    }
}
