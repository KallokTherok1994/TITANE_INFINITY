use crate::system::evolution::EvolutionState;
use crate::system::adaptive_intelligence::AdaptiveIntelligenceState;
use crate::system::conscience::ConscienceState;
use crate::system::continuum::ContinuumState;

pub struct SentientInputs {
    pub evolution_momentum: f32,
    pub growth_potential: f32,
    pub trajectory_stability: f32,
    pub adaptation_score: f32,
    pub plasticity_level: f32,
    pub cognitive_flexibility: f32,
    pub clarity_index: f32,
    pub self_coherence: f32,
    pub continuity_score: f32,
}
pub fn collect_sentient_inputs(
    evolution: &EvolutionState,
    adaptive: &AdaptiveIntelligenceState,
    conscience: &ConscienceState,
    continuum: &ContinuumState,
) -> Result<SentientInputs, String> {
    Ok(SentientInputs {
        evolution_momentum: evolution.evolution_momentum.clamp(0.0, 1.0),
        growth_potential: evolution.growth_potential.clamp(0.0, 1.0),
        trajectory_stability: evolution.trajectory_stability.clamp(0.0, 1.0),
        adaptation_score: adaptive.adaptation_score.clamp(0.0, 1.0),
        plasticity_level: adaptive.plasticity_level.clamp(0.0, 1.0),
        cognitive_flexibility: adaptive.cognitive_flexibility.clamp(0.0, 1.0),
        clarity_index: conscience.clarity_index.clamp(0.0, 1.0),
        self_coherence: conscience.self_coherence.clamp(0.0, 1.0),
        continuity_score: continuum.continuity_score.clamp(0.0, 1.0),
    })
