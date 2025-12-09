//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — TEMPORAL INTELLIGENCE ENGINE v2
//! Super Prompt #18 — Orchestration temporelle cognitive
//! ═══════════════════════════════════════════════════════════════════════════════
//!
//! Ce module gère l'intelligence temporelle de TITANE∞:
//! - Modèle du temps (passé, présent, futur)
//! - Mémoire temporelle et continuité
//! - Routines et habitudes
//! - Planification intelligente
//! - Anticipation et prédiction
//! - Alignement long terme

pub mod time_model;
pub mod temporal_memory;
pub mod routines;
pub mod planner;
pub mod anticipator;
pub mod long_term_alignment;
pub mod temporal_metrics;
pub mod temporal_events;
pub mod diagnostics;
pub mod config;
pub mod integrations;

pub use time_model::{TimeModel, TemporalContext, TimeScale, Moment};
pub use temporal_memory::{TemporalMemory, TemporalTrace, MemoryDecay};
pub use routines::{RoutineEngine, Routine, RoutinePattern, RoutineTrigger};
pub use planner::{TemporalPlanner, Plan, Task, TaskPriority, PlanningHorizon};
pub use anticipator::{Anticipator, Prediction, PredictionConfidence};
pub use long_term_alignment::{LongTermAligner, Goal, Milestone, AlignmentScore};
pub use temporal_metrics::{TemporalMetrics, TemporalHealth};
pub use temporal_events::{TemporalEvent, TemporalEventType};
pub use diagnostics::TemporalDiagnostics;
pub use config::TemporalConfig;

// Exposer les intégrations système
pub use integrations::{
    IntegrationConfig,
    TemporalKernelBridge, SchedulerAdjustments, ResourceLimits, MaintenanceAdvice,
    TemporalOmegaBridge, OmegaTemporalAdjustments, RoutingStrategy,
    TemporalMemoryBridge, MemoryTemporalAdjustments, PreloadingStrategy, ConsolidationRecommendation,
    TemporalAgiBridge, AgiTemporalAdjustments, HeuristicTuningStrategy, AlignmentRecommendation,
    TemporalConversationBridge, ConversationTemporalAdjustments, ConversationTone, TemporalNarrative,
};

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Version du Temporal Engine
pub const TEMPORAL_ENGINE_VERSION: &str = "v2.0.0-Ω";

/// État temporel global
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct TemporalState {
    pub current_moment: Moment,
    pub active_routines: Vec<String>,
    pub pending_tasks: usize,
    pub predictions_made: u64,
    pub alignment_score: f32,
    pub cognitive_rhythm_phase: String,
    pub last_planning_at: u64,
}

/// Moteur d'intelligence temporelle
pub struct TemporalIntelligenceEngine {
    config: TemporalConfig,
    state: Arc<RwLock<TemporalState>>,
    time_model: TimeModel,
    temporal_memory: TemporalMemory,
    routine_engine: RoutineEngine,
    planner: TemporalPlanner,
    anticipator: Anticipator,
    long_term_aligner: LongTermAligner,
    metrics: TemporalMetrics,
    diagnostics: TemporalDiagnostics,
}

impl TemporalIntelligenceEngine {
    /// Crée un nouveau moteur temporel
    pub fn new(config: TemporalConfig) -> Self {
        Self {
            config: config.clone(),
            state: Arc::new(RwLock::new(TemporalState::default())),
            time_model: TimeModel::new(),
            temporal_memory: TemporalMemory::new(config.memory_config.clone()),
            routine_engine: RoutineEngine::new(),
            planner: TemporalPlanner::new(config.planner_config.clone()),
            anticipator: Anticipator::new(),
            long_term_aligner: LongTermAligner::new(),
            metrics: TemporalMetrics::new(),
            diagnostics: TemporalDiagnostics::new(),
        }
    }

    /// Initialise le moteur
    pub async fn initialize(&mut self) -> Result<(), TemporalError> {
        // Charger les routines
        self.routine_engine.load_default_routines().await;

        // Synchroniser le temps
        self.time_model.sync_now().await;

        // Initialiser le contexte temporel
        let context = self.time_model.current_context().await;

        let mut state = self.state.write().await;
        state.current_moment = context.now.clone();
        state.cognitive_rhythm_phase = self.detect_rhythm_phase(&context);

        self.diagnostics.emit(TemporalEvent::new(
            TemporalEventType::EngineInitialized,
            "Temporal Intelligence Engine initialized".to_string(),
        )).await;

        Ok(())
    }

    /// Tick principal du moteur (appelé régulièrement)
    pub async fn tick(&mut self) -> Result<TickResult, TemporalError> {
        let start = std::time::Instant::now();

        // 1. Mettre à jour le modèle temporel
        self.time_model.sync_now().await;
        let context = self.time_model.current_context().await;

        // 2. Vérifier les routines à déclencher
        let triggered_routines = self.routine_engine.check_triggers(&context).await;

        // 3. Mettre à jour les tâches planifiées
        let tasks_status = self.planner.update(&context).await;

        // 4. Générer des anticipations
        let predictions = self.anticipator.predict(&context, &self.temporal_memory).await;

        // 5. Vérifier l'alignement long terme
        let alignment = self.long_term_aligner.check_alignment(&context).await;

        // 6. Mettre à jour l'état
        let mut state = self.state.write().await;
        state.current_moment = context.now.clone();
        state.active_routines = triggered_routines.iter().map(|r| r.id.clone()).collect();
        state.pending_tasks = tasks_status.pending;
        state.predictions_made += predictions.len() as u64;
        state.alignment_score = alignment.score;
        state.cognitive_rhythm_phase = self.detect_rhythm_phase(&context);

        // 7. Métriques
        self.metrics.record_tick(start.elapsed().as_millis() as u64).await;

        Ok(TickResult {
            triggered_routines,
            tasks_due: tasks_status.due,
            predictions,
            alignment_score: alignment.score,
            tick_duration_ms: start.elapsed().as_millis() as u64,
        })
    }

    /// Enregistre une trace temporelle
    pub async fn record_trace(&mut self, trace: TemporalTrace) -> Result<(), TemporalError> {
        self.temporal_memory.record(trace.clone()).await;

        self.diagnostics.emit(TemporalEvent::new(
            TemporalEventType::TraceRecorded,
            format!("Recorded trace: {}", trace.event_type),
        )).await;

        Ok(())
    }

    /// Ajoute une routine
    pub async fn add_routine(&mut self, routine: Routine) -> Result<String, TemporalError> {
        let id = routine.id.clone();
        self.routine_engine.add_routine(routine).await;
        Ok(id)
    }

    /// Crée une tâche planifiée
    pub async fn schedule_task(&mut self, task: Task) -> Result<String, TemporalError> {
        let id = task.id.clone();
        self.planner.add_task(task).await;
        Ok(id)
    }

    /// Définit un objectif long terme
    pub async fn set_goal(&mut self, goal: Goal) -> Result<String, TemporalError> {
        let id = goal.id.clone();
        self.long_term_aligner.add_goal(goal).await;
        Ok(id)
    }

    /// Obtient des prédictions pour un horizon donné
    pub async fn predict(&self, horizon: PlanningHorizon) -> Vec<Prediction> {
        let context = self.time_model.current_context().await;
        self.anticipator.predict_horizon(&context, &self.temporal_memory, horizon).await
    }

    /// Récupère le contexte temporel actuel
    pub async fn current_context(&self) -> TemporalContext {
        self.time_model.current_context().await
    }

    /// Récupère l'état
    pub async fn get_state(&self) -> TemporalState {
        self.state.read().await.clone()
    }

    /// Récupère les métriques
    pub async fn get_metrics(&self) -> TemporalHealth {
        self.metrics.health().await
    }

    /// Récupère les routines actives
    pub async fn active_routines(&self) -> Vec<Routine> {
        self.routine_engine.active_routines().await
    }

    /// Récupère les tâches dues
    pub async fn due_tasks(&self) -> Vec<Task> {
        self.planner.due_tasks().await
    }

    /// Détecte la phase du rythme cognitif
    fn detect_rhythm_phase(&self, context: &TemporalContext) -> String {
        let hour = context.now.hour;

        match hour {
            5..=8 => "morning_ramp".to_string(),
            9..=11 => "peak_focus".to_string(),
            12..=13 => "midday_dip".to_string(),
            14..=17 => "afternoon_stable".to_string(),
            18..=21 => "evening_wind_down".to_string(),
            22..=23 | 0..=4 => "rest_recovery".to_string(),
            _ => "unknown".to_string(),
        }
    }
}

impl Default for TemporalIntelligenceEngine {
    fn default() -> Self {
        Self::new(TemporalConfig::default())
    }
}

/// Résultat d'un tick
#[derive(Clone, Debug)]
pub struct TickResult {
    pub triggered_routines: Vec<Routine>,
    pub tasks_due: Vec<Task>,
    pub predictions: Vec<Prediction>,
    pub alignment_score: f32,
    pub tick_duration_ms: u64,
}

/// Erreurs du moteur temporel
#[derive(Debug, Clone)]
pub enum TemporalError {
    InitializationFailed(String),
    RoutineError(String),
    PlanningError(String),
    PredictionError(String),
    AlignmentError(String),
    MemoryError(String),
}

impl std::fmt::Display for TemporalError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InitializationFailed(msg) => write!(f, "Initialization failed: {}", msg),
            Self::RoutineError(msg) => write!(f, "Routine error: {}", msg),
            Self::PlanningError(msg) => write!(f, "Planning error: {}", msg),
            Self::PredictionError(msg) => write!(f, "Prediction error: {}", msg),
            Self::AlignmentError(msg) => write!(f, "Alignment error: {}", msg),
            Self::MemoryError(msg) => write!(f, "Memory error: {}", msg),
        }
    }
}

impl std::error::Error for TemporalError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_temporal_engine_creation() {
        let engine = TemporalIntelligenceEngine::default();
        assert_eq!(engine.config.name, "default");
    }

    #[tokio::test]
    async fn test_temporal_state() {
        let engine = TemporalIntelligenceEngine::default();
        let state = engine.get_state().await;
        assert_eq!(state.predictions_made, 0);
    }
}
