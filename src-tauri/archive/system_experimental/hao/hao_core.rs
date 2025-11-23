pub fn compute_alignment_vector(dse_sync: f32, current_av: f32) -> f32 {
    let new_av = (dse_sync * 0.6 + current_av * 0.4).clamp(0.0, 1.0);
    new_av
}

pub fn compute_sda(av: f32) -> String {
    if av > 0.8 { "Alignement optimal".to_string() }
    else if av > 0.5 { "Alignement stable".to_string() }
    else { "Recalibration nécessaire".to_string() }
