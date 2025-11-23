pub fn refine_micro_balance(stability: f32, turbulence: f32) -> f32 {
    let correction = turbulence * 0.20;
    (stability - correction.max0.0).min1.0
}
