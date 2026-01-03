#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   SEASONS ENGINE — Long-term Seasonal Patterns
//   SUPER PROMPT #16
// ═══════════════════════════════════════════════════════════════

use crate::cycle_engine::cycles::SeasonalPhase;
use serde::{Deserialize, Serialize};

/// Seasonal Parameters (affect system behavior)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeasonalParameters {
    pub phase: SeasonalPhase,
    pub energy_multiplier: f32,       // 0.5 - 1.5
    pub creativity_boost: f32,        // 0.0 - 1.0
    pub introspection_depth: f32,     // 0.0 - 1.0
    pub consolidation_frequency: f32, // 0.0 - 1.0
}

impl SeasonalParameters {
    pub fn from_phase(phase: SeasonalPhase) -> Self {
        match phase {
            SeasonalPhase::Spring => Self {
                phase,
                energy_multiplier: 1.2,
                creativity_boost: 0.8,
                introspection_depth: 0.3,
                consolidation_frequency: 0.4,
            },
            SeasonalPhase::Summer => Self {
                phase,
                energy_multiplier: 1.5,
                creativity_boost: 0.6,
                introspection_depth: 0.2,
                consolidation_frequency: 0.3,
            },
            SeasonalPhase::Autumn => Self {
                phase,
                energy_multiplier: 1.0,
                creativity_boost: 0.5,
                introspection_depth: 0.5,
                consolidation_frequency: 0.7,
            },
            SeasonalPhase::Winter => Self {
                phase,
                energy_multiplier: 0.7,
                creativity_boost: 0.3,
                introspection_depth: 0.9,
                consolidation_frequency: 0.9,
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // SeasonalParameters Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_seasonal_params_spring() {
        let params = SeasonalParameters::from_phase(SeasonalPhase::Spring);
        assert_eq!(params.phase, SeasonalPhase::Spring);
        assert_eq!(params.energy_multiplier, 1.2);
        assert_eq!(params.creativity_boost, 0.8);
        assert_eq!(params.introspection_depth, 0.3);
        assert_eq!(params.consolidation_frequency, 0.4);
    }

    #[test]
    fn test_seasonal_params_summer() {
        let params = SeasonalParameters::from_phase(SeasonalPhase::Summer);
        assert_eq!(params.phase, SeasonalPhase::Summer);
        assert_eq!(params.energy_multiplier, 1.5);
        assert_eq!(params.creativity_boost, 0.6);
        assert_eq!(params.introspection_depth, 0.2);
        assert_eq!(params.consolidation_frequency, 0.3);
    }

    #[test]
    fn test_seasonal_params_autumn() {
        let params = SeasonalParameters::from_phase(SeasonalPhase::Autumn);
        assert_eq!(params.phase, SeasonalPhase::Autumn);
        assert_eq!(params.energy_multiplier, 1.0);
        assert_eq!(params.creativity_boost, 0.5);
        assert_eq!(params.introspection_depth, 0.5);
        assert_eq!(params.consolidation_frequency, 0.7);
    }

    #[test]
    fn test_seasonal_params_winter() {
        let params = SeasonalParameters::from_phase(SeasonalPhase::Winter);
        assert_eq!(params.phase, SeasonalPhase::Winter);
        assert_eq!(params.energy_multiplier, 0.7);
        assert_eq!(params.creativity_boost, 0.3);
        assert_eq!(params.introspection_depth, 0.9);
        assert_eq!(params.consolidation_frequency, 0.9);
    }

    #[test]
    fn test_seasonal_params_clone() {
        let params = SeasonalParameters::from_phase(SeasonalPhase::Spring);
        let cloned = params.clone();
        assert_eq!(params.phase, cloned.phase);
        assert_eq!(params.energy_multiplier, cloned.energy_multiplier);
    }

    #[test]
    fn test_seasonal_params_debug() {
        let params = SeasonalParameters::from_phase(SeasonalPhase::Summer);
        let debug = format!("{:?}", params);
        assert!(debug.contains("SeasonalParameters"));
    }

    #[test]
    fn test_seasonal_params_serialization() {
        let params = SeasonalParameters::from_phase(SeasonalPhase::Autumn);
        let json = serde_json::to_string(&params).expect("seasonal params should serialize");
        let restored: SeasonalParameters =
            serde_json::from_str(&json).expect("seasonal params should deserialize");
        assert_eq!(params.phase, restored.phase);
        assert_eq!(params.energy_multiplier, restored.energy_multiplier);
    }

    #[test]
    fn test_seasonal_params_energy_range() {
        for phase in [
            SeasonalPhase::Spring,
            SeasonalPhase::Summer,
            SeasonalPhase::Autumn,
            SeasonalPhase::Winter,
        ] {
            let params = SeasonalParameters::from_phase(phase);
            assert!(params.energy_multiplier >= 0.5 && params.energy_multiplier <= 1.5);
        }
    }

    #[test]
    fn test_seasonal_params_creativity_range() {
        for phase in [
            SeasonalPhase::Spring,
            SeasonalPhase::Summer,
            SeasonalPhase::Autumn,
            SeasonalPhase::Winter,
        ] {
            let params = SeasonalParameters::from_phase(phase);
            assert!(params.creativity_boost >= 0.0 && params.creativity_boost <= 1.0);
        }
    }

    #[test]
    fn test_seasonal_params_introspection_range() {
        for phase in [
            SeasonalPhase::Spring,
            SeasonalPhase::Summer,
            SeasonalPhase::Autumn,
            SeasonalPhase::Winter,
        ] {
            let params = SeasonalParameters::from_phase(phase);
            assert!(params.introspection_depth >= 0.0 && params.introspection_depth <= 1.0);
        }
    }

    #[test]
    fn test_seasonal_params_consolidation_range() {
        for phase in [
            SeasonalPhase::Spring,
            SeasonalPhase::Summer,
            SeasonalPhase::Autumn,
            SeasonalPhase::Winter,
        ] {
            let params = SeasonalParameters::from_phase(phase);
            assert!(params.consolidation_frequency >= 0.0 && params.consolidation_frequency <= 1.0);
        }
    }

    #[test]
    fn test_seasonal_params_summer_highest_energy() {
        let summer = SeasonalParameters::from_phase(SeasonalPhase::Summer);
        let winter = SeasonalParameters::from_phase(SeasonalPhase::Winter);
        assert!(summer.energy_multiplier > winter.energy_multiplier);
    }

    #[test]
    fn test_seasonal_params_winter_highest_introspection() {
        let winter = SeasonalParameters::from_phase(SeasonalPhase::Winter);
        let summer = SeasonalParameters::from_phase(SeasonalPhase::Summer);
        assert!(winter.introspection_depth > summer.introspection_depth);
    }
}
