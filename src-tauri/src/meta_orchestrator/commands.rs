//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞ — META ORCHESTRATOR COMMANDS
//! Commandes Tauri pour le Meta Orchestrator
//! ═══════════════════════════════════════════════════════════════════════════

use super::{
    MetaMetrics, MetaOrchestrator, MetaOrchestratorState, OrchestrationCycleResult,
    OrchestrationMode, PriorityTask, TaskPriority, TaskStatus,
};
use crate::utils::AppError;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════════════

static META_ORCHESTRATOR: Lazy<Arc<RwLock<Option<MetaOrchestrator>>>> =
    Lazy::new(|| Arc::new(RwLock::new(None)));

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

/// Initialise le Meta Orchestrator
#[tauri::command]
pub async fn orchestrator_init() -> Result<MetaOrchestratorState, AppError> {
    log::info!("[MetaOrchestrator] Initializing via command...");

    let orchestrator = MetaOrchestrator::new();
    orchestrator.initialize().await.map_err(|e| AppError::Internal(e.to_string()))?;

    let state = orchestrator.get_state().await;

    let mut global = META_ORCHESTRATOR.write().await;
    *global = Some(orchestrator);

    log::info!("[MetaOrchestrator] ✅ Initialized successfully");
    Ok(state)
}

/// Récupère l'état actuel du Meta Orchestrator
#[tauri::command]
pub async fn orchestrator_get_state() -> Result<MetaOrchestratorState, AppError> {
    let global = META_ORCHESTRATOR.read().await;

    match &*global {
        Some(orchestrator) => Ok(orchestrator.get_state().await),
        None => Err(AppError::Internal("Meta Orchestrator not initialized".to_string())),
    }
}

/// Exécute un cycle d'orchestration
#[tauri::command]
pub async fn orchestrator_run_cycle() -> Result<OrchestrationCycleResult, AppError> {
    let global = META_ORCHESTRATOR.read().await;

    match &*global {
        Some(orchestrator) => orchestrator
            .run_cycle()
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal("Meta Orchestrator not initialized".to_string())),
    }
}

/// Change le mode d'orchestration
#[tauri::command]
pub async fn orchestrator_set_mode(mode: String) -> Result<(), AppError> {
    let global = META_ORCHESTRATOR.read().await;

    let orchestration_mode = match mode.to_lowercase().as_str() {
        "minimal" => OrchestrationMode::Minimal,
        "balanced" => OrchestrationMode::Balanced,
        "performance" => OrchestrationMode::Performance,
        "powersave" | "power_save" => OrchestrationMode::PowerSave,
        "emergency" => OrchestrationMode::Emergency,
        "maintenance" => OrchestrationMode::Maintenance,
        _ => return Err(AppError::Internal(format!("Unknown mode: {}", mode))),
    };

    match &*global {
        Some(orchestrator) => orchestrator
            .set_mode(orchestration_mode)
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal("Meta Orchestrator not initialized".to_string())),
    }
}

/// Récupère les métriques globales
#[tauri::command]
pub async fn orchestrator_get_metrics() -> Result<MetaMetrics, AppError> {
    let global = META_ORCHESTRATOR.read().await;

    match &*global {
        Some(orchestrator) => Ok(orchestrator.get_metrics().await),
        None => Err(AppError::Internal("Meta Orchestrator not initialized".to_string())),
    }
}

/// Ajoute une tâche à la queue
#[tauri::command]
pub async fn orchestrator_enqueue_task(
    name: String,
    priority: String,
    engine: String,
    metadata: Option<HashMap<String, serde_json::Value>>,
) -> Result<String, AppError> {
    let global = META_ORCHESTRATOR.read().await;

    let task_priority = match priority.to_lowercase().as_str() {
        "background" => TaskPriority::Background,
        "low" => TaskPriority::Low,
        "normal" => TaskPriority::Normal,
        "high" => TaskPriority::High,
        "critical" => TaskPriority::Critical,
        "emergency" => TaskPriority::Emergency,
        _ => TaskPriority::Normal,
    };

    let task = PriorityTask {
        id: format!("task-{}", uuid::Uuid::new_v4()),
        name,
        priority: task_priority,
        engine,
        status: TaskStatus::Queued,
        created_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64,
        started_at: None,
        deadline_ms: None,
        progress_percent: 0.0,
        metadata: metadata.unwrap_or_default(),
    };

    match &*global {
        Some(orchestrator) => orchestrator
            .enqueue_task(task)
            .await
            .map_err(|e| AppError::Internal(e.to_string())),
        None => Err(AppError::Internal("Meta Orchestrator not initialized".to_string())),
    }
}

/// Récupère la queue de tâches
#[tauri::command]
pub async fn orchestrator_get_queue() -> Result<Vec<PriorityTask>, AppError> {
    let global = META_ORCHESTRATOR.read().await;

    match &*global {
        Some(orchestrator) => {
            let state = orchestrator.get_state().await;
            Ok(state.priority_queue)
        }
        None => Err(AppError::Internal("Meta Orchestrator not initialized".to_string())),
    }
}

/// Récupère le statut des engines
#[tauri::command]
pub async fn orchestrator_get_engines() -> Result<Vec<super::EngineStatus>, AppError> {
    let global = META_ORCHESTRATOR.read().await;

    match &*global {
        Some(orchestrator) => {
            let state = orchestrator.get_state().await;
            Ok(state.active_engines)
        }
        None => Err(AppError::Internal("Meta Orchestrator not initialized".to_string())),
    }
}

/// Récupère la santé système
#[tauri::command]
pub async fn orchestrator_get_health() -> Result<super::SystemHealth, AppError> {
    let global = META_ORCHESTRATOR.read().await;

    match &*global {
        Some(orchestrator) => {
            let state = orchestrator.get_state().await;
            Ok(state.system_health)
        }
        None => Err(AppError::Internal("Meta Orchestrator not initialized".to_string())),
    }
}

/// Rapport complet du Meta Orchestrator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaOrchestratorReport {
    pub state: MetaOrchestratorState,
    pub metrics: MetaMetrics,
    pub summary: String,
}

#[tauri::command]
pub async fn orchestrator_get_report() -> Result<MetaOrchestratorReport, AppError> {
    let global = META_ORCHESTRATOR.read().await;

    match &*global {
        Some(orchestrator) => {
            let state = orchestrator.get_state().await;
            let metrics = orchestrator.get_metrics().await;

            let summary = format!(
                "Meta Orchestrator: {} engines, {} pending tasks, health: {:.0}%",
                state.active_engines.len(),
                state.priority_queue.len(),
                state.system_health.overall_score * 100.0
            );

            Ok(MetaOrchestratorReport {
                state,
                metrics,
                summary,
            })
        }
        None => Err(AppError::Internal("Meta Orchestrator not initialized".to_string())),
    }
}
