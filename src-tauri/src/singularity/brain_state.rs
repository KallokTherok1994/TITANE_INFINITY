// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — SINGULARITY OS - BRAIN STATE
//   Super Prompt #13: Conversation Brain - Core Data Structures
//   The unified cognitive state of the system
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

/// Conversation Mode - Determines the personality and approach
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ConversationMode {
    /// Warm, guiding, progressive - helps user grow
    Coach,
    /// Structured, precise, technical - delivers expertise
    Expert,
    /// Abstract, conceptual, pattern-focused - meta-thinking
    Meta,
    /// Analytical, introspective - understanding mind
    Cognitive,
    /// Fluid, imaginative, open - creative expression
    Creative,
    /// Factual, neutral, logical - pure reasoning
    Logic,
    /// Calm, balanced, harmonious - emotional equilibrium
    Harmonic,
    /// Default balanced mode
    Neutral,
}

impl Default for ConversationMode {
    fn default() -> Self {
        Self::Neutral
    }
}

impl ConversationMode {
    /// Get mode weight for blending
    pub fn weight(&self) -> f32 {
        match self {
            Self::Coach => 0.9,
            Self::Expert => 0.95,
            Self::Meta => 0.85,
            Self::Cognitive => 0.88,
            Self::Creative => 0.82,
            Self::Logic => 0.92,
            Self::Harmonic => 0.87,
            Self::Neutral => 0.8,
        }
    }

    /// Get description for logging
    pub fn description(&self) -> &'static str {
        match self {
            Self::Coach => "Warm, guiding, progressive",
            Self::Expert => "Structured, precise, technical",
            Self::Meta => "Abstract, conceptual, patterns",
            Self::Cognitive => "Analytical, introspective",
            Self::Creative => "Fluid, imaginative, open",
            Self::Logic => "Factual, neutral, logical",
            Self::Harmonic => "Calm, balanced, harmonious",
            Self::Neutral => "Default balanced mode",
        }
    }
}

/// Intent Classification - Semantic understanding of user message
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum IntentClass {
    /// User seeking information
    Query,
    /// User wants to accomplish a task
    Task,
    /// User asking for help/guidance
    Help,
    /// User expressing emotion/venting
    Emotional,
    /// User engaging in casual conversation
    Conversation,
    /// User giving commands/instructions
    Command,
    /// User asking for creative output
    Creative,
    /// User debugging or troubleshooting
    Debug,
    /// User seeking explanation
    Explanation,
    /// Meta-discussion about the system
    MetaQuery,
    /// Unknown/ambiguous intent
    Unknown,
}

impl Default for IntentClass {
    fn default() -> Self {
        Self::Unknown
    }
}

/// Affective State - Emotional tonality of response
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct AffectiveState {
    /// Positive/negative sentiment (-1.0 to 1.0)
    pub valence: f32,
    /// Energy level (0.0 to 1.0)
    pub arousal: f32,
    /// Confidence in emotional state
    pub confidence: f32,
}

impl Default for AffectiveState {
    fn default() -> Self {
        Self {
            valence: 0.2,  // Slightly positive
            arousal: 0.5,  // Balanced energy
            confidence: 0.8,
        }
    }
}

impl AffectiveState {
    pub fn new(valence: f32, arousal: f32) -> Self {
        Self {
            valence: valence.clamp(-1.0, 1.0),
            arousal: arousal.clamp(0.0, 1.0),
            confidence: 0.8,
        }
    }

    /// Create from mode
    pub fn from_mode(mode: ConversationMode) -> Self {
        match mode {
            ConversationMode::Coach => Self::new(0.5, 0.4),     // Warm, calm
            ConversationMode::Expert => Self::new(0.1, 0.3),   // Neutral, controlled
            ConversationMode::Meta => Self::new(0.2, 0.2),     // Detached, thoughtful
            ConversationMode::Cognitive => Self::new(0.0, 0.4), // Neutral, active
            ConversationMode::Creative => Self::new(0.4, 0.6), // Positive, energetic
            ConversationMode::Logic => Self::new(0.0, 0.2),    // Neutral, low energy
            ConversationMode::Harmonic => Self::new(0.3, 0.3), // Positive, calm
            ConversationMode::Neutral => Self::new(0.1, 0.4),  // Slightly positive
        }
    }
}

/// Style Profile - How the response is structured and delivered
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleProfile {
    /// Tone of voice (e.g., "chaleureux", "technique", "neutre")
    pub tone: String,
    /// Structure preference (e.g., "progressif", "concis", "fluide")
    pub structure: String,
    /// Information density (0.0-1.0, low to high)
    pub density: f32,
    /// Response tempo (0.0-1.0, slow to fast)
    pub tempo: f32,
    /// Formality level (0.0-1.0, casual to formal)
    pub formality: f32,
    /// Use of examples and analogies
    pub use_examples: bool,
    /// Use of emojis/emoticons
    pub use_emojis: bool,
}

impl Default for StyleProfile {
    fn default() -> Self {
        Self {
            tone: "équilibré".to_string(),
            structure: "clair".to_string(),
            density: 0.5,
            tempo: 0.5,
            formality: 0.5,
            use_examples: true,
            use_emojis: false,
        }
    }
}

impl StyleProfile {
    /// Create style from conversation mode
    pub fn from_mode(mode: ConversationMode) -> Self {
        match mode {
            ConversationMode::Coach => Self {
                tone: "chaleureux".to_string(),
                structure: "progressif".to_string(),
                density: 0.4,
                tempo: 0.4,
                formality: 0.3,
                use_examples: true,
                use_emojis: false,
            },
            ConversationMode::Expert => Self {
                tone: "technique".to_string(),
                structure: "concis".to_string(),
                density: 0.8,
                tempo: 0.6,
                formality: 0.7,
                use_examples: true,
                use_emojis: false,
            },
            ConversationMode::Meta => Self {
                tone: "abstrait".to_string(),
                structure: "conceptuel".to_string(),
                density: 0.6,
                tempo: 0.3,
                formality: 0.6,
                use_examples: false,
                use_emojis: false,
            },
            ConversationMode::Cognitive => Self {
                tone: "analytique".to_string(),
                structure: "structuré".to_string(),
                density: 0.7,
                tempo: 0.5,
                formality: 0.5,
                use_examples: true,
                use_emojis: false,
            },
            ConversationMode::Creative => Self {
                tone: "fluide".to_string(),
                structure: "libre".to_string(),
                density: 0.5,
                tempo: 0.6,
                formality: 0.2,
                use_examples: true,
                use_emojis: false,
            },
            ConversationMode::Logic => Self {
                tone: "factuel".to_string(),
                structure: "linéaire".to_string(),
                density: 0.9,
                tempo: 0.5,
                formality: 0.8,
                use_examples: false,
                use_emojis: false,
            },
            ConversationMode::Harmonic => Self {
                tone: "calme".to_string(),
                structure: "équilibré".to_string(),
                density: 0.4,
                tempo: 0.3,
                formality: 0.4,
                use_examples: true,
                use_emojis: false,
            },
            ConversationMode::Neutral => Self::default(),
        }
    }
}

/// Memory Context - Retrieved relevant memories
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct MemoryContext {
    /// Retrieved memory entries
    pub items: Vec<MemoryContextItem>,
    /// Total relevance score
    pub relevance_score: f32,
    /// Source distribution (STM, MTM, LTM)
    pub source_distribution: HashMap<String, usize>,
    /// Timestamp of retrieval
    pub retrieved_at: i64,
}

/// Single memory context item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryContextItem {
    pub id: Uuid,
    pub content: String,
    pub relevance: f32,
    pub source_tier: String,
    pub timestamp: i64,
}

/// Constraint Profile - Rules for coherence and behavior
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConstraintProfile {
    /// Maximum response length (tokens)
    pub max_length: usize,
    /// Required topics to address
    pub required_topics: Vec<String>,
    /// Forbidden topics/words
    pub forbidden: Vec<String>,
    /// Tone constraints
    pub tone_constraints: Vec<String>,
    /// Safety level (0.0-1.0)
    pub safety_level: f32,
    /// Coherence threshold
    pub coherence_threshold: f32,
}

impl Default for ConstraintProfile {
    fn default() -> Self {
        Self {
            max_length: 2000,
            required_topics: vec![],
            forbidden: vec![],
            tone_constraints: vec![],
            safety_level: 0.9,
            coherence_threshold: 0.85,
        }
    }
}

/// The complete cognitive state of the Singularity OS
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationBrainState {
    /// Session identifier
    pub session_id: Uuid,
    /// Current conversation mode
    pub mode: ConversationMode,
    /// Classified intent
    pub intent: IntentClass,
    /// Affective/emotional state
    pub affect: AffectiveState,
    /// Memory context
    pub context: MemoryContext,
    /// Style profile
    pub style: StyleProfile,
    /// Reasoning chain (compressed)
    pub reasoning_chain: Vec<String>,
    /// Constraints
    pub constraints: ConstraintProfile,
    /// Evolution level (auto-improvement metric)
    pub evolution_level: f32,
    /// Coherence score
    pub coherence_score: f32,
    /// Last updated timestamp
    pub updated_at: i64,
    /// Message count in session
    pub message_count: u32,
    /// Total processing time (ms)
    pub total_processing_ms: u128,
}

impl Default for ConversationBrainState {
    fn default() -> Self {
        Self {
            session_id: Uuid::new_v4(),
            mode: ConversationMode::default(),
            intent: IntentClass::default(),
            affect: AffectiveState::default(),
            context: MemoryContext::default(),
            style: StyleProfile::default(),
            reasoning_chain: vec![],
            constraints: ConstraintProfile::default(),
            evolution_level: 1.0,
            coherence_score: 0.85,
            updated_at: chrono::Utc::now().timestamp_millis(),
            message_count: 0,
            total_processing_ms: 0,
        }
    }
}

impl ConversationBrainState {
    /// Create new brain state for a session
    pub fn new() -> Self {
        Self::default()
    }

    /// Create with specific mode
    pub fn with_mode(mode: ConversationMode) -> Self {
        let mut state = Self::default();
        state.mode = mode;
        state.affect = AffectiveState::from_mode(mode);
        state.style = StyleProfile::from_mode(mode);
        state
    }

    /// Update mode and cascade changes
    pub fn set_mode(&mut self, mode: ConversationMode) {
        self.mode = mode;
        self.affect = AffectiveState::from_mode(mode);
        self.style = StyleProfile::from_mode(mode);
        self.updated_at = chrono::Utc::now().timestamp_millis();
    }

    /// Add to reasoning chain
    pub fn add_reasoning(&mut self, step: String) {
        self.reasoning_chain.push(step);
        // Keep chain manageable
        if self.reasoning_chain.len() > 20 {
            self.reasoning_chain.remove(0);
        }
    }

    /// Increment evolution
    pub fn evolve(&mut self, delta: f32) {
        self.evolution_level = (self.evolution_level + delta).clamp(0.0, 10.0);
    }

    /// Get compressed reasoning summary
    pub fn reasoning_summary(&self) -> String {
        if self.reasoning_chain.is_empty() {
            return "No reasoning recorded".to_string();
        }

        let last_n = self.reasoning_chain.iter().rev().take(3).collect::<Vec<_>>();
        last_n.into_iter().rev().cloned().collect::<Vec<_>>().join(" → ")
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_conversation_mode_defaults() {
        let mode = ConversationMode::default();
        assert_eq!(mode, ConversationMode::Neutral);
    }

    #[test]
    fn test_affective_state_from_mode() {
        let coach_affect = AffectiveState::from_mode(ConversationMode::Coach);
        assert!(coach_affect.valence > 0.0); // Coach is warm/positive

        let logic_affect = AffectiveState::from_mode(ConversationMode::Logic);
        assert!(logic_affect.valence.abs() < 0.1); // Logic is neutral
    }

    #[test]
    fn test_style_profile_from_mode() {
        let expert_style = StyleProfile::from_mode(ConversationMode::Expert);
        assert_eq!(expert_style.tone, "technique");
        assert!(expert_style.density > 0.7);

        let creative_style = StyleProfile::from_mode(ConversationMode::Creative);
        assert_eq!(creative_style.tone, "fluide");
        assert!(creative_style.formality < 0.5);
    }

    #[test]
    fn test_brain_state_mode_cascade() {
        let mut state = ConversationBrainState::new();
        state.set_mode(ConversationMode::Coach);

        assert_eq!(state.mode, ConversationMode::Coach);
        assert!(state.affect.valence > 0.0);
        assert_eq!(state.style.tone, "chaleureux");
    }

    #[test]
    fn test_reasoning_chain() {
        let mut state = ConversationBrainState::new();
        state.add_reasoning("Step 1".to_string());
        state.add_reasoning("Step 2".to_string());
        state.add_reasoning("Step 3".to_string());

        let summary = state.reasoning_summary();
        assert!(summary.contains("Step 1"));
        assert!(summary.contains("→"));
    }

    #[test]
    fn test_evolution() {
        let mut state = ConversationBrainState::new();
        let initial = state.evolution_level;
        state.evolve(0.5);
        assert!(state.evolution_level > initial);
    }
}
