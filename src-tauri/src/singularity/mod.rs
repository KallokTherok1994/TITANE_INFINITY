// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — SINGULARITY MODULE
//   Super Prompt #13: Conversation Brain + Original Engines
//   Architecture: 20 moteurs → 1 état global cohérent + OS cognitif
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//   MODULES EXISTANTS v17 (Legacy)
// ═══════════════════════════════════════════════════════════════
pub mod coherence;
pub mod core;
pub mod emergent;
pub mod fusion;
pub mod security;
pub mod singularity_state;
pub mod totality;

// ═══════════════════════════════════════════════════════════════
//   MODULES v∞ (v20)
// ═══════════════════════════════════════════════════════════════
pub mod singularity_commands;
pub mod singularity_selftest;
pub mod singularity_state_vinfinity;

// Module v∞.19.3Ω (Phase 8 - IA Context)
pub mod ia_context;

// ═══════════════════════════════════════════════════════════════
//   SINGULARITY OS vΩ (Super Prompt #13 - Conversation Brain)
// ═══════════════════════════════════════════════════════════════
pub mod brain_state;
pub mod reasoning;
pub mod style_controller;
pub mod emotion_controller;
pub mod coherence_controller;
pub mod behavior_controller;
pub mod mode_selector;
pub mod evolution_engine;
pub mod singularity_os;

// ═══════════════════════════════════════════════════════════════
//   EXPORTS v17 (Legacy)
// ═══════════════════════════════════════════════════════════════
pub use self::core::*;
pub use coherence::*;
pub use emergent::*;
pub use fusion::*;
pub use security::*;
pub use singularity_state::*;
pub use totality::*;

// ═══════════════════════════════════════════════════════════════
//   EXPORTS v∞
// ═══════════════════════════════════════════════════════════════
pub use singularity_commands::*;
pub use ia_context::*;
pub use singularity_selftest::*;
pub use singularity_state_vinfinity::*;

// ═══════════════════════════════════════════════════════════════
//   EXPORTS SINGULARITY OS vΩ (Super Prompt #13)
// ═══════════════════════════════════════════════════════════════
pub use brain_state::{
    ConversationMode, IntentClass, AffectiveState, StyleProfile,
    MemoryContext, MemoryContextItem, ConstraintProfile, ConversationBrainState,
};
pub use reasoning::{ReasoningEngine, ReasoningResult};
pub use style_controller::StyleController;
pub use emotion_controller::EmotionController;
pub use coherence_controller::{CoherenceController, CoherenceResult, CoherenceWeights};
pub use behavior_controller::{BehaviorController, BehaviorProfile, BehaviorFlags};
pub use mode_selector::ModeSelector;
pub use evolution_engine::{EvolutionEngine, EvolutionSnapshot, EvolutionMetrics};
pub use singularity_os::{
    SingularityOS, SingularityOutput, SingularityHealth, SingularityError,
    QuickOutput, IntentClassifier, targets,
};
