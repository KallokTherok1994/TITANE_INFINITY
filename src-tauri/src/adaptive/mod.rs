// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v21 — ADAPTIVE MODULE
//   Module d'optimisation adaptative
// ═══════════════════════════════════════════════════════════════════════════════

pub mod adaptive_engine;
pub mod adaptive_commands;

#[cfg(test)]
pub mod tests;

pub use adaptive_engine::{
    AdaptiveOptimizationEngine,
    SystemPerformanceSample,
    AdaptiveRule,
    AdaptiveCondition,
    AdaptiveAction,
    PreferenceProfile,
    LearningState,
    AiPreference,
    SystemBehaviorMode,
    OptimizationBias,
    AdaptiveSummary,
};
