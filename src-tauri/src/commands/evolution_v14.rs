// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — EVOLUTION COMMANDS
//   Tauri commands for Auto-Evolution system
// ═══════════════════════════════════════════════════════════════

use crate::compat::CoreCollection;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::State;

/// Simplified Evolution Report for v14
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionReport {
    pub id: String,
    pub timestamp: i64,
    pub issues_found: usize,
    pub recommendations: Vec<String>,
    pub health_score: f32,
}

/// Simplified Evolution State for v14
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvolutionStateData {
    pub reports_generated: u32,
    pub repairs_applied: u32,
    pub success_rate: f64,
    pub last_diagnosis: Option<i64>,
}

/// Simplified Health Status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthStatus {
    pub overall: String,
    pub score: f32,
    pub issues: Vec<String>,
}

/// Global state for Auto-Evolution
pub struct EvolutionState14 {
    pub core_collection: Arc<CoreCollection>,
    pub state: Arc<Mutex<EvolutionStateData>>,
}

impl EvolutionState14 {
    pub fn new(core_collection: Arc<CoreCollection>) -> Self {
        Self {
            core_collection,
            state: Arc::new(Mutex::new(EvolutionStateData {
                reports_generated: 0,
                repairs_applied: 0,
                success_rate: 100.0,
                last_diagnosis: None,
            })),
        }
    }
}

/// Run auto-evolution cycle (simplified v14)
#[tauri::command]
pub async fn run_auto_evolution(
    state: State<'_, EvolutionState14>,
) -> Result<EvolutionReport, String> {
    log::info!("[Evolution v14] Starting auto-evolution cycle");

    // Get current state from SingularityEngine
    let (health_score, issues) = {
        let engine_guard = state
            .core_collection
            .engine()
            .lock()
            .map_err(|e| format!("Failed to lock SingularityEngine: {}", e))?;

        let singularity_state = engine_guard.snapshot();
        let health = singularity_state.health();

        let score = match health {
            crate::core::types::EngineHealth::Healthy => 1.0,
            crate::core::types::EngineHealth::Degraded => 0.7,
            crate::core::types::EngineHealth::Critical => 0.4,
            crate::core::types::EngineHealth::Offline => 0.0,
        };

        let mut issues = Vec::new();
        if singularity_state.sentinel.alert_count > 10 {
            issues.push(format!(
                "High alert count: {}",
                singularity_state.sentinel.alert_count
            ));
        }
        if singularity_state.memory.capacity_usage > 0.8 {
            issues.push("Memory capacity high".to_string());
        }

        (score, issues)
    };

    // Update state
    {
        let mut evolution_state = state.state.lock().unwrap();
        evolution_state.reports_generated += 1;
        evolution_state.last_diagnosis = Some(chrono::Utc::now().timestamp());
    }

    let report = EvolutionReport {
        id: uuid::Uuid::new_v4().to_string(),
        timestamp: chrono::Utc::now().timestamp(),
        issues_found: issues.len(),
        recommendations: issues.iter().map(|i| format!("Fix: {}", i)).collect(),
        health_score,
    };

    log::info!(
        "[Evolution v14] Cycle complete - {} issues, health score: {:.2}",
        report.issues_found,
        report.health_score
    );

    Ok(report)
}

/// Get current evolution state
#[tauri::command]
pub async fn get_evolution_state(
    state: State<'_, EvolutionState14>,
) -> Result<EvolutionStateData, String> {
    log::info!("[Evolution v14] Getting evolution state");

    let evolution_state = state.state.lock().unwrap();
    Ok(evolution_state.clone())
}

/// Run quick health check
#[tauri::command]
pub async fn evolution_health_check(
    state: State<'_, EvolutionState14>,
) -> Result<HealthStatus, String> {
    log::info!("[Evolution v14] Running quick health check");

    let (overall, score, issues) = {
        let engine_guard = state
            .core_collection
            .engine()
            .lock()
            .map_err(|e| format!("Failed to lock SingularityEngine: {}", e))?;

        let singularity_state = engine_guard.snapshot();
        let health = singularity_state.health();

        let (status, score) = match health {
            crate::core::types::EngineHealth::Healthy => ("Healthy".to_string(), 1.0),
            crate::core::types::EngineHealth::Degraded => ("Degraded".to_string(), 0.7),
            crate::core::types::EngineHealth::Critical => ("Critical".to_string(), 0.4),
            crate::core::types::EngineHealth::Offline => ("Offline".to_string(), 0.0),
        };

        let mut issues = Vec::new();
        if singularity_state.sentinel.alert_count > 10 {
            issues.push(format!(
                "Sentinel: {} alerts",
                singularity_state.sentinel.alert_count
            ));
        }
        if singularity_state.memory.capacity_usage > 0.8 {
            issues.push(format!(
                "Memory: {:.1}% capacity",
                singularity_state.memory.capacity_usage * 100.0
            ));
        }

        (status, score, issues)
    };

    log::info!("[Evolution v14] Health: {} ({:.2})", overall, score);

    Ok(HealthStatus {
        overall,
        score,
        issues,
    })
}
