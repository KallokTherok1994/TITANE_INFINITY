// Copyright © 2025 TITANE∞ — BodyPostureAI v24
// License: Proprietary — TITANE OS
// Module: AI-Driven Posture Adaptation

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

use super::fullbody_engine::SkeletonModel;

// ═══════════════════════════════════════════════════════════════════════════
// POSTURE DEFINITIONS — 5 postures dynamiques
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PostureType {
    /// Posture Professionnelle (assis, dos droit, épaules ouvertes)
    Professional,

    /// Posture Engagée (léger lean-in, énergie active)
    Engaged,

    /// Posture Calme (épaules relâchées, respiration lente)
    Calm,

    /// Posture Créative (gestuelle plus large et expressive)
    Creative,

    /// Posture Accueil (sourire, ouverture corporelle)
    Welcoming,
}

#[derive(Debug, Clone)]
pub struct PostureConfiguration {
    pub posture_type: PostureType,
    pub spine_alignment: f32,      // -1.0 (penché arrière) → 1.0 (penché avant)
    pub shoulder_openness: f32,    // 0.0 (fermé) → 1.0 (ouvert)
    pub arm_activity: f32,         // 0.0 (repos) → 1.0 (très expressif)
    pub energy_level: f32,         // 0.0 (calme) → 1.0 (dynamique)
    pub breathing_rate: f32,       // 0.5 (lent) → 1.5 (rapide)
}

impl PostureConfiguration {
    /// Posture Professionnelle
    pub fn professional() -> Self {
        Self {
            posture_type: PostureType::Professional,
            spine_alignment: 0.0,      // Droit, neutre
            shoulder_openness: 0.8,    // Épaules ouvertes
            arm_activity: 0.3,         // Mouvements contrôlés
            energy_level: 0.6,         // Énergie modérée
            breathing_rate: 1.0,       // Respiration normale
        }
    }

    /// Posture Engagée
    pub fn engaged() -> Self {
        Self {
            posture_type: PostureType::Engaged,
            spine_alignment: 0.2,      // Léger lean-in
            shoulder_openness: 0.9,    // Très ouvert
            arm_activity: 0.7,         // Gestuelle active
            energy_level: 0.85,        // Haute énergie
            breathing_rate: 1.2,       // Respiration légèrement accélérée
        }
    }

    /// Posture Calme
    pub fn calm() -> Self {
        Self {
            posture_type: PostureType::Calm,
            spine_alignment: -0.05,    // Légèrement en retrait
            shoulder_openness: 0.6,    // Épaules relâchées
            arm_activity: 0.2,         // Mouvements minimaux
            energy_level: 0.4,         // Basse énergie
            breathing_rate: 0.7,       // Respiration lente
        }
    }

    /// Posture Créative
    pub fn creative() -> Self {
        Self {
            posture_type: PostureType::Creative,
            spine_alignment: 0.1,      // Légère inclinaison
            shoulder_openness: 0.85,   // Ouvert
            arm_activity: 0.9,         // Très expressif
            energy_level: 0.75,        // Énergie créative
            breathing_rate: 1.1,       // Respiration dynamique
        }
    }

    /// Posture Accueil
    pub fn welcoming() -> Self {
        Self {
            posture_type: PostureType::Welcoming,
            spine_alignment: 0.05,     // Légèrement vers avant
            shoulder_openness: 1.0,    // Complètement ouvert
            arm_activity: 0.5,         // Gestuelle accueillante
            energy_level: 0.7,         // Énergie chaleureuse
            breathing_rate: 1.0,       // Respiration normale
        }
    }

    /// Appliquer configuration au skeleton
    pub fn apply_to_skeleton(&self, skeleton: &mut SkeletonModel) {
        // Ajuster spine alignment
        if let Some(spine_upper) = skeleton.bones.get_mut("spine_upper") {
            let lean_angle = self.spine_alignment * 0.1; // Max ±10° rotation
            spine_upper.rotation[0] = lean_angle;
        }

        // Ajuster largeur épaules
        let shoulder_offset = 0.18 * self.shoulder_openness;
        if let Some(shoulder_left) = skeleton.bones.get_mut("shoulder_left") {
            shoulder_left.position[0] = -shoulder_offset;
        }
        if let Some(shoulder_right) = skeleton.bones.get_mut("shoulder_right") {
            shoulder_right.position[0] = shoulder_offset;
        }

        // Ajuster position bras (arm_activity influence repos vs. expressif)
        if let Some(upper_arm_left) = skeleton.bones.get_mut("upper_arm_left") {
            let arm_angle = -0.2 + (self.arm_activity * 0.3);
            upper_arm_left.rotation[1] = arm_angle;
        }
        if let Some(upper_arm_right) = skeleton.bones.get_mut("upper_arm_right") {
            let arm_angle = 0.2 - (self.arm_activity * 0.3);
            upper_arm_right.rotation[1] = arm_angle;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVERSATIONAL CONTEXT — Analyse du contexte pour sélection posture
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationalContext {
    pub user_engagement: f32,      // 0.0–1.0 (détecté via durée interaction)
    pub topic_complexity: f32,     // 0.0–1.0 (détecté via cognitive_load)
    pub emotional_valence: f32,    // -1.0 (négatif) → 1.0 (positif)
    pub conversation_phase: String, // "opening" | "middle" | "closing" | "brainstorm"
    pub recent_gestures: VecDeque<String>, // Historique gestes (éviter répétitions)
}

impl Default for ConversationalContext {
    fn default() -> Self {
        Self {
            user_engagement: 0.5,
            topic_complexity: 0.3,
            emotional_valence: 0.0,
            conversation_phase: "opening".to_string(),
            recent_gestures: VecDeque::with_capacity(10),
        }
    }
}

impl ConversationalContext {
    /// Mettre à jour engagement utilisateur
    pub fn update_engagement(&mut self, engagement: f32) {
        self.user_engagement = engagement.clamp(0.0, 1.0);
    }

    /// Mettre à jour complexité du sujet
    pub fn update_complexity(&mut self, complexity: f32) {
        self.topic_complexity = complexity.clamp(0.0, 1.0);
    }

    /// Enregistrer geste utilisé (éviter répétitions)
    pub fn record_gesture(&mut self, gesture_name: String) {
        self.recent_gestures.push_back(gesture_name);
        if self.recent_gestures.len() > 10 {
            self.recent_gestures.pop_front();
        }
    }

    /// Vérifier si geste a été récemment utilisé
    pub fn is_gesture_recent(&self, gesture_name: &str) -> bool {
        self.recent_gestures.iter().any(|g| g == gesture_name)
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// BODY POSTURE AI — Sélection intelligente de posture
// ═══════════════════════════════════════════════════════════════════════════

pub struct BodyPostureAI {
    pub current_posture: PostureConfiguration,
    pub context: ConversationalContext,
    pub posture_history: VecDeque<PostureType>,
    pub stability_counter: u32, // Éviter changements trop fréquents
}

impl BodyPostureAI {
    pub fn new() -> Self {
        Self {
            current_posture: PostureConfiguration::professional(),
            context: ConversationalContext::default(),
            posture_history: VecDeque::with_capacity(5),
            stability_counter: 0,
        }
    }

    /// Analyser contexte et sélectionner posture optimale
    pub fn select_optimal_posture(&mut self) -> PostureConfiguration {
        // Stabilité: ne changer que si counter > seuil (éviter jitter)
        if self.stability_counter < 180 { // ~3 secondes à 60 FPS
            self.stability_counter += 1;
            return self.current_posture.clone();
        }

        let new_posture = self.compute_posture_from_context();

        // Vérifier si changement nécessaire
        if new_posture != self.current_posture.posture_type {
            self.current_posture = match new_posture {
                PostureType::Professional => PostureConfiguration::professional(),
                PostureType::Engaged => PostureConfiguration::engaged(),
                PostureType::Calm => PostureConfiguration::calm(),
                PostureType::Creative => PostureConfiguration::creative(),
                PostureType::Welcoming => PostureConfiguration::welcoming(),
            };

            self.posture_history.push_back(new_posture);
            if self.posture_history.len() > 5 {
                self.posture_history.pop_front();
            }

            self.stability_counter = 0; // Reset counter
        }

        self.current_posture.clone()
    }

    /// Calculer posture basée sur contexte
    fn compute_posture_from_context(&self) -> PostureType {
        let ctx = &self.context;

        // Règles de décision (heuristiques)

        // Phase d'ouverture → Welcoming
        if ctx.conversation_phase == "opening" {
            return PostureType::Welcoming;
        }

        // Phase brainstorm → Creative
        if ctx.conversation_phase == "brainstorm" {
            return PostureType::Creative;
        }

        // Haute complexité + haut engagement → Professional
        if ctx.topic_complexity > 0.6 && ctx.user_engagement > 0.7 {
            return PostureType::Professional;
        }

        // Haut engagement + valence positive → Engaged
        if ctx.user_engagement > 0.7 && ctx.emotional_valence > 0.3 {
            return PostureType::Engaged;
        }

        // Faible engagement + haute complexité → Calm (éviter surcharge)
        if ctx.user_engagement < 0.4 && ctx.topic_complexity > 0.5 {
            return PostureType::Calm;
        }

        // Phase de clôture → Welcoming
        if ctx.conversation_phase == "closing" {
            return PostureType::Welcoming;
        }

        // Default: Professional
        PostureType::Professional
    }

    /// Mettre à jour contexte conversationnel
    pub fn update_context(&mut self, context: ConversationalContext) {
        self.context = context;
    }

    /// Appliquer posture courante au skeleton
    pub fn apply_to_skeleton(&self, skeleton: &mut SkeletonModel) {
        self.current_posture.apply_to_skeleton(skeleton);
    }

    /// Suggérer geste basé sur posture courante
    pub fn suggest_gesture(&self) -> Option<String> {
        match self.current_posture.posture_type {
            PostureType::Professional => Some("listening".to_string()),
            PostureType::Engaged => Some("explaining".to_string()),
            PostureType::Calm => Some("idle_cycle".to_string()),
            PostureType::Creative => Some("explaining".to_string()),
            PostureType::Welcoming => Some("smiling_warm".to_string()),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_posture_configurations() {
        let pro = PostureConfiguration::professional();
        assert_eq!(pro.posture_type, PostureType::Professional);
        assert_eq!(pro.spine_alignment, 0.0);
        assert!(pro.shoulder_openness > 0.7);

        let engaged = PostureConfiguration::engaged();
        assert_eq!(engaged.posture_type, PostureType::Engaged);
        assert!(engaged.energy_level > 0.8);
    }

    #[test]
    fn test_posture_ai_selection() {
        let mut ai = BodyPostureAI::new();

        // Context: haute complexité + haut engagement → Professional
        let mut ctx = ConversationalContext::default();
        ctx.topic_complexity = 0.8;
        ctx.user_engagement = 0.9;
        ai.update_context(ctx);

        ai.stability_counter = 200; // Force sélection
        let posture = ai.select_optimal_posture();
        assert_eq!(posture.posture_type, PostureType::Professional);
    }

    #[test]
    fn test_gesture_history() {
        let mut ctx = ConversationalContext::default();
        ctx.record_gesture("listening".to_string());
        ctx.record_gesture("explaining".to_string());

        assert!(ctx.is_gesture_recent("listening"));
        assert!(!ctx.is_gesture_recent("thinking"));
    }
}
