use super::collect::StrategicInputs;

pub fn compute_strategic_intelligence(
    inputs: &StrategicInputs,
    trend_factor: f32,
) -> Result<(f32, f32, f32), String> {
    let strategic_clarity = (
        inputs.global_integration * 0.30 +
        inputs.architectural_coherence * 0.25 +
        inputs.priority_index * 0.20 +
        inputs.sentience_level * 0.15 +
        inputs.cognitive_resonance * 0.10
    ).clamp(0.0, 1.0);
    let directional_focus = (
        inputs.priority_index * 0.30 +
        inputs.evolution_momentum * 0.25 +
        inputs.systemic_coherence * 0.20 +
        (1.0 - inputs.executive_load) * 0.15 +
        trend_factor * 0.10
    let long_term_alignment = (
        inputs.safety_margin * 0.30 +
        inputs.adaptive_stability * 0.25 +
        inputs.regulation_profile * 0.20 +
        inputs.global_integration * 0.15 +
    Ok((strategic_clarity, directional_focus, long_term_alignment))
}
