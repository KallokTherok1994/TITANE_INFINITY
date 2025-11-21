// TITANE∞ v12 - AdaptiveEngine Module
// Dynamic adaptation of AI behavior based on context and performance

use super::ModuleStatus;
use log::info;

pub struct AdaptiveEngine {
    active: bool,
    health: f32,
    learning_rate: f32,
    adaptation_history: Vec<Adaptation>,
}

#[derive(Debug, Clone)]
pub struct Adaptation {
    pub parameter: String,
    pub old_value: f32,
    pub new_value: f32,
    pub timestamp: i64,
    pub reason: String,
}

#[derive(Debug, Clone)]
pub struct AdaptiveConfig {
    pub temperature: f32,
    pub max_tokens: usize,
    pub response_speed: ResponseSpeed,
    pub verbosity: f32,
    pub creativity: f32,
}

impl Default for AdaptiveConfig {
    fn default() -> Self {
        Self {
            temperature: 0.7,
            max_tokens: 2000,
            response_speed: ResponseSpeed::Normal,
            verbosity: 0.7,
            creativity: 0.6,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ResponseSpeed {
    Fast,
    Normal,
    Thorough,
}

impl AdaptiveEngine {
    pub fn new() -> Self {
        info!("AdaptiveEngine initialized");
        Self {
            active: true,
            health: 1.0,
            learning_rate: 0.1,
            adaptation_history: Vec::new(),
        }
    }

    pub fn adapt_config(
        &mut self,
        current: &AdaptiveConfig,
        context: &AdaptationContext,
    ) -> AdaptiveConfig {
        let mut adapted = current.clone();

        // Adapt temperature based on creativity needs
        if context.requires_creativity {
            adapted.temperature = self.adapt_parameter(
                adapted.temperature,
                0.9,
                "High creativity required",
            );
        } else if context.requires_precision {
            adapted.temperature = self.adapt_parameter(
                adapted.temperature,
                0.3,
                "High precision required",
            );
        }

        // Adapt max tokens based on complexity
        if context.complexity > 0.7 {
            adapted.max_tokens = (adapted.max_tokens as f32 * 1.5) as usize;
            self.record_adaptation(
                "max_tokens".to_string(),
                current.max_tokens as f32,
                adapted.max_tokens as f32,
                "High complexity detected",
            );
        }

        // Adapt response speed based on urgency
        if context.urgency > 0.8 {
            adapted.response_speed = ResponseSpeed::Fast;
        } else if context.requires_depth {
            adapted.response_speed = ResponseSpeed::Thorough;
        }

        // Adapt verbosity based on user preference
        if context.user_prefers_concise {
            adapted.verbosity =
                self.adapt_parameter(adapted.verbosity, 0.4, "User prefers concise responses");
        } else if context.user_prefers_detailed {
            adapted.verbosity =
                self.adapt_parameter(adapted.verbosity, 0.9, "User prefers detailed responses");
        }

        adapted
    }

    fn adapt_parameter(&mut self, current: f32, target: f32, reason: &str) -> f32 {
        let new_value = current + (target - current) * self.learning_rate;
        self.record_adaptation(
            "parameter".to_string(),
            current,
            new_value,
            reason,
        );
        new_value.clamp(0.0, 1.0)
    }

    fn record_adaptation(&mut self, parameter: String, old_value: f32, new_value: f32, reason: &str) {
        let adaptation = Adaptation {
            parameter,
            old_value,
            new_value,
            timestamp: chrono::Utc::now().timestamp(),
            reason: reason.to_string(),
        };

        self.adaptation_history.push(adaptation);

        // Keep only last 100 adaptations
        if self.adaptation_history.len() > 100 {
            self.adaptation_history.drain(0..50);
        }
    }

    pub fn analyze_performance(&self, feedback: &PerformanceFeedback) -> PerformanceAnalysis {
        let overall_score = (feedback.response_quality
            + feedback.response_relevance
            + feedback.user_satisfaction)
            / 3.0;

        let needs_improvement = overall_score < 0.7;

        let recommendations = if needs_improvement {
            vec![
                "Consider adjusting temperature".to_string(),
                "Review context window size".to_string(),
                "Analyze user feedback patterns".to_string(),
            ]
        } else {
            vec!["Performance is optimal".to_string()]
        };

        PerformanceAnalysis {
            overall_score,
            needs_improvement,
            recommendations,
            timestamp: chrono::Utc::now().timestamp(),
        }
    }

    pub fn get_status(&self) -> ModuleStatus {
        ModuleStatus {
            name: "AdaptiveEngine".to_string(),
            active: self.active,
            health: self.health,
            last_check: chrono::Utc::now().timestamp(),
        }
    }

    pub fn get_adaptation_history(&self) -> &[Adaptation] {
        &self.adaptation_history
    }

    pub fn set_learning_rate(&mut self, rate: f32) {
        self.learning_rate = rate.clamp(0.0, 1.0);
    }
}

impl Default for AdaptiveEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone)]
pub struct AdaptationContext {
    pub requires_creativity: bool,
    pub requires_precision: bool,
    pub requires_depth: bool,
    pub complexity: f32,
    pub urgency: f32,
    pub user_prefers_concise: bool,
    pub user_prefers_detailed: bool,
}

impl Default for AdaptationContext {
    fn default() -> Self {
        Self {
            requires_creativity: false,
            requires_precision: true,
            requires_depth: false,
            complexity: 0.5,
            urgency: 0.5,
            user_prefers_concise: false,
            user_prefers_detailed: false,
        }
    }
}

#[derive(Debug, Clone)]
pub struct PerformanceFeedback {
    pub response_quality: f32,
    pub response_relevance: f32,
    pub user_satisfaction: f32,
}

#[derive(Debug, Clone)]
pub struct PerformanceAnalysis {
    pub overall_score: f32,
    pub needs_improvement: bool,
    pub recommendations: Vec<String>,
    pub timestamp: i64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_adaptive_engine_creation() {
        let engine = AdaptiveEngine::new();
        assert!(engine.active);
    }

    #[test]
    fn test_config_adaptation() {
        let mut engine = AdaptiveEngine::new();
        let config = AdaptiveConfig::default();
        let mut context = AdaptationContext::default();
        context.requires_creativity = true;

        let adapted = engine.adapt_config(&config, &context);
        assert!(adapted.temperature > config.temperature);
    }

    #[test]
    fn test_performance_analysis() {
        let engine = AdaptiveEngine::new();
        let feedback = PerformanceFeedback {
            response_quality: 0.9,
            response_relevance: 0.8,
            user_satisfaction: 0.85,
        };

        let analysis = engine.analyze_performance(&feedback);
        assert!(!analysis.needs_improvement);
    }
}
