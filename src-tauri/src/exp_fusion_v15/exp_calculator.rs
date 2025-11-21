// ⚙️ EXP Calculator — Calcul intelligent et pondération
// Règles de progression cohérentes et professionnelles

use super::ExpSource;

pub struct ExpCalculator {
    base_multiplier: f32,
}

#[allow(dead_code)] // API publique pour calculs XP
impl ExpCalculator {
    pub fn new() -> Self {
        Self {
            base_multiplier: 1.0,
        }
    }

    /// Calculer XP pondéré selon la source
    pub fn calculate_weighted_exp(&self, base_amount: u64, source: &ExpSource) -> u64 {
        let multiplier = match source {
            ExpSource::Interaction => 1.0,
            ExpSource::MetaMode => 1.2,
            ExpSource::AutoEvolution => 1.5,
            ExpSource::FileImport => 0.8,
            ExpSource::ProjectUpdate => 2.0,
            ExpSource::KnowledgeAcquisition => 1.3,
            ExpSource::SystemOptimization => 2.5,
        };

        ((base_amount as f32) * multiplier * self.base_multiplier) as u64
    }

    /// Calculer XP nécessaire pour un niveau
    pub fn calculate_exp_for_level(&self, level: u32) -> u64 {
        // Formule : XP = 100 * level^1.5
        // Niveau 1 → 100 XP
        // Niveau 2 → 282 XP
        // Niveau 3 → 519 XP
        // Progression équilibrée, non linéaire
        (100.0 * (level as f32).powf(1.5)) as u64
    }

    /// Calculer niveau depuis XP total
    pub fn calculate_level_from_total_exp(&self, total_exp: u64) -> (u32, u64) {
        let mut level = 1;
        let mut cumulative = 0u64;

        loop {
            let required = self.calculate_exp_for_level(level);
            if cumulative + required > total_exp {
                return (level, total_exp - cumulative);
            }
            cumulative += required;
            level += 1;

            if level > 1000 {
                break; // Sécurité
            }
        }

        (level, 0)
    }

    /// Pondération par importance de donnée
    pub fn weight_by_importance(&self, base_amount: u64, importance: f32) -> u64 {
        // importance: 0.0 → 1.0
        ((base_amount as f32) * (0.5 + importance)) as u64
    }

    /// Pondération par complexité
    pub fn weight_by_complexity(&self, base_amount: u64, complexity: f32) -> u64 {
        // complexity: 0.0 (simple) → 2.0 (très complexe)
        ((base_amount as f32) * (0.8 + complexity * 0.6)) as u64
    }
}

impl Default for ExpCalculator {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_weighted_exp() {
        let calc = ExpCalculator::new();
        
        let interaction_exp = calc.calculate_weighted_exp(10, &ExpSource::Interaction);
        let optimization_exp = calc.calculate_weighted_exp(10, &ExpSource::SystemOptimization);

        assert_eq!(interaction_exp, 10);
        assert_eq!(optimization_exp, 25);
    }

    #[test]
    fn test_level_calculation() {
        let calc = ExpCalculator::new();

        let level_1_exp = calc.calculate_exp_for_level(1);
        let level_2_exp = calc.calculate_exp_for_level(2);

        assert_eq!(level_1_exp, 100);
        assert!(level_2_exp > level_1_exp);
    }
}
