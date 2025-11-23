use super::collect::SentientInputs;

pub fn compute_sentient(
    inputs: &SentientInputs,
    loop_stability: f32,
) -> Result<(f32, f32, f32), String> {
    let sentience_level = (
        inputs.clarity_index * 0.30 +
        inputs.self_coherence * 0.25 +
        inputs.evolution_momentum * 0.25 +
        loop_stability * 0.20
    ).clamp(0.0, 1.0);
    let reflexivity_index = (
        inputs.cognitive_flexibility * 0.35 +
        inputs.plasticity_level * 0.30 +
        inputs.adaptation_score * 0.20 +
        inputs.trajectory_stability * 0.15
    let presence_stability = (
        inputs.continuity_score * 0.40 +
        inputs.self_coherence * 0.30 +
        loop_stability * 0.30
    Ok((sentience_level, reflexivity_index, presence_stability))
}
