// ═══════════════════════════════════════════════════════════════
// TITANE∞ — Recovery Engine
// ═══════════════════════════════════════════════════════════════
use serde::{Deserialize, Serialize};
use crate::meta_energy::fatigue_engine::FatigueLevel;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryPlan {
    pub recommended_rest_seconds: u64,
    pub recovery_rate_boost: f32,
    pub low_activity_mode: bool,
    pub estimated_recovery_energy: f32,
    pub message: String,
}

/// Moteur de récupération énergétique
pub struct RecoveryEngine {
    min_recovery_seconds: u64,
    base_regeneration_rate: f32,
}

impl RecoveryEngine {
    pub fn new(min_recovery_seconds: u64, base_regeneration_rate: f32) -> Self {
        Self {
            min_recovery_seconds,
            base_regeneration_rate,
        }
    }

    pub fn plan(&self, fatigue: &FatigueLevel, current_energy: f32) -> RecoveryPlan {
        let (rest_secs, boost, low_activity) = match fatigue {
            FatigueLevel::Fresh | FatigueLevel::Normal => {
                (0, 1.0, false)
            }
            FatigueLevel::Tired => {
                (self.min_recovery_seconds * 2, 1.5, false)
            }
            FatigueLevel::Exhausted => {
                (self.min_recovery_seconds * 6, 2.5, true)
            }
        };

        let cycles = rest_secs / 30; // 30s per cycle
        let estimated_recovery = self.base_regeneration_rate * boost * cycles as f32;
        let message = match fatigue {
            FatigueLevel::Fresh => "Système en bonne forme — aucune récupération requise.".into(),
            FatigueLevel::Normal => "Niveau normal — maintenir la cadence.".into(),
            FatigueLevel::Tired => "Fatigue détectée — pause recommandée.".into(),
            FatigueLevel::Exhausted => "Épuisement critique — arrêt d'urgence recommandé.".into(),
        };

        RecoveryPlan {
            recommended_rest_seconds: rest_secs,
            recovery_rate_boost: boost,
            low_activity_mode: low_activity,
            estimated_recovery_energy: (current_energy + estimated_recovery).min(1.0),
            message,
        }
    }
}
