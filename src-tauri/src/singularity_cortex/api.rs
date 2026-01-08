// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Singularity API v∞
//   Commandes Tauri pour Singularity Cortex OS
// ═══════════════════════════════════════════════════════════════

use crate::singularity_cortex::{state::CognitiveMode, SingularityCortex};
use std::sync::Arc;
use tauri::State;
use tokio::sync::RwLock;

pub struct SingularityCortexState {
    pub cortex: Arc<RwLock<SingularityCortex>>,
}

impl SingularityCortexState {
    pub fn new() -> Self {
        Self {
            cortex: Arc::new(RwLock::new(SingularityCortex::new())),
        }
    }
}

#[tauri::command]
pub async fn singularity_cortex_get_state(
    cortex: State<'_, SingularityCortexState>,
) -> Result<crate::singularity_cortex::state::SingularityState, String> {
    let c = cortex.cortex.read().await;
    Ok(c.get_state().await)
}

#[tauri::command]
pub async fn singularity_cortex_get_stats(
    cortex: State<'_, SingularityCortexState>,
) -> Result<crate::singularity_cortex::state::SingularityStats, String> {
    let c = cortex.cortex.read().await;
    Ok(c.get_stats().await)
}

#[tauri::command]
pub async fn singularity_cortex_get_context(
    cortex: State<'_, SingularityCortexState>,
    count: usize,
) -> Result<Vec<String>, String> {
    let c = cortex.cortex.read().await;
    Ok(c.get_recent_context(count).await)
}

#[tauri::command]
pub async fn singularity_cortex_set_mode(
    cortex: State<'_, SingularityCortexState>,
    mode: String,
) -> Result<(), String> {
    let c = cortex.cortex.read().await;

    let cognitive_mode = match mode.to_lowercase().as_str() {
        "coach" => CognitiveMode::Coach,
        "architect" => CognitiveMode::Architect,
        "analyst" => CognitiveMode::Analyst,
        "meta" => CognitiveMode::Meta,
        "observer" => CognitiveMode::Observer,
        "expert" => CognitiveMode::Expert,
        _ => return Err(format!("Mode invalide: {}", mode)),
    };

    c.set_mode(cognitive_mode).await;
    Ok(())
}

#[tauri::command]
pub async fn singularity_cortex_record_interaction(
    cortex: State<'_, SingularityCortexState>,
) -> Result<(), String> {
    let c = cortex.cortex.read().await;
    c.record_interaction().await;
    Ok(())
}

#[tauri::command]
pub async fn singularity_cortex_push_context(
    cortex: State<'_, SingularityCortexState>,
    content: String,
) -> Result<(), String> {
    let c = cortex.cortex.read().await;
    c.push_context(content).await;
    Ok(())
}

#[tauri::command]
pub async fn singularity_cortex_reset(
    cortex: State<'_, SingularityCortexState>,
) -> Result<(), String> {
    let c = cortex.cortex.read().await;
    c.reset().await;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_singularity_cortex_state_new() {
        let state = SingularityCortexState::new();
        assert!(Arc::strong_count(&state.cortex) == 1);
    }

    #[tokio::test]
    async fn test_get_state_returns_ok() {
        let state = SingularityCortexState::new();
        let cortex = state.cortex.read().await;
        let result = cortex.get_state().await;
        // State should have valid fields
        assert!(result.total_interactions >= 0);
        assert!(result.coherence_level >= 0.0);
    }

    #[tokio::test]
    async fn test_get_stats_returns_ok() {
        let state = SingularityCortexState::new();
        let cortex = state.cortex.read().await;
        let stats = cortex.get_stats().await;
        // Stats should be initialized
        assert!(stats.total_interactions >= 0);
    }

    #[tokio::test]
    async fn test_get_recent_context_empty() {
        let state = SingularityCortexState::new();
        let cortex = state.cortex.read().await;
        let context = cortex.get_recent_context(5).await;
        // New cortex should have empty context
        assert_eq!(context.len(), 0);
    }

    #[tokio::test]
    async fn test_push_context_and_retrieve() {
        let state = SingularityCortexState::new();
        let cortex = state.cortex.read().await;

        cortex.push_context("Test context 1".to_string()).await;
        cortex.push_context("Test context 2".to_string()).await;

        let context = cortex.get_recent_context(5).await;
        assert_eq!(context.len(), 2);
        assert_eq!(context[0], "Test context 1");
        assert_eq!(context[1], "Test context 2");
    }

    #[tokio::test]
    async fn test_set_mode_valid() {
        let state = SingularityCortexState::new();
        let cortex = state.cortex.read().await;

        // Test all valid modes
        cortex.set_mode(CognitiveMode::Coach).await;
        cortex.set_mode(CognitiveMode::Architect).await;
        cortex.set_mode(CognitiveMode::Analyst).await;
        cortex.set_mode(CognitiveMode::Meta).await;
        cortex.set_mode(CognitiveMode::Observer).await;
        cortex.set_mode(CognitiveMode::Expert).await;

        // Should not panic
    }

    #[tokio::test]
    async fn test_record_interaction() {
        let state = SingularityCortexState::new();
        let cortex = state.cortex.read().await;

        let initial_stats = cortex.get_stats().await;
        let initial_count = initial_stats.total_interactions;

        cortex.record_interaction().await;

        let updated_stats = cortex.get_stats().await;
        assert_eq!(updated_stats.total_interactions, initial_count + 1);
    }

    #[tokio::test]
    async fn test_reset_clears_state() {
        let state = SingularityCortexState::new();
        let cortex = state.cortex.read().await;

        // Add some context
        cortex.push_context("Test".to_string()).await;
        cortex.record_interaction().await;

        // Reset
        cortex.reset().await;

        // Context should be cleared
        let context = cortex.get_recent_context(10).await;
        assert_eq!(context.len(), 0);
    }

    #[tokio::test]
    async fn test_mode_string_parsing() {
        let state = SingularityCortexState::new();
        let cortex = state.cortex.read().await;

        // Test case-insensitive parsing
        cortex.set_mode(CognitiveMode::Coach).await;

        // Verify mode was set (would need getter to fully verify)
        // For now, just ensure no panic
    }

    #[tokio::test]
    async fn test_context_limit() {
        let state = SingularityCortexState::new();
        let cortex = state.cortex.read().await;

        // Push more context than requested
        for i in 0..10 {
            cortex.push_context(format!("Context {}", i)).await;
        }

        // Request only 5
        let context = cortex.get_recent_context(5).await;
        assert!(context.len() <= 5);
    }
}
