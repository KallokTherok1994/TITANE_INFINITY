//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞ — META ORCHESTRATOR ENGINE
//! SUPER PROMPT OPUS #18
//!
//! Superviseur global de tous les sous-systèmes TITANE
//! Conscience système, allocation ressources, priorités dynamiques
//!
//! © 2025 Kevin Thibault — Licence MIT
//! ═══════════════════════════════════════════════════════════════════════════

pub mod awareness;
pub mod commands;
pub mod priority_scheduler;
pub mod resource_governor;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

/// État global du Meta Orchestrator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaOrchestratorState {
    pub initialized: bool,
    pub awareness_level: AwarenessLevel,
    pub system_health: SystemHealth,
    pub active_engines: Vec<EngineStatus>,
    pub resource_allocation: ResourceAllocation,
    pub priority_queue: Vec<PriorityTask>,
    pub orchestration_mode: OrchestrationMode,
    pub last_cycle_ms: u64,
    pub total_cycles: u64,
    pub uptime_seconds: u64,
}

impl Default for MetaOrchestratorState {
    fn default() -> Self {
        Self {
            initialized: false,
            awareness_level: AwarenessLevel::Dormant,
            system_health: SystemHealth::default(),
            active_engines: Vec::new(),
            resource_allocation: ResourceAllocation::default(),
            priority_queue: Vec::new(),
            orchestration_mode: OrchestrationMode::Balanced,
            last_cycle_ms: 0,
            total_cycles: 0,
            uptime_seconds: 0,
        }
    }
}

/// Niveau de conscience système
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AwarenessLevel {
    Dormant,      // Système en veille
    Minimal,      // Conscience minimale
    Standard,     // Fonctionnement normal
    Elevated,     // Attention accrue
    HyperAware,   // Surveillance maximale
    Transcendent, // Mode méta-cognitif
}

impl Default for AwarenessLevel {
    fn default() -> Self {
        Self::Standard
    }
}

/// Mode d'orchestration
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OrchestrationMode {
    Minimal,     // Ressources minimales
    Balanced,    // Équilibre performance/ressources
    Performance, // Priorité performance
    PowerSave,   // Économie d'énergie
    Emergency,   // Mode urgence
    Maintenance, // Mode maintenance
}

impl Default for OrchestrationMode {
    fn default() -> Self {
        Self::Balanced
    }
}

/// Santé globale du système
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemHealth {
    pub overall_score: f64,
    pub cpu_usage: f64,
    pub memory_usage: f64,
    pub gpu_usage: f64,
    pub disk_io: f64,
    pub network_latency_ms: u64,
    pub error_rate: f64,
    pub warnings: Vec<String>,
    pub critical_issues: Vec<String>,
}

impl Default for SystemHealth {
    fn default() -> Self {
        Self {
            overall_score: 1.0,
            cpu_usage: 0.0,
            memory_usage: 0.0,
            gpu_usage: 0.0,
            disk_io: 0.0,
            network_latency_ms: 0,
            error_rate: 0.0,
            warnings: Vec::new(),
            critical_issues: Vec::new(),
        }
    }
}

/// Status d'un engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineStatus {
    pub name: String,
    pub engine_type: EngineType,
    pub status: EngineState,
    pub priority: u8,
    pub cpu_percent: f64,
    pub memory_mb: f64,
    pub last_activity_ms: u64,
    pub error_count: u32,
    pub tasks_completed: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EngineType {
    Core,
    Cognitive,
    Memory,
    Voice,
    Identity,
    Cloud,
    UI,
    Security,
    Analytics,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EngineState {
    Stopped,
    Starting,
    Running,
    Paused,
    Degraded,
    Error,
    Stopping,
}

/// Allocation de ressources
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceAllocation {
    pub cpu_quota_percent: f64,
    pub memory_limit_mb: u64,
    pub gpu_enabled: bool,
    pub gpu_quota_percent: f64,
    pub io_priority: IoPriority,
    pub network_bandwidth_kbps: u64,
    pub thread_pool_size: usize,
}

impl Default for ResourceAllocation {
    fn default() -> Self {
        Self {
            cpu_quota_percent: 80.0,
            memory_limit_mb: 4096,
            gpu_enabled: true,
            gpu_quota_percent: 50.0,
            io_priority: IoPriority::Normal,
            network_bandwidth_kbps: 0, // Unlimited
            thread_pool_size: 8,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum IoPriority {
    Low,
    Normal,
    High,
    Realtime,
}

/// Tâche prioritaire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PriorityTask {
    pub id: String,
    pub name: String,
    pub priority: TaskPriority,
    pub engine: String,
    pub status: TaskStatus,
    pub created_at: u64,
    pub started_at: Option<u64>,
    pub deadline_ms: Option<u64>,
    pub progress_percent: f64,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum TaskPriority {
    Background = 0,
    Low = 1,
    Normal = 2,
    High = 3,
    Critical = 4,
    Emergency = 5,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TaskStatus {
    Queued,
    Running,
    Paused,
    Completed,
    Failed,
    Cancelled,
}

// ═══════════════════════════════════════════════════════════════════════════
// META ORCHESTRATOR ENGINE
// ═══════════════════════════════════════════════════════════════════════════

pub struct MetaOrchestrator {
    state: Arc<RwLock<MetaOrchestratorState>>,
    awareness: awareness::SystemAwareness,
    resource_governor: resource_governor::ResourceGovernor,
    scheduler: priority_scheduler::PriorityScheduler,
    start_time: std::time::Instant,
}

impl MetaOrchestrator {
    pub fn new() -> Self {
        log::info!("[MetaOrchestrator] Initializing Meta Orchestrator v∞...");

        Self {
            state: Arc::new(RwLock::new(MetaOrchestratorState::default())),
            awareness: awareness::SystemAwareness::new(),
            resource_governor: resource_governor::ResourceGovernor::new(),
            scheduler: priority_scheduler::PriorityScheduler::new(),
            start_time: std::time::Instant::now(),
        }
    }

    /// Initialise le Meta Orchestrator
    pub async fn initialize(&self) -> Result<(), MetaOrchestratorError> {
        log::info!("[MetaOrchestrator] Starting initialization sequence...");

        // Initialiser les sous-systèmes
        self.awareness.initialize().await?;
        self.resource_governor.initialize().await?;
        self.scheduler.initialize().await?;

        // Mettre à jour l'état
        let mut state = self.state.write().await;
        state.initialized = true;
        state.awareness_level = AwarenessLevel::Standard;
        state.orchestration_mode = OrchestrationMode::Balanced;

        // Enregistrer les engines connus
        state.active_engines = self.discover_engines().await;

        log::info!(
            "[MetaOrchestrator] ✅ Initialization complete - {} engines registered",
            state.active_engines.len()
        );

        Ok(())
    }

    /// Découvre les engines actifs
    async fn discover_engines(&self) -> Vec<EngineStatus> {
        vec![
            EngineStatus {
                name: "SingularityEngine".to_string(),
                engine_type: EngineType::Core,
                status: EngineState::Running,
                priority: 10,
                cpu_percent: 0.0,
                memory_mb: 0.0,
                last_activity_ms: 0,
                error_count: 0,
                tasks_completed: 0,
            },
            EngineStatus {
                name: "CognitiveLayer".to_string(),
                engine_type: EngineType::Cognitive,
                status: EngineState::Running,
                priority: 9,
                cpu_percent: 0.0,
                memory_mb: 0.0,
                last_activity_ms: 0,
                error_count: 0,
                tasks_completed: 0,
            },
            EngineStatus {
                name: "MemoryEvolution".to_string(),
                engine_type: EngineType::Memory,
                status: EngineState::Running,
                priority: 8,
                cpu_percent: 0.0,
                memory_mb: 0.0,
                last_activity_ms: 0,
                error_count: 0,
                tasks_completed: 0,
            },
            EngineStatus {
                name: "VoiceEngine".to_string(),
                engine_type: EngineType::Voice,
                status: EngineState::Running,
                priority: 7,
                cpu_percent: 0.0,
                memory_mb: 0.0,
                last_activity_ms: 0,
                error_count: 0,
                tasks_completed: 0,
            },
            EngineStatus {
                name: "IdentityEngine".to_string(),
                engine_type: EngineType::Identity,
                status: EngineState::Running,
                priority: 6,
                cpu_percent: 0.0,
                memory_mb: 0.0,
                last_activity_ms: 0,
                error_count: 0,
                tasks_completed: 0,
            },
            EngineStatus {
                name: "CloudSync".to_string(),
                engine_type: EngineType::Cloud,
                status: EngineState::Running,
                priority: 5,
                cpu_percent: 0.0,
                memory_mb: 0.0,
                last_activity_ms: 0,
                error_count: 0,
                tasks_completed: 0,
            },
            EngineStatus {
                name: "SecurityEngine".to_string(),
                engine_type: EngineType::Security,
                status: EngineState::Running,
                priority: 10,
                cpu_percent: 0.0,
                memory_mb: 0.0,
                last_activity_ms: 0,
                error_count: 0,
                tasks_completed: 0,
            },
        ]
    }

    /// Exécute un cycle d'orchestration
    pub async fn run_cycle(&self) -> Result<OrchestrationCycleResult, MetaOrchestratorError> {
        let cycle_start = std::time::Instant::now();

        // 1. Mettre à jour la conscience système
        let awareness_report = self.awareness.analyze().await?;

        // 2. Ajuster les ressources
        let resource_report = self.resource_governor.optimize().await?;

        // 3. Traiter la queue de priorités
        let scheduler_report = self.scheduler.process_queue().await?;

        // 4. Mettre à jour l'état
        let mut state = self.state.write().await;
        state.last_cycle_ms = cycle_start.elapsed().as_millis() as u64;
        state.total_cycles += 1;
        state.uptime_seconds = self.start_time.elapsed().as_secs();
        state.awareness_level = awareness_report.recommended_level;
        state.system_health = awareness_report.health.clone();

        Ok(OrchestrationCycleResult {
            cycle_number: state.total_cycles,
            duration_ms: state.last_cycle_ms,
            awareness_level: state.awareness_level,
            tasks_processed: scheduler_report.tasks_processed,
            resources_adjusted: resource_report.adjustments_made,
            health_score: state.system_health.overall_score,
        })
    }

    /// Récupère l'état actuel
    pub async fn get_state(&self) -> MetaOrchestratorState {
        self.state.read().await.clone()
    }

    /// Change le mode d'orchestration
    pub async fn set_mode(&self, mode: OrchestrationMode) -> Result<(), MetaOrchestratorError> {
        let mut state = self.state.write().await;
        let old_mode = state.orchestration_mode;
        state.orchestration_mode = mode;

        // Ajuster les ressources selon le mode
        self.resource_governor.apply_mode(mode).await?;

        log::info!(
            "[MetaOrchestrator] Mode changed: {:?} → {:?}",
            old_mode,
            mode
        );
        Ok(())
    }

    /// Ajoute une tâche à la queue
    pub async fn enqueue_task(&self, task: PriorityTask) -> Result<String, MetaOrchestratorError> {
        let task_id = task.id.clone();
        self.scheduler.enqueue(task).await?;

        let mut state = self.state.write().await;
        state.priority_queue = self.scheduler.get_queue().await;

        Ok(task_id)
    }

    /// Récupère les métriques globales
    pub async fn get_metrics(&self) -> MetaMetrics {
        let state = self.state.read().await;

        MetaMetrics {
            uptime_seconds: state.uptime_seconds,
            total_cycles: state.total_cycles,
            avg_cycle_ms: if state.total_cycles > 0 {
                state.last_cycle_ms
            } else {
                0
            },
            active_engines: state.active_engines.len(),
            pending_tasks: state.priority_queue.len(),
            health_score: state.system_health.overall_score,
            awareness_level: state.awareness_level,
            orchestration_mode: state.orchestration_mode,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES RÉSULTATS
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrchestrationCycleResult {
    pub cycle_number: u64,
    pub duration_ms: u64,
    pub awareness_level: AwarenessLevel,
    pub tasks_processed: usize,
    pub resources_adjusted: usize,
    pub health_score: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaMetrics {
    pub uptime_seconds: u64,
    pub total_cycles: u64,
    pub avg_cycle_ms: u64,
    pub active_engines: usize,
    pub pending_tasks: usize,
    pub health_score: f64,
    pub awareness_level: AwarenessLevel,
    pub orchestration_mode: OrchestrationMode,
}

// ═══════════════════════════════════════════════════════════════════════════
// ERREURS
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, thiserror::Error)]
pub enum MetaOrchestratorError {
    #[error("Initialization failed: {0}")]
    InitializationFailed(String),

    #[error("Awareness error: {0}")]
    AwarenessError(String),

    #[error("Resource allocation error: {0}")]
    ResourceError(String),

    #[error("Scheduler error: {0}")]
    SchedulerError(String),

    #[error("Invalid mode: {0}")]
    InvalidMode(String),

    #[error("Task not found: {0}")]
    TaskNotFound(String),

    #[error("Engine not found: {0}")]
    EngineNotFound(String),
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_meta_orchestrator_creation() {
        let orchestrator = MetaOrchestrator::new();
        let state = orchestrator.get_state().await;
        assert!(!state.initialized);
    }

    #[tokio::test]
    async fn test_meta_orchestrator_initialization() {
        let orchestrator = MetaOrchestrator::new();
        let result = orchestrator.initialize().await;
        assert!(result.is_ok());

        let state = orchestrator.get_state().await;
        assert!(state.initialized);
        assert!(!state.active_engines.is_empty());
    }
}
