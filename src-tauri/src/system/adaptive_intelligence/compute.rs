// TITANE∞ v8.0 - Adaptive Intelligence Engine: Core Computation

use super::super::identity::IdentityState;
use super::super::meaning::MeaningState;
use super::super::conscience::ConscienceState;
use super::super::resonance_v2::ResonanceV2State;
use super::super::self_alignment::SelfAlignmentState;
use super::super::governor::GovernorState;
use super::super::mission::MissionState;
use super::super::evolution::EvolutionState;
use super::metrics::{AdaptiveMetrics, clamp01};
pub fn compute_adaptive_intelligence(
    identity: &IdentityState,
    meaning: &MeaningState,
    conscience: &ConscienceState,
    resonance: &ResonanceV2State,
    alignment: &SelfAlignmentState,
    governor: &GovernorState,
    mission: &MissionState,
    evolution: &EvolutionState,
) -> AdaptiveMetrics {
    // Plasticité = capacité à absorber & transformer
    let mut plasticity = conscience.insight_potential * 0.35
        + meaning.meaning_depth * 0.25
        + resonance.oscillation_index * 0.20
        + identity.identity_core * 0.20;
    plasticity = clamp01(plasticity);
    // Adaptation = réponse interne aux variations
    let mut adaptation = (1.0 - alignment.drift_index) * 0.4
        + governor.homeostasis_score * 0.30
        + mission.mission_vector * 0.30;
    adaptation = clamp01(adaptation);
    // Reserve = marge tampon pour absorber des tensions
    let mut reserve = identity.identity_continuity * 0.40
        + evolution.evolution_momentum * 0.35
        + (1.0 - governor.regulation_level) * 0.25;
    reserve = clamp01(reserve);
    AdaptiveMetrics {
        plasticity,
        adaptation,
        reserve,
    }
}
