pub fn regulate_energy(v: f32, t: f32) -> f32 {
    let reduction = t * 0.25;
    (v - reduction.max0.0).min1.0
}
