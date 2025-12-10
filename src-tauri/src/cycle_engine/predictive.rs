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

    #[test]
    fn test_predict_next_phase() {
        let model = PredictiveTemporalModel::new();
        assert_eq!(
            model.predict_next_daily_phase(DailyPhase::Morning),
            DailyPhase::Noon
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
}
