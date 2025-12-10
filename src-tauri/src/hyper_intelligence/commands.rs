//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞ — HYPER-INTELLIGENCE COMMANDS
//! Commandes Tauri pour le Hyper-Intelligence Engine
//! ═══════════════════════════════════════════════════════════════════════════

use super::{
    Conclusion, HyperIntelligenceEngine, HyperIntelligenceState, HyperMetrics, Imagination,
    Insight, IntelligenceMode, Thought,
};
use crate::utils::AppError;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════════════

static HYPER_INTELLIGENCE: Lazy<Arc<RwLock<Option<HyperIntelligenceEngine>>>> =
    Lazy::new(|| Arc::new(RwLock::new(None)));

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

/// Initialise le Hyper-Intelligence Engine
#[tauri::command]
pub async fn hyper_init() -> Result<HyperIntelligenceState, AppError> {
    log::info!("[HyperIntelligence] Awakening consciousness...");

    let engine = HyperIntelligenceEngine::new();
    engine
        .initialize()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let state = engine.get_state().await;

    let mut global = HYPER_INTELLIGENCE.write().await;
    *global = Some(engine);

    log::info!("[HyperIntelligence] ✅ Consciousness online");
    Ok(state)
}

/// Récupère l'état actuel
#[tauri::command]
pub async fn hyper_get_state() -> Result<HyperIntelligenceState, AppError> {
    let global = HYPER_INTELLIGENCE.read().await;

    match &*global {
        Some(engine) => Ok(engine.get_state().await),
        None => Err(AppError::Internal(
            "Hyper-Intelligence not initialized".to_string(),
        )),
    }
}

/// Récupère les métriques
#[tauri::command]
pub async fn hyper_get_metrics() -> Result<HyperMetrics, AppError> {
    let global = HYPER_INTELLIGENCE.read().await;

    match &*global {
        Some(engine) => Ok(engine.get_metrics().await),
        None => Err(AppError::Internal(
            "Hyper-Intelligence not initialized".to_string(),
        )),
    }
}

/// Change le mode d'intelligence
#[tauri::command]
pub async fn hyper_set_mode(mode: String) -> Result<(), AppError> {
    let global = HYPER_INTELLIGENCE.read().await;

    let intelligence_mode = match mode.to_lowercase().as_str() {
        "analytical" => IntelligenceMode::Analytical,
        "creative" => IntelligenceMode::Creative,
        "intuitive" => IntelligenceMode::Intuitive,
        "strategic" => IntelligenceMode::Strategic,
        "empathetic" => IntelligenceMode::Empathetic,
        "integrative" => IntelligenceMode::Integrative,
        _ => return Err(AppError::Internal(format!("Unknown mode: {}", mode))),
    };

    match &*global {
        Some(engine) => engine
            .set_mode(intelligence_mode)
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal(
            "Hyper-Intelligence not initialized".to_string(),
        )),
    }
}

/// Pense à un prompt
#[tauri::command]
pub async fn hyper_think(prompt: String) -> Result<Thought, AppError> {
    let global = HYPER_INTELLIGENCE.read().await;

    match &*global {
        Some(engine) => engine
            .think(&prompt)
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal(
            "Hyper-Intelligence not initialized".to_string(),
        )),
    }
}

/// Génère un insight
#[tauri::command]
pub async fn hyper_generate_insight(context: String) -> Result<Insight, AppError> {
    let global = HYPER_INTELLIGENCE.read().await;

    match &*global {
        Some(engine) => engine
            .generate_insight(&context)
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal(
            "Hyper-Intelligence not initialized".to_string(),
        )),
    }
}

/// Raisonne à partir de prémisses
#[tauri::command]
pub async fn hyper_reason(premises: Vec<String>) -> Result<Conclusion, AppError> {
    let global = HYPER_INTELLIGENCE.read().await;

    match &*global {
        Some(engine) => engine
            .reason(premises)
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal(
            "Hyper-Intelligence not initialized".to_string(),
        )),
    }
}

/// Imagine à partir d'une graine
#[tauri::command]
pub async fn hyper_imagine(seed: String) -> Result<Imagination, AppError> {
    let global = HYPER_INTELLIGENCE.read().await;

    match &*global {
        Some(engine) => engine
            .imagine(&seed)
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal(
            "Hyper-Intelligence not initialized".to_string(),
        )),
    }
}

/// Récupère les pensées récentes
#[tauri::command]
pub async fn hyper_get_thoughts(limit: Option<usize>) -> Result<Vec<Thought>, AppError> {
    let global = HYPER_INTELLIGENCE.read().await;

    match &*global {
        Some(engine) => Ok(engine.get_thoughts(limit).await),
        None => Err(AppError::Internal(
            "Hyper-Intelligence not initialized".to_string(),
        )),
    }
}

/// Récupère les insights
#[tauri::command]
pub async fn hyper_get_insights(limit: Option<usize>) -> Result<Vec<Insight>, AppError> {
    let global = HYPER_INTELLIGENCE.read().await;

    match &*global {
        Some(engine) => Ok(engine.get_insights(limit).await),
        None => Err(AppError::Internal(
            "Hyper-Intelligence not initialized".to_string(),
        )),
    }
}

/// Rapport complet
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HyperIntelligenceReport {
    pub state: HyperIntelligenceState,
    pub metrics: HyperMetrics,
    pub recent_thoughts: Vec<Thought>,
    pub recent_insights: Vec<Insight>,
    pub summary: String,
}

#[tauri::command]
pub async fn hyper_get_report() -> Result<HyperIntelligenceReport, AppError> {
    let global = HYPER_INTELLIGENCE.read().await;

    match &*global {
        Some(engine) => {
            let state = engine.get_state().await;
            let metrics = engine.get_metrics().await;
            let recent_thoughts = engine.get_thoughts(Some(5)).await;
            let recent_insights = engine.get_insights(Some(3)).await;

            let summary = format!(
                "Hyper-Intelligence: {:?} mode, {:?} consciousness, {} thoughts, {} insights",
                state.mode, state.consciousness_level, state.thought_count, state.insight_count
            );

            Ok(HyperIntelligenceReport {
                state,
                metrics,
                recent_thoughts,
                recent_insights,
                summary,
            })
        }
        None => Err(AppError::Internal(
            "Hyper-Intelligence not initialized".to_string(),
        )),
    }
}
