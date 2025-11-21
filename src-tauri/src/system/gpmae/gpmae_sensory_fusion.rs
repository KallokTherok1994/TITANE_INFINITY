pub fn fuse_perceptions(gps: f32, isce: f32) -> f32 {
    (gps + isce / 2.0).clamp(0.0, 1.0)
}
