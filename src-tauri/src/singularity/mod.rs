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
pub mod behavior_controller;
pub mod brain_state;
pub mod coherence_controller;
pub mod emotion_controller;
pub mod evolution_engine;
pub mod mode_selector;
pub mod reasoning;
pub mod singularity_os;
pub mod style_controller;

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
pub use ia_context::*;
pub use singularity_commands::*;
pub use singularity_selftest::*;
pub use singularity_state_vinfinity::*;

// ═══════════════════════════════════════════════════════════════
//   EXPORTS SINGULARITY OS vΩ (Super Prompt #13)
// ═══════════════════════════════════════════════════════════════
pub use behavior_controller::{BehaviorController, BehaviorFlags, BehaviorProfile};
pub use brain_state::{
    AffectiveState, ConstraintProfile, ConversationBrainState, ConversationMode, IntentClass,
    MemoryContext, MemoryContextItem, StyleProfile,
};
pub use coherence_controller::{CoherenceController, CoherenceResult, CoherenceWeights};
pub use emotion_controller::EmotionController;
pub use evolution_engine::{EvolutionEngine, EvolutionMetrics, EvolutionSnapshot};
pub use mode_selector::ModeSelector;
pub use reasoning::{ReasoningEngine, ReasoningResult};
pub use singularity_os::{
    targets, IntentClassifier, QuickOutput, SingularityError, SingularityHealth, SingularityOS,
    SingularityOutput,
};
pub use style_controller::StyleController;
