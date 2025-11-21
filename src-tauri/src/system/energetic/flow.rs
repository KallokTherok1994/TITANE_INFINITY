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
use super::super::self_healing_v2::SelfHealingState;

pub struct FlowMetrics {
    pub energy: f64,
    pub pressure: f64,
    pub vitality: f64,
}
pub fn compute_flow(
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
    continuum_state: &ContinuumState,
    healing: &SelfHealingState,
) -> FlowMetrics {
    let energy = (
        sentient.sentience_level * 0.12
        + harmonic.neuro_harmony * 0.10
        + meta.global_integration * 0.12
        + architecture.structural_integrity * 0.08
        + strategic.strategic_clarity * 0.08
        + intention.intentional_drive * 0.12
        + action.activation_potential * 0.14
        + executive.executive_load * 0.10
        + central.safety_margin * 0.08
        + evolution.evolution_momentum * 0.06
    ).clamp(0.0, 1.0);
    let pressure = (
        action.readiness_level * 0.35
        + executive.executive_load * 0.30
        + strategic.strategic_clarity * 0.20
        + central.safety_margin * 0.15
    let vitality = (
        sentient.sentience_level * 0.20
        + harmonic.neuro_harmony * 0.18
        + healing.integrity_score * 0.22
        + evolution.evolution_momentum * 0.15
        + continuum_state.stability_level * 0.25
    FlowMetrics {
        energy,
        pressure,
        vitality,
    }
