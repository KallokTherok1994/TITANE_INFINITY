// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v22 — NARRATIVE MODULE
//   Module narratif et expressif
// ═══════════════════════════════════════════════════════════════════════════════

pub mod narrative_engine;
pub mod narrative_commands;

#[cfg(test)]
pub mod tests;

pub use narrative_engine::{
    NarrativeEngine,
    IdentityProfile,
    ToneModel,
    SymbolicModel,
    NarrativeArchetype,
    ExpressionRule,
    NarrativeOutput,
    StyleProfile,
    ToneModulation,
    NarrativePerspective,
};
