// TITANE∞ v8.0 - Evolution Engine
// Module de collecte pour l'évolution

use crate::system::adaptive::AdaptiveIntelligenceState;
use crate::system::conscience::ConscienceState;
use crate::system::metacortex::MetaCortexState;
use crate::system::continuum::ContinuumState;
use crate::system::neurofield::NeuroFieldState;
use crate::system::neuromesh::NeuroMeshState;
/// Entrées pour le calcul évolutif
#[derive(Debug, Clone)]
pub struct EvolutionInputs {
    pub adaptation_score: f32,
    pub plasticity_level: f32,
    pub cognitive_flexibility: f32,
    pub clarity_index: f32,
    pub insight_potential: f32,
    pub metacortex_clarity: f32,
    pub continuity_score: f32,
    pub neural_density: f32,
    pub synaptic_flow: f32,
}
/// Collecte les signaux pour l'évolution
pub fn collect_evolution_inputs(
    adaptive: &AdaptiveIntelligenceState,
    conscience: &ConscienceState,
    metacortex: &MetaCortexState,
    continuum: &ContinuumState,
    neurofield: &NeuroFieldState,
    neuromesh: &NeuroMeshState,
) -> Result<EvolutionInputs, String> {
    Ok(EvolutionInputs {
        adaptation_score: adaptive.adaptation_score.clamp(0.0, 1.0),
        plasticity_level: adaptive.plasticity_level.clamp(0.0, 1.0),
        cognitive_flexibility: adaptive.cognitive_flexibility.clamp(0.0, 1.0),
        clarity_index: conscience.clarity_index.clamp(0.0, 1.0),
        insight_potential: conscience.insight_potential.clamp(0.0, 1.0),
        metacortex_clarity: metacortex.metacortex_clarity.clamp(0.0, 1.0),
        continuity_score: continuum.progression.clamp(0.0, 1.0),
        neural_density: neurofield.neural_density.clamp(0.0, 1.0),
        synaptic_flow: neuromesh.synaptic_flow.clamp(0.0, 1.0),
    })
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_collect_evolution_inputs() {
        let adaptive = AdaptiveIntelligenceState {
            initialized: true,
            adaptation_score: 0.85,
            plasticity_level: 0.82,
            cognitive_flexibility: 0.88,
            last_update: 1000,
        };
        let conscience = ConscienceState {
            clarity_index: 0.8,
            self_coherence: 0.85,
            insight_potential: 0.87,
        let metacortex = MetaCortexState {
            metacortex_clarity: 0.83,
            reasoning_depth: 0.8,
            global_coherence: 0.85,
        let continuum = ContinuumState {
            momentum: 0.7,
            direction: 0.8,
            progression: 0.87,
            stability_trend: 0.75,
        let neurofield = NeuroFieldState {
            neural_density: 0.8,
            signal_propagation: 0.75,
            field_coherence: 0.85,
        let neuromesh = NeuroMeshState {
            mesh_density: 0.78,
            synaptic_flow: 0.82,
            network_coherence: 0.85,
        let result = collect_evolution_inputs(
            &adaptive,
            &conscience,
            &metacortex,
            &continuum,
            &neurofield,
            &neuromesh,
        );
        assert!(result.is_ok());
        let inputs = result.unwrap();
        assert_eq!(inputs.adaptation_score, 0.85);
        assert_eq!(inputs.synaptic_flow, 0.82);
    }
    fn test_collect_with_clamping() {
            adaptation_score: 1.5,
            plasticity_level: -0.2,
            cognitive_flexibility: 0.5,
            clarity_index: 0.5,
            self_coherence: 0.5,
            insight_potential: 0.5,
            metacortex_clarity: 0.5,
            reasoning_depth: 0.5,
            global_coherence: 0.5,
            momentum: 0.5,
            direction: 0.5,
            progression: 0.5,
            stability_trend: 0.5,
            neural_density: 0.5,
            signal_propagation: 0.5,
            field_coherence: 0.5,
            mesh_density: 0.5,
            synaptic_flow: 0.5,
            network_coherence: 0.5,
        assert_eq!(inputs.adaptation_score, 1.0);
        assert_eq!(inputs.plasticity_level, 0.0);
