use super::collect::CentralGovernorInputs;

fn clamp01(x: f32) -> f32 {
    if x < 0.0 {
        0.0
    } else if x > 1.0 {
        1.0
    } else {
        x
    }
}
pub fn compute_central_governor(
    inputs: &CentralGovernorInputs,
    profile_stability: f32,
) -> Result<(f32, f32, f32), String> {
    let mut regulation_profile = (
        inputs.regulation_level * 0.30 +
        (1.0 - inputs.deviation_index) * 0.25 +
        inputs.homeostasis_score * 0.20 +
        inputs.stability_score * 0.15 +
        profile_stability * 0.10
    );
    let mut safety_margin = (
        inputs.structural_integrity * 0.25 +
        inputs.architectural_coherence * 0.25 +
        inputs.global_integration * 0.20 +
        inputs.systemic_coherence * 0.20 +
        inputs.alignment_index * 0.10
    let mut adaptive_stability = (
        inputs.neuro_harmony * 0.25 +
        inputs.sentience_level * 0.20 +
        inputs.adaptive_stability_hint * 0.20
    regulation_profile = clamp01(regulation_profile);
    safety_margin = clamp01(safety_margin);
    adaptive_stability = clamp01(adaptive_stability);
    Ok((regulation_profile, safety_margin, adaptive_stability))
