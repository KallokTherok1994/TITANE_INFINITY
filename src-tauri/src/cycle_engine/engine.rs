// ═══════════════════════════════════════════════════════════════
//   CYCLE ENGINE — Main Orchestrator
//   SUPER PROMPT #16 — Temporal Intelligence & Cognitive Rhythms
// ═══════════════════════════════════════════════════════════════

use crate::cycle_engine::{
    alignment::AlignmentEngine,
    clock::ClockEngine,
    cognitive_rhythm::CognitiveRhythmParams,
    config::{CycleEngineConfig, CycleError, CycleResult},
    continuity::ContinuityEngine,
    cycles::CycleState,
    diagnostics::CycleEngineDiagnostics,
    load_regulator::{LoadRegulationParams, LoadRegulator},
    predictive::{PredictiveEvent, PredictiveTemporalModel},
    seasons::SeasonalParameters,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::time::{interval, Duration};

/// Main Cycle Engine — Temporal Intelligence Core
pub struct CycleEngine {
    config: Arc<RwLock<CycleEngineConfig>>,
    clock: Arc<ClockEngine>,
    load_regulator: Arc<RwLock<LoadRegulator>>,
    continuity: Arc<RwLock<ContinuityEngine>>,
    predictive: Arc<RwLock<PredictiveTemporalModel>>,
    alignment: Arc<RwLock<AlignmentEngine>>,
    current_state: Arc<RwLock<CycleState>>,
    running: Arc<RwLock<bool>>,
    start_time: Arc<RwLock<Option<std::time::Instant>>>,
}

impl CycleEngine {
    /// Create new Cycle Engine
    pub fn new(config: CycleEngineConfig) -> Self {
        Self {
            config: Arc::new(RwLock::new(config.clone())),
            clock: Arc::new(ClockEngine::new(config.tick_interval_seconds)),
            load_regulator: Arc::new(RwLock::new(LoadRegulator::new())),
            continuity: Arc::new(RwLock::new(ContinuityEngine::new())),
            predictive: Arc::new(RwLock::new(PredictiveTemporalModel::new())),
            alignment: Arc::new(RwLock::new(AlignmentEngine::new())),
            current_state: Arc::new(RwLock::new(CycleState::current())),
            running: Arc::new(RwLock::new(false)),
            start_time: Arc::new(RwLock::new(None)),
        }
    }

    /// Start the Cycle Engine
    pub async fn start(&self) -> CycleResult<()> {
        let mut running = self.running.write().await;
        if *running {
            return Err(CycleError("Cycle Engine already running".to_string()));
        }
        *running = true;
        drop(running);

        // Record start time
        let mut start_time = self.start_time.write().await;
        *start_time = Some(std::time::Instant::now());
        drop(start_time);

        // Start clock
        self.clock.start().await?;

        // Spawn main cycle loop
        let current_state = Arc::clone(&self.current_state);
        let config = Arc::clone(&self.config);
        let running_clone = Arc::clone(&self.running);
        let load_regulator = Arc::clone(&self.load_regulator);
        let continuity = Arc::clone(&self.continuity);
        let predictive = Arc::clone(&self.predictive);
        let alignment = Arc::clone(&self.alignment);

        tokio::spawn(async move {
            let mut interval_timer = interval(Duration::from_secs(60)); // Update every minute

            loop {
                interval_timer.tick().await;

                let running = running_clone.read().await;
                if !*running {
                    break;
                }
                drop(running);

                // Update cycle state
                let new_state = CycleState::current();
                let mut state = current_state.write().await;

                let previous_phase = state.daily_phase;
                *state = new_state.clone();
                drop(state);

                // Detect phase changes
                if previous_phase != new_state.daily_phase {
                    log::info!(
                        "🌍 Cycle Phase Change: {:?} → {:?}",
                        previous_phase,
                        new_state.daily_phase
                    );
                }

                // Update cognitive rhythm
                let cognitive_rhythm = CognitiveRhythmParams::from_cycle_state(&new_state);

                // Update load regulation (using placeholder metrics)
                let mut regulator = load_regulator.write().await;
                let load_params = regulator.adjust(&new_state, &cognitive_rhythm, 0.5, 0.5);
                drop(regulator);

                // Update alignment
                let mut alignment_engine = alignment.write().await;
                let system_alignment =
                    alignment_engine.align_system(&new_state, &cognitive_rhythm, &load_params);
                drop(alignment_engine);

                // Record continuity event
                let mut continuity_engine = continuity.write().await;
                continuity_engine.record_event(
                    new_state.daily_phase as u8,
                    new_state.weekly_phase as u8,
                    "cycle_update".to_string(),
                );
                drop(continuity_engine);

                // Generate predictions
                let predictive_model = predictive.read().await;
                let predictions = predictive_model.predict_next_cycle_change(&new_state);
                drop(predictive_model);

                if !predictions.is_empty() {
                    log::debug!("🔮 Predictions: {} upcoming events", predictions.len());
                }

                log::debug!(
                    "⚡ Cycle Engine: Mode={:?}, Omega={:.2}, SelfHealing={:.2}, Alignment={:.2}",
                    cognitive_rhythm.mode,
                    load_params.omega_intensity,
                    load_params.self_healing_frequency,
                    system_alignment.alignment_score
                );
            }
        });

        Ok(())
    }

    /// Stop the Cycle Engine
    pub async fn stop(&self) -> CycleResult<()> {
        let mut running = self.running.write().await;
        *running = false;
        drop(running);

        self.clock.stop().await?;

        Ok(())
    }

    /// Get current cycle state
    pub async fn current_state(&self) -> CycleState {
        let state = self.current_state.read().await;
        state.clone()
    }

    /// Get current cognitive rhythm parameters
    pub async fn current_rhythm(&self) -> CognitiveRhythmParams {
        let state = self.current_state().await;
        CognitiveRhythmParams::from_cycle_state(&state)
    }

    /// Get current load regulation parameters
    pub async fn current_load_params(&self) -> LoadRegulationParams {
        let regulator = self.load_regulator.read().await;
        regulator.current_params().clone()
    }

    /// Get current seasonal parameters
    pub async fn current_seasonal_params(&self) -> SeasonalParameters {
        let state = self.current_state().await;
        SeasonalParameters::from_phase(state.seasonal_phase)
    }

    /// Get predictions
    pub async fn get_predictions(&self) -> Vec<PredictiveEvent> {
        let state = self.current_state().await;
        let predictive = self.predictive.read().await;
        predictive.predict_next_cycle_change(&state)
    }

    /// Get diagnostics
    pub async fn diagnostics(&self) -> CycleEngineDiagnostics {
        let running = self.running.read().await;
        let clock_running = self.clock.is_running().await;
        let state = self.current_state().await;
        let load_params = self.current_load_params().await;
        let alignment_engine = self.alignment.read().await;
        let alignment_score = alignment_engine.current_alignment().alignment_score;

        let uptime = {
            let start_time = self.start_time.read().await;
            start_time.map(|t| t.elapsed().as_secs()).unwrap_or(0)
        };

        CycleEngineDiagnostics {
            enabled: *running,
            clock_running,
            current_cycle: state,
            omega_intensity: load_params.omega_intensity,
            self_healing_frequency: load_params.self_healing_frequency,
            memory_consolidation_active: load_params.memory_gc_frequency > 0.5,
            alignment_score,
            uptime_seconds: uptime,
        }
    }

    /// Check if running
    pub async fn is_running(&self) -> bool {
        let running = self.running.read().await;
        *running
    }

    /// Update configuration
    pub async fn update_config(&self, new_config: CycleEngineConfig) -> CycleResult<()> {
        let mut config = self.config.write().await;
        *config = new_config;
        Ok(())
    }

    /// Get configuration
    pub async fn config(&self) -> CycleEngineConfig {
        let config = self.config.read().await;
        config.clone()
    }
}

impl Default for CycleEngine {
    fn default() -> Self {
        Self::new(CycleEngineConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_cycle_engine_start_stop() {
        let engine = CycleEngine::new(CycleEngineConfig {
            enabled: true,
            tick_interval_seconds: 1,
            ..Default::default()
        });

        assert!(!engine.is_running().await);

        engine.start().await.expect("Failed to start");
        assert!(engine.is_running().await);

        tokio::time::sleep(Duration::from_secs(2)).await;

        engine.stop().await.expect("Failed to stop");
        assert!(!engine.is_running().await);
    }

    #[tokio::test]
    async fn test_cycle_state() {
        let engine = CycleEngine::default();
        let state = engine.current_state().await;

        assert!(state.timestamp > 0);
    }

    #[tokio::test]
    async fn test_cognitive_rhythm() {
        let engine = CycleEngine::default();
        let rhythm = engine.current_rhythm().await;

        assert!(rhythm.omega_depth >= 0.0 && rhythm.omega_depth <= 1.0);
        assert!(rhythm.analysis_intensity >= 0.0 && rhythm.analysis_intensity <= 1.0);
    }

    #[tokio::test]
    async fn test_predictions() {
        let engine = CycleEngine::default();
        let predictions = engine.get_predictions().await;

        assert!(!predictions.is_empty());
    }

    #[tokio::test]
    async fn test_diagnostics() {
        let engine = CycleEngine::default();
        let diagnostics = engine.diagnostics().await;

        assert!(!diagnostics.enabled); // Not started yet
        assert_eq!(diagnostics.uptime_seconds, 0);
    }
}
