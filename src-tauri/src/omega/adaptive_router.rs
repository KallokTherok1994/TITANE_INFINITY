// ═══════════════════════════════════════════════════════════════
//   OMEGA ADAPTIVE ROUTER — Dynamic Engine Selection
//   SUPER PROMPT #8: Intelligent engine routing based on context
// ═══════════════════════════════════════════════════════════════

use crate::omega::context_v2::{OmegaContextV2, OmegaInput};
use serde::{Deserialize, Serialize};

/// Engine ID
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum EngineId {
    Orchestrator,   // #0
    Style,          // #1
    Coherence,      // #2
    Reflection,     // #3
    Emotion,        // #4
    Memory,         // #5 (deprecated, using MemoryOS)
    Behavior,       // #6
    Adaptation,     // #7
    SystemHealth,   // #8
    ConversationOS, // #∞
}

impl EngineId {
    pub fn as_str(&self) -> &'static str {
        match self {
            EngineId::Orchestrator => "orchestrator",
            EngineId::Style => "style",
            EngineId::Coherence => "coherence",
            EngineId::Reflection => "reflection",
            EngineId::Emotion => "emotion",
            EngineId::Memory => "memory",
            EngineId::Behavior => "behavior",
            EngineId::Adaptation => "adaptation",
            EngineId::SystemHealth => "system_health",
            EngineId::ConversationOS => "conversation_os",
        }
    }
}

/// Adaptive Router
pub struct AdaptiveRouter {
    config: AdaptiveRouterConfig,
}

#[derive(Debug, Clone)]
pub struct AdaptiveRouterConfig {
    /// Enable adaptive routing (if false, use static pipeline)
    pub enable_adaptive: bool,

    /// Minimum engines to activate
    pub min_engines: usize,

    /// Maximum engines to activate
    pub max_engines: usize,

    /// Enable parallel execution hints
    pub enable_parallel: bool,
}

impl Default for AdaptiveRouterConfig {
    fn default() -> Self {
        Self {
            enable_adaptive: true,
            min_engines: 3,
            max_engines: 8,
            enable_parallel: true,
        }
    }
}

impl AdaptiveRouter {
    pub fn new(config: AdaptiveRouterConfig) -> Self {
        Self { config }
    }

    /// Route engines based on context
    pub fn route(&self, ctx: &OmegaContextV2) -> EngineSequence {
        if !self.config.enable_adaptive {
            return self.static_pipeline();
        }

        let mut sequence = EngineSequence::new();

        // Always start with Orchestrator
        sequence.add(EngineId::Orchestrator, false);

        // Analyze input type
        match &ctx.input {
            OmegaInput::Text(text) => {
                self.route_text(text, ctx, &mut sequence);
            }
            OmegaInput::Voice { .. } => {
                self.route_voice(ctx, &mut sequence);
            }
            OmegaInput::Command(_) => {
                self.route_command(ctx, &mut sequence);
            }
            OmegaInput::SystemEvent(_) => {
                self.route_system_event(ctx, &mut sequence);
            }
            OmegaInput::Hybrid { .. } => {
                self.route_hybrid(ctx, &mut sequence);
            }
        }

        // Always end with ConversationOS
        sequence.add(EngineId::ConversationOS, false);

        // Enforce limits
        sequence.truncate(self.config.max_engines);

        sequence
    }

    /// Route text input
    fn route_text(&self, text: &str, ctx: &OmegaContextV2, sequence: &mut EngineSequence) {
        // Coherence (always for text)
        sequence.add(EngineId::Coherence, true);

        // Check if complex reasoning needed
        if self.is_complex_query(text) {
            sequence.add(EngineId::Reflection, false);
        }

        // Check if emotional content
        if self.has_emotional_content(text) {
            sequence.add(EngineId::Emotion, true);
        }

        // Check if user history relevant
        if ctx.total_memory_entries() > 0 {
            sequence.add(EngineId::Behavior, false);
        }

        // Check if system under pressure
        if ctx.is_system_under_pressure() {
            sequence.add(EngineId::Adaptation, false);
        }

        // Check if high priority
        if ctx.is_high_priority() {
            // Skip heavy engines
            sequence.remove(EngineId::Reflection);
            sequence.remove(EngineId::Behavior);
        }
    }

    /// Route voice input
    fn route_voice(&self, ctx: &OmegaContextV2, sequence: &mut EngineSequence) {
        // Voice inputs prioritize emotion + coherence
        sequence.add(EngineId::Emotion, true);
        sequence.add(EngineId::Coherence, true);

        if ctx.total_memory_entries() > 0 {
            sequence.add(EngineId::Behavior, false);
        }
    }

    /// Route command input
    fn route_command(&self, _ctx: &OmegaContextV2, sequence: &mut EngineSequence) {
        // Commands are direct, skip most cognitive engines
        sequence.add(EngineId::Coherence, false);
    }

    /// Route system event
    fn route_system_event(&self, _ctx: &OmegaContextV2, sequence: &mut EngineSequence) {
        // System events go through SystemHealth + Adaptation
        sequence.add(EngineId::SystemHealth, false);
        sequence.add(EngineId::Adaptation, false);
    }

    /// Route hybrid input
    fn route_hybrid(&self, ctx: &OmegaContextV2, sequence: &mut EngineSequence) {
        // Hybrid: use all engines
        self.route_text(&ctx.input_text(), ctx, sequence);
    }

    /// Static pipeline (fallback)
    fn static_pipeline(&self) -> EngineSequence {
        let mut sequence = EngineSequence::new();

        sequence.add(EngineId::Orchestrator, false);
        sequence.add(EngineId::Coherence, true);
        sequence.add(EngineId::Reflection, false);
        sequence.add(EngineId::Emotion, true);
        sequence.add(EngineId::Behavior, false);
        sequence.add(EngineId::ConversationOS, false);

        sequence
    }

    /// Check if query is complex
    fn is_complex_query(&self, text: &str) -> bool {
        // Heuristic: length, keywords, question marks
        if text.len() > 200 {
            return true;
        }

        let keywords = ["explain", "why", "how", "analyze", "compare", "elaborate"];
        keywords.iter().any(|k| text.to_lowercase().contains(k))
    }

    /// Check if text has emotional content
    fn has_emotional_content(&self, text: &str) -> bool {
        let emotional_keywords = [
            "feel", "love", "hate", "sad", "happy", "angry", "worried", "excited", "!",
        ];
        emotional_keywords
            .iter()
            .any(|k| text.to_lowercase().contains(k))
    }
}

/// Engine Sequence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineSequence {
    pub engines: Vec<EngineExecution>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineExecution {
    pub engine: EngineId,
    pub can_parallel: bool,
}

impl EngineSequence {
    pub fn new() -> Self {
        Self {
            engines: Vec::new(),
        }
    }

    pub fn add(&mut self, engine: EngineId, can_parallel: bool) {
        // Avoid duplicates
        if !self.engines.iter().any(|e| e.engine == engine) {
            self.engines.push(EngineExecution {
                engine,
                can_parallel,
            });
        }
    }

    pub fn remove(&mut self, engine: EngineId) {
        self.engines.retain(|e| e.engine != engine);
    }

    pub fn truncate(&mut self, max: usize) {
        self.engines.truncate(max);
    }

    pub fn len(&self) -> usize {
        self.engines.len()
    }

    pub fn is_empty(&self) -> bool {
        self.engines.is_empty()
    }
}

impl Default for EngineSequence {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_adaptive_router_text() {
        let config = AdaptiveRouterConfig::default();
        let router = AdaptiveRouter::new(config);

        let input = OmegaInput::Text("Why is the sky blue?".to_string());
        let ctx = OmegaContextV2::new(input);

        let sequence = router.route(&ctx);

        assert!(!sequence.is_empty());
        assert!(sequence
            .engines
            .iter()
            .any(|e| e.engine == EngineId::Orchestrator));
        assert!(sequence
            .engines
            .iter()
            .any(|e| e.engine == EngineId::Coherence));
    }

    #[test]
    fn test_complex_query_detection() {
        let config = AdaptiveRouterConfig::default();
        let router = AdaptiveRouter::new(config);

        assert!(router.is_complex_query("Can you explain how quantum computing works?"));
        assert!(!router.is_complex_query("Hello"));
    }

    #[test]
    fn test_emotional_content_detection() {
        let config = AdaptiveRouterConfig::default();
        let router = AdaptiveRouter::new(config);

        assert!(router.has_emotional_content("I feel so happy today!"));
        assert!(!router.has_emotional_content("What is the weather?"));
    }
}
