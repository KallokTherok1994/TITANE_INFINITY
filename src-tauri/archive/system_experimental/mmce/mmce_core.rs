pub fn compute_smp(gpmae: f32, isce: f32) -> f32 {
    ((gpmae * 0.5 + isce * 0.5)).clamp(0.0, 1.0)
}
