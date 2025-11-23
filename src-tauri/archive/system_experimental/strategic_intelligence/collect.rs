use crate::system::executive_flow::ExecutiveFlowState;
use crate::system::central_governor::CentralGovernorState;
use crate::system::architecture::ArchitectureState;
use crate::system::meta_integration::MetaIntegrationState;
use crate::system::harmonic_brain::HarmonicBrainState;
use crate::system::sentient::SentientState;
use crate::system::evolution::EvolutionState;

pub struct StrategicInputs {
    pub executive_load: f32,
    pub priority_index: f32,
    pub alert_level: f32,
    pub regulation_profile: f32,
    pub safety_margin: f32,
    pub adaptive_stability: f32,
    pub global_integration: f32,
    pub systemic_coherence: f32,
    pub architectural_coherence: f32,
    pub cognitive_resonance: f32,
    pub sentience_level: f32,
    pub evolution_momentum: f32,
}
pub fn collect_strategic_inputs(
    executive: &ExecutiveFlowState,
    central: &CentralGovernorState,
    architecture: &ArchitectureState,
    meta: &MetaIntegrationState,
    harmonic: &HarmonicBrainState,
    sentient: &SentientState,
    evolution: &EvolutionState,
) -> Result<StrategicInputs, String> {
    Ok(StrategicInputs {
        executive_load: executive.executive_load.clamp(0.0, 1.0),
        priority_index: executive.priority_index.clamp(0.0, 1.0),
        alert_level: executive.alert_level.clamp(0.0, 1.0),
        regulation_profile: central.regulation_profile.clamp(0.0, 1.0),
        safety_margin: central.safety_margin.clamp(0.0, 1.0),
        adaptive_stability: central.adaptive_stability.clamp(0.0, 1.0),
        global_integration: meta.global_integration.clamp(0.0, 1.0),
        systemic_coherence: meta.systemic_coherence.clamp(0.0, 1.0),
        architectural_coherence: architecture.architectural_coherence.clamp(0.0, 1.0),
        cognitive_resonance: harmonic.cognitive_resonance.clamp(0.0, 1.0),
        sentience_level: sentient.sentience_level.clamp(0.0, 1.0),
        evolution_momentum: evolution.evolution_momentum.clamp(0.0, 1.0),
    })
