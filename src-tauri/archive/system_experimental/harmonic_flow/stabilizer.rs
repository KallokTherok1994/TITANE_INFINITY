pub fn stabilize_flow(harmonic: f32, turbulence: f32) -> f32 {
    let correction = turbulence * 0.3;
    (harmonic - correction.max0.0).min1.0
}
