// ═══════════════════════════════════════════════════════════════
// TITANE∞ — Fatigue Engine
// ═══════════════════════════════════════════════════════════════
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum FatigueLevel {
    Fresh,
    Normal,
    Tired,
    Exhausted,
}

impl FatigueLevel {
    pub fn from_energy(energy_normalized: f32) -> Self {
        match energy_normalized {
            e if e > 0.8 => FatigueLevel::Fresh,
            e if e > 0.5 => FatigueLevel::Normal,
            e if e > 0.2 => FatigueLevel::Tired,
            _ => FatigueLevel::Exhausted,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            FatigueLevel::Fresh => "Fresh",
            FatigueLevel::Normal => "Normal",
            FatigueLevel::Tired => "Tired",
            FatigueLevel::Exhausted => "Exhausted",
        }
    }

    pub fn cognitive_multiplier(&self) -> f32 {
        match self {
            FatigueLevel::Fresh => 1.0,
            FatigueLevel::Normal => 0.85,
            FatigueLevel::Tired => 0.6,
            FatigueLevel::Exhausted => 0.3,
        }
    }
}

/// Moteur d'analyse de fatigue cognitive
pub struct FatigueEngine {
    pub threshold_exhaustion: f32,
    pub threshold_tired: f32,
    pub threshold_fresh: f32,
}

impl FatigueEngine {
    pub fn new(threshold_exhaustion: f32) -> Self {
        Self {
            threshold_exhaustion,
            threshold_tired: 0.5,
            threshold_fresh: 0.8,
        }
    }

    pub fn assess(&self, energy_normalized: f32) -> FatigueLevel {
        FatigueLevel::from_energy(energy_normalized)
    }

    /// Facteur de consommation selon la tâche en cours
    pub fn consumption_factor(&self, task_intensity: f32, fatigue: &FatigueLevel) -> f32 {
        task_intensity * (1.0 + (1.0 - fatigue.cognitive_multiplier()) * 0.5)
    }
}
