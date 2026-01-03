#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   PREDICTIVE TEMPORAL MODEL — Anticipation & Planning
//   SUPER PROMPT #16
// ═══════════════════════════════════════════════════════════════

use crate::cycle_engine::cycles::{CycleState, DailyPhase};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictiveEvent {
    pub event_type: String,
    pub predicted_time: i64, // Unix timestamp
    pub confidence: f32,
    pub suggested_action: String,
}

pub struct PredictiveTemporalModel {
    predictions: Vec<PredictiveEvent>,
}

impl PredictiveTemporalModel {
    pub fn new() -> Self {
        Self {
            predictions: vec![],
        }
    }

    /// Predict next cycle changes
    pub fn predict_next_cycle_change(&self, current_state: &CycleState) -> Vec<PredictiveEvent> {
        let mut predictions = vec![];

        // Predict next daily phase change
        let next_phase = self.predict_next_daily_phase(current_state.daily_phase);
        let time_to_next = self.time_to_next_phase(current_state.daily_phase);

        predictions.push(PredictiveEvent {
            event_type: "daily_phase_change".to_string(),
            predicted_time: current_state.timestamp + time_to_next,
            confidence: 0.95,
            suggested_action: format!("Prepare for {:?} mode", next_phase),
        });

        predictions
    }

    /// Predict next daily phase
    fn predict_next_daily_phase(&self, current: DailyPhase) -> DailyPhase {
        match current {
            DailyPhase::Dawn => DailyPhase::Morning,
            DailyPhase::Morning => DailyPhase::Noon,
            DailyPhase::Noon => DailyPhase::Afternoon,
            DailyPhase::Afternoon => DailyPhase::Dusk,
            DailyPhase::Dusk => DailyPhase::Night,
            DailyPhase::Night => DailyPhase::Dawn,
        }
    }

    /// Calculate time to next phase (seconds)
    fn time_to_next_phase(&self, current: DailyPhase) -> i64 {
        match current {
            DailyPhase::Dawn => 2 * 3600,      // 2h
            DailyPhase::Morning => 5 * 3600,   // 5h
            DailyPhase::Noon => 2 * 3600,      // 2h
            DailyPhase::Afternoon => 4 * 3600, // 4h
            DailyPhase::Dusk => 2 * 3600,      // 2h
            DailyPhase::Night => 9 * 3600,     // 9h
        }
    }

    /// Suggest optimal time for task
    pub fn suggest_optimal_time(&self, task_type: &str) -> Option<DailyPhase> {
        match task_type {
            "creative" => Some(DailyPhase::Dawn),
            "analytical" => Some(DailyPhase::Morning),
            "execution" => Some(DailyPhase::Afternoon),
            "synthesis" => Some(DailyPhase::Dusk),
            "consolidation" => Some(DailyPhase::Night),
            _ => Some(DailyPhase::Noon), // Default to peak
        }
    }
}

impl Default for PredictiveTemporalModel {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // PredictiveEvent Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_predictive_event_creation() {
        let event = PredictiveEvent {
            event_type: "test_event".to_string(),
            predicted_time: 1234567890,
            confidence: 0.8,
            suggested_action: "Do something".to_string(),
        };
        assert_eq!(event.event_type, "test_event");
        assert_eq!(event.predicted_time, 1234567890);
        assert_eq!(event.confidence, 0.8);
    }

    #[test]
    fn test_predictive_event_clone() {
        let event = PredictiveEvent {
            event_type: "clone_test".to_string(),
            predicted_time: 1000,
            confidence: 0.5,
            suggested_action: "Test".to_string(),
        };
        let cloned = event.clone();
        assert_eq!(event.event_type, cloned.event_type);
        assert_eq!(event.confidence, cloned.confidence);
    }

    #[test]
    fn test_predictive_event_debug() {
        let event = PredictiveEvent {
            event_type: "debug_test".to_string(),
            predicted_time: 1000,
            confidence: 0.5,
            suggested_action: "Test".to_string(),
        };
        let debug = format!("{:?}", event);
        assert!(debug.contains("PredictiveEvent"));
    }

    #[test]
    fn test_predictive_event_serialization() {
        let event = PredictiveEvent {
            event_type: "serial_test".to_string(),
            predicted_time: 2000,
            confidence: 0.9,
            suggested_action: "Serialize".to_string(),
        };
        let json = serde_json::to_string(&event).expect("predictive event should serialize");
        let restored: PredictiveEvent =
            serde_json::from_str(&json).expect("predictive event should deserialize");
        assert_eq!(event.event_type, restored.event_type);
        assert_eq!(event.confidence, restored.confidence);
    }

    // ─────────────────────────────────────────────────────────────
    // PredictiveTemporalModel Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_predict_next_phase() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(
            model.predict_next_daily_phase(DailyPhase::Morning),
            DailyPhase::Noon
        );
    }

    #[test]
    fn test_predict_next_phase_dawn() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(
            model.predict_next_daily_phase(DailyPhase::Dawn),
            DailyPhase::Morning
        );
    }

    #[test]
    fn test_predict_next_phase_noon() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(
            model.predict_next_daily_phase(DailyPhase::Noon),
            DailyPhase::Afternoon
        );
    }

    #[test]
    fn test_predict_next_phase_afternoon() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(
            model.predict_next_daily_phase(DailyPhase::Afternoon),
            DailyPhase::Dusk
        );
    }

    #[test]
    fn test_predict_next_phase_dusk() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(
            model.predict_next_daily_phase(DailyPhase::Dusk),
            DailyPhase::Night
        );
    }

    #[test]
    fn test_predict_next_phase_night() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(
            model.predict_next_daily_phase(DailyPhase::Night),
            DailyPhase::Dawn
        );
    }

    #[test]
    fn test_suggest_optimal_time() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(
            model.suggest_optimal_time("creative"),
            Some(DailyPhase::Dawn)
        );
    }

    #[test]
    fn test_suggest_optimal_time_analytical() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(
            model.suggest_optimal_time("analytical"),
            Some(DailyPhase::Morning)
        );
    }

    #[test]
    fn test_suggest_optimal_time_execution() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(
            model.suggest_optimal_time("execution"),
            Some(DailyPhase::Afternoon)
        );
    }

    #[test]
    fn test_suggest_optimal_time_synthesis() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(
            model.suggest_optimal_time("synthesis"),
            Some(DailyPhase::Dusk)
        );
    }

    #[test]
    fn test_suggest_optimal_time_consolidation() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(
            model.suggest_optimal_time("consolidation"),
            Some(DailyPhase::Night)
        );
    }

    #[test]
    fn test_suggest_optimal_time_unknown() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(
            model.suggest_optimal_time("unknown_task"),
            Some(DailyPhase::Noon)
        );
    }

    #[test]
    fn test_model_new() {
        let model = PredictiveTemporalModel::new();
        // Model should be created without errors
        assert!(model.predictions.is_empty());
    }

    #[test]
    fn test_model_default() {
        let model = PredictiveTemporalModel::default();
        assert!(model.predictions.is_empty());
    }

    #[test]
    fn test_time_to_next_phase_dawn() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(model.time_to_next_phase(DailyPhase::Dawn), 2 * 3600);
    }

    #[test]
    fn test_time_to_next_phase_morning() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(model.time_to_next_phase(DailyPhase::Morning), 5 * 3600);
    }

    #[test]
    fn test_time_to_next_phase_noon() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(model.time_to_next_phase(DailyPhase::Noon), 2 * 3600);
    }

    #[test]
    fn test_time_to_next_phase_afternoon() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(model.time_to_next_phase(DailyPhase::Afternoon), 4 * 3600);
    }

    #[test]
    fn test_time_to_next_phase_dusk() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(model.time_to_next_phase(DailyPhase::Dusk), 2 * 3600);
    }

    #[test]
    fn test_time_to_next_phase_night() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(model.time_to_next_phase(DailyPhase::Night), 9 * 3600);
    }

    #[test]
    fn test_predict_next_cycle_change() {
        let model = PredictiveTemporalModel::new();
        let state = CycleState::current();
        let predictions = model.predict_next_cycle_change(&state);
        assert!(!predictions.is_empty());
        assert_eq!(predictions[0].event_type, "daily_phase_change");
        assert_eq!(predictions[0].confidence, 0.95);
    }

    #[test]
    fn test_predict_next_cycle_change_timestamp() {
        let model = PredictiveTemporalModel::new();
        let state = CycleState::current();
        let predictions = model.predict_next_cycle_change(&state);
        assert!(predictions[0].predicted_time > state.timestamp);
    }

    #[test]
    fn test_predict_next_cycle_change_action() {
        let model = PredictiveTemporalModel::new();
        let state = CycleState::current();
        let predictions = model.predict_next_cycle_change(&state);
        assert!(predictions[0].suggested_action.contains("Prepare for"));
    }
}
