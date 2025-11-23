use crate::core::backend::system::{
    vitality::VitalityState,
    harmonic_flow::HarmonicFlowState,
    adaptive_intelligence::AdaptiveIntelligenceState,
    resonance::ResonanceState,
    self_alignment::SelfAlignmentState,
};

use super::metrics::{InnerDynamicsMetrics, clamp01};
pub fn compute_inner_dynamics(
    vitality: &VitalityState,
    harmonic: &HarmonicFlowState,
    adaptive: &AdaptiveIntelligenceState,
    resonance: &ResonanceState,
    alignment: &SelfAlignmentState,
) -> InnerDynamicsMetrics {
    // MICRO STABILITÉ : oscillations fines + stabilité adaptative
    let mut micro_stability =
        (1.0 - vitality.tension_index) * 0.40 +
        harmonic.harmonic_index * 0.30 +
        adaptive.stability_reserve * 0.30;
    micro_stability = clamp01(micro_stability);
    // MICRO BALANCE : micro-flux / micro-résonance / continuité
    let mut micro_balance =
        vitality.energy_flow * 0.35 +
        (1.0 - harmonic.turbulence_index) * 0.35 +
        (1.0 - alignment.drift_index) * 0.30;
    micro_balance = clamp01(micro_balance);
    // MICRO TURBULENCE : signaux faibles de dérive
    let mut micro_turbulence =
        resonance.turbulence_index * 0.45 +
        (1.0 - adaptive.adaptation_level) * 0.30 +
        alignment.drift_index * 0.25;
    micro_turbulence = clamp01(micro_turbulence);
    InnerDynamicsMetrics {
        micro_stability,
        micro_balance,
        micro_turbulence,
    }
}
