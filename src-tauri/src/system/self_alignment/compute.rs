// TITANE∞ v8.0 - Self-Alignment Engine: Core Computation

use super::super::identity::IdentityState;
use super::super::meaning::MeaningState;
use super::super::resonance_v2::ResonanceV2State;
use super::super::evolution::EvolutionState;
use super::super::strategic_intelligence::StrategicIntelligenceState;
use super::metrics::{SelfAlignmentMetrics, clamp01};
pub fn compute_alignment(
    identity: &IdentityState,
    meaning: &MeaningState,
    resonance: &ResonanceV2State,
    evolution: &EvolutionState,
    strategic: &StrategicIntelligenceState,
) -> SelfAlignmentMetrics {
    // ALIGNMENT = identité + sens + résonance
    let mut alignment = identity.identity_alignment * 0.4
        + meaning.meaning_alignment * 0.35
        + resonance.coherence_harmonic_index * 0.25;
    alignment = clamp01(alignment);
    // DRIFT = instabilité + contradiction interne
    let mut drift = (identity.identity_continuity - evolution.evolution_momentum).abs() * 0.4
        + (meaning.meaning_orientation - strategic.long_term_alignment).abs() * 0.6;
    drift = clamp01(drift);
    // CORRECTION = drift + manque d'alignement
    let mut correction = drift * 0.6 + (1.0 - alignment) * 0.4;
    correction = clamp01(correction);
    SelfAlignmentMetrics {
        alignment,
        drift,
        correction,
    }
}
