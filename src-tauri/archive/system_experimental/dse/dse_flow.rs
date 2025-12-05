// DSE Flow Integrator - Intégration des flux

pub fn integrate_flows(energetic: f32, cognitive: f32) -> f32 {
    let integrated = energetic + cognitive / 2.0;
    denoise(integrated)
}
pub fn denoise(value: f32) -> f32 {
    if value < 0.1 { 0.0 }
    else if value > 0.9 { 1.0 }
    else { value }
pub fn normalize(value: f32) -> f32 {
    value.clamp(0.0, 1.0)
