// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — SINGULARITY OS - COHERENCE CONTROLLER
//   Super Prompt #13: Internal fusion and coherence management
//   Fuses context, reasoning, memory, style, emotion, constraints
// ═══════════════════════════════════════════════════════════════

use super::brain_state::{
    AffectiveState, ConstraintProfile, ConversationMode, MemoryContext, StyleProfile,
};

/// Coherence Controller - Fuses all cognitive components
#[derive(Debug, Clone)]
pub struct CoherenceController {
    /// Coherence threshold
    threshold: f32,
    /// Weight for different components
    weights: CoherenceWeights,
    /// Last coherence score
    last_score: f32,
}

/// Weights for coherence calculation
#[derive(Debug, Clone)]
pub struct CoherenceWeights {
    pub context: f32,
    pub reasoning: f32,
    pub style: f32,
    pub emotion: f32,
    pub constraints: f32,
}

impl Default for CoherenceWeights {
    fn default() -> Self {
        Self {
            context: 0.25,
            reasoning: 0.30,
            style: 0.15,
            emotion: 0.15,
            constraints: 0.15,
        }
    }
}

impl Default for CoherenceController {
    fn default() -> Self {
        Self {
            threshold: 0.85,
            weights: CoherenceWeights::default(),
            last_score: 0.0,
        }
    }
}

impl CoherenceController {
    /// Create new coherence controller
    pub fn new() -> Self {
        Self::default()
    }

    /// Create with custom threshold
    pub fn with_threshold(threshold: f32) -> Self {
        Self {
            threshold: threshold.clamp(0.0, 1.0),
            ..Self::default()
        }
    }

    /// Main merge function - fuses all components
    pub fn merge(
        &mut self,
        reasoning: &[String],
        context: &MemoryContext,
        style: &StyleProfile,
        affect: &AffectiveState,
        constraints: &ConstraintProfile,
        mode: ConversationMode,
    ) -> CoherenceResult {
        let start = std::time::Instant::now();

        // Calculate individual coherence scores
        let context_score = self.evaluate_context_coherence(context);
        let reasoning_score = self.evaluate_reasoning_coherence(reasoning);
        let style_score = self.evaluate_style_coherence(style, mode);
        let emotion_score = self.evaluate_emotion_coherence(affect, mode);
        let constraint_score = self.evaluate_constraint_compliance(constraints);

        // Weighted overall score
        let overall_score = self.weights.context * context_score
            + self.weights.reasoning * reasoning_score
            + self.weights.style * style_score
            + self.weights.emotion * emotion_score
            + self.weights.constraints * constraint_score;

        self.last_score = overall_score;

        // Build synthesis
        let synthesis = self.build_synthesis(reasoning, context, mode);

        // Check threshold
        let is_coherent = overall_score >= self.threshold;

        // Recommendations if not coherent
        let recommendations = if !is_coherent {
            self.generate_recommendations(
                context_score,
                reasoning_score,
                style_score,
                emotion_score,
                constraint_score,
            )
        } else {
            vec![]
        };

        CoherenceResult {
            synthesis,
            overall_score,
            is_coherent,
            component_scores: ComponentScores {
                context: context_score,
                reasoning: reasoning_score,
                style: style_score,
                emotion: emotion_score,
                constraints: constraint_score,
            },
            recommendations,
            duration_ms: start.elapsed().as_millis(),
        }
    }

    /// Evaluate context coherence
    fn evaluate_context_coherence(&self, context: &MemoryContext) -> f32 {
        if context.items.is_empty() {
            // No context items is acceptable, but we still reward higher relevance signals.
            let relevance = context.relevance_score.clamp(0.0, 1.0);
            return (0.6 + relevance * 0.3).clamp(0.0, 1.0);
        }

        // Based on relevance score and item count
        let relevance_factor = context.relevance_score;
        let coverage_factor = (context.items.len() as f32 / 5.0).min(1.0);

        (relevance_factor * 0.7 + coverage_factor * 0.3).clamp(0.0, 1.0)
    }

    /// Evaluate reasoning coherence
    fn evaluate_reasoning_coherence(&self, reasoning: &[String]) -> f32 {
        if reasoning.is_empty() {
            return 0.5;
        }

        // Check for logical progression
        let has_analysis = reasoning.iter().any(|s| s.contains("Analyse"));
        let has_synthesis = reasoning.iter().any(|s| s.contains("Synthèse"));
        let has_context = reasoning.iter().any(|s| s.contains("Contexte"));

        let completeness = [has_analysis, has_synthesis, has_context]
            .iter()
            .filter(|&&x| x)
            .count() as f32
            / 3.0;

        let length_factor = (reasoning.len() as f32 / 5.0).min(1.0);

        (completeness * 0.6 + length_factor * 0.4).clamp(0.0, 1.0)
    }

    /// Evaluate style coherence with mode
    fn evaluate_style_coherence(&self, style: &StyleProfile, mode: ConversationMode) -> f32 {
        let expected_style = StyleProfile::from_mode(mode);

        // Compare key attributes
        let tone_match = if style.tone == expected_style.tone {
            1.0
        } else {
            0.6
        };

        let density_diff = (style.density - expected_style.density).abs();
        let tempo_diff = (style.tempo - expected_style.tempo).abs();

        let numeric_match = 1.0 - ((density_diff + tempo_diff) / 2.0);

        (tone_match * 0.5 + numeric_match * 0.5).clamp(0.0, 1.0)
    }

    /// Evaluate emotion coherence with mode
    fn evaluate_emotion_coherence(&self, affect: &AffectiveState, mode: ConversationMode) -> f32 {
        let expected_affect = AffectiveState::from_mode(mode);

        let valence_diff = (affect.valence - expected_affect.valence).abs();
        let arousal_diff = (affect.arousal - expected_affect.arousal).abs();

        // Tolerance zone
        let valence_score = if valence_diff < 0.3 {
            1.0
        } else {
            1.0 - valence_diff
        };
        let arousal_score = if arousal_diff < 0.3 {
            1.0
        } else {
            1.0 - arousal_diff
        };

        let base_score = (valence_score + arousal_score) / 2.0;

        // Bonus for confidence
        let confidence_bonus = affect.confidence * 0.1;

        (base_score + confidence_bonus).clamp(0.0, 1.0)
    }

    /// Evaluate constraint compliance
    fn evaluate_constraint_compliance(&self, constraints: &ConstraintProfile) -> f32 {
        // Base compliance (assuming response follows constraints)
        let mut score: f32 = 0.9;

        // Penalize if safety level is very high (more restrictive)
        if constraints.safety_level > 0.95 {
            score -= 0.05;
        }

        // Penalize for many required topics
        if constraints.required_topics.len() > 5 {
            score -= 0.1;
        }

        // Penalize for many forbidden items
        if constraints.forbidden.len() > 10 {
            score -= 0.1;
        }

        score.clamp(0.0, 1.0)
    }

    /// Build synthesis from components
    fn build_synthesis(
        &self,
        reasoning: &[String],
        context: &MemoryContext,
        mode: ConversationMode,
    ) -> String {
        let reasoning_summary = if let Some(last) = reasoning.last() {
            last.clone()
        } else {
            "Analyse directe".to_string()
        };

        let context_summary = if context.items.is_empty() {
            "sans contexte historique".to_string()
        } else {
            format!("avec {} éléments contextuels", context.items.len())
        };

        format!(
            "Synthèse cohérente [{:?}]: {} {}",
            mode, reasoning_summary, context_summary
        )
    }

    /// Generate recommendations for improvement
    fn generate_recommendations(
        &self,
        context_score: f32,
        reasoning_score: f32,
        style_score: f32,
        emotion_score: f32,
        constraint_score: f32,
    ) -> Vec<String> {
        let mut recs = Vec::new();

        if context_score < 0.7 {
            recs.push("Améliorer la récupération de contexte mémoire".to_string());
        }

        if reasoning_score < 0.7 {
            recs.push("Approfondir la chaîne de raisonnement".to_string());
        }

        if style_score < 0.7 {
            recs.push("Ajuster le style au mode actif".to_string());
        }

        if emotion_score < 0.7 {
            recs.push("Calibrer l'état émotionnel".to_string());
        }

        if constraint_score < 0.7 {
            recs.push("Revoir les contraintes appliquées".to_string());
        }

        recs
    }

    /// Get last coherence score
    pub fn last_score(&self) -> f32 {
        self.last_score
    }

    /// Set threshold
    pub fn set_threshold(&mut self, threshold: f32) {
        self.threshold = threshold.clamp(0.0, 1.0);
    }

    /// Set weights
    pub fn set_weights(&mut self, weights: CoherenceWeights) {
        self.weights = weights;
    }

    /// Quick coherence check
    pub fn quick_check(&self, reasoning: &[String], context: &MemoryContext) -> f32 {
        let r_score = self.evaluate_reasoning_coherence(reasoning);
        let c_score = self.evaluate_context_coherence(context);
        (r_score + c_score) / 2.0
    }
}

/// Result of coherence merge
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CoherenceResult {
    /// Synthesized output direction
    pub synthesis: String,
    /// Overall coherence score
    pub overall_score: f32,
    /// Is above threshold
    pub is_coherent: bool,
    /// Individual component scores
    pub component_scores: ComponentScores,
    /// Recommendations if not coherent
    pub recommendations: Vec<String>,
    /// Processing duration
    pub duration_ms: u128,
}

/// Individual component scores
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ComponentScores {
    pub context: f32,
    pub reasoning: f32,
    pub style: f32,
    pub emotion: f32,
    pub constraints: f32,
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_coherence_controller_creation() {
        let controller = CoherenceController::new();
        assert_eq!(controller.threshold, 0.85);
    }

    #[test]
    fn test_merge_basic() {
        let mut controller = CoherenceController::new();

        let reasoning = vec![
            "Analyse: message court".to_string(),
            "Contexte: 2 items".to_string(),
            "Synthèse: réponse directe".to_string(),
        ];

        let context = MemoryContext {
            items: vec![],
            relevance_score: 0.8,
            ..Default::default()
        };

        let style = StyleProfile::default();
        let affect = AffectiveState::default();
        let constraints = ConstraintProfile::default();

        let result = controller.merge(
            &reasoning,
            &context,
            &style,
            &affect,
            &constraints,
            ConversationMode::Neutral,
        );

        assert!(result.overall_score > 0.0);
        assert!(!result.synthesis.is_empty());
    }

    #[test]
    fn test_context_coherence() {
        let controller = CoherenceController::new();

        // Empty context
        let empty_context = MemoryContext::default();
        let score1 = controller.evaluate_context_coherence(&empty_context);
        assert!(score1 > 0.5);

        // Good context
        let good_context = MemoryContext {
            items: vec![],
            relevance_score: 0.9,
            ..Default::default()
        };
        let score2 = controller.evaluate_context_coherence(&good_context);
        assert!(score2 > score1);
    }

    #[test]
    fn test_reasoning_coherence() {
        let controller = CoherenceController::new();

        // Complete reasoning
        let complete = vec![
            "Analyse: test".to_string(),
            "Contexte: ok".to_string(),
            "Synthèse: final".to_string(),
        ];
        let score1 = controller.evaluate_reasoning_coherence(&complete);

        // Incomplete reasoning
        let incomplete = vec!["Step 1".to_string()];
        let score2 = controller.evaluate_reasoning_coherence(&incomplete);

        assert!(score1 > score2);
    }

    #[test]
    fn test_style_coherence() {
        let controller = CoherenceController::new();

        // Matching style
        let expert_style = StyleProfile::from_mode(ConversationMode::Expert);
        let score1 = controller.evaluate_style_coherence(&expert_style, ConversationMode::Expert);

        // Mismatched style
        let coach_style = StyleProfile::from_mode(ConversationMode::Coach);
        let score2 = controller.evaluate_style_coherence(&coach_style, ConversationMode::Expert);

        assert!(score1 > score2);
    }

    #[test]
    fn test_recommendations() {
        let mut controller = CoherenceController::with_threshold(0.95);

        let reasoning = vec!["Minimal".to_string()];
        let context = MemoryContext::default();
        let style = StyleProfile::default();
        let affect = AffectiveState::default();
        let constraints = ConstraintProfile::default();

        let result = controller.merge(
            &reasoning,
            &context,
            &style,
            &affect,
            &constraints,
            ConversationMode::Expert,
        );

        // With high threshold, likely not coherent
        if !result.is_coherent {
            assert!(!result.recommendations.is_empty());
        }
    }

    #[test]
    fn test_quick_check() {
        let controller = CoherenceController::new();

        let reasoning = vec!["Analyse: test".to_string()];
        let context = MemoryContext::default();

        let score = controller.quick_check(&reasoning, &context);
        assert!(score > 0.0 && score <= 1.0);
    }
}
