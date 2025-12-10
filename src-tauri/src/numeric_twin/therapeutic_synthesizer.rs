// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ vΩ∞ — THERAPEUTIC SYNTHESIZER
//   Sous-moteur de synthèse thérapeutique/coach/guide
// ═══════════════════════════════════════════════════════════════════════════

#![allow(dead_code)]

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Synthétiseur thérapeutique - posture coach/guide Kevin
pub struct TherapeuticSynthesizer {
    /// Observations de posture
    posture_observations: Vec<PostureObservation>,
    /// Interventions enregistrées
    interventions: Vec<TherapeuticIntervention>,
    /// Profil thérapeutique actuel
    current_profile: TherapeuticProfile,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostureObservation {
    pub posture_type: PostureType,
    pub quality: f32,
    pub context: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PostureType {
    /// Écoute profonde
    DeepListening,
    /// Guidance non-directive
    NonDirectiveGuidance,
    /// Stabilisation
    Stabilization,
    /// Clarification
    Clarification,
    /// Soutien
    Support,
    /// Recadrage
    Reframing,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TherapeuticIntervention {
    pub intervention_type: InterventionType,
    pub context: String,
    pub effectiveness: f32,
    pub user_feedback: Option<String>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum InterventionType {
    /// Question ouverte
    OpenQuestion,
    /// Reformulation
    Reformulation,
    /// Validation émotionnelle
    EmotionalValidation,
    /// Suggestion douce
    GentleSuggestion,
    /// Silence actif
    ActiveSilence,
    /// Recadrage positif
    PositiveReframing,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TherapeuticProfile {
    /// Score d'écoute profonde
    pub deep_listening_score: f32,
    /// Score de respect du rythme
    pub rhythm_respect_score: f32,
    /// Score de précision du soutien
    pub support_precision_score: f32,
    /// Score de verticalité ancrée
    pub grounded_verticality_score: f32,
    /// Score de guidance non-directive
    pub non_directive_score: f32,
    /// Score global
    pub overall_score: f32,
}

impl Default for TherapeuticProfile {
    fn default() -> Self {
        Self {
            deep_listening_score: 0.85,
            rhythm_respect_score: 0.80,
            support_precision_score: 0.82,
            grounded_verticality_score: 0.78,
            non_directive_score: 0.88,
            overall_score: 0.83,
        }
    }
}

impl TherapeuticSynthesizer {
    pub fn new() -> Self {
        Self {
            posture_observations: Vec::new(),
            interventions: Vec::new(),
            current_profile: TherapeuticProfile::default(),
        }
    }

    /// Observe une posture thérapeutique
    pub fn observe_posture(&mut self, posture_type: PostureType, quality: f32, context: &str) {
        self.posture_observations.push(PostureObservation {
            posture_type,
            quality,
            context: context.to_string(),
            timestamp: Utc::now(),
        });

        self.update_profile();
    }

    /// Enregistre une intervention
    pub fn record_intervention(
        &mut self,
        intervention_type: InterventionType,
        context: &str,
        effectiveness: f32,
        feedback: Option<String>,
    ) {
        self.interventions.push(TherapeuticIntervention {
            intervention_type,
            context: context.to_string(),
            effectiveness,
            user_feedback: feedback,
            timestamp: Utc::now(),
        });
    }

    /// Met à jour le profil thérapeutique
    fn update_profile(&mut self) {
        if self.posture_observations.is_empty() {
            return;
        }

        let recent: Vec<&PostureObservation> =
            self.posture_observations.iter().rev().take(50).collect();

        // Calculer scores par type de posture
        let mut listening_sum = 0.0;
        let mut listening_count = 0;
        let mut guidance_sum = 0.0;
        let mut guidance_count = 0;

        for obs in recent {
            match obs.posture_type {
                PostureType::DeepListening => {
                    listening_sum += obs.quality;
                    listening_count += 1;
                }
                PostureType::NonDirectiveGuidance => {
                    guidance_sum += obs.quality;
                    guidance_count += 1;
                }
                _ => {}
            }
        }

        if listening_count > 0 {
            self.current_profile.deep_listening_score = listening_sum / listening_count as f32;
        }
        if guidance_count > 0 {
            self.current_profile.non_directive_score = guidance_sum / guidance_count as f32;
        }

        // Calculer score global
        self.current_profile.overall_score = (self.current_profile.deep_listening_score
            + self.current_profile.rhythm_respect_score
            + self.current_profile.support_precision_score
            + self.current_profile.grounded_verticality_score
            + self.current_profile.non_directive_score)
            / 5.0;
    }

    /// Recommande une intervention
    pub fn recommend_intervention(&self, context: &str, emotional_state: &str) -> InterventionType {
        let context_lower = context.to_lowercase();
        let emotion_lower = emotional_state.to_lowercase();

        // Stress élevé → validation émotionnelle
        if emotion_lower.contains("stress") || emotion_lower.contains("anxieux") {
            return InterventionType::EmotionalValidation;
        }

        // Confusion → reformulation
        if emotion_lower.contains("confus") || emotion_lower.contains("perdu") {
            return InterventionType::Reformulation;
        }

        // Exploration → question ouverte
        if context_lower.contains("explor") || context_lower.contains("cherche") {
            return InterventionType::OpenQuestion;
        }

        // Négatif → recadrage positif
        if emotion_lower.contains("négatif") || emotion_lower.contains("décourag") {
            return InterventionType::PositiveReframing;
        }

        // Par défaut → suggestion douce
        InterventionType::GentleSuggestion
    }

    /// Obtient le profil actuel
    pub fn get_profile(&self) -> &TherapeuticProfile {
        &self.current_profile
    }
}

impl Default for TherapeuticSynthesizer {
    fn default() -> Self {
        Self::new()
    }
}
