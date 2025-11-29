// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v22 — NARRATIVE MODULE
//   Module narratif et expressif
// ═══════════════════════════════════════════════════════════════════════════════

pub mod narrative_commands;
pub mod narrative_engine;

#[cfg(test)]
pub mod tests;

pub use narrative_engine::{
    ExpressionRule, IdentityProfile, NarrativeArchetype, NarrativeEngine, NarrativeOutput,
    NarrativePerspective, StyleProfile, SymbolicModel, ToneModel, ToneModulation,
};
