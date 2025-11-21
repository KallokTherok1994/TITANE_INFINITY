pub fn compute_gps(isce: f32, paefe: f32) -> f32 {
    ((isce * 0.6 + paefe * 0.4)).clamp(0.0, 1.0)
}
