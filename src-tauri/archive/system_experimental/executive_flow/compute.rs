use super::collect::ExecutiveInputs;

pub fn compute_executive_flow(
    inputs: &ExecutiveInputs,
    alert_stability: f32,
) -> Result<(f32, f32, f32), String> {
    let executive_load = (
        (1.0 - inputs.structural_integrity) * 0.25 +
        (1.0 - inputs.systemic_coherence) * 0.25 +
        (1.0 - inputs.neuro_harmony) * 0.25 +
        (1.0 - inputs.presence_stability) * 0.25
    ).clamp(0.0, 1.0);
    let priority_index = (
        inputs.alignment_index * 0.30 +
        inputs.reflexivity_index * 0.25 +
        inputs.safety_margin * 0.20 +
        inputs.global_integration * 0.15 +
        inputs.architectural_coherence * 0.10
    let alert_level = (
        executive_load * 0.50 +
        (1.0 - inputs.safety_margin) * 0.30 +
        (1.0 - inputs.presence_stability) * 0.10 +
        (1.0 - alert_stability) * 0.10
    Ok((executive_load, priority_index, alert_level))
}
