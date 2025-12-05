use serde::{Deserialize, Serialize};

/// État du centre cœur (alignement/désir/sens)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeartState {
    pub alignment: f32,           // 0.0 → 1.0 (tâche = désir?)
    pub motivation: f32,          // 0.0 → 1.0
    pub meaning_connection: f32,  // sens perçu
    pub authenticity: f32,        // "deuxième vitesse"
    pub emotional_valence: f32,   // -1.0 → +1.0
    pub emotional_intensity: f32, // 0.0 → 1.0
}

impl Default for HeartState {
    fn default() -> Self {
        Self {
            alignment: 0.5,
            motivation: 0.6,
            meaning_connection: 0.5,
            authenticity: 0.7,
            emotional_valence: 0.0,
            emotional_intensity: 0.3,
        }
    }
}

impl HeartState {
    /// Vérifie si alignement fort (flow)
    pub fn is_aligned(&self) -> bool {
        self.alignment > 0.7
    }

    /// Vérifie si désalignement critique
    pub fn is_misaligned(&self) -> bool {
        self.alignment < 0.3
    }

    /// Vérifie si motivation basse
    pub fn is_unmotivated(&self) -> bool {
        self.motivation < 0.3
    }

    /// Score global de "well-being" cœur
    pub fn wellbeing_score(&self) -> f32 {
        let positive_factors =
            (self.alignment + self.motivation + self.meaning_connection + self.authenticity) / 4.0;

        // Ajuster selon valence émotionnelle
        let emotion_factor = if self.emotional_valence > 0.0 {
            1.0 + (self.emotional_valence * 0.2)
        } else {
            1.0 + (self.emotional_valence * 0.3) // Négatif pèse plus lourd
        };

        (positive_factors * emotion_factor).clamp(0.0, 1.0)
    }
}

/// Recommandation basée sur l'état du cœur
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HeartRecommendation {
    /// La tâche est alignée, continuer
    Continue { reinforcement: String },
    /// Désalignement détecté, proposer pause
    PauseAndReflect { reason: String },
    /// Tâche non-alignée, suggérer changement
    Redirect { suggestion: String },
    /// Fatigue émotionnelle, repos
    EmotionalRest { duration_secs: u64 },
}

impl HeartRecommendation {
    /// Génère recommandation depuis état cœur
    pub fn from_heart_state(state: &HeartState) -> Self {
        // Alignement fort + émotion positive
        if state.alignment > 0.8 && state.emotional_valence > 0.5 {
            return HeartRecommendation::Continue {
                reinforcement: "Excellent flow détecté! Vous êtes dans votre élément.".into(),
            };
        }

        // Désalignement + motivation basse
        if state.is_misaligned() && state.is_unmotivated() {
            return HeartRecommendation::Redirect {
                suggestion:
                    "Cette tâche semble éloignée de vos désirs. Peut-être changer d'activité?"
                        .into(),
            };
        }

        // Émotion négative intense
        if state.emotional_valence < -0.6 && state.emotional_intensity > 0.7 {
            return HeartRecommendation::EmotionalRest {
                duration_secs: 300, // 5 min
            };
        }

        // Alignement moyen mais authenticity faible
        if state.alignment > 0.4 && state.authenticity < 0.4 {
            return HeartRecommendation::PauseAndReflect {
                reason: "Vous semblez faire ce qui est attendu plutôt que ce qui résonne en vous."
                    .into(),
            };
        }

        // Par défaut, continuer
        HeartRecommendation::Continue {
            reinforcement: "Continuez, vous vous en sortez bien.".into(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_heart_state_alignment() {
        let state1 = HeartState {
            alignment: 0.8,
            ..Default::default()
        };

        assert!(state1.is_aligned());
        assert!(!state1.is_misaligned());

        let state2 = HeartState {
            alignment: 0.2,
            ..Default::default()
        };
        assert!(!state2.is_aligned());
        assert!(state2.is_misaligned());
    }

    #[test]
    fn test_heart_state_motivation() {
        let state1 = HeartState {
            motivation: 0.2,
            ..Default::default()
        };

        assert!(state1.is_unmotivated());

        let state2 = HeartState {
            motivation: 0.8,
            ..Default::default()
        };
        assert!(!state2.is_unmotivated());
    }

    #[test]
    fn test_heart_wellbeing_score() {
        // Tout au max + émotion positive
        let state1 = HeartState {
            alignment: 1.0,
            motivation: 1.0,
            meaning_connection: 1.0,
            authenticity: 1.0,
            emotional_valence: 1.0,
            ..Default::default()
        };

        let score = state1.wellbeing_score();
        assert!(score > 0.9);

        // Tout au min + émotion négative
        let state2 = HeartState {
            alignment: 0.0,
            motivation: 0.0,
            meaning_connection: 0.0,
            authenticity: 0.0,
            emotional_valence: -1.0,
            ..Default::default()
        };

        let score = state2.wellbeing_score();
        assert!(score < 0.1);
    }

    #[test]
    fn test_heart_recommendation_flow() {
        let state = HeartState {
            alignment: 0.9,
            emotional_valence: 0.8,
            ..Default::default()
        };

        let rec = HeartRecommendation::from_heart_state(&state);
        assert!(matches!(rec, HeartRecommendation::Continue { .. }));
    }

    #[test]
    fn test_heart_recommendation_redirect() {
        let state = HeartState {
            alignment: 0.2,
            motivation: 0.2,
            ..Default::default()
        };

        let rec = HeartRecommendation::from_heart_state(&state);
        assert!(matches!(rec, HeartRecommendation::Redirect { .. }));
    }

    #[test]
    fn test_heart_recommendation_emotional_rest() {
        let state = HeartState {
            emotional_valence: -0.8,
            emotional_intensity: 0.9,
            ..Default::default()
        };

        let rec = HeartRecommendation::from_heart_state(&state);
        assert!(matches!(rec, HeartRecommendation::EmotionalRest { .. }));
    }

    #[test]
    fn test_heart_recommendation_pause_reflect() {
        let state = HeartState {
            alignment: 0.5,
            authenticity: 0.3,
            ..Default::default()
        };

        let rec = HeartRecommendation::from_heart_state(&state);
        assert!(matches!(rec, HeartRecommendation::PauseAndReflect { .. }));
    }
}
