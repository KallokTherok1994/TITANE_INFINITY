pub fn check_deviation(alignment_vector: f32) -> f32 {
    let ideal = 0.75;
    alignment_vector - ideal.abs()
}
