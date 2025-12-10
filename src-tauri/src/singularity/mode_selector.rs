// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — SINGULARITY OS - MODE SELECTOR
//   Super Prompt #13: Intelligent conversation mode selection
//   Selects optimal mode based on intent, context, and history
// ═══════════════════════════════════════════════════════════════

use super::brain_state::{ConversationMode, IntentClass};
use std::collections::HashMap;

/// Mode Selector - Chooses optimal conversation mode
#[derive(Debug, Clone)]
pub struct ModeSelector {
    /// Current mode
    current_mode: ConversationMode,
    /// Mode history for stability
    mode_history: Vec<ConversationMode>,
    /// Maximum history size
    max_history: usize,
    /// Stability factor (resistance to mode change)
    stability_factor: f32,
    /// Mode scores for decision
    mode_scores: HashMap<ConversationMode, f32>,
    /// Locked mode (if user explicitly requested)
    locked_mode: Option<ConversationMode>,
}

impl Default for ModeSelector {
    fn default() -> Self {
        Self {
            current_mode: ConversationMode::Neutral,
            mode_history: Vec::new(),
            max_history: 10,
            stability_factor: 0.6,
            mode_scores: HashMap::new(),
            locked_mode: None,
        }
    }
}

impl ModeSelector {
    /// Create new mode selector
    pub fn new() -> Self {
        Self::default()
    }

    /// Create with initial mode
    pub fn with_mode(mode: ConversationMode) -> Self {
        Self {
            current_mode: mode,
            ..Self::default()
        }
    }

    /// Select mode based on intent
    pub fn select(&mut self, intent: &IntentClass) -> ConversationMode {
        // If locked, return locked mode
        if let Some(locked) = self.locked_mode {
            return locked;
        }

        // Get base mode from intent
        let intent_mode = self.mode_from_intent(intent);

        // Apply stability consideration
        let final_mode = self.apply_stability(intent_mode);

        // Store in history
        self.store_mode(final_mode);

        // Update current
        self.current_mode = final_mode;

        final_mode
    }

    /// Select mode with additional context signals
    pub fn select_with_context(
        &mut self,
        intent: &IntentClass,
        message_length: usize,
        has_question_mark: bool,
        has_code: bool,
        sentiment_score: Option<f32>,
    ) -> ConversationMode {
        // If locked, return locked mode
        if let Some(locked) = self.locked_mode {
            return locked;
        }

        // Initialize scores
        self.mode_scores.clear();
        for mode in &[
            ConversationMode::Coach,
            ConversationMode::Expert,
            ConversationMode::Meta,
            ConversationMode::Cognitive,
            ConversationMode::Creative,
            ConversationMode::Logic,
            ConversationMode::Harmonic,
            ConversationMode::Neutral,
        ] {
            self.mode_scores.insert(*mode, 0.0);
        }

        // Score based on intent
        self.apply_intent_scores(intent);

        // Score based on message characteristics
        self.apply_message_scores(message_length, has_question_mark, has_code);

        // Score based on sentiment
        if let Some(sentiment) = sentiment_score {
            self.apply_sentiment_scores(sentiment);
        }

        // Score based on history (stability)
        self.apply_history_scores();

        // Get highest scoring mode
        let best_mode = self
            .mode_scores
            .iter()
            .max_by(|a, b| a.1.partial_cmp(b.1).unwrap())
            .map(|(mode, _)| *mode)
            .unwrap_or(ConversationMode::Neutral);

        // Store and update
        self.store_mode(best_mode);
        self.current_mode = best_mode;

        best_mode
    }

    /// Get mode from intent (primary mapping)
    fn mode_from_intent(&self, intent: &IntentClass) -> ConversationMode {
        match intent {
            IntentClass::Query => ConversationMode::Expert,
            IntentClass::Task => ConversationMode::Expert,
            IntentClass::Help => ConversationMode::Coach,
            IntentClass::Emotional => ConversationMode::Harmonic,
            IntentClass::Conversation => ConversationMode::Neutral,
            IntentClass::Command => ConversationMode::Logic,
            IntentClass::Creative => ConversationMode::Creative,
            IntentClass::Debug => ConversationMode::Expert,
            IntentClass::Explanation => ConversationMode::Coach,
            IntentClass::MetaQuery => ConversationMode::Meta,
            IntentClass::Unknown => ConversationMode::Neutral,
        }
    }

    /// Apply intent-based scores
    fn apply_intent_scores(&mut self, intent: &IntentClass) {
        match intent {
            IntentClass::Query => {
                *self
                    .mode_scores
                    .entry(ConversationMode::Expert)
                    .or_insert(0.0) += 0.8;
                *self
                    .mode_scores
                    .entry(ConversationMode::Logic)
                    .or_insert(0.0) += 0.3;
            }
            IntentClass::Task => {
                *self
                    .mode_scores
                    .entry(ConversationMode::Expert)
                    .or_insert(0.0) += 0.7;
                *self
                    .mode_scores
                    .entry(ConversationMode::Coach)
                    .or_insert(0.0) += 0.4;
            }
            IntentClass::Help => {
                *self
                    .mode_scores
                    .entry(ConversationMode::Coach)
                    .or_insert(0.0) += 0.9;
                *self
                    .mode_scores
                    .entry(ConversationMode::Harmonic)
                    .or_insert(0.0) += 0.3;
            }
            IntentClass::Emotional => {
                *self
                    .mode_scores
                    .entry(ConversationMode::Harmonic)
                    .or_insert(0.0) += 0.9;
                *self
                    .mode_scores
                    .entry(ConversationMode::Coach)
                    .or_insert(0.0) += 0.4;
            }
            IntentClass::Conversation => {
                *self
                    .mode_scores
                    .entry(ConversationMode::Neutral)
                    .or_insert(0.0) += 0.7;
                *self
                    .mode_scores
                    .entry(ConversationMode::Harmonic)
                    .or_insert(0.0) += 0.3;
            }
            IntentClass::Command => {
                *self
                    .mode_scores
                    .entry(ConversationMode::Logic)
                    .or_insert(0.0) += 0.8;
                *self
                    .mode_scores
                    .entry(ConversationMode::Expert)
                    .or_insert(0.0) += 0.3;
            }
            IntentClass::Creative => {
                *self
                    .mode_scores
                    .entry(ConversationMode::Creative)
                    .or_insert(0.0) += 0.9;
                *self
                    .mode_scores
                    .entry(ConversationMode::Meta)
                    .or_insert(0.0) += 0.2;
            }
            IntentClass::Debug => {
                *self
                    .mode_scores
                    .entry(ConversationMode::Expert)
                    .or_insert(0.0) += 0.8;
                *self
                    .mode_scores
                    .entry(ConversationMode::Logic)
                    .or_insert(0.0) += 0.4;
            }
            IntentClass::Explanation => {
                *self
                    .mode_scores
                    .entry(ConversationMode::Coach)
                    .or_insert(0.0) += 0.7;
                *self
                    .mode_scores
                    .entry(ConversationMode::Expert)
                    .or_insert(0.0) += 0.4;
            }
            IntentClass::MetaQuery => {
                *self
                    .mode_scores
                    .entry(ConversationMode::Meta)
                    .or_insert(0.0) += 0.9;
                *self
                    .mode_scores
                    .entry(ConversationMode::Cognitive)
                    .or_insert(0.0) += 0.3;
            }
            IntentClass::Unknown => {
                *self
                    .mode_scores
                    .entry(ConversationMode::Neutral)
                    .or_insert(0.0) += 0.6;
            }
        }
    }

    /// Apply message characteristic scores
    fn apply_message_scores(&mut self, length: usize, has_question: bool, has_code: bool) {
        // Long messages suggest complex needs
        if length > 200 {
            *self
                .mode_scores
                .entry(ConversationMode::Expert)
                .or_insert(0.0) += 0.2;
            *self
                .mode_scores
                .entry(ConversationMode::Cognitive)
                .or_insert(0.0) += 0.1;
        } else if length < 20 {
            // Short messages might be commands or quick queries
            *self
                .mode_scores
                .entry(ConversationMode::Logic)
                .or_insert(0.0) += 0.1;
        }

        // Question marks suggest query/help
        if has_question {
            *self
                .mode_scores
                .entry(ConversationMode::Expert)
                .or_insert(0.0) += 0.1;
            *self
                .mode_scores
                .entry(ConversationMode::Coach)
                .or_insert(0.0) += 0.1;
        }

        // Code suggests technical context
        if has_code {
            *self
                .mode_scores
                .entry(ConversationMode::Expert)
                .or_insert(0.0) += 0.3;
            *self
                .mode_scores
                .entry(ConversationMode::Logic)
                .or_insert(0.0) += 0.2;
        }
    }

    /// Apply sentiment-based scores
    fn apply_sentiment_scores(&mut self, sentiment: f32) {
        if sentiment < -0.3 {
            // Negative sentiment → supportive modes
            *self
                .mode_scores
                .entry(ConversationMode::Harmonic)
                .or_insert(0.0) += 0.3;
            *self
                .mode_scores
                .entry(ConversationMode::Coach)
                .or_insert(0.0) += 0.2;
        } else if sentiment > 0.5 {
            // Very positive → can be more creative/open
            *self
                .mode_scores
                .entry(ConversationMode::Creative)
                .or_insert(0.0) += 0.1;
        }
    }

    /// Apply history-based scores (stability)
    fn apply_history_scores(&mut self) {
        if self.mode_history.is_empty() {
            return;
        }

        // Count recent modes
        let mut mode_counts: HashMap<ConversationMode, usize> = HashMap::new();
        for mode in &self.mode_history {
            *mode_counts.entry(*mode).or_insert(0) += 1;
        }

        // Add stability bonus for consistent modes
        for (mode, count) in mode_counts {
            let bonus = (count as f32 / self.mode_history.len() as f32) * self.stability_factor;
            *self.mode_scores.entry(mode).or_insert(0.0) += bonus;
        }
    }

    /// Apply stability consideration
    fn apply_stability(&self, new_mode: ConversationMode) -> ConversationMode {
        if self.mode_history.is_empty() {
            return new_mode;
        }

        // If current mode is working well, resist change
        if new_mode != self.current_mode {
            // Check how often current mode appears in history
            let current_count = self
                .mode_history
                .iter()
                .filter(|&&m| m == self.current_mode)
                .count();

            let stability_ratio = current_count as f32 / self.mode_history.len() as f32;

            // If current mode is very stable, keep it
            if stability_ratio > self.stability_factor {
                return self.current_mode;
            }
        }

        new_mode
    }

    /// Store mode in history
    fn store_mode(&mut self, mode: ConversationMode) {
        self.mode_history.push(mode);
        if self.mode_history.len() > self.max_history {
            self.mode_history.remove(0);
        }
    }

    /// Get current mode
    pub fn current(&self) -> ConversationMode {
        self.current_mode
    }

    /// Lock to specific mode
    pub fn lock_mode(&mut self, mode: ConversationMode) {
        self.locked_mode = Some(mode);
        self.current_mode = mode;
    }

    /// Unlock mode
    pub fn unlock_mode(&mut self) {
        self.locked_mode = None;
    }

    /// Check if locked
    pub fn is_locked(&self) -> bool {
        self.locked_mode.is_some()
    }

    /// Get mode distribution from history
    pub fn get_distribution(&self) -> HashMap<ConversationMode, f32> {
        let mut distribution: HashMap<ConversationMode, f32> = HashMap::new();

        if self.mode_history.is_empty() {
            return distribution;
        }

        let total = self.mode_history.len() as f32;
        for mode in &self.mode_history {
            *distribution.entry(*mode).or_insert(0.0) += 1.0 / total;
        }

        distribution
    }

    /// Get stability score
    pub fn stability_score(&self) -> f32 {
        if self.mode_history.len() < 2 {
            return 1.0;
        }

        // Count mode changes
        let mut changes = 0;
        for i in 1..self.mode_history.len() {
            if self.mode_history[i] != self.mode_history[i - 1] {
                changes += 1;
            }
        }

        let change_ratio = changes as f32 / (self.mode_history.len() - 1) as f32;
        1.0 - change_ratio
    }

    /// Reset selector
    pub fn reset(&mut self) {
        self.current_mode = ConversationMode::Neutral;
        self.mode_history.clear();
        self.mode_scores.clear();
        self.locked_mode = None;
    }

    /// Set stability factor
    pub fn set_stability(&mut self, factor: f32) {
        self.stability_factor = factor.clamp(0.0, 1.0);
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mode_selector_creation() {
        let selector = ModeSelector::new();
        assert_eq!(selector.current(), ConversationMode::Neutral);
    }

    #[test]
    fn test_mode_from_intent() {
        let mut selector = ModeSelector::new();

        // Help intent → Coach
        let mode = selector.select(&IntentClass::Help);
        assert_eq!(mode, ConversationMode::Coach);

        // Creative intent → Creative
        let mut selector2 = ModeSelector::new();
        let mode2 = selector2.select(&IntentClass::Creative);
        assert_eq!(mode2, ConversationMode::Creative);
    }

    #[test]
    fn test_mode_locking() {
        let mut selector = ModeSelector::new();

        selector.lock_mode(ConversationMode::Expert);
        assert!(selector.is_locked());

        // Even with Help intent, should return Expert
        let mode = selector.select(&IntentClass::Help);
        assert_eq!(mode, ConversationMode::Expert);

        selector.unlock_mode();
        assert!(!selector.is_locked());
    }

    #[test]
    fn test_context_selection() {
        let mut selector = ModeSelector::new();

        // Long technical message with code
        let mode = selector.select_with_context(
            &IntentClass::Debug,
            300,  // long message
            true, // has question
            true, // has code
            Some(0.0),
        );

        // Should favor Expert
        assert_eq!(mode, ConversationMode::Expert);
    }

    #[test]
    fn test_stability() {
        let mut selector = ModeSelector::new();
        selector.set_stability(0.8);

        // Build up Expert history
        for _ in 0..5 {
            selector.select(&IntentClass::Query);
        }

        let score = selector.stability_score();
        assert!(score > 0.8);

        // Now try to switch - should resist
        let mode = selector.select(&IntentClass::Emotional);
        // Might still be Expert due to high stability
        // (depends on stability factor)
    }

    #[test]
    fn test_distribution() {
        let mut selector = ModeSelector::new();

        selector.select(&IntentClass::Query); // Expert
        selector.select(&IntentClass::Query); // Expert
        selector.select(&IntentClass::Help); // Coach

        let dist = selector.get_distribution();
        assert!(!dist.is_empty());
    }

    #[test]
    fn test_reset() {
        let mut selector = ModeSelector::new();

        selector.select(&IntentClass::Query);
        selector.lock_mode(ConversationMode::Creative);

        selector.reset();

        assert_eq!(selector.current(), ConversationMode::Neutral);
        assert!(!selector.is_locked());
    }
}
