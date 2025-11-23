use crate::system::strategic_intelligence::StrategicIntelligenceState;
use crate::system::executive_flow::ExecutiveFlowState;
use crate::system::central_governor::CentralGovernorState;
use crate::system::architecture::ArchitectureState;
use crate::system::harmonic_brain::HarmonicBrainState;
use crate::system::sentient::SentientState;
use crate::system::evolution::EvolutionState;
use crate::system::meta_integration::MetaIntegrationState;

pub struct IntentionInputs {
    pub strategic_clarity: f32,
    pub directional_focus: f32,
    pub long_term_alignment: f32,
    pub executive_load: f32,
    pub priority_index: f32,
    pub alert_level: f32,
    pub global_integration: f32,
    pub architectural_coherence: f32,
    pub alignment_index: f32,
    pub evolution_momentum: f32,
    pub sentience_level: f32,
}
pub fn collect_intention_inputs(
    strategic: &StrategicIntelligenceState,
    executive: &ExecutiveFlowState,
    _central: &CentralGovernorState,
    architecture: &ArchitectureState,
    _harmonic: &HarmonicBrainState,
    sentient: &SentientState,
    evolution: &EvolutionState,
    meta: &MetaIntegrationState,
) -> Result<IntentionInputs, String> {
    Ok(IntentionInputs {
        strategic_clarity: strategic.strategic_clarity.clamp(0.0, 1.0),
        directional_focus: strategic.directional_focus.clamp(0.0, 1.0),
        long_term_alignment: strategic.long_term_alignment.clamp(0.0, 1.0),
        executive_load: executive.executive_load.clamp(0.0, 1.0),
        priority_index: executive.priority_index.clamp(0.0, 1.0),
        alert_level: executive.alert_level.clamp(0.0, 1.0),
        global_integration: meta.global_integration.clamp(0.0, 1.0),
        architectural_coherence: architecture.architectural_coherence.clamp(0.0, 1.0),
        alignment_index: meta.alignment_index.clamp(0.0, 1.0),
        evolution_momentum: evolution.evolution_momentum.clamp(0.0, 1.0),
        sentience_level: sentient.sentience_level.clamp(0.0, 1.0),
    })
