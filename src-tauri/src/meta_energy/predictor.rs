// ═══════════════════════════════════════════════════════════════
// TITANE∞ — Energy Predictor
// ═══════════════════════════════════════════════════════════════
use serde::{Deserialize, Serialize};
use crate::meta_energy::energy_model::EnergySnapshot;
use crate::meta_energy::fatigue_engine::FatigueLevel;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnergyForecast {
    pub horizon_hours: u32,
    pub predicted_levels: Vec<f32>,
    pub predicted_fatigue: Vec<String>,
    pub low_energy_windows: Vec<u32>,
    pub peak_windows: Vec<u32>,
    pub confidence: f32,
}

/// Prédicteur d'énergie cognitive sur horizon temporel
pub struct EnergyPredictor {
    forecast_horizon_hours: u32,
    regeneration_rate: f32,
    base_consumption: f32,
}

impl EnergyPredictor {
    pub fn new(forecast_horizon_hours: u32, regeneration_rate: f32, base_consumption: f32) -> Self {
        Self {
            forecast_horizon_hours,
            regeneration_rate,
            base_consumption,
        }
    }

    pub fn forecast(&self, current_energy: f32, _history: &[EnergySnapshot]) -> EnergyForecast {
        let steps = self.forecast_horizon_hours as usize;
        let mut levels = Vec::with_capacity(steps);
        let mut fatigue_labels = Vec::with_capacity(steps);
        let mut low_windows = Vec::new();
        let mut peak_windows = Vec::new();

        let mut energy = current_energy;
        for hour in 0..steps {
            // Simple oscillation model: energy follows daily cycle
            let hour_of_day = (hour % 24) as f32;
            let circadian_factor = 0.5 + 0.5 * ((hour_of_day - 14.0) * std::f32::consts::PI / 12.0).cos();
            let net = self.regeneration_rate * circadian_factor - self.base_consumption;
            energy = (energy + net).clamp(0.0, 1.0);
            levels.push(energy);

            let fatigue = FatigueLevel::from_energy(energy);
            fatigue_labels.push(fatigue.as_str().to_string());

            if energy < 0.3 {
                low_windows.push(hour as u32);
            }
            if energy > 0.75 {
                peak_windows.push(hour as u32);
            }
        }

        let data_points = levels.len();
        EnergyForecast {
            horizon_hours: self.forecast_horizon_hours,
            predicted_levels: levels,
            predicted_fatigue: fatigue_labels,
            low_energy_windows: low_windows,
            peak_windows: peak_windows,
            confidence: if data_points > 0 { 0.72 } else { 0.0 },
        }
    }
}
