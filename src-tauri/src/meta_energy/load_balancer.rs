// ═══════════════════════════════════════════════════════════════
// TITANE∞ — Load Balancer
// ═══════════════════════════════════════════════════════════════
use serde::{Deserialize, Serialize};
use crate::meta_energy::fatigue_engine::FatigueLevel;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadBalance {
    pub allocated_capacity: f32,
    pub deferred_tasks: u32,
    pub throttle_factor: f32,
    pub priority_mode: String,
}

/// Répartiteur de charge cognitif
pub struct LoadBalancer {
    max_load: f32,
}

impl LoadBalancer {
    pub fn new(max_load: f32) -> Self {
        Self { max_load }
    }

    pub fn balance(&self, requested_load: f32, fatigue: &FatigueLevel) -> LoadBalance {
        let multiplier = fatigue.cognitive_multiplier();
        let available = self.max_load * multiplier;
        let allocated = requested_load.min(available);
        let overflow = (requested_load - available).max(0.0);
        let deferred = (overflow / 0.1) as u32;

        let throttle = if available > 0.0 {
            (allocated / available).min(1.0)
        } else {
            0.0
        };

        let priority_mode = match fatigue {
            FatigueLevel::Fresh => "FullCapacity",
            FatigueLevel::Normal => "Standard",
            FatigueLevel::Tired => "Conservative",
            FatigueLevel::Exhausted => "Minimal",
        }
        .to_string();

        LoadBalance {
            allocated_capacity: allocated,
            deferred_tasks: deferred,
            throttle_factor: throttle,
            priority_mode,
        }
    }
}
