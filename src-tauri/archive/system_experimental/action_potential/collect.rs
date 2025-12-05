use crate::TitaneResult;
use super::super::intention::IntentionState;
use super::super::strategic_intelligence::StrategicIntelligenceState;
use super::super::executive_flow::ExecutiveFlowState;
use super::super::central_governor::CentralGovernorState;
use super::super::architecture::ArchitectureState;
use super::super::harmonic_brain::HarmonicBrainState;
use super::super::meta_integration::MetaIntegrationState;

pub struct ActionInputs {
    pub intentional_drive: f64,
    pub directional_coherence: f64,
    pub potential_alignment: f64,
    pub strategic_clarity: f64,
    pub long_term_alignment: f64,
    pub executive_load: f64,
    pub priority_index: f64,
    pub alert_level: f64,
    pub safety_margin: f64,
    pub structural_integrity: f64,
    pub neuro_harmony: f64,
    pub global_integration: f64,
}
pub fn collect_action_inputs(
    intention: &IntentionState,
    strategic: &StrategicIntelligenceState,
    executive: &ExecutiveFlowState,
    central: &CentralGovernorState,
    architecture: &ArchitectureState,
    harmonic: &HarmonicBrainState,
    meta: &MetaIntegrationState,
) -> TitaneResult<ActionInputs> {
    Ok(ActionInputs {
        intentional_drive: intention.intentional_drive.clamp(0.0, 1.0),
        directional_coherence: intention.directional_coherence.clamp(0.0, 1.0),
        potential_alignment: intention.potential_alignment.clamp(0.0, 1.0),
        strategic_clarity: strategic.strategic_clarity.clamp(0.0, 1.0),
        long_term_alignment: strategic.long_term_alignment.clamp(0.0, 1.0),
        executive_load: executive.executive_load.clamp(0.0, 1.0),
        priority_index: executive.priority_index.clamp(0.0, 1.0),
        alert_level: executive.alert_level.clamp(0.0, 1.0),
        safety_margin: central.safety_margin.clamp(0.0, 1.0),
        structural_integrity: architecture.structural_integrity.clamp(0.0, 1.0),
        neuro_harmony: harmonic.neuro_harmony.clamp(0.0, 1.0),
        global_integration: meta.global_integration.clamp(0.0, 1.0),
    })
