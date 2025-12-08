// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — SINGULARITY OS - EVOLUTION ENGINE
//   Super Prompt #13: Self-improvement and auto-evolution
//   Learns from interactions, improves models, tracks growth
// ═══════════════════════════════════════════════════════════════

use std::collections::HashMap;
use super::brain_state::{ConversationBrainState, ConversationMode};

/// Evolution Engine - Manages self-improvement
#[derive(Debug, Clone)]
pub struct EvolutionEngine {
    /// Current evolution level
    level: f32,
    /// Experience points
    xp: f32,
    /// XP needed for next level
    xp_to_next: f32,
    /// Evolution metrics
    metrics: EvolutionMetrics,
    /// Pattern history for learning
    patterns: PatternHistory,
    /// Evolution rate (how fast it learns)
    evolution_rate: f32,
    /// Maximum level cap
    max_level: f32,
}

/// Evolution metrics tracking
#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct EvolutionMetrics {
    /// Total interactions processed
    pub total_interactions: u64,
    /// Successful interactions (implicit feedback)
    pub successful_interactions: u64,
    /// Average coherence score
    pub avg_coherence: f32,
    /// Average style stability
    pub avg_style_stability: f32,
    /// Mode distribution effectiveness
    pub mode_effectiveness: HashMap<String, f32>,
    /// Memory relevance improvement
    pub memory_relevance_trend: Vec<f32>,
    /// Response latency trend (ms)
    pub latency_trend: Vec<u128>,
    /// Cognitive drift score (lower is better)
    pub cognitive_drift: f32,
}

/// Pattern history for learning
#[derive(Debug, Clone, Default)]
pub struct PatternHistory {
    /// Successful patterns
    pub successful: Vec<SuccessPattern>,
    /// Maximum patterns to keep
    pub max_patterns: usize,
}

/// A successful interaction pattern
#[derive(Debug, Clone)]
pub struct SuccessPattern {
    pub mode: ConversationMode,
    pub coherence: f32,
    pub style_stability: f32,
    pub memory_relevance: f32,
    pub latency_ms: u128,
    pub timestamp: i64,
}

impl Default for EvolutionEngine {
    fn default() -> Self {
        Self {
            level: 1.0,
            xp: 0.0,
            xp_to_next: 100.0,
            metrics: EvolutionMetrics::default(),
            patterns: PatternHistory {
                successful: Vec::new(),
                max_patterns: 100,
            },
            evolution_rate: 0.001,
            max_level: 10.0,
        }
    }
}

impl EvolutionEngine {
    /// Create new evolution engine
    pub fn new() -> Self {
        Self::default()
    }

    /// Create at specific level
    pub fn at_level(level: f32) -> Self {
        let mut engine = Self::default();
        engine.level = level.clamp(1.0, engine.max_level);
        engine
    }

    /// Update from interaction
    pub fn update(&mut self, state: &ConversationBrainState, latency_ms: u128) {
        // Track interaction
        self.metrics.total_interactions += 1;

        // Update coherence average
        self.update_coherence_avg(state.coherence_score);

        // Update latency trend
        self.metrics.latency_trend.push(latency_ms);
        if self.metrics.latency_trend.len() > 100 {
            self.metrics.latency_trend.remove(0);
        }

        // Calculate XP gain
        let xp_gain = self.calculate_xp_gain(state, latency_ms);
        self.add_xp(xp_gain);

        // Check for successful pattern
        if self.is_successful_interaction(state, latency_ms) {
            self.record_success_pattern(state, latency_ms);
            self.metrics.successful_interactions += 1;
        }

        // Update mode effectiveness
        let mode_key = format!("{:?}", state.mode);
        let effectiveness = self.calculate_mode_effectiveness(state);
        self.metrics
            .mode_effectiveness
            .entry(mode_key)
            .and_modify(|e| *e = (*e + effectiveness) / 2.0)
            .or_insert(effectiveness);

        // Update evolution level
        self.level = (self.level + self.evolution_rate).min(self.max_level);

        // Update cognitive drift
        self.update_cognitive_drift(state);
    }

    /// Calculate XP gain from interaction
    fn calculate_xp_gain(&self, state: &ConversationBrainState, latency_ms: u128) -> f32 {
        let mut xp = 1.0; // Base XP

        // Bonus for high coherence
        if state.coherence_score > 0.9 {
            xp += 2.0;
        } else if state.coherence_score > 0.8 {
            xp += 1.0;
        }

        // Bonus for fast response
        if latency_ms < 20 {
            xp += 1.5;
        } else if latency_ms < 30 {
            xp += 0.5;
        }

        // Bonus for complex mode handling
        match state.mode {
            ConversationMode::Meta | ConversationMode::Cognitive => xp += 1.0,
            ConversationMode::Creative => xp += 0.5,
            _ => {}
        }

        xp * self.evolution_rate
    }

    /// Add XP and handle leveling
    fn add_xp(&mut self, xp: f32) {
        self.xp += xp;

        // Level up check
        while self.xp >= self.xp_to_next && self.level < self.max_level {
            self.xp -= self.xp_to_next;
            self.level += 0.1;
            self.xp_to_next *= 1.2; // Increasing XP requirements
        }
    }

    /// Update coherence average
    fn update_coherence_avg(&mut self, coherence: f32) {
        let count = self.metrics.total_interactions as f32;
        self.metrics.avg_coherence =
            (self.metrics.avg_coherence * (count - 1.0) + coherence) / count;
    }

    /// Check if interaction was successful
    fn is_successful_interaction(&self, state: &ConversationBrainState, latency_ms: u128) -> bool {
        state.coherence_score > 0.85 && latency_ms < 30
    }

    /// Record successful pattern
    fn record_success_pattern(&mut self, state: &ConversationBrainState, latency_ms: u128) {
        let pattern = SuccessPattern {
            mode: state.mode,
            coherence: state.coherence_score,
            style_stability: 0.9, // Would come from style controller
            memory_relevance: state.context.relevance_score,
            latency_ms,
            timestamp: chrono::Utc::now().timestamp_millis(),
        };

        self.patterns.successful.push(pattern);

        // Trim if too many
        if self.patterns.successful.len() > self.patterns.max_patterns {
            self.patterns.successful.remove(0);
        }
    }

    /// Calculate mode effectiveness
    fn calculate_mode_effectiveness(&self, state: &ConversationBrainState) -> f32 {
        // Based on coherence and context relevance
        (state.coherence_score + state.context.relevance_score) / 2.0
    }

    /// Update cognitive drift metric
    fn update_cognitive_drift(&mut self, state: &ConversationBrainState) {
        // Drift increases with inconsistency, decreases with stability
        let target_drift = 1.0 - state.coherence_score;
        self.metrics.cognitive_drift =
            self.metrics.cognitive_drift * 0.9 + target_drift * 0.1;
    }

    /// Get current level
    pub fn level(&self) -> f32 {
        self.level
    }

    /// Get current XP
    pub fn xp(&self) -> f32 {
        self.xp
    }

    /// Get XP progress percentage
    pub fn xp_progress(&self) -> f32 {
        (self.xp / self.xp_to_next) * 100.0
    }

    /// Get metrics
    pub fn metrics(&self) -> &EvolutionMetrics {
        &self.metrics
    }

    /// Get success rate
    pub fn success_rate(&self) -> f32 {
        if self.metrics.total_interactions == 0 {
            return 1.0;
        }
        self.metrics.successful_interactions as f32 / self.metrics.total_interactions as f32
    }

    /// Get average latency
    pub fn avg_latency(&self) -> u128 {
        if self.metrics.latency_trend.is_empty() {
            return 0;
        }
        self.metrics.latency_trend.iter().sum::<u128>()
            / self.metrics.latency_trend.len() as u128
    }

    /// Get evolution snapshot
    pub fn snapshot(&self) -> EvolutionSnapshot {
        EvolutionSnapshot {
            level: self.level,
            xp: self.xp,
            xp_to_next: self.xp_to_next,
            xp_progress: self.xp_progress(),
            total_interactions: self.metrics.total_interactions,
            success_rate: self.success_rate(),
            avg_coherence: self.metrics.avg_coherence,
            avg_latency_ms: self.avg_latency(),
            cognitive_drift: self.metrics.cognitive_drift,
            pattern_count: self.patterns.successful.len(),
        }
    }

    /// Apply learnings from patterns
    pub fn apply_learnings(&self) -> LearningInsights {
        let mut insights = LearningInsights::default();

        if self.patterns.successful.is_empty() {
            return insights;
        }

        // Analyze successful modes
        let mut mode_counts: HashMap<ConversationMode, usize> = HashMap::new();
        let mut total_coherence = 0.0;
        let mut total_latency = 0u128;

        for pattern in &self.patterns.successful {
            *mode_counts.entry(pattern.mode).or_insert(0) += 1;
            total_coherence += pattern.coherence;
            total_latency += pattern.latency_ms;
        }

        // Best mode
        let best_mode = mode_counts
            .iter()
            .max_by_key(|(_, count)| *count)
            .map(|(mode, _)| *mode);

        insights.recommended_mode = best_mode;
        insights.avg_success_coherence = total_coherence / self.patterns.successful.len() as f32;
        insights.avg_success_latency = total_latency / self.patterns.successful.len() as u128;

        // Recommendations
        if insights.avg_success_coherence > 0.9 {
            insights.recommendations.push("Maintenir les patterns actuels".to_string());
        }

        if self.metrics.cognitive_drift > 0.2 {
            insights.recommendations.push("Réduire la dérive cognitive".to_string());
        }

        insights
    }

    /// Reset evolution (keep level, reset metrics)
    pub fn soft_reset(&mut self) {
        self.metrics = EvolutionMetrics::default();
        self.patterns.successful.clear();
    }

    /// Full reset
    pub fn hard_reset(&mut self) {
        *self = Self::default();
    }

    /// Set evolution rate
    pub fn set_evolution_rate(&mut self, rate: f32) {
        self.evolution_rate = rate.clamp(0.0001, 0.1);
    }
}

/// Evolution snapshot for reporting
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct EvolutionSnapshot {
    pub level: f32,
    pub xp: f32,
    pub xp_to_next: f32,
    pub xp_progress: f32,
    pub total_interactions: u64,
    pub success_rate: f32,
    pub avg_coherence: f32,
    pub avg_latency_ms: u128,
    pub cognitive_drift: f32,
    pub pattern_count: usize,
}

/// Learning insights from pattern analysis
#[derive(Debug, Clone, Default)]
pub struct LearningInsights {
    pub recommended_mode: Option<ConversationMode>,
    pub avg_success_coherence: f32,
    pub avg_success_latency: u128,
    pub recommendations: Vec<String>,
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_evolution_engine_creation() {
        let engine = EvolutionEngine::new();
        assert_eq!(engine.level(), 1.0);
        assert_eq!(engine.xp(), 0.0);
    }

    #[test]
    fn test_update_interaction() {
        let mut engine = EvolutionEngine::new();
        let state = ConversationBrainState::default();

        engine.update(&state, 15);

        assert_eq!(engine.metrics.total_interactions, 1);
        assert!(engine.xp() > 0.0);
    }

    #[test]
    fn test_success_tracking() {
        let mut engine = EvolutionEngine::new();
        let mut state = ConversationBrainState::default();
        state.coherence_score = 0.95;

        engine.update(&state, 15); // Fast, high coherence = success

        assert_eq!(engine.metrics.successful_interactions, 1);
    }

    #[test]
    fn test_xp_progress() {
        let mut engine = EvolutionEngine::new();
        engine.add_xp(50.0);

        let progress = engine.xp_progress();
        assert_eq!(progress, 50.0); // 50 out of 100
    }

    #[test]
    fn test_snapshot() {
        let engine = EvolutionEngine::new();
        let snapshot = engine.snapshot();

        assert_eq!(snapshot.level, 1.0);
        assert_eq!(snapshot.total_interactions, 0);
    }

    #[test]
    fn test_learning_insights() {
        let mut engine = EvolutionEngine::new();

        // Add some patterns
        for _ in 0..5 {
            let mut state = ConversationBrainState::default();
            state.coherence_score = 0.92;
            state.mode = ConversationMode::Expert;
            engine.update(&state, 18);
        }

        let insights = engine.apply_learnings();
        assert!(insights.recommended_mode.is_some());
        assert!(insights.avg_success_coherence > 0.9);
    }

    #[test]
    fn test_evolution_at_level() {
        let engine = EvolutionEngine::at_level(5.0);
        assert_eq!(engine.level(), 5.0);
    }

    #[test]
    fn test_success_rate() {
        let mut engine = EvolutionEngine::new();

        // One success, one failure
        let mut success_state = ConversationBrainState::default();
        success_state.coherence_score = 0.95;
        engine.update(&success_state, 15);

        let mut fail_state = ConversationBrainState::default();
        fail_state.coherence_score = 0.5;
        engine.update(&fail_state, 100);

        let rate = engine.success_rate();
        assert!(rate > 0.0 && rate < 1.0);
    }
}
