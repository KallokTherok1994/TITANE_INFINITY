use super::collect::MetaInputs;

pub fn compute_meta_integration(
    inputs: &MetaInputs,
    alignment_stability: f32,
) -> Result<(f32, f32, f32), String> {
    let global_integration = (
        inputs.neuro_harmony * 0.30 +
        inputs.sentience_level * 0.25 +
        inputs.evolution_momentum * 0.20 +
        alignment_stability * 0.25
    ).clamp(0.0, 1.0);
    let systemic_coherence = (
        inputs.integration_coherence * 0.30 +
        inputs.presence_stability * 0.25 +
        inputs.self_coherence * 0.25 +
        inputs.trajectory_stability * 0.20
    let alignment_index = (
        inputs.cognitive_resonance * 0.30 +
        inputs.reflexivity_index * 0.25 +
        inputs.growth_potential * 0.25 +
        alignment_stability * 0.20
    Ok((global_integration, systemic_coherence, alignment_index))
}
