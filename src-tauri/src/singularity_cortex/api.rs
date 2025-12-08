// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Singularity API v∞
//   Commandes Tauri pour Singularity Cortex OS
// ═══════════════════════════════════════════════════════════════

use crate::singularity_cortex::{SingularityCortex, state::CognitiveMode};
use tauri::State;
use std::sync::Arc;
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
