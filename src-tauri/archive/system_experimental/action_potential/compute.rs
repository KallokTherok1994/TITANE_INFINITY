use crate::TitaneResult;
use super::collect::ActionInputs;

fn clamp01(x: f64) -> f64 {
    x.clamp(0.0, 1.0)
}
pub fn compute_action_potential(
    inputs: &ActionInputs,
    baseline_threshold: f64,
) -> TitaneResult<(f64, f64, f64)> {
    let mut activation_potential = inputs.intentional_drive * 0.30
        + inputs.directional_coherence * 0.25
        + inputs.potential_alignment * 0.20
        + inputs.strategic_clarity * 0.15
        + (1.0 - inputs.executive_load) * 0.10;
    activation_potential = clamp01(activation_potential);
    let mut readiness_level = activation_potential * 0.30
        + inputs.safety_margin * 0.25
        + inputs.structural_integrity * 0.20
        + inputs.neuro_harmony * 0.15
        + (1.0 - inputs.alert_level) * 0.10;
    readiness_level = clamp01(readiness_level);
    let activation_vs_baseline = if baseline_threshold <= 0.0 {
        activation_potential
    } else {
        activation_potential - baseline_threshold
    };
    let mut expression_gate = activation_potential * 0.30
        + readiness_level * 0.25
        + inputs.long_term_alignment * 0.20
        + inputs.global_integration * 0.15
    expression_gate += activation_vs_baseline * 0.10;
    expression_gate = clamp01(expression_gate);
    Ok((activation_potential, readiness_level, expression_gate))
