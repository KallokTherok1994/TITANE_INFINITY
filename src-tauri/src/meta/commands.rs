// TITANE∞ v18 — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

//! META LAYER COMMANDS
//!
//! Tauri commands for Meta-Cognition and Deep Sync engines

use crate::meta::{
    CognitiveSnapshot, DeepSyncEngine, EngineState, MetaCognitionEngine,
    MetaCognitiveReport, DeepSyncState, SyncedState,
};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Global meta-cognition engine
static META_ENGINE: once_cell::sync::Lazy<Arc<Mutex<MetaCognitionEngine>>> =
    once_cell::sync::Lazy::new(|| Arc::new(Mutex::new(MetaCognitionEngine::new())));

/// Global deep sync engine
static DEEP_SYNC_ENGINE: once_cell::sync::Lazy<Arc<Mutex<DeepSyncEngine>>> =
    once_cell::sync::Lazy::new(|| Arc::new(Mutex::new(DeepSyncEngine::new())));

/// Get meta-cognition report
#[tauri::command]
pub async fn meta_get_report(
    cognitive_integrity: Option<f32>,
    timeline_coherence: Option<f32>,
    memory_alignment: Option<f32>,
    ai_stability: Option<f32>,
    singularity_coherence: Option<f32>,
) -> Result<MetaCognitiveReport, String> {
    let mut engine = META_ENGINE.lock().await;

    let snapshot = CognitiveSnapshot {
        cognitive_integrity,
        timeline_coherence,
        memory_alignment,
        ai_stability,
        singularity_coherence,
        emotion_state: None,
        ..Default::default()
    };

    let report = engine.evaluate(&snapshot).await;

    Ok(report)
}

/// Trigger deep sync
#[tauri::command]
pub async fn meta_trigger_sync(
    engine_states: HashMap<String, f32>,
) -> Result<SyncedState, String> {
    let mut sync_engine = DEEP_SYNC_ENGINE.lock().await;

    // Convert to EngineState map
    let states: HashMap<String, EngineState> = engine_states
        .into_iter()
        .map(|(name, value)| (name.clone(), EngineState::new(name, value)))
        .collect();

    let synced = sync_engine.deep_sync(&states).await;

    Ok(synced)
}

/// Get engine alignment status
#[tauri::command]
pub async fn meta_get_alignment() -> Result<HashMap<String, bool>, String> {
    let sync_engine = DEEP_SYNC_ENGINE.lock().await;
    let state = sync_engine.get_state();

    let mut alignment = HashMap::new();
    for engine in &state.engines_in_sync {
        alignment.insert(engine.clone(), true);
    }
    for engine in &state.engines_out_of_sync {
        alignment.insert(engine.clone(), false);
    }

    Ok(alignment)
}

/// Get meta state
#[tauri::command]
pub async fn meta_get_state() -> Result<(crate::meta::MetaCognitionState, DeepSyncState), String> {
    let meta_engine = META_ENGINE.lock().await;
    let sync_engine = DEEP_SYNC_ENGINE.lock().await;

    Ok((meta_engine.get_state().clone(), sync_engine.get_state().clone()))
}

/// Establish baseline for meta-cognition
#[tauri::command]
pub async fn meta_establish_baseline(coherence: f32) -> Result<(), String> {
    let mut engine = META_ENGINE.lock().await;
    engine.establish_baseline(coherence);
    Ok(())
}

/// META v18.1: Self-test complet des moteurs META
///
/// Exécute tous les self-tests:
/// - META-COGNITION ENGINE
/// - DEEP SYNC ENGINE
///
/// Retourne: (success, rapport détaillé)
#[tauri::command]
pub async fn meta_selftest_all() -> Result<SelfTestReport, String> {
    log::info!("🧪 Starting META self-test...");

    // [1] Test META-COGNITION ENGINE
    let (meta_success, meta_issues) = {
        let mut engine = META_ENGINE.lock().await;
        engine.meta_selftest().await
    };

    // [2] Test DEEP SYNC ENGINE
    let (sync_success, sync_issues) = {
        let mut engine = DEEP_SYNC_ENGINE.lock().await;
        engine.deep_sync_selftest().await
    };

    // [3] Compiler rapport
    let all_success = meta_success && sync_success;
    let mut all_issues = Vec::new();

    if !meta_success {
        all_issues.push(format!("META-COGNITION ENGINE: {} issues", meta_issues.len()));
        all_issues.extend(meta_issues.iter().map(|i| format!("  • {}", i)));
    }

    if !sync_success {
        all_issues.push(format!("DEEP SYNC ENGINE: {} issues", sync_issues.len()));
        all_issues.extend(sync_issues.iter().map(|i| format!("  • {}", i)));
    }

    let report = SelfTestReport {
        success: all_success,
        meta_cognition_passed: meta_success,
        deep_sync_passed: sync_success,
        meta_cognition_issues: meta_issues,
        deep_sync_issues: sync_issues,
        total_issues: all_issues.len(),
    };

    if all_success {
        log::info!("✅ META self-test: ALL PASSED");
    } else {
        log::error!("❌ META self-test: FAILED ({} total issues)", all_issues.len());
    }

    Ok(report)
}

/// Self-test report structure
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SelfTestReport {
    pub success: bool,
    pub meta_cognition_passed: bool,
    pub deep_sync_passed: bool,
    pub meta_cognition_issues: Vec<String>,
    pub deep_sync_issues: Vec<String>,
    pub total_issues: usize,
}

/// Verify sync quality
#[tauri::command]
pub async fn meta_verify_sync() -> Result<bool, String> {
    let sync_engine = DEEP_SYNC_ENGINE.lock().await;
    Ok(sync_engine.verify_sync())
}

/// Detect desync
#[tauri::command]
pub async fn meta_detect_desync() -> Result<bool, String> {
    let sync_engine = DEEP_SYNC_ENGINE.lock().await;
    Ok(sync_engine.detect_desync())
}
