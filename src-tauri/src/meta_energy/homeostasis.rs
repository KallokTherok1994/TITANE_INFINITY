// ═══════════════════════════════════════════════════════════════
// TITANE∞ — Homeostasis Controller
// ═══════════════════════════════════════════════════════════════
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HomeoBalance {
    pub current_energy: f32,
    pub target_energy: f32,
    pub deviation: f32,
    pub correction: f32,
    pub in_balance: bool,
    pub action: String,
}

/// Contrôleur homéostatique — maintient l'énergie autour de la cible
pub struct HomeostasisController {
    pub target_energy: f32,
    pub tolerance: f32,
}

impl HomeostasisController {
    pub fn new(target_energy: f32, tolerance: f32) -> Self {
        Self { target_energy, tolerance }
    }

    pub fn assess(&self, current_energy: f32) -> HomeoBalance {
        let deviation = current_energy - self.target_energy;
        let in_balance = deviation.abs() <= self.tolerance;

        // Correction proportionnelle
        let correction = if in_balance {
            0.0
        } else {
            -deviation * 0.3 // P-controller with gain 0.3
        };

        let action = match (deviation > 0.0, in_balance) {
            (_, true) => "Stable — aucune correction requise",
            (true, false) => "Surplus d'énergie — réduire la régénération",
            (false, false) => "Déficit énergétique — augmenter la récupération",
        }
        .to_string();

        HomeoBalance {
            current_energy,
            target_energy: self.target_energy,
            deviation,
            correction,
            in_balance,
            action,
        }
    }

    pub fn apply_correction(&self, energy: &mut f32) {
        let balance = self.assess(*energy);
        *energy = (*energy + balance.correction).clamp(0.0, 1.0);
    }
}
