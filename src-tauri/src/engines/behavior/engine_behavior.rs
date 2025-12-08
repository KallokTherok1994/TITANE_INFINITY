//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — BEHAVIOR ENGINE
//! Cœur du moteur comportemental
//! ═══════════════════════════════════════════════════════════════════════════════

use super::{BehaviorMode, BehaviorProfile, BehaviorRules, BehaviorState};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Types d'intention détectés
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum Intent {
    Question,
    FollowUp,
    Creation,
    Analysis,
    Action,
    Clarification,
    Meta,
    Unknown,
}

/// Signal émotionnel détecté
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EmotionSignal {
    pub primary: EmotionType,
    pub intensity: f32,
    pub confidence: f32,
}

impl Default for EmotionSignal {
    fn default() -> Self {
        Self {
            primary: EmotionType::Neutral,
            intensity: 0.5,
            confidence: 0.8,
        }
    }
}

/// Types d'émotions
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum EmotionType {
    Joy,
    Stress,
    Confusion,
    Curiosity,
    Frustration,
    Satisfaction,
    Neutral,
}

/// Input pour le moteur comportemental
#[derive(Clone, Debug)]
pub struct BehaviorInput {
    pub message: String,
    pub intent: Intent,
    pub emotion: EmotionSignal,
    pub context_length: usize,
    pub session_duration_ms: u64,
}

/// Output du moteur comportemental
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BehaviorOutput {
    pub profile: BehaviorProfile,
    pub adjustments: Vec<String>,
    pub stability_score: f32,
}

/// Moteur comportemental TITANE∞
pub struct BehaviorEngine {
    profile: Arc<RwLock<BehaviorProfile>>,
    rules: BehaviorRules,
    state: Arc<RwLock<BehaviorState>>,
}

impl BehaviorEngine {
    /// Crée un nouveau moteur comportemental
    pub fn new() -> Self {
        Self {
            profile: Arc::new(RwLock::new(BehaviorProfile::default())),
            rules: BehaviorRules::default(),
            state: Arc::new(RwLock::new(BehaviorState::default())),
        }
    }

    /// Crée avec des règles personnalisées
    pub fn with_rules(rules: BehaviorRules) -> Self {
        Self {
            profile: Arc::new(RwLock::new(BehaviorProfile::default())),
            rules,
            state: Arc::new(RwLock::new(BehaviorState::default())),
        }
    }

    /// Traite un input et retourne le profil ajusté
    pub async fn process(&self, input: BehaviorInput) -> BehaviorOutput {
        let mut profile = self.profile.read().await.clone();
        let mut state = self.state.write().await;
        let mut adjustments = Vec::new();

        // 1. Ajuster selon l'intention utilisateur
        let (adjusted_profile, intent_adj) = self.adjust_for_intent(profile, &input.intent);
        profile = adjusted_profile;
        if let Some(adj) = intent_adj {
            adjustments.push(adj);
        }

        // 2. Ajuster selon les signaux émotionnels
        let (adjusted_profile, emotion_adj) = self.adjust_for_emotion(profile, &input.emotion);
        profile = adjusted_profile;
        if let Some(adj) = emotion_adj {
            adjustments.push(adj);
        }

        // 3. Régulation dynamique interne
        profile = self.apply_internal_regulation(profile, &mut state);

        // 4. Enregistrer l'état
        if !adjustments.is_empty() && state.can_adjust(self.rules.adjustment_cooldown_ms) {
            state.record_adjustment(&adjustments.join(", "), profile.mode.clone());
        }

        // 5. Mettre à jour le profil global
        *self.profile.write().await = profile.clone();

        BehaviorOutput {
            profile,
            adjustments,
            stability_score: state.stability,
        }
    }

    /// Ajustement selon l'intention
    fn adjust_for_intent(
        &self,
        mut profile: BehaviorProfile,
        intent: &Intent,
    ) -> (BehaviorProfile, Option<String>) {
        let adjustment = match intent {
            Intent::FollowUp => {
                profile.warmth += 0.1;
                profile.reflectiveness += 0.1;
                Some("FollowUp: +warmth, +reflectiveness".to_string())
            }
            Intent::Creation => {
                profile.adaptability += 0.2;
                profile.directiveness -= 0.1;
                Some("Creation: +adaptability, -directiveness".to_string())
            }
            Intent::Analysis => {
                profile.reflectiveness += 0.3;
                profile.directiveness -= 0.1;
                Some("Analysis: +reflectiveness".to_string())
            }
            Intent::Action => {
                profile.directiveness += 0.3;
                profile.assertiveness += 0.2;
                Some("Action: +directiveness, +assertiveness".to_string())
            }
            Intent::Clarification => {
                profile.warmth += 0.15;
                profile.reflectiveness += 0.2;
                Some("Clarification: +warmth, +reflectiveness".to_string())
            }
            Intent::Meta => {
                profile.reflectiveness += 0.25;
                profile.mode = BehaviorMode::Meta;
                Some("Meta: mode switch, +reflectiveness".to_string())
            }
            _ => None,
        };

        profile.clamp_all();
        (profile, adjustment)
    }

    /// Ajustement selon l'émotion
    fn adjust_for_emotion(
        &self,
        mut profile: BehaviorProfile,
        emotion: &EmotionSignal,
    ) -> (BehaviorProfile, Option<String>) {
        let intensity = emotion.intensity * emotion.confidence;

        let adjustment = match emotion.primary {
            EmotionType::Stress => {
                profile.warmth += 0.2 * intensity;
                profile.assertiveness -= 0.1 * intensity;
                Some(format!("Stress detected: +warmth ({})", intensity))
            }
            EmotionType::Joy => {
                profile.adaptability += 0.1 * intensity;
                profile.warmth += 0.05 * intensity;
                Some("Joy: +adaptability".to_string())
            }
            EmotionType::Confusion => {
                profile.reflectiveness += 0.3 * intensity;
                profile.directiveness += 0.1 * intensity;
                profile.warmth += 0.1 * intensity;
                Some("Confusion: +reflectiveness, +directiveness".to_string())
            }
            EmotionType::Frustration => {
                profile.warmth += 0.25 * intensity;
                profile.assertiveness -= 0.15 * intensity;
                profile.directiveness += 0.1 * intensity;
                Some("Frustration: +warmth, +directiveness".to_string())
            }
            EmotionType::Curiosity => {
                profile.adaptability += 0.15 * intensity;
                profile.reflectiveness += 0.1 * intensity;
                Some("Curiosity: +adaptability".to_string())
            }
            _ => None,
        };

        profile.clamp_all();
        (profile, adjustment)
    }

    /// Régulation interne (stabilisation)
    fn apply_internal_regulation(
        &self,
        mut profile: BehaviorProfile,
        state: &mut BehaviorState,
    ) -> BehaviorProfile {
        // Appliquer les limites des règles
        profile.warmth = self.rules.clamp_warmth(profile.warmth);
        profile.assertiveness = self.rules.clamp_assertiveness(profile.assertiveness);

        // Stabilisation selon fluctuation
        profile.adaptability *= 1.0 - state.fluctuation * 0.5;

        // Boost réflexivité pour modes méta/analyst
        if matches!(profile.mode, BehaviorMode::Meta | BehaviorMode::Analyst) {
            profile.reflectiveness += self.rules.reflection_boost;
        }

        // Mise à jour de la stabilité
        state.update_stability(0.02);
        state.decay_fluctuation(0.05);

        // Calcul cohérence
        let coherence = profile.stability_score();
        state.update_coherence(coherence);

        profile.clamp_all();
        profile
    }

    /// Récupère le profil actuel
    pub async fn get_profile(&self) -> BehaviorProfile {
        self.profile.read().await.clone()
    }

    /// Récupère l'état actuel
    pub async fn get_state(&self) -> BehaviorState {
        self.state.read().await.clone()
    }

    /// Change de mode manuellement
    pub async fn set_mode(&self, mode: BehaviorMode) {
        let mut profile = self.profile.write().await;
        *profile = mode.default_profile();
    }

    /// Réinitialise le moteur
    pub async fn reset(&self) {
        *self.profile.write().await = BehaviorProfile::default();
        *self.state.write().await = BehaviorState::default();
    }
}

impl Default for BehaviorEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_behavior_engine_creation() {
        let engine = BehaviorEngine::new();
        let profile = engine.get_profile().await;
        assert_eq!(profile.mode, BehaviorMode::Neutral);
    }

    #[tokio::test]
    async fn test_process_with_intent() {
        let engine = BehaviorEngine::new();
        let input = BehaviorInput {
            message: "Analyse ce code".to_string(),
            intent: Intent::Analysis,
            emotion: EmotionSignal::default(),
            context_length: 100,
            session_duration_ms: 5000,
        };

        let output = engine.process(input).await;
        assert!(output.profile.reflectiveness > 0.6);
        assert!(!output.adjustments.is_empty());
    }

    #[tokio::test]
    async fn test_process_with_emotion() {
        let engine = BehaviorEngine::new();
        let input = BehaviorInput {
            message: "Je suis perdu...".to_string(),
            intent: Intent::Question,
            emotion: EmotionSignal {
                primary: EmotionType::Confusion,
                intensity: 0.8,
                confidence: 0.9,
            },
            context_length: 50,
            session_duration_ms: 3000,
        };

        let output = engine.process(input).await;
        assert!(output.profile.warmth > 0.6);
    }

    #[tokio::test]
    async fn test_mode_change() {
        let engine = BehaviorEngine::new();
        engine.set_mode(BehaviorMode::Coach).await;

        let profile = engine.get_profile().await;
        assert_eq!(profile.mode, BehaviorMode::Coach);
        assert!(profile.warmth > 0.8);
    }
}
