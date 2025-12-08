//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — BEHAVIOR ENGINE vΩ
//! Super Prompt #16 — Comportements Cognitifs Unifiés
//! ═══════════════════════════════════════════════════════════════════════════════

pub mod behavior_profile;
pub mod behavior_rules;
pub mod behavior_state;
pub mod engine_behavior;

pub use behavior_profile::{BehaviorMode, BehaviorProfile};
pub use behavior_rules::BehaviorRules;
pub use behavior_state::BehaviorState;
pub use engine_behavior::{BehaviorEngine, EmotionSignal, EmotionType, Intent};
