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
    pub energy_multiplier: f32,      // 0.5 - 1.5
    pub creativity_boost: f32,       // 0.0 - 1.0
    pub introspection_depth: f32,    // 0.0 - 1.0
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
