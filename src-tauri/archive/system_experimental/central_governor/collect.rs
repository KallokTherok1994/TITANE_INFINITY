use crate::system::governor::GovernorState;
use crate::system::stability::StabilityState;
use crate::system::architecture::ArchitectureState;
use crate::system::meta_integration::MetaIntegrationState;
use crate::system::harmonic_brain::HarmonicBrainState;
use crate::system::sentient::SentientState;
use crate::system::evolution::EvolutionState;
use crate::system::adaptive::AdaptiveIntelligenceState;
use crate::system::conscience::ConscienceState;

pub struct CentralGovernorInputs {
    pub regulation_level: f32,
    pub deviation_index: f32,
    pub homeostasis_score: f32,
    pub stability_score: f32,
    pub structural_integrity: f32,
    pub cognitive_geometry: f32,
    pub architectural_coherence: f32,
    pub global_integration: f32,
    pub systemic_coherence: f32,
    pub alignment_index: f32,
    pub neuro_harmony: f32,
    pub sentience_level: f32,
    pub adaptive_stability_hint: f32,
}
pub fn collect_central_inputs(
    governor: &GovernorState,
    stability: &StabilityState,
    architecture: &ArchitectureState,
    meta: &MetaIntegrationState,
    harmonic: &HarmonicBrainState,
    sentient: &SentientState,
    evolution: &EvolutionState,
    adaptive: &AdaptiveIntelligenceState,
    _conscience: &ConscienceState,
) -> Result<CentralGovernorInputs, String> {
    let adaptive_stability_hint = (
        adaptive.adaptation_score * 0.6 +
        evolution.trajectory_stability * 0.4
    ).clamp(0.0, 1.0);
    Ok(CentralGovernorInputs {
        regulation_level: governor.regulation_level.clamp(0.0, 1.0),
        deviation_index: governor.deviation_index.clamp(0.0, 1.0),
        homeostasis_score: governor.homeostasis_score.clamp(0.0, 1.0),
        stability_score: stability.stability_score.clamp(0.0, 1.0),
        structural_integrity: architecture.structural_integrity.clamp(0.0, 1.0),
        cognitive_geometry: architecture.cognitive_geometry.clamp(0.0, 1.0),
        architectural_coherence: architecture.architectural_coherence.clamp(0.0, 1.0),
        global_integration: meta.global_integration.clamp(0.0, 1.0),
        systemic_coherence: meta.systemic_coherence.clamp(0.0, 1.0),
        alignment_index: meta.alignment_index.clamp(0.0, 1.0),
        neuro_harmony: harmonic.neuro_harmony.clamp(0.0, 1.0),
        sentience_level: sentient.sentience_level.clamp(0.0, 1.0),
        adaptive_stability_hint,
    })
