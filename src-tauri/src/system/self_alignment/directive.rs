// TITANE∞ v8.0 - Self-Alignment Engine: Alignment Directive

pub struct AlignmentDirective {
    pub alignment_target: f64,
    pub recommended_shift: f64,
}
pub fn generate_directive(alignment: f64, drift: f64, correction: f64) -> AlignmentDirective {
    // Objectif : toujours tendre vers 0.75 (stabilité optimale)
    let base_target = 0.75_f64;
    let recommended = base_target - alignment * correction;
    AlignmentDirective {
        alignment_target: base_target,
        recommended_shift: recommended.clamp(-0.25, 0.25),
    }
