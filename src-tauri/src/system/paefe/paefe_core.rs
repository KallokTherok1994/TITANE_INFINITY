pub fn compute_pap(convergence: f32, alignment: f32) -> f32 {
    let stability = convergence + alignment / 2.0;
    (1.0 - stability).clamp(0.0, 1.0)
}
