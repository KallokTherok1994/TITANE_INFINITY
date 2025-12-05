pub fn derive_direction(flux: f32, cognitive: f32) -> f32 {
    (flux + cognitive / 2.0).clamp(0.0, 1.0)
}
