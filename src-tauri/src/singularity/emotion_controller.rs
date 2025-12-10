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
            current_state: AffectiveState::default(),
            history: Vec::new(),
            max_history: 20,
            inertia: 0.6,
            empathy_level: 0.7,
        }
    }
}

impl EmotionController {
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
            return AffectiveState::default();
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
        self.current_state = AffectiveState::default();
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
}
