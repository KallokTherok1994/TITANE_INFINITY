// 🧮 EXP Weight Integration — Intégration des pondérations XP avec l'auto-évolution
// Connecte exp_calculator avec les modules d'évolution pour moduler l'XP dynamiquement

use crate::exp_fusion_v15::exp_calculator::ExpCalculator;
use crate::auto_evolution_v15::logic_calibration::LogicCalibrator;
use crate::auto_evolution_v15::mode_adaptation::ModeAdapter;

/// Intégrateur de poids XP basé sur l'évolution
#[allow(dead_code)] // API publique pour intégrations futures
pub struct ExpWeightIntegrator {
    calculator: ExpCalculator,
    logic_calibrator: LogicCalibrator,
    mode_adapter: ModeAdapter,
}

#[allow(dead_code)] // API publique pour intégrations futures
impl ExpWeightIntegrator {
    pub fn new() -> Self {
        Self {
            calculator: ExpCalculator::new(),
            logic_calibrator: LogicCalibrator::new(),
            mode_adapter: ModeAdapter::new(),
        }
    }

    /// Calculer le niveau depuis l'XP total avec calibration logique
    pub fn calculate_level_with_calibration(&self, total_exp: u64) -> (u32, u64) {
        let (level, _current) = self.calculator.calculate_level_from_total_exp(total_exp);
        
        // Appliquer la précision logique pour ajuster légèrement
        let precision = self.logic_calibrator.get_precision();
        let needed = self.calculator.calculate_exp_for_level(level + 1);
        let adjusted_needed = (needed as f32 * (1.0 + (1.0 - precision) * 0.1)) as u64;
        
        (level, adjusted_needed)
    }

    /// Pondérer l'XP par importance avec pertinence logique
    pub fn weight_by_importance_calibrated(&self, base_amount: u64, importance: f32) -> u64 {
        let weighted = self.calculator.weight_by_importance(base_amount, importance);
        
        // Moduler avec la pertinence logique
        let pertinence = self.logic_calibrator.get_pertinence();
        (weighted as f32 * pertinence) as u64
    }

    /// Pondérer l'XP par complexité avec adaptation de mode
    pub fn weight_by_complexity_adapted(&self, base_amount: u64, complexity: f32, current_mode: &str) -> u64 {
        let weighted = self.calculator.weight_by_complexity(base_amount, complexity);
        
        // Appliquer les paramètres de mode
        if let Some(params) = self.mode_adapter.get_mode_parameters(current_mode) {
            (weighted as f32 * params.intensity) as u64
        } else {
            weighted
        }
    }

    /// Calculer l'XP final avec tous les modificateurs évolutifs
    pub fn calculate_final_exp(
        &self,
        base_amount: u64,
        importance: f32,
        complexity: f32,
        current_mode: &str,
    ) -> u64 {
        // 1. Pondération importance + calibration logique
        let after_importance = self.weight_by_importance_calibrated(base_amount, importance);
        
        // 2. Pondération complexité + adaptation mode
        let after_complexity = self.weight_by_complexity_adapted(after_importance, complexity, current_mode);
        
        // 3. Multiplicateur final basé sur précision et pertinence
        let precision = self.logic_calibrator.get_precision();
        let pertinence = self.logic_calibrator.get_pertinence();
        let final_multiplier = (precision + pertinence) / 2.0;
        
        (after_complexity as f32 * final_multiplier) as u64
    }

    /// Obtenir les statistiques d'intégration
    pub fn get_integration_stats(&self) -> String {
        let precision = self.logic_calibrator.get_precision();
        let pertinence = self.logic_calibrator.get_pertinence();
        
        format!(
            "🧮 EXP Weight Integration\n\
             Précision logique: {:.2}\n\
             Pertinence: {:.2}\n\
             Multiplicateur moyen: {:.2}",
            precision,
            pertinence,
            (precision + pertinence) / 2.0
        )
    }
}

impl Default for ExpWeightIntegrator {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_exp_integration() {
        let integrator = ExpWeightIntegrator::new();
        
        // Test calcul niveau
        let (level, _) = integrator.calculate_level_with_calibration(1000);
        assert!(level > 0);
        
        // Test pondération importance
        let weighted = integrator.weight_by_importance_calibrated(100, 1.5);
        assert!(weighted >= 100);
        
        // Test pondération complexité
        let adapted = integrator.weight_by_complexity_adapted(100, 2.0, "autonomous");
        assert!(adapted >= 100);
        
        // Test calcul final
        let final_exp = integrator.calculate_final_exp(100, 1.5, 2.0, "autonomous");
        assert!(final_exp >= 100);
    }
}
