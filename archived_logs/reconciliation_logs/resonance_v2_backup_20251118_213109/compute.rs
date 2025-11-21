// TITANE∞ v8.0 - Resonance Engine v2: Main Computation

use super::super::sentient::SentientState;
use super::super::harmonic_brain::HarmonicBrainState;
use super::super::meta_integration::MetaIntegrationState;
use super::super::architecture::ArchitectureState;
use super::super::strategic_intelligence::StrategicIntelligenceState;
use super::super::intention::IntentionState;
use super::super::action_potential::ActionPotentialState;
use super::super::executive_flow::ExecutiveFlowState;
use super::super::central_governor::CentralGovernorState;
use super::super::evolution::EvolutionState;
use super::super::continuum::ContinuumState;
use super::super::energetic::EnergeticState;

use super::metrics::{ResonanceMetrics, clamp01};
use super::oscillation::compute_oscillation;
use super::harmonic::compute_harmonic;

pub fn compute_resonance(
    sentient: &SentientState,
    harmonic: &HarmonicBrainState,
    meta: &MetaIntegrationState,
    architecture: &ArchitectureState,
    strategic: &StrategicIntelligenceState,
    intention: &IntentionState,
    action: &ActionPotentialState,
    executive: &ExecutiveFlowState,
    central: &CentralGovernorState,
    evolution: &EvolutionState,
    continuum: &ContinuumState,
    energetic: &EnergeticState,
) -> ResonanceMetrics {
    let osc = compute_oscillation(
        sentient,
        harmonic,
        meta,
        architecture,
        strategic,
        intention,
        action,
        executive,
        central,
        evolution,
    );

    let harm = compute_harmonic(harmonic, meta, strategic, architecture);

    // Resonance = harmonic coherence – oscillation (adoucissement)
    let mut resonance = harm.harmonic_score * 0.7 + (1.0 - osc.instability) * 0.3;

    resonance = clamp01(resonance);

    // Oscillation index = micro variance adoucie
    let oscillation = clamp01(osc.micro_variance);

    // Harmonic coherence = mélange avec continuum + vitalité énergétique
    let mut coherence = harm.harmonic_score * 0.5
        + continuum.continuity_index * 0.3
        + energetic.energy_level * 0.2;

    coherence = clamp01(coherence);

    ResonanceMetrics {
        resonance_index: resonance,
        oscillation_index: oscillation,
        coherence_harmonic_index: coherence,
    }
}
