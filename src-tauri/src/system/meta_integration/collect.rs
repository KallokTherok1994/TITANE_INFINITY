use crate::system::harmonic_brain::HarmonicBrainState;
use crate::system::sentient::SentientState;
use crate::system::evolution::EvolutionState;
use crate::system::adaptive_intelligence::AdaptiveIntelligenceState;
use crate::system::conscience::ConscienceState;
use crate::system::metacortex::MetaCortexState;

pub struct MetaInputs {
    pub neuro_harmony: f32,
    pub integration_coherence: f32,
    pub cognitive_resonance: f32,
    pub sentience_level: f32,
    pub reflexivity_index: f32,
    pub presence_stability: f32,
    pub evolution_momentum: f32,
    pub growth_potential: f32,
    pub trajectory_stability: f32,
    pub adaptation_score: f32,
    pub self_coherence: f32,
}
pub fn collect_meta_inputs(
    harmonic: &HarmonicBrainState,
    sentient: &SentientState,
    evolution: &EvolutionState,
    adaptive: &AdaptiveIntelligenceState,
    conscience: &ConscienceState,
    _metacortex: &MetaCortexState,
) -> Result<MetaInputs, String> {
    Ok(MetaInputs {
        neuro_harmony: harmonic.neuro_harmony.clamp(0.0, 1.0),
        integration_coherence: harmonic.integration_coherence.clamp(0.0, 1.0),
        cognitive_resonance: harmonic.cognitive_resonance.clamp(0.0, 1.0),
        sentience_level: sentient.sentience_level.clamp(0.0, 1.0),
        reflexivity_index: sentient.reflexivity_index.clamp(0.0, 1.0),
        presence_stability: sentient.presence_stability.clamp(0.0, 1.0),
        evolution_momentum: evolution.evolution_momentum.clamp(0.0, 1.0),
        growth_potential: evolution.growth_potential.clamp(0.0, 1.0),
        trajectory_stability: evolution.trajectory_stability.clamp(0.0, 1.0),
        adaptation_score: adaptive.adaptation_score.clamp(0.0, 1.0),
        self_coherence: conscience.self_coherence.clamp(0.0, 1.0),
    })
