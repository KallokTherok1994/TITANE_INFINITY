use crate::core::backend::system::{
    resonance::ResonanceState,
    vitality::VitalityState,
    adaptive_intelligence::AdaptiveIntelligenceState,
    self_alignment::SelfAlignmentState,
    evolution::OrganicEvolutionState,
};

use super::metrics::{HarmonicMetrics, clamp01};
pub fn compute_harmonic_flow(
    resonance: &ResonanceState,
    vitality: &VitalityState,
    adaptive: &AdaptiveIntelligenceState,
    alignment: &SelfAlignmentState,
    evolution: &OrganicEvolutionState,
) -> HarmonicMetrics {
    // Harmonie = cohérence vibratoire + adaptation + vitalité
    let mut harmonic =
        resonance.coherence_harmonic_index * 0.40 +
        adaptive.adaptation_level * 0.35 +
        vitality.vitality_index * 0.25;
    harmonic = clamp01(harmonic);
    // Équilibre des oscillations = flux - tension + continuité évolutive
    let mut balance =
        vitality.energy_flow * 0.45 +
        (1.0 - vitality.tension_index) * 0.35 +
        evolution.continuity_factor * 0.20;
    balance = clamp01(balance);
    // Turbulences = instabilité vibratoire + drift
    let mut turbulence =
        resonance.turbulence_index * 0.50 +
        alignment.drift_index * 0.30 +
        (1.0 - adaptive.stability_reserve) * 0.20;
    turbulence = clamp01(turbulence);
    HarmonicMetrics {
        harmonic,
        balance,
        turbulence,
    }
}
