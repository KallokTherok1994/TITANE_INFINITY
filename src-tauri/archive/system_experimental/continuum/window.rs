use super::super::strategic_intelligence::StrategicIntelligenceState;
use super::super::intention::IntentionState;
use super::super::action_potential::ActionPotentialState;
use super::super::executive_flow::ExecutiveFlowState;
use super::super::central_governor::CentralGovernorState;
use super::super::architecture::ArchitectureState;
use super::super::meta_integration::MetaIntegrationState;
use super::super::harmonic_brain::HarmonicBrainState;
use super::super::sentient::SentientState;
use super::super::evolution::EvolutionState;

#[derive(Clone, Copy)]
pub struct ContinuumSnapshot {
    pub strategic_clarity: f64,
    pub long_term_alignment: f64,
    pub intentional_drive: f64,
    pub activation_potential: f64,
    pub readiness_level: f64,
    pub safety_margin: f64,
    pub structural_integrity: f64,
    pub global_integration: f64,
    pub neuro_harmony: f64,
    pub sentience_level: f64,
    pub evolution_momentum: f64,
}
fn clamp01(x: f64) -> f64 {
    x.clamp(0.0, 1.0)
pub fn build_snapshot(
    strategic: &StrategicIntelligenceState,
    intention: &IntentionState,
    action: &ActionPotentialState,
    _executive: &ExecutiveFlowState,
    central: &CentralGovernorState,
    architecture: &ArchitectureState,
    meta: &MetaIntegrationState,
    harmonic: &HarmonicBrainState,
    sentient: &SentientState,
    evolution: &EvolutionState,
) -> ContinuumSnapshot {
    ContinuumSnapshot {
        strategic_clarity: clamp01(strategic.strategic_clarity),
        long_term_alignment: clamp01(strategic.long_term_alignment),
        intentional_drive: clamp01(intention.intentional_drive),
        activation_potential: clamp01(action.activation_potential),
        readiness_level: clamp01(action.readiness_level),
        safety_margin: clamp01(central.safety_margin),
        structural_integrity: clamp01(architecture.structural_integrity),
        global_integration: clamp01(meta.global_integration),
        neuro_harmony: clamp01(harmonic.neuro_harmony),
        sentience_level: clamp01(sentient.sentience_level),
        evolution_momentum: clamp01(evolution.evolution_momentum),
    }
