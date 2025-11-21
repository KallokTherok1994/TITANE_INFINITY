pub fn synthesize_meaning(mmce: f32, gpmae: f32) -> f32 {
    ((mmce * 0.55 + gpmae * 0.45)).clamp(0.0, 1.0)
}
