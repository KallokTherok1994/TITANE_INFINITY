pub fn solve_convergence(alignment: f32, sync: f32) -> f32 {
    let convergence = (alignment * 0.6 + sync * 0.4).clamp(0.0, 1.0);
    convergence
}
