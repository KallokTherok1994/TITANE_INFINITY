pub fn consolidate(smp: f32, continuity: f32) -> f32 {
    ((smp * 0.6 + continuity * 0.4) * 1.1).min1.0
}
