use crate::cognitive::{BodyState, HeartState, MentalState};
use serde::{Deserialize, Serialize};

/// État cognitif global unifiant les trois centres
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveState {
    /// Centre Mental
    pub mental: MentalState,

    /// Centre Cœur
    pub heart: HeartState,

    /// Centre Corps
    pub body: BodyState,

    /// Scores de cohérence inter-centres
    pub coherence: CenterCoherence,

    /// Timestamp de l'état (ms since epoch)
    pub timestamp: u64,
}

impl Default for CognitiveState {
    fn default() -> Self {
        Self {
            mental: MentalState::default(),
            heart: HeartState::default(),
            body: BodyState::default(),
            coherence: CenterCoherence::default(),
            timestamp: crate::core::utils::now_ms(),
        }
    }
}

impl CognitiveState {
    /// Crée un nouvel état avec timestamp actuel
    pub fn new() -> Self {
        Self::default()
    }

    /// Met à jour la cohérence inter-centres
    pub fn update_coherence(&mut self) {
        self.coherence = CenterCoherence::compute(&self.mental, &self.heart, &self.body);
    }

    /// Vérifie si système en état critique (besoin intervention)
    pub fn is_critical(&self) -> bool {
        self.mental.charge.is_overloaded()
            || self.heart.is_misaligned()
            || self.body.is_depleted()
            || self.coherence.global < 0.3
    }

    /// Vérifie si système en flow (optimal)
    pub fn is_in_flow(&self) -> bool {
        self.mental.charge.current > 0.5
            && self.mental.charge.current < 0.8
            && self.heart.is_aligned()
            && self.body.vitality_score() > 0.6
            && self.coherence.global > 0.7
    }

    /// Génère recommandations système
    pub fn generate_recommendations(&self) -> Vec<SystemRecommendation> {
        let mut recommendations = Vec::new();

        // Mental surchargé
        if self.mental.charge.is_overloaded() {
            recommendations.push(SystemRecommendation::ReduceMentalLoad {
                reason: "Charge cognitive au-delà de la capacité".into(),
            });
        }

        // Cœur désaligné
        if self.heart.is_misaligned() {
            recommendations.push(SystemRecommendation::CheckHeartAlignment {
                reason: "Désalignement entre tâche et désir détecté".into(),
            });
        }

        // Corps épuisé
        if self.body.is_depleted() {
            recommendations.push(SystemRecommendation::PhysicalBreak {
                duration_secs: 600, // 10 min
                reason: "Énergie corporelle critique".into(),
            });
        }

        // Cohérence faible
        if self.coherence.global < 0.4 {
            recommendations.push(SystemRecommendation::CenteringExercise {
                exercise: "Respiration profonde + scan des 3 centres".into(),
            });
        }

        // Flow détecté
        if self.is_in_flow() {
            recommendations.push(SystemRecommendation::MaintainFlow {
                message: "Excellent état de flow! Minimiser interruptions.".into(),
            });
        }

        recommendations
    }
}

/// Cohérence entre les trois centres
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CenterCoherence {
    pub mental_heart: f32, // 0.0 → 1.0
    pub heart_body: f32,
    pub body_mental: f32,
    pub global: f32, // moyenne des trois
}

impl Default for CenterCoherence {
    fn default() -> Self {
        Self {
            mental_heart: 0.5,
            heart_body: 0.5,
            body_mental: 0.5,
            global: 0.5,
        }
    }
}

impl CenterCoherence {
    /// Calcule la cohérence entre les trois centres
    pub fn compute(mental: &MentalState, heart: &HeartState, body: &BodyState) -> Self {
        // Mental-Cœur: charge mentale alignée avec motivation/alignement
        let mental_heart = if mental.charge.current > 0.7 {
            // Si charge élevée, besoin alignement fort
            heart.alignment * 0.7 + heart.motivation * 0.3
        } else {
            // Charge normale, cohérence par défaut
            0.7
        };

        // Cœur-Corps: alignement cœur vs énergie corps
        let heart_body = if heart.alignment > 0.7 {
            // Si alignement fort, besoin d'énergie pour soutenir
            body.energy_level
        } else {
            // Alignement faible, corps peut compenser
            0.5 + (body.vitality_score() * 0.5)
        };

        // Corps-Mental: énergie corps vs charge mentale
        let body_mental = if body.energy_level > 0.6 {
            // Énergie suffisante pour charge mentale
            1.0 - (mental.charge.current - body.energy_level).abs()
        } else {
            // Énergie faible, charge devrait être basse
            if mental.charge.current < 0.4 {
                0.8 // Cohérent: faible énergie, faible charge
            } else {
                0.3 // Incohérent: faible énergie, haute charge
            }
        };

        let global = (mental_heart + heart_body + body_mental) / 3.0;

        Self {
            mental_heart: mental_heart.clamp(0.0, 1.0),
            heart_body: heart_body.clamp(0.0, 1.0),
            body_mental: body_mental.clamp(0.0, 1.0),
            global: global.clamp(0.0, 1.0),
        }
    }
}

/// Recommandations système basées sur état cognitif
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SystemRecommendation {
    ReduceMentalLoad {
        reason: String,
    },
    CheckHeartAlignment {
        reason: String,
    },
    PhysicalBreak {
        duration_secs: u64,
        reason: String,
    },
    CenteringExercise {
        exercise: String,
    },
    MaintainFlow {
        message: String,
    },
    SwitchMode {
        from_mode: String,
        to_mode: String,
        reason: String,
    },
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cognitive_state_creation() {
        let state = CognitiveState::new();

        assert!(state.mental.charge.current >= 0.0);
        assert!(state.heart.alignment >= 0.0);
        assert!(state.body.energy_level >= 0.0);
    }

    #[test]
    fn test_cognitive_state_critical() {
        let mut state = CognitiveState::new();

        // Surcharge mentale
        state.mental.charge.current = 1.0;
        state.mental.charge.capacity = 0.8;
        assert!(state.is_critical());

        // Désalignement cœur
        state = CognitiveState::new();
        state.heart.alignment = 0.1;
        assert!(state.is_critical());

        // Épuisement corps
        state = CognitiveState::new();
        state.body.energy_level = 0.1;
        assert!(state.is_critical());

        // Cohérence faible
        state = CognitiveState::new();
        state.coherence.global = 0.2;
        assert!(state.is_critical());
    }

    #[test]
    fn test_cognitive_state_flow() {
        let mut state = CognitiveState::new();

        state.mental.charge.current = 0.6;
        state.heart.alignment = 0.9;
        state.body.energy_level = 0.8;
        state.body.physical_tension = 0.2;
        state.coherence.global = 0.8;

        assert!(state.is_in_flow());
    }

    #[test]
    fn test_coherence_computation() {
        let mut mental = MentalState::default();
        let mut heart = HeartState::default();
        let mut body = BodyState::default();

        // Cas optimal
        mental.charge.current = 0.6;
        heart.alignment = 0.9;
        heart.motivation = 0.9;
        body.energy_level = 0.8;

        let coherence = CenterCoherence::compute(&mental, &heart, &body);
        assert!(coherence.global > 0.6);

        // Cas incohérent: charge élevée + alignement faible
        mental.charge.current = 0.9;
        heart.alignment = 0.2;
        heart.motivation = 0.3;

        let coherence = CenterCoherence::compute(&mental, &heart, &body);
        assert!(coherence.mental_heart < 0.5);

        // Cas incohérent: énergie faible + charge élevée
        body.energy_level = 0.2;
        mental.charge.current = 0.9;

        let coherence = CenterCoherence::compute(&mental, &heart, &body);
        assert!(coherence.body_mental < 0.5);
    }

    #[test]
    fn test_recommendations_generation() {
        let mut state = CognitiveState::new();

        // Surcharge mentale
        state.mental.charge.current = 1.0;
        state.mental.charge.capacity = 0.8;

        let recs = state.generate_recommendations();
        assert!(recs
            .iter()
            .any(|r| matches!(r, SystemRecommendation::ReduceMentalLoad { .. })));

        // Flow
        state = CognitiveState::new();
        state.mental.charge.current = 0.6;
        state.heart.alignment = 0.9;
        state.body.energy_level = 0.8;
        state.coherence.global = 0.8;

        let recs = state.generate_recommendations();
        assert!(recs
            .iter()
            .any(|r| matches!(r, SystemRecommendation::MaintainFlow { .. })));

        // Corps épuisé
        state = CognitiveState::new();
        state.body.energy_level = 0.1;

        let recs = state.generate_recommendations();
        assert!(recs
            .iter()
            .any(|r| matches!(r, SystemRecommendation::PhysicalBreak { .. })));
    }

    #[test]
    fn test_update_coherence() {
        let mut state = CognitiveState::new();

        state.mental.charge.current = 0.9;
        state.heart.alignment = 0.2;

        state.update_coherence();

        assert!(state.coherence.mental_heart < 0.5);
    }

    #[test]
    fn test_cognitive_state_default() {
        let state = CognitiveState::default();
        assert!(state.timestamp > 0);
        assert_eq!(state.coherence.global, 0.5);
    }

    #[test]
    fn test_cognitive_state_clone() {
        let state = CognitiveState::new();
        let cloned = state.clone();
        assert_eq!(cloned.coherence.global, state.coherence.global);
    }

    #[test]
    fn test_cognitive_state_debug() {
        let state = CognitiveState::new();
        let debug_str = format!("{:?}", state);
        assert!(debug_str.contains("CognitiveState"));
    }

    #[test]
    fn test_center_coherence_default() {
        let coherence = CenterCoherence::default();
        assert_eq!(coherence.mental_heart, 0.5);
        assert_eq!(coherence.heart_body, 0.5);
        assert_eq!(coherence.body_mental, 0.5);
        assert_eq!(coherence.global, 0.5);
    }

    #[test]
    fn test_center_coherence_clone() {
        let coherence = CenterCoherence::default();
        let cloned = coherence.clone();
        assert_eq!(cloned.global, coherence.global);
    }

    #[test]
    fn test_center_coherence_debug() {
        let coherence = CenterCoherence::default();
        let debug_str = format!("{:?}", coherence);
        assert!(debug_str.contains("CenterCoherence"));
    }

    #[test]
    fn test_system_recommendation_variants() {
        let rec1 = SystemRecommendation::ReduceMentalLoad {
            reason: "test".to_string(),
        };
        let rec2 = SystemRecommendation::CheckHeartAlignment {
            reason: "test".to_string(),
        };
        let rec3 = SystemRecommendation::PhysicalBreak {
            duration_secs: 300,
            reason: "test".to_string(),
        };
        let rec4 = SystemRecommendation::CenteringExercise {
            exercise: "test".to_string(),
        };
        let rec5 = SystemRecommendation::MaintainFlow {
            message: "test".to_string(),
        };
        let rec6 = SystemRecommendation::SwitchMode {
            from_mode: "A".to_string(),
            to_mode: "B".to_string(),
            reason: "test".to_string(),
        };

        // Just ensure they can be created
        let _ = format!("{:?}", rec1);
        let _ = format!("{:?}", rec2);
        let _ = format!("{:?}", rec3);
        let _ = format!("{:?}", rec4);
        let _ = format!("{:?}", rec5);
        let _ = format!("{:?}", rec6);
    }

    #[test]
    fn test_system_recommendation_clone() {
        let rec = SystemRecommendation::MaintainFlow {
            message: "Excellent flow!".to_string(),
        };
        let cloned = rec.clone();
        if let SystemRecommendation::MaintainFlow { message } = cloned {
            assert_eq!(message, "Excellent flow!");
        }
    }

    #[test]
    fn test_cognitive_state_not_critical_when_normal() {
        let state = CognitiveState::new();
        // Default state should not be critical
        assert!(!state.is_critical());
    }

    #[test]
    fn test_cognitive_state_not_in_flow_by_default() {
        let state = CognitiveState::new();
        // Default state typically not in flow
        assert!(!state.is_in_flow());
    }

    #[test]
    fn test_coherence_clamping() {
        let mut mental = MentalState::default();
        let mut heart = HeartState::default();
        let body = BodyState::default();

        // Set extreme values
        mental.charge.current = 10.0; // Way over
        heart.alignment = -5.0; // Way under
        heart.motivation = 2.0; // Over

        let coherence = CenterCoherence::compute(&mental, &heart, &body);

        // All values should be clamped to 0.0-1.0
        assert!(coherence.mental_heart >= 0.0 && coherence.mental_heart <= 1.0);
        assert!(coherence.heart_body >= 0.0 && coherence.heart_body <= 1.0);
        assert!(coherence.body_mental >= 0.0 && coherence.body_mental <= 1.0);
        assert!(coherence.global >= 0.0 && coherence.global <= 1.0);
    }

    #[test]
    fn test_recommendations_heart_misaligned() {
        let mut state = CognitiveState::new();
        state.heart.alignment = 0.1;

        let recs = state.generate_recommendations();
        assert!(recs
            .iter()
            .any(|r| matches!(r, SystemRecommendation::CheckHeartAlignment { .. })));
    }

    #[test]
    fn test_recommendations_low_coherence() {
        let mut state = CognitiveState::new();
        state.coherence.global = 0.2;

        let recs = state.generate_recommendations();
        assert!(recs
            .iter()
            .any(|r| matches!(r, SystemRecommendation::CenteringExercise { .. })));
    }

    #[test]
    fn test_recommendations_empty_for_normal_state() {
        let state = CognitiveState::new();
        let recs = state.generate_recommendations();
        // Normal state should have few or no recommendations
        assert!(recs.len() <= 2);
    }

    #[test]
    fn test_serialization_cognitive_state() {
        let state = CognitiveState::new();
        let json = serde_json::to_string(&state).unwrap();
        let restored: CognitiveState = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.coherence.global, state.coherence.global);
    }

    #[test]
    fn test_serialization_center_coherence() {
        let coherence = CenterCoherence::default();
        let json = serde_json::to_string(&coherence).unwrap();
        let restored: CenterCoherence = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.global, coherence.global);
    }

    #[test]
    fn test_serialization_system_recommendation() {
        let rec = SystemRecommendation::PhysicalBreak {
            duration_secs: 600,
            reason: "Need rest".to_string(),
        };
        let json = serde_json::to_string(&rec).unwrap();
        let restored: SystemRecommendation = serde_json::from_str(&json).unwrap();
        if let SystemRecommendation::PhysicalBreak { duration_secs, .. } = restored {
            assert_eq!(duration_secs, 600);
        }
    }
}
