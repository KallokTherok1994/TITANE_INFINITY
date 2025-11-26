// TITANE∞ v16 - Cognitive Commands
// Tauri commands for cognitive layer interaction

use crate::cognitive::{AnalysisEngine, ConsistencyEngine, IntegrationEngine, EvolutionCognitiveEngine};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::State;

/// Global cognitive state v16
pub struct CognitiveSystemState {
    pub analysis: Arc<Mutex<AnalysisEngine>>,
    pub consistency: Arc<Mutex<ConsistencyEngine>>,
    pub integration: Arc<Mutex<IntegrationEngine>>,
    pub evolution: Arc<Mutex<EvolutionCognitiveEngine>>,
}

impl CognitiveSystemState {
    pub fn new() -> Self {
        Self {
            analysis: Arc::new(Mutex::new(AnalysisEngine::new())),
            consistency: Arc::new(Mutex::new(ConsistencyEngine::new())),
            integration: Arc::new(Mutex::new(IntegrationEngine::new())),
            evolution: Arc::new(Mutex::new(EvolutionCognitiveEngine::new())),
        }
    }
}

/// Cognitive status v16
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveStatus {
    pub analysis_scans: u64,
    pub consistency_checks: u64,
    pub integration_cycles: u64,
    pub learning_cycles: u64,
    pub optimization_score: f32,
}

/// Run cognitive analysis scan
#[tauri::command]
pub async fn cognitive_analyze(
    state: State<'_, CognitiveSystemState>,
    data: String,
) -> Result<String, String> {
    log::info!("[Cognitive v16] cognitive_analyze");

    let mut engine = state.analysis.lock().await;
    let result = engine.scan(&data);

    serde_json::to_string(&result).map_err(|e| e.to_string())
}

/// Check system coherence
#[tauri::command]
pub async fn cognitive_check_coherence(
    state: State<'_, CognitiveSystemState>,
    state_data: String,
) -> Result<String, String> {
    log::info!("[Cognitive v16] cognitive_check_coherence");

    let mut engine = state.consistency.lock().await;
    let result = engine.check_coherence(&state_data);

    serde_json::to_string(&result).map_err(|e| e.to_string())
}

/// Integrate multiple signals
#[tauri::command]
pub async fn cognitive_integrate(
    state: State<'_, CognitiveSystemState>,
    signals: Vec<String>,
) -> Result<String, String> {
    log::info!("[Cognitive v16] cognitive_integrate: {} signals", signals.len());

    let mut engine = state.integration.lock().await;
    let result = engine.integrate(signals);

    serde_json::to_string(&result).map_err(|e| e.to_string())
}

/// Execute learning cycle
#[tauri::command]
pub async fn cognitive_learn(
    state: State<'_, CognitiveSystemState>,
    experience: String,
) -> Result<(), String> {
    log::info!("[Cognitive v16] cognitive_learn");

    let mut engine = state.evolution.lock().await;
    engine.learn(&experience);

    Ok(())
}

/// Get cognitive system status
#[tauri::command]
pub async fn cognitive_get_status(
    state: State<'_, CognitiveSystemState>,
) -> Result<CognitiveStatus, String> {
    log::info!("[Cognitive v16] cognitive_get_status");

    let analysis = state.analysis.lock().await;
    let consistency = state.consistency.lock().await;
    let integration = state.integration.lock().await;
    let evolution = state.evolution.lock().await;

    Ok(CognitiveStatus {
        analysis_scans: analysis.scan_count(),
        consistency_checks: consistency.check_count(),
        integration_cycles: integration.integration_count(),
        learning_cycles: evolution.metrics().learning_cycles,
        optimization_score: evolution.metrics().optimization_score,
    })
}

/// Run optimization cycle
#[tauri::command]
pub async fn cognitive_optimize(
    state: State<'_, CognitiveSystemState>,
) -> Result<(), String> {
    log::info!("[Cognitive v16] cognitive_optimize");

    let mut engine = state.evolution.lock().await;
    engine.optimize();

    Ok(())
}
