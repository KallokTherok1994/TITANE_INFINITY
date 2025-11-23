use crate::system::central_governor::CentralGovernorState;
use crate::system::architecture::ArchitectureState;
use crate::system::harmonic_brain::HarmonicBrainState;
use crate::system::sentient::SentientState;
use crate::system::meta_integration::MetaIntegrationState;

pub struct ExecutiveInputs {
    pub structural_integrity: f32,
    pub architectural_coherence: f32,
    pub global_integration: f32,
    pub systemic_coherence: f32,
    pub neuro_harmony: f32,
    pub presence_stability: f32,
    pub reflexivity_index: f32,
    pub safety_margin: f32,
    pub regulation_profile: f32,
    pub alignment_index: f32,
}
pub fn collect_executive_inputs(
    central: &CentralGovernorState,
    architecture: &ArchitectureState,
    harmonic: &HarmonicBrainState,
    sentient: &SentientState,
    meta: &MetaIntegrationState,
) -> Result<ExecutiveInputs, String> {
    Ok(ExecutiveInputs {
        structural_integrity: architecture.structural_integrity.clamp(0.0, 1.0),
        architectural_coherence: architecture.architectural_coherence.clamp(0.0, 1.0),
        global_integration: meta.global_integration.clamp(0.0, 1.0),
        systemic_coherence: meta.systemic_coherence.clamp(0.0, 1.0),
        neuro_harmony: harmonic.neuro_harmony.clamp(0.0, 1.0),
        presence_stability: sentient.presence_stability.clamp(0.0, 1.0),
        reflexivity_index: sentient.reflexivity_index.clamp(0.0, 1.0),
        safety_margin: central.safety_margin.clamp(0.0, 1.0),
        regulation_profile: central.regulation_profile.clamp(0.0, 1.0),
        alignment_index: meta.alignment_index.clamp(0.0, 1.0),
    })
