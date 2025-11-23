pub fn compute_tension(convergence_index: f32) -> f32 {
    if convergence_index < 0.3 { 0.8 }
    else if convergence_index > 0.8 { 0.1 }
    else { 1.0 - convergence_index }
}
