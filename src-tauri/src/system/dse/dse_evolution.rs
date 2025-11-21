// DSE Evolution Sync - Synchronisation évolutive

pub fn sync_evolution_momentum(
    growth_vector: f32,
    continuity: f32,
) -> f32 {
    let momentum = (growth_vector * 0.6 + continuity * 0.4).clamp(0.0, 1.0);
    smooth_evolution(momentum)
}
fn smooth_evolution(value: f32) -> f32 {
    // Lissage évolutif progressif
    if value < 0.3 { value * 0.8 }
    else if value > 0.8 { 0.8 + (value - 0.8) * 0.5 }
    else { value }
