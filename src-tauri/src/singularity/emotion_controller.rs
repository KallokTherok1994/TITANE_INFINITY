// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — SINGULARITY OS - EMOTION CONTROLLER
//   Super Prompt #13: Affective state management
//   Emotion is never dramatic, but supports response quality
// ═══════════════════════════════════════════════════════════════

use super::brain_state::{AffectiveState, ConversationMode, IntentClass};

/// Emotion Controller - Manages affective state for responses
#[derive(Debug, Clone)]
pub struct EmotionController {
    /// Current emotional state
    current_state: AffectiveState,
    /// Emotional history for smoothing
    history: Vec<AffectiveState>,
    /// Maximum history size
    max_history: usize,
    /// Emotional inertia (resistance to change)
    inertia: f32,
    /// Empathy level (responsiveness to user emotions)
    empathy_level: f32,
}

impl Default for EmotionController {
    fn default() -> Self {
        Self {
            current_state: EmotionController::neutral_state(),
            history: Vec::new(),
            max_history: 20,
            inertia: 0.6,
            empathy_level: 0.7,
        }
    }
}

impl EmotionController {
    fn neutral_state() -> AffectiveState {
        // Neutral valence, but balanced arousal to avoid overly “flat” responses.
        AffectiveState::new(0.0, 0.5)
    }

    /// Create new emotion controller
    pub fn new() -> Self {
        Self::default()
    }

    /// Create with custom empathy
    pub fn with_empathy(empathy: f32) -> Self {
        Self {
            empathy_level: empathy.clamp(0.0, 1.0),
            ..Self::default()
        }
    }

    /// Adjust emotional state based on mode
    pub fn adjust(&mut self, mode: ConversationMode) -> AffectiveState {
        let target = AffectiveState::from_mode(mode);
        self.blend_towards(target)
    }

    /// Adjust based on detected user emotion
    pub fn respond_to_user_emotion(
        &mut self,
        user_valence: f32,
        user_arousal: f32,
    ) -> AffectiveState {
        // Mirror with empathy but maintain stability
        let empathic_valence = user_valence * self.empathy_level;
        let empathic_arousal = user_arousal * self.empathy_level * 0.8; // Slightly damped arousal

        let target = AffectiveState::new(empathic_valence, empathic_arousal);
        self.blend_towards(target)
    }

    /// Adjust based on intent
    pub fn adjust_for_intent(&mut self, intent: &IntentClass) -> AffectiveState {
        let target = match intent {
            IntentClass::Emotional => AffectiveState::new(0.3, 0.3), // Warm, calm
            IntentClass::Help => AffectiveState::new(0.4, 0.4),      // Supportive, active
            IntentClass::Creative => AffectiveState::new(0.5, 0.6),  // Positive, energetic
            IntentClass::Debug => AffectiveState::new(0.0, 0.5),     // Neutral, focused
            IntentClass::Task => AffectiveState::new(0.1, 0.5),      // Slightly positive, active
            IntentClass::Query => AffectiveState::new(0.1, 0.4),     // Helpful, moderate
            IntentClass::Conversation => AffectiveState::new(0.3, 0.5), // Engaged, friendly
            _ => AffectiveState::default(),
        };
        self.blend_towards(target)
    }

    /// Full adjustment considering mode, intent, and context
    pub fn full_adjust(
        &mut self,
        mode: ConversationMode,
        intent: &IntentClass,
        user_sentiment: Option<f32>,
    ) -> AffectiveState {
        // Start with mode base
        let mut target = AffectiveState::from_mode(mode);

        // Adjust for intent
        let intent_affect = self.get_intent_adjustment(intent);
        target.valence = (target.valence + intent_affect.0) / 2.0;
        target.arousal = (target.arousal + intent_affect.1) / 2.0;

        // Respond to user sentiment if available
        if let Some(sentiment) = user_sentiment {
            let empathic_adjustment = sentiment * self.empathy_level * 0.3;
            target.valence = (target.valence + empathic_adjustment).clamp(-1.0, 1.0);
        }

        self.blend_towards(target)
    }

    /// Get intent-based adjustment values
    fn get_intent_adjustment(&self, intent: &IntentClass) -> (f32, f32) {
        match intent {
            IntentClass::Emotional => (0.3, -0.1),   // Warmer, calmer
            IntentClass::Help => (0.2, 0.1),         // Supportive, slightly more active
            IntentClass::Creative => (0.3, 0.2),     // More positive, more energetic
            IntentClass::Debug => (0.0, 0.2),        // Neutral, focused
            IntentClass::Task => (0.1, 0.1),         // Slightly positive, active
            IntentClass::Query => (0.0, 0.0),        // Neutral
            IntentClass::Conversation => (0.2, 0.1), // Friendly, engaged
            IntentClass::Command => (0.0, 0.1),      // Neutral, ready
            IntentClass::Explanation => (0.1, 0.0),  // Helpful
            IntentClass::MetaQuery => (0.0, 0.0),    // Neutral
            IntentClass::Unknown => (0.0, 0.0),      // Default
        }
    }

    /// Blend towards target with inertia
    fn blend_towards(&mut self, target: AffectiveState) -> AffectiveState {
        let blend = 1.0 - self.inertia;

        let new_state = AffectiveState {
            valence: self.current_state.valence * self.inertia + target.valence * blend,
            arousal: self.current_state.arousal * self.inertia + target.arousal * blend,
            confidence: (self.current_state.confidence + target.confidence) / 2.0,
        };

        // Store in history
        self.store_state(&new_state);

        // Update current
        self.current_state = new_state;

        new_state
    }

    /// Store state in history
    fn store_state(&mut self, state: &AffectiveState) {
        self.history.push(*state);
        if self.history.len() > self.max_history {
            self.history.remove(0);
        }
    }

    /// Get current state
    pub fn current(&self) -> &AffectiveState {
        &self.current_state
    }

    /// Get emotional stability score
    pub fn stability_score(&self) -> f32 {
        if self.history.len() < 2 {
            return 1.0;
        }

        // Calculate variance in valence and arousal
        let valences: Vec<f32> = self.history.iter().map(|s| s.valence).collect();
        let arousals: Vec<f32> = self.history.iter().map(|s| s.arousal).collect();

        let valence_var = calculate_variance(&valences);
        let arousal_var = calculate_variance(&arousals);

        // Lower variance = higher stability
        let avg_variance = (valence_var + arousal_var) / 2.0;
        (1.0 - avg_variance.min(1.0)).max(0.0)
    }

    /// Get average emotional state
    pub fn average_state(&self) -> AffectiveState {
        if self.history.is_empty() {
            return AffectiveState {
                valence: 0.0,
                arousal: 0.0,
                confidence: 0.0,
            };
        }

        let count = self.history.len() as f32;
        let avg_valence: f32 = self.history.iter().map(|s| s.valence).sum::<f32>() / count;
        let avg_arousal: f32 = self.history.iter().map(|s| s.arousal).sum::<f32>() / count;
        let avg_confidence: f32 = self.history.iter().map(|s| s.confidence).sum::<f32>() / count;

        AffectiveState {
            valence: avg_valence,
            arousal: avg_arousal,
            confidence: avg_confidence,
        }
    }

    /// Reset to neutral state
    pub fn reset(&mut self) {
        self.current_state = Self::neutral_state();
        self.history.clear();
    }

    /// Get emotional description for logging
    pub fn describe(&self) -> String {
        let state = &self.current_state;

        let valence_desc = if state.valence > 0.3 {
            "positif"
        } else if state.valence < -0.3 {
            "préoccupé"
        } else {
            "neutre"
        };

        let arousal_desc = if state.arousal > 0.6 {
            "actif"
        } else if state.arousal < 0.3 {
            "calme"
        } else {
            "équilibré"
        };

        format!(
            "État: {} et {} (v={:.2}, a={:.2}, conf={:.2})",
            valence_desc, arousal_desc, state.valence, state.arousal, state.confidence
        )
    }

    /// Set empathy level
    pub fn set_empathy(&mut self, level: f32) {
        self.empathy_level = level.clamp(0.0, 1.0);
    }

    /// Set inertia (resistance to change)
    pub fn set_inertia(&mut self, inertia: f32) {
        self.inertia = inertia.clamp(0.0, 1.0);
    }
}

/// Calculate variance of a slice
fn calculate_variance(values: &[f32]) -> f32 {
    if values.len() < 2 {
        return 0.0;
    }

    let mean = values.iter().sum::<f32>() / values.len() as f32;
    let squared_diff_sum: f32 = values.iter().map(|v| (v - mean).powi(2)).sum();
    squared_diff_sum / values.len() as f32
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_emotion_controller_creation() {
        let controller = EmotionController::new();
        let state = controller.current();

        assert!(state.valence >= -1.0 && state.valence <= 1.0);
        assert!(state.arousal >= 0.0 && state.arousal <= 1.0);
    }

    #[test]
    fn test_mode_adjustment() {
        let mut controller = EmotionController::new();

        let coach_state = controller.adjust(ConversationMode::Coach);
        assert!(coach_state.valence > 0.0); // Coach is warm

        let logic_state = controller.adjust(ConversationMode::Logic);
        // Should blend towards neutral
        assert!(logic_state.valence.abs() < 0.5);
    }

    #[test]
    fn test_empathy_response() {
        let mut controller = EmotionController::with_empathy(0.8);

        // User is happy
        let response = controller.respond_to_user_emotion(0.8, 0.6);
        assert!(response.valence > 0.0);

        // User is sad
        let response2 = controller.respond_to_user_emotion(-0.5, 0.3);
        // Should be less negative due to inertia
        assert!(response2.valence > -0.5);
    }

    #[test]
    fn test_intent_adjustment() {
        let mut controller = EmotionController::new();

        let creative_state = controller.adjust_for_intent(&IntentClass::Creative);
        assert!(creative_state.valence > 0.0);
        assert!(creative_state.arousal > 0.4);

        let debug_state = controller.adjust_for_intent(&IntentClass::Debug);
        assert!(debug_state.valence.abs() < 0.3); // More neutral
    }

    #[test]
    fn test_stability_score() {
        let mut controller = EmotionController::new();

        // Consistent adjustments
        for _ in 0..5 {
            controller.adjust(ConversationMode::Expert);
        }

        let score = controller.stability_score();
        assert!(score > 0.8);
    }

    #[test]
    fn test_description() {
        let controller = EmotionController::new();
        let desc = controller.describe();

        assert!(desc.contains("État:"));
        assert!(desc.contains("v="));
    }

    #[test]
    fn test_full_adjust() {
        let mut controller = EmotionController::new();

        let state = controller.full_adjust(
            ConversationMode::Coach,
            &IntentClass::Help,
            Some(0.5), // User is positive
        );

        assert!(state.valence > 0.0);
    }

    #[test]
    fn test_reset() {
        let mut controller = EmotionController::new();

        // Make some adjustments
        controller.adjust(ConversationMode::Coach);
        controller.adjust(ConversationMode::Creative);

        assert!(!controller.history.is_empty());

        controller.reset();

        assert!(controller.history.is_empty());
        assert_eq!(controller.current().valence, 0.0);
    }

    #[test]
    fn test_set_empathy() {
        let mut controller = EmotionController::new();

        controller.set_empathy(0.9);
        assert_eq!(controller.empathy_level, 0.9);

        // Test clamping
        controller.set_empathy(1.5);
        assert_eq!(controller.empathy_level, 1.0);

        controller.set_empathy(-0.5);
        assert_eq!(controller.empathy_level, 0.0);
    }

    #[test]
    fn test_set_inertia() {
        let mut controller = EmotionController::new();

        controller.set_inertia(0.8);
        assert_eq!(controller.inertia, 0.8);

        // Test clamping
        controller.set_inertia(2.0);
        assert_eq!(controller.inertia, 1.0);

        controller.set_inertia(-1.0);
        assert_eq!(controller.inertia, 0.0);
    }

    #[test]
    fn test_average_state_empty() {
        let controller = EmotionController::new();
        let avg = controller.average_state();

        assert_eq!(avg.valence, 0.0);
        assert_eq!(avg.arousal, 0.0);
    }

    #[test]
    fn test_average_state_with_history() {
        let mut controller = EmotionController::new();

        controller.adjust(ConversationMode::Coach);
        controller.adjust(ConversationMode::Logic);
        controller.adjust(ConversationMode::Creative);

        let avg = controller.average_state();
        // Average should be reasonable values
        assert!(avg.valence >= -1.0 && avg.valence <= 1.0);
        assert!(avg.arousal >= 0.0 && avg.arousal <= 1.0);
    }

    #[test]
    fn test_stability_with_single_entry() {
        let mut controller = EmotionController::new();
        controller.adjust(ConversationMode::Expert);

        // Single entry should give high stability
        let score = controller.stability_score();
        assert_eq!(score, 1.0);
    }

    #[test]
    fn test_full_adjust_without_sentiment() {
        let mut controller = EmotionController::new();

        let state = controller.full_adjust(
            ConversationMode::Logic,
            &IntentClass::Debug,
            None, // No user sentiment
        );

        // Should still produce valid state
        assert!(state.valence >= -1.0 && state.valence <= 1.0);
    }

    #[test]
    fn test_history_limit() {
        let mut controller = EmotionController::new();
        controller.max_history = 5;

        // Make more adjustments than max history
        for _ in 0..10 {
            controller.adjust(ConversationMode::Coach);
        }

        assert!(controller.history.len() <= 5);
    }

    #[test]
    fn test_with_empathy_constructor() {
        let controller = EmotionController::with_empathy(0.5);
        assert_eq!(controller.empathy_level, 0.5);
    }

    #[test]
    fn test_variance_calculation() {
        let values = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let variance = calculate_variance(&values);
        assert!(variance > 0.0);

        let constant = vec![5.0, 5.0, 5.0];
        let zero_var = calculate_variance(&constant);
        assert_eq!(zero_var, 0.0);
    }

    #[test]
    fn test_variance_single_value() {
        let single = vec![1.0];
        let variance = calculate_variance(&single);
        assert_eq!(variance, 0.0);
    }

    #[test]
    fn test_emotion_controller_default() {
        let controller = EmotionController::default();
        assert_eq!(controller.inertia, 0.6);
        assert_eq!(controller.empathy_level, 0.7);
    }

    #[test]
    fn test_emotion_controller_clone() {
        let controller = EmotionController::new();
        let cloned = controller.clone();
        assert_eq!(cloned.inertia, controller.inertia);
        assert_eq!(cloned.empathy_level, controller.empathy_level);
    }

    #[test]
    fn test_describe_positive_active() {
        let mut controller = EmotionController::new();
        controller.current_state = AffectiveState::new(0.5, 0.7);
        let desc = controller.describe();
        assert!(desc.contains("positif"));
        assert!(desc.contains("actif"));
    }

    #[test]
    fn test_describe_neutral_calm() {
        let mut controller = EmotionController::new();
        controller.current_state = AffectiveState::new(0.0, 0.2);
        let desc = controller.describe();
        assert!(desc.contains("neutre"));
        assert!(desc.contains("calme"));
    }

    #[test]
    fn test_describe_concerned() {
        let mut controller = EmotionController::new();
        controller.current_state = AffectiveState::new(-0.5, 0.5);
        let desc = controller.describe();
        assert!(desc.contains("préoccupé"));
    }

    #[test]
    fn test_adjust_all_modes() {
        let mut controller = EmotionController::new();

        let modes = vec![
            ConversationMode::Expert,
            ConversationMode::Coach,
            ConversationMode::Creative,
            ConversationMode::Logic,
            ConversationMode::Meta,
            ConversationMode::Cognitive,
        ];

        for mode in modes {
            let state = controller.adjust(mode);
            assert!(state.valence >= -1.0 && state.valence <= 1.0);
            assert!(state.arousal >= 0.0 && state.arousal <= 1.0);
        }
    }

    #[test]
    fn test_adjust_for_all_intents() {
        let mut controller = EmotionController::new();

        let intents = vec![
            IntentClass::Emotional,
            IntentClass::Help,
            IntentClass::Creative,
            IntentClass::Debug,
            IntentClass::Task,
            IntentClass::Query,
            IntentClass::Conversation,
            IntentClass::Command,
            IntentClass::Explanation,
            IntentClass::MetaQuery,
            IntentClass::Unknown,
        ];

        for intent in intents {
            let state = controller.adjust_for_intent(&intent);
            assert!(state.valence >= -1.0 && state.valence <= 1.0);
        }
    }

    #[test]
    fn test_respond_to_extreme_user_emotion() {
        let mut controller = EmotionController::new();

        // Extreme positive
        let state1 = controller.respond_to_user_emotion(1.0, 1.0);
        assert!(state1.valence >= 0.0);

        // Extreme negative
        let state2 = controller.respond_to_user_emotion(-1.0, 0.0);
        assert!(state2.valence <= 0.5);
    }

    #[test]
    fn test_full_adjust_with_negative_sentiment() {
        let mut controller = EmotionController::new();
        let state =
            controller.full_adjust(ConversationMode::Coach, &IntentClass::Emotional, Some(-0.8));
        assert!(state.valence >= -1.0);
    }

    #[test]
    fn test_stability_score_volatile() {
        let mut controller = EmotionController::new();
        controller.inertia = 0.0; // No inertia = more volatile

        controller.adjust(ConversationMode::Coach);
        controller.adjust(ConversationMode::Logic);
        controller.adjust(ConversationMode::Creative);
        controller.adjust(ConversationMode::Meta);

        let score = controller.stability_score();
        // With volatile changes, stability should be lower
        assert!(score <= 1.0);
    }

    #[test]
    fn test_variance_empty() {
        let empty: Vec<f32> = vec![];
        let variance = calculate_variance(&empty);
        assert_eq!(variance, 0.0);
    }

    #[test]
    fn test_with_empathy_clamping() {
        let controller1 = EmotionController::with_empathy(1.5);
        assert_eq!(controller1.empathy_level, 1.0);

        let controller2 = EmotionController::with_empathy(-0.5);
        assert_eq!(controller2.empathy_level, 0.0);
    }

    #[test]
    fn test_get_intent_adjustment_values() {
        let controller = EmotionController::new();

        let (v, a) = controller.get_intent_adjustment(&IntentClass::Creative);
        assert!(v > 0.0);
        assert!(a > 0.0);

        let (v2, a2) = controller.get_intent_adjustment(&IntentClass::Unknown);
        assert_eq!(v2, 0.0);
        assert_eq!(a2, 0.0);
    }

    #[test]
    fn test_current_returns_reference() {
        let controller = EmotionController::new();
        let current = controller.current();
        assert_eq!(current.valence, 0.0);
    }
}
