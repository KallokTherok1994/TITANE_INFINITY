// TITANE∞ v8.0 - Resonance Engine v2: Oscillation Analysis

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

pub struct OscillationResult {
    pub micro_variance: f64,
    pub instability: f64,
}

pub fn compute_oscillation(
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
) -> OscillationResult {
    let mut sum = 0.0_f64;

    let values = [
        sentient.sentience_level,
        harmonic.neuro_harmony,
        meta.global_integration,
        architecture.structural_integrity,
        strategic.strategic_clarity,
        intention.intentional_drive,
        action.activation_potential,
        executive.executive_load,
        central.safety_margin,
        evolution.evolution_momentum,
    ];

    for v in values {
        sum += (v - 0.5).abs();
    }

    let avg = sum / (values.len() as f64);

    OscillationResult {
        micro_variance: avg,
        instability: avg * 0.65,
    }
}
