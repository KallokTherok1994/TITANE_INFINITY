use crate::core::backend::system::{
    identity::IdentityState,
    resonance::ResonanceState,
    conscience::ConscienceState,
    adaptive_intelligence::AdaptiveIntelligenceState,
    self_alignment::SelfAlignmentState,
    evolution::OrganicEvolutionState,
};

use super::metrics::{VitalityMetrics, clamp01};
pub fn compute_vitality(
    identity: &IdentityState,
    resonance: &ResonanceState,
    conscience: &ConscienceState,
    adaptive: &AdaptiveIntelligenceState,
    alignment: &SelfAlignmentState,
    evolution: &OrganicEvolutionState,
) -> VitalityMetrics {
    // Vitalité = cohérence + continuité + adaptabilité
    let mut vitality =
        identity.identity_core * 0.30 +
        evolution.continuity_factor * 0.30 +
        adaptive.adaptation_level * 0.40;
    vitality = clamp01(vitality);
    // Flux = résonance + plasticité + direction évolutive
    let mut flow =
        resonance.energy_wave * 0.40 +
        adaptive.plasticity_index * 0.35 +
        evolution.growth_vector * 0.25;
    flow = clamp01(flow);
    // Tension = turbulences + dérive + surcharge interne
    let mut tension =
        resonance.turbulence_index * 0.40 +
        alignment.drift_index * 0.30 +
        (1.0 - conscience.self_coherence) * 0.30;
    tension = clamp01(tension);
    VitalityMetrics {
        vitality,
        flow,
        tension,
    }
}
