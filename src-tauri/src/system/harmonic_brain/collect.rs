use crate::system::sentient::SentientState;
use crate::system::evolution::EvolutionState;
use crate::system::adaptive_intelligence::AdaptiveIntelligenceState;
use crate::system::conscience::ConscienceState;
use crate::system::metacortex::MetaCortexState;
use crate::system::continuum::ContinuumState;

pub struct HarmonicInputs {
    pub sentience_level: f32,
    pub reflexivity_index: f32,
    pub presence_stability: f32,
    pub evolution_momentum: f32,
    pub integration_trend: f32,
    pub adaptation_score: f32,
    pub clarity_index: f32,
    pub self_coherence: f32,
}
pub fn collect_harmonic_inputs(
    sentient: &SentientState,
    evolution: &EvolutionState,
    adaptive: &AdaptiveIntelligenceState,
    conscience: &ConscienceState,
    metacortex: &MetaCortexState,
    _continuum: &ContinuumState,
) -> Result<HarmonicInputs, String> {
    Ok(HarmonicInputs {
        sentience_level: sentient.sentience_level.clamp(0.0, 1.0),
        reflexivity_index: sentient.reflexivity_index.clamp(0.0, 1.0),
        presence_stability: sentient.presence_stability.clamp(0.0, 1.0),
        evolution_momentum: evolution.evolution_momentum.clamp(0.0, 1.0),
        integration_trend: metacortex.integration_trend.clamp(0.0, 1.0),
        adaptation_score: adaptive.adaptation_score.clamp(0.0, 1.0),
        clarity_index: conscience.clarity_index.clamp(0.0, 1.0),
        self_coherence: conscience.self_coherence.clamp(0.0, 1.0),
    })
