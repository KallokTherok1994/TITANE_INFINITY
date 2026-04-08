// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v30.0.0 — ADAPTIVE MODULE
//   Module d'optimisation adaptative
// ═══════════════════════════════════════════════════════════════════════════════

pub mod adaptive_commands;
pub mod adaptive_engine;

#[cfg(test)]
pub mod tests;

pub use adaptive_engine::{
    AdaptiveAction, AdaptiveCondition, AdaptiveOptimizationEngine, AdaptiveRule, AdaptiveSummary,
    AiPreference, LearningState, OptimizationBias, PreferenceProfile, SystemBehaviorMode,
    SystemPerformanceSample,
};
