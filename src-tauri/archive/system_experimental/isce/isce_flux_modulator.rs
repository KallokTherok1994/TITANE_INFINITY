pub fn modulate_flux(resonance: f32, tension: f32) -> f32 {
    (resonance - tension * 0.2).clamp(0.0, 1.0)
}
