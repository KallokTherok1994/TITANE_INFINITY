// ═══════════════════════════════════════════════════════════════
// TITANE∞ — Meta-Energy Config
// ═══════════════════════════════════════════════════════════════
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaEnergyConfig {
    /// Énergie cible pour l'homéostasie (0.0–1.0)
    pub target_energy: f32,
    /// Tolérance autour de la cible
    pub tolerance: f32,
    /// Taux de régénération par cycle (0.0–1.0)
    pub regeneration_rate: f32,
    /// Taux de consommation basale par cycle
    pub base_consumption_rate: f32,
    /// Seuil de fatigue sévère
    pub exhaustion_threshold: f32,
    /// Durée minimale de récupération (secondes)
    pub min_recovery_seconds: u64,
    /// Fenêtre de prédiction (heures)
    pub forecast_horizon_hours: u32,
}

impl Default for MetaEnergyConfig {
    fn default() -> Self {
        Self {
            target_energy: 0.65,
            tolerance: 0.1,
            regeneration_rate: 0.02,
            base_consumption_rate: 0.01,
            exhaustion_threshold: 0.2,
            min_recovery_seconds: 300,
            forecast_horizon_hours: 8,
        }
    }
}
