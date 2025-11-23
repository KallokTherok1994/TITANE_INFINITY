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

pub struct RhythmMetrics {
    pub stability: f64,
    pub activity_scale: f64,
}
pub fn compute_rhythm(
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
) -> RhythmMetrics {
    let stability = (
        harmonic.neuro_harmony * 0.30
        + architecture.structural_integrity * 0.25
        + central.safety_margin * 0.25
        + meta.global_integration * 0.20
    ).clamp(0.0, 1.0);
    let activity_scale = (
        action.activation_potential * 0.30
        + executive.executive_load * 0.25
        + intention.intentional_drive * 0.25
        + sentient.sentience_level * 0.10
        + strategic.strategic_clarity * 0.10
    RhythmMetrics {
        stability,
        activity_scale,
    }
