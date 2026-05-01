// ═══════════════════════════════════════════════════════════════
// TITANE∞ — Energy Model
// ═══════════════════════════════════════════════════════════════
use serde::{Deserialize, Serialize};

/// État énergétique courant du système cognitif
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnergyState {
    pub current: f32,
    pub max_capacity: f32,
    pub regeneration_rate: f32,
    pub consumption_rate: f32,
    pub timestamp: i64,
}

impl EnergyState {
    pub fn new(max_capacity: f32, regeneration_rate: f32) -> Self {
        Self {
            current: max_capacity * 0.65,
            max_capacity,
            regeneration_rate,
            consumption_rate: 0.01,
            timestamp: chrono_now(),
        }
    }

    /// Niveau normalisé (0.0–1.0)
    pub fn normalized(&self) -> f32 {
        (self.current / self.max_capacity).clamp(0.0, 1.0)
    }

    /// Appliquer un delta (consommation ou récupération)
    pub fn apply_delta(&mut self, delta: f32) {
        self.current = (self.current + delta).clamp(0.0, self.max_capacity);
        self.timestamp = chrono_now();
    }
}

/// Instantané historique pour la prédiction
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnergySnapshot {
    pub energy_level: f32,
    pub fatigue_level: f32,
    pub timestamp: i64,
    pub activity: String,
}

fn chrono_now() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}
