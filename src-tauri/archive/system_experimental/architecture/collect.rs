use crate::system::meta_integration::MetaIntegrationState;
use crate::system::harmonic_brain::HarmonicBrainState;
use crate::system::sentient::SentientState;
use crate::system::evolution::EvolutionState;
use crate::system::adaptive_intelligence::AdaptiveIntelligenceState;
use crate::system::conscience::ConscienceState;

pub struct ArchitectureInputs {
    pub global_integration: f32,
    pub systemic_coherence: f32,
    pub alignment_index: f32,
    pub neuro_harmony: f32,
    pub presence_stability: f32,
    pub reflexivity_index: f32,
    pub trajectory_stability: f32,
    pub clarity_index: f32,
    pub self_coherence: f32,
}
pub fn collect_arch_inputs(
    meta: &MetaIntegrationState,
    harmonic: &HarmonicBrainState,
    sentient: &SentientState,
    evolution: &EvolutionState,
    _adaptive: &AdaptiveIntelligenceState,
    conscience: &ConscienceState,
) -> Result<ArchitectureInputs, String> {
    Ok(ArchitectureInputs {
        global_integration: meta.global_integration.clamp(0.0, 1.0),
        systemic_coherence: meta.systemic_coherence.clamp(0.0, 1.0),
        alignment_index: meta.alignment_index.clamp(0.0, 1.0),
        neuro_harmony: harmonic.neuro_harmony.clamp(0.0, 1.0),
        presence_stability: sentient.presence_stability.clamp(0.0, 1.0),
        reflexivity_index: sentient.reflexivity_index.clamp(0.0, 1.0),
        trajectory_stability: evolution.trajectory_stability.clamp(0.0, 1.0),
        clarity_index: conscience.clarity_index.clamp(0.0, 1.0),
        self_coherence: conscience.self_coherence.clamp(0.0, 1.0),
    })
