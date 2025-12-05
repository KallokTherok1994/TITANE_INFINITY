use super::collect::IntentionInputs;

pub fn compute_intention(
    inputs: &IntentionInputs,
    drive_factor: f32,
) -> Result<(f32, f32, f32), String> {
    let intentional_drive = (
        inputs.directional_focus * 0.30 +
        inputs.evolution_momentum * 0.25 +
        inputs.sentience_level * 0.20 +
        (1.0 - inputs.executive_load) * 0.15 +
        drive_factor * 0.10
    ).clamp(0.0, 1.0);
    let directional_coherence = (
        inputs.strategic_clarity * 0.30 +
        inputs.priority_index * 0.25 +
        inputs.architectural_coherence * 0.20 +
        inputs.global_integration * 0.15 +
    let potential_alignment = (
        inputs.long_term_alignment * 0.30 +
        inputs.alignment_index * 0.25 +
        (1.0 - inputs.alert_level) * 0.15 +
    Ok((intentional_drive, directional_coherence, potential_alignment))
}
