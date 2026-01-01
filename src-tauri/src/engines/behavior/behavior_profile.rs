//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — BEHAVIOR PROFILE
//! Modèle stable représentant l'attitude active
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Mode comportemental actif
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Default)]
pub enum BehaviorMode {
    /// Mode coaching - accompagnement bienveillant
    Coach,
    /// Mode méta - réflexion sur la réflexion
    Meta,
    /// Mode analytique - précision et structure
    Analyst,
    /// Mode créatif - divergence et exploration
    Creative,
    /// Mode neutre - équilibré par défaut
    #[default]
    Neutral,
}

impl BehaviorMode {
    /// Retourne le profil par défaut pour ce mode
    pub fn default_profile(&self) -> BehaviorProfile {
        match self {
            BehaviorMode::Coach => BehaviorProfile {
                mode: self.clone(),
                assertiveness: 0.6,
                warmth: 0.85,
                directiveness: 0.5,
                reflectiveness: 0.7,
                adaptability: 0.8,
            },
            BehaviorMode::Meta => BehaviorProfile {
                mode: self.clone(),
                assertiveness: 0.4,
                warmth: 0.5,
                directiveness: 0.3,
                reflectiveness: 0.95,
                adaptability: 0.6,
            },
            BehaviorMode::Analyst => BehaviorProfile {
                mode: self.clone(),
                assertiveness: 0.7,
                warmth: 0.4,
                directiveness: 0.8,
                reflectiveness: 0.85,
                adaptability: 0.5,
            },
            BehaviorMode::Creative => BehaviorProfile {
                mode: self.clone(),
                assertiveness: 0.5,
                warmth: 0.7,
                directiveness: 0.3,
                reflectiveness: 0.6,
                adaptability: 0.95,
            },
            BehaviorMode::Neutral => BehaviorProfile {
                mode: self.clone(),
                assertiveness: 0.5,
                warmth: 0.6,
                directiveness: 0.5,
                reflectiveness: 0.6,
                adaptability: 0.7,
            },
        }
    }
}

/// Profil comportemental complet
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BehaviorProfile {
    /// Mode comportemental actif
    pub mode: BehaviorMode,
    /// Niveau d'assertivité (0.0 = passif, 1.0 = très assertif)
    pub assertiveness: f32,
    /// Niveau de chaleur (0.0 = distant, 1.0 = très chaleureux)
    pub warmth: f32,
    /// Niveau de directivité (0.0 = suggestif, 1.0 = directif)
    pub directiveness: f32,
    /// Niveau de réflexivité (0.0 = réactif, 1.0 = très réfléchi)
    pub reflectiveness: f32,
    /// Niveau d'adaptabilité (0.0 = rigide, 1.0 = très adaptable)
    pub adaptability: f32,
}

impl Default for BehaviorProfile {
    fn default() -> Self {
        BehaviorMode::Neutral.default_profile()
    }
}

impl BehaviorProfile {
    /// Crée un nouveau profil avec le mode spécifié
    pub fn new(mode: BehaviorMode) -> Self {
        mode.default_profile()
    }

    /// Applique un clamp sur toutes les valeurs (0.0 - 1.0)
    pub fn clamp_all(&mut self) {
        self.assertiveness = self.assertiveness.clamp(0.0, 1.0);
        self.warmth = self.warmth.clamp(0.0, 1.0);
        self.directiveness = self.directiveness.clamp(0.0, 1.0);
        self.reflectiveness = self.reflectiveness.clamp(0.0, 1.0);
        self.adaptability = self.adaptability.clamp(0.0, 1.0);
    }

    /// Calcule un score de stabilité comportementale
    pub fn stability_score(&self) -> f32 {
        let variance = self.compute_variance();
        1.0 - variance.min(1.0)
    }

    /// Calcule la variance des paramètres
    fn compute_variance(&self) -> f32 {
        let values = [
            self.assertiveness,
            self.warmth,
            self.directiveness,
            self.reflectiveness,
            self.adaptability,
        ];
        let mean = values.iter().sum::<f32>() / values.len() as f32;
        let variance = values.iter().map(|v| (v - mean).powi(2)).sum::<f32>() / values.len() as f32;
        variance.sqrt()
    }

    /// Fusionne deux profils avec un ratio
    pub fn blend(&self, other: &BehaviorProfile, ratio: f32) -> BehaviorProfile {
        let r = ratio.clamp(0.0, 1.0);
        let inv = 1.0 - r;

        BehaviorProfile {
            mode: if r > 0.5 {
                other.mode.clone()
            } else {
                self.mode.clone()
            },
            assertiveness: self.assertiveness * inv + other.assertiveness * r,
            warmth: self.warmth * inv + other.warmth * r,
            directiveness: self.directiveness * inv + other.directiveness * r,
            reflectiveness: self.reflectiveness * inv + other.reflectiveness * r,
            adaptability: self.adaptability * inv + other.adaptability * r,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_profile() {
        let profile = BehaviorProfile::default();
        assert_eq!(profile.mode, BehaviorMode::Neutral);
        assert!(profile.warmth >= 0.0 && profile.warmth <= 1.0);
    }

    #[test]
    fn test_mode_profiles() {
        let coach = BehaviorMode::Coach.default_profile();
        assert!(coach.warmth > 0.7);

        let analyst = BehaviorMode::Analyst.default_profile();
        assert!(analyst.reflectiveness > 0.8);
    }

    #[test]
    fn test_blend() {
        let p1 = BehaviorMode::Coach.default_profile();
        let p2 = BehaviorMode::Analyst.default_profile();
        let blended = p1.blend(&p2, 0.5);

        assert!(blended.warmth < p1.warmth);
        assert!(blended.warmth > p2.warmth);
    }

    #[test]
    fn test_stability_score() {
        let profile = BehaviorProfile::default();
        let score = profile.stability_score();
        assert!((0.0..=1.0).contains(&score));
    }
}
