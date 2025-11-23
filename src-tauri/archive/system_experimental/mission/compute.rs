// TITANE∞ v8.0 - Mission Engine: Core Computation
use crate::shared::utils::*;

use super::super::identity::IdentityState;
use super::super::meaning::MeaningState;
use super::super::self_alignment::SelfAlignmentState;
use super::super::resonance_v2::ResonanceV2State;
use super::super::evolution::EvolutionState;
use super::super::strategic_intelligence::StrategicIntelligenceState;
use super::metrics::{MissionMetrics, clamp01};
pub fn compute_mission(
    identity: &IdentityState,
    meaning: &MeaningState,
    alignment: &SelfAlignmentState,
    resonance: &ResonanceV2State,
    evolution: &EvolutionState,
    strategic: &StrategicIntelligenceState,
) -> MissionMetrics {
    // AXE = identité + sens profond + cohérence
    let mut axis = identity.identity_core * 0.35
        + meaning.meaning_depth * 0.35
        + resonance.coherence_harmonic_index * 0.30;
    axis = clamp01(axis);
    // VECTOR = direction évolutive + orientation de sens
    let mut vector = evolution.evolution_momentum * 0.5
        + meaning.meaning_orientation * 0.3
        + strategic.long_term_alignment * 0.2;
    vector = clamp01(vector);
    // COHERENCE = alignement + stabilité de l'axe
    let mut coherence = alignment.alignment_index * 0.45
        + (1.0 - alignment.drift_index) * 0.35
        + identity.identity_continuity * 0.20;
    coherence = clamp01(coherence);
    MissionMetrics {
        axis,
        vector,
        coherence,
    }
}
