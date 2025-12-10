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
    pub spine_alignment: f32,   // -1.0 (penché arrière) → 1.0 (penché avant)
    pub shoulder_openness: f32, // 0.0 (fermé) → 1.0 (ouvert)
    pub arm_activity: f32,      // 0.0 (repos) → 1.0 (très expressif)
    pub energy_level: f32,      // 0.0 (calme) → 1.0 (dynamique)
    pub breathing_rate: f32,    // 0.5 (lent) → 1.5 (rapide)
}

impl PostureConfiguration {
    /// Posture Professionnelle
    pub fn professional() -> Self {
        Self {
            posture_type: PostureType::Professional,
            spine_alignment: 0.0,   // Droit, neutre
            shoulder_openness: 0.8, // Épaules ouvertes
            arm_activity: 0.3,      // Mouvements contrôlés
            energy_level: 0.6,      // Énergie modérée
            breathing_rate: 1.0,    // Respiration normale
        }
    }

    /// Posture Engagée
    pub fn engaged() -> Self {
        Self {
            posture_type: PostureType::Engaged,
            spine_alignment: 0.2,   // Léger lean-in
            shoulder_openness: 0.9, // Très ouvert
            arm_activity: 0.7,      // Gestuelle active
            energy_level: 0.85,     // Haute énergie
            breathing_rate: 1.2,    // Respiration légèrement accélérée
        }
    }

    /// Posture Calme
    pub fn calm() -> Self {
        Self {
            posture_type: PostureType::Calm,
            spine_alignment: -0.05, // Légèrement en retrait
            shoulder_openness: 0.6, // Épaules relâchées
            arm_activity: 0.2,      // Mouvements minimaux
            energy_level: 0.4,      // Basse énergie
            breathing_rate: 0.7,    // Respiration lente
        }
    }

    /// Posture Créative
    pub fn creative() -> Self {
        Self {
            posture_type: PostureType::Creative,
            spine_alignment: 0.1,    // Légère inclinaison
            shoulder_openness: 0.85, // Ouvert
            arm_activity: 0.9,       // Très expressif
            energy_level: 0.75,      // Énergie créative
            breathing_rate: 1.1,     // Respiration dynamique
        }
    }

    /// Posture Accueil
    pub fn welcoming() -> Self {
        Self {
            posture_type: PostureType::Welcoming,
            spine_alignment: 0.05,  // Légèrement vers avant
            shoulder_openness: 1.0, // Complètement ouvert
            arm_activity: 0.5,      // Gestuelle accueillante
            energy_level: 0.7,      // Énergie chaleureuse
            breathing_rate: 1.0,    // Respiration normale
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
    pub user_engagement: f32,       // 0.0–1.0 (détecté via durée interaction)
    pub topic_complexity: f32,      // 0.0–1.0 (détecté via cognitive_load)
    pub emotional_valence: f32,     // -1.0 (négatif) → 1.0 (positif)
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

impl Default for BodyPostureAI {
    fn default() -> Self {
        Self::new()
    }
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
        if self.stability_counter < 180 {
            // ~3 secondes à 60 FPS
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

        // Phase brainstorm → Creative (prioritaire car contexte explicite)
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

        // Phases d'ouverture/fermeture après heuristiques pour éviter override
        if ctx.conversation_phase == "opening" || ctx.conversation_phase == "closing" {
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

    // ─────────────────────────────────────────────────────────────
    // PostureType Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_posture_type_equality() {
        assert_eq!(PostureType::Professional, PostureType::Professional);
        assert_ne!(PostureType::Professional, PostureType::Engaged);
    }

    #[test]
    fn test_posture_type_clone() {
        let posture = PostureType::Creative;
        let cloned = posture.clone();
        assert_eq!(cloned, PostureType::Creative);
    }

    #[test]
    fn test_posture_type_debug() {
        let posture = PostureType::Welcoming;
        let debug_str = format!("{:?}", posture);
        assert!(debug_str.contains("Welcoming"));
    }

    #[test]
    fn test_posture_type_serialization() {
        let posture = PostureType::Calm;
        let json = serde_json::to_string(&posture).unwrap();
        let restored: PostureType = serde_json::from_str(&json).unwrap();
        assert_eq!(restored, PostureType::Calm);
    }

    #[test]
    fn test_posture_type_all_variants() {
        let postures = vec![
            PostureType::Professional,
            PostureType::Engaged,
            PostureType::Calm,
            PostureType::Creative,
            PostureType::Welcoming,
        ];
        assert_eq!(postures.len(), 5);
    }

    // ─────────────────────────────────────────────────────────────
    // PostureConfiguration Tests
    // ─────────────────────────────────────────────────────────────

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
    fn test_posture_professional() {
        let pro = PostureConfiguration::professional();
        assert_eq!(pro.posture_type, PostureType::Professional);
        assert_eq!(pro.spine_alignment, 0.0);
        assert_eq!(pro.shoulder_openness, 0.8);
        assert_eq!(pro.arm_activity, 0.3);
        assert_eq!(pro.energy_level, 0.6);
        assert_eq!(pro.breathing_rate, 1.0);
    }

    #[test]
    fn test_posture_engaged() {
        let engaged = PostureConfiguration::engaged();
        assert_eq!(engaged.posture_type, PostureType::Engaged);
        assert_eq!(engaged.spine_alignment, 0.2);
        assert_eq!(engaged.shoulder_openness, 0.9);
        assert_eq!(engaged.arm_activity, 0.7);
        assert_eq!(engaged.energy_level, 0.85);
        assert_eq!(engaged.breathing_rate, 1.2);
    }

    #[test]
    fn test_posture_calm() {
        let calm = PostureConfiguration::calm();
        assert_eq!(calm.posture_type, PostureType::Calm);
        assert_eq!(calm.spine_alignment, -0.05);
        assert_eq!(calm.shoulder_openness, 0.6);
        assert_eq!(calm.arm_activity, 0.2);
        assert_eq!(calm.energy_level, 0.4);
        assert_eq!(calm.breathing_rate, 0.7);
    }

    #[test]
    fn test_posture_creative() {
        let creative = PostureConfiguration::creative();
        assert_eq!(creative.posture_type, PostureType::Creative);
        assert_eq!(creative.spine_alignment, 0.1);
        assert_eq!(creative.shoulder_openness, 0.85);
        assert_eq!(creative.arm_activity, 0.9);
        assert_eq!(creative.energy_level, 0.75);
        assert_eq!(creative.breathing_rate, 1.1);
    }

    #[test]
    fn test_posture_welcoming() {
        let welcoming = PostureConfiguration::welcoming();
        assert_eq!(welcoming.posture_type, PostureType::Welcoming);
        assert_eq!(welcoming.spine_alignment, 0.05);
        assert_eq!(welcoming.shoulder_openness, 1.0);
        assert_eq!(welcoming.arm_activity, 0.5);
        assert_eq!(welcoming.energy_level, 0.7);
        assert_eq!(welcoming.breathing_rate, 1.0);
    }

    #[test]
    fn test_posture_configuration_clone() {
        let config = PostureConfiguration::professional();
        let cloned = config.clone();
        assert_eq!(cloned.posture_type, PostureType::Professional);
    }

    #[test]
    fn test_posture_configuration_debug() {
        let config = PostureConfiguration::calm();
        let debug_str = format!("{:?}", config);
        assert!(debug_str.contains("PostureConfiguration"));
    }

    // ─────────────────────────────────────────────────────────────
    // ConversationalContext Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_conversational_context_default() {
        let ctx = ConversationalContext::default();
        assert_eq!(ctx.user_engagement, 0.5);
        assert_eq!(ctx.topic_complexity, 0.3);
        assert_eq!(ctx.emotional_valence, 0.0);
        assert_eq!(ctx.conversation_phase, "opening");
        assert!(ctx.recent_gestures.is_empty());
    }

    #[test]
    fn test_conversational_context_update_engagement() {
        let mut ctx = ConversationalContext::default();
        ctx.update_engagement(0.9);
        assert_eq!(ctx.user_engagement, 0.9);
    }

    #[test]
    fn test_conversational_context_update_engagement_clamped() {
        let mut ctx = ConversationalContext::default();
        ctx.update_engagement(1.5);
        assert_eq!(ctx.user_engagement, 1.0);

        ctx.update_engagement(-0.5);
        assert_eq!(ctx.user_engagement, 0.0);
    }

    #[test]
    fn test_conversational_context_update_complexity() {
        let mut ctx = ConversationalContext::default();
        ctx.update_complexity(0.7);
        assert_eq!(ctx.topic_complexity, 0.7);
    }

    #[test]
    fn test_conversational_context_update_complexity_clamped() {
        let mut ctx = ConversationalContext::default();
        ctx.update_complexity(2.0);
        assert_eq!(ctx.topic_complexity, 1.0);
    }

    #[test]
    fn test_gesture_history() {
        let mut ctx = ConversationalContext::default();
        ctx.record_gesture("listening".to_string());
        ctx.record_gesture("explaining".to_string());

        assert!(ctx.is_gesture_recent("listening"));
        assert!(!ctx.is_gesture_recent("thinking"));
    }

    #[test]
    fn test_gesture_history_limit() {
        let mut ctx = ConversationalContext::default();
        for i in 0..15 {
            ctx.record_gesture(format!("gesture_{}", i));
        }
        // Should only keep last 10
        assert!(!ctx.is_gesture_recent("gesture_0"));
        assert!(!ctx.is_gesture_recent("gesture_4"));
        assert!(ctx.is_gesture_recent("gesture_14"));
    }

    #[test]
    fn test_conversational_context_clone() {
        let ctx = ConversationalContext::default();
        let cloned = ctx.clone();
        assert_eq!(cloned.user_engagement, ctx.user_engagement);
    }

    #[test]
    fn test_conversational_context_serialization() {
        let ctx = ConversationalContext::default();
        let json = serde_json::to_string(&ctx).unwrap();
        let restored: ConversationalContext = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.user_engagement, 0.5);
    }

    // ─────────────────────────────────────────────────────────────
    // BodyPostureAI Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_body_posture_ai_new() {
        let ai = BodyPostureAI::new();
        assert_eq!(ai.current_posture.posture_type, PostureType::Professional);
        assert_eq!(ai.stability_counter, 0);
    }

    #[test]
    fn test_body_posture_ai_default() {
        let ai = BodyPostureAI::default();
        assert_eq!(ai.current_posture.posture_type, PostureType::Professional);
    }

    #[test]
    fn test_posture_ai_selection() {
        let mut ai = BodyPostureAI::new();

        // Context: haute complexité + haut engagement → Professional
        let ctx = ConversationalContext {
            topic_complexity: 0.8,
            user_engagement: 0.9,
            ..Default::default()
        };
        ai.update_context(ctx);

        ai.stability_counter = 200; // Force sélection
        let posture = ai.select_optimal_posture();
        assert_eq!(posture.posture_type, PostureType::Professional);
    }

    #[test]
    fn test_posture_ai_selection_brainstorm() {
        let mut ai = BodyPostureAI::new();
        let ctx = ConversationalContext {
            conversation_phase: "brainstorm".to_string(),
            ..Default::default()
        };
        ai.update_context(ctx);
        ai.stability_counter = 200;

        let posture = ai.select_optimal_posture();
        assert_eq!(posture.posture_type, PostureType::Creative);
    }

    #[test]
    fn test_posture_ai_selection_engaged() {
        let mut ai = BodyPostureAI::new();
        let ctx = ConversationalContext {
            user_engagement: 0.8,
            emotional_valence: 0.5,
            ..Default::default()
        };
        ai.update_context(ctx);
        ai.stability_counter = 200;

        let posture = ai.select_optimal_posture();
        assert_eq!(posture.posture_type, PostureType::Engaged);
    }

    #[test]
    fn test_posture_ai_selection_calm() {
        let mut ai = BodyPostureAI::new();
        let ctx = ConversationalContext {
            user_engagement: 0.3,
            topic_complexity: 0.6,
            conversation_phase: "middle".to_string(),
            ..Default::default()
        };
        ai.update_context(ctx);
        ai.stability_counter = 200;

        let posture = ai.select_optimal_posture();
        assert_eq!(posture.posture_type, PostureType::Calm);
    }

    #[test]
    fn test_posture_ai_selection_welcoming_opening() {
        let mut ai = BodyPostureAI::new();
        let ctx = ConversationalContext {
            conversation_phase: "opening".to_string(),
            ..Default::default()
        };
        ai.update_context(ctx);
        ai.stability_counter = 200;

        let posture = ai.select_optimal_posture();
        assert_eq!(posture.posture_type, PostureType::Welcoming);
    }

    #[test]
    fn test_posture_ai_selection_welcoming_closing() {
        let mut ai = BodyPostureAI::new();
        let ctx = ConversationalContext {
            conversation_phase: "closing".to_string(),
            ..Default::default()
        };
        ai.update_context(ctx);
        ai.stability_counter = 200;

        let posture = ai.select_optimal_posture();
        assert_eq!(posture.posture_type, PostureType::Welcoming);
    }

    #[test]
    fn test_posture_ai_stability() {
        let mut ai = BodyPostureAI::new();
        ai.stability_counter = 0;

        // Should not change posture immediately due to stability
        let posture = ai.select_optimal_posture();
        assert_eq!(posture.posture_type, PostureType::Professional);
        assert_eq!(ai.stability_counter, 1);
    }

    #[test]
    fn test_posture_ai_update_context() {
        let mut ai = BodyPostureAI::new();
        let ctx = ConversationalContext {
            user_engagement: 0.95,
            topic_complexity: 0.1,
            emotional_valence: 0.8,
            conversation_phase: "middle".to_string(),
            recent_gestures: Default::default(),
        };
        ai.update_context(ctx);
        assert_eq!(ai.context.user_engagement, 0.95);
        assert_eq!(ai.context.topic_complexity, 0.1);
    }

    #[test]
    fn test_posture_ai_suggest_gesture_professional() {
        let ai = BodyPostureAI::new();
        let gesture = ai.suggest_gesture();
        assert_eq!(gesture, Some("listening".to_string()));
    }

    #[test]
    fn test_posture_ai_suggest_gesture_engaged() {
        let mut ai = BodyPostureAI::new();
        ai.current_posture = PostureConfiguration::engaged();
        let gesture = ai.suggest_gesture();
        assert_eq!(gesture, Some("explaining".to_string()));
    }

    #[test]
    fn test_posture_ai_suggest_gesture_calm() {
        let mut ai = BodyPostureAI::new();
        ai.current_posture = PostureConfiguration::calm();
        let gesture = ai.suggest_gesture();
        assert_eq!(gesture, Some("idle_cycle".to_string()));
    }

    #[test]
    fn test_posture_ai_suggest_gesture_creative() {
        let mut ai = BodyPostureAI::new();
        ai.current_posture = PostureConfiguration::creative();
        let gesture = ai.suggest_gesture();
        assert_eq!(gesture, Some("explaining".to_string()));
    }

    #[test]
    fn test_posture_ai_suggest_gesture_welcoming() {
        let mut ai = BodyPostureAI::new();
        ai.current_posture = PostureConfiguration::welcoming();
        let gesture = ai.suggest_gesture();
        assert_eq!(gesture, Some("smiling_warm".to_string()));
    }
}
