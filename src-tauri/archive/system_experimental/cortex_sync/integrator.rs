// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 — Cortex Synchronique Avancé : Integrator                  ║
// ║ Collecte normalisée des signaux pour vision globale                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

use crate::system::{
    field::FieldState,
    swarm::SwarmState,
    continuum::ContinuumState,
    ans::ANSState,
    resonance::ResonanceState,
    senses::innersense::InnerSenseState,
};
/// Inputs collectés depuis les modules pour analyse globale
#[derive(Debug, Clone)]
pub struct CortexInputs {
    pub field_orientation: f32,
    pub field_turbulence: f32,
    pub swarm_consensus: f32,
    pub swarm_divergence: f32,
    pub continuum_momentum: f32,
    pub continuum_progression: f32,
    pub ans_stability: f32,
    pub resonance_flow: f32,
    pub depth: f32,
}
impl Default for CortexInputs {
    fn default() -> Self {
        Self {
            field_orientation: 0.5,
            field_turbulence: 0.3,
            swarm_consensus: 0.7,
            swarm_divergence: 0.2,
            continuum_momentum: 0.5,
            continuum_progression: 0.5,
            ans_stability: 0.7,
            resonance_flow: 0.6,
            depth: 0.5,
        }
    }
/// Collecte les signaux internes pour le Cortex Synchronique
///
/// Extraction pure sans interprétation ni calcul complexe.
/// Chaque valeur est clampée [0.0, 1.0].
/// # Arguments
/// * `field` - État du Field Engine
/// * `swarm` - État du Swarm Mode
/// * `continuum` - État du Meta-Continuum
/// * `ans` - État de l'ANS
/// * `resonance` - État de Resonance
/// * `innersense` - État InnerSense
/// # Returns
/// * `Ok(CortexInputs)` - Signaux normalisés
/// * `Err(String)` - Si valeurs invalides
pub fn collect_signals(
    field: &FieldState,
    swarm: &SwarmState,
    continuum: &ContinuumState,
    ans: &ANSState,
    resonance: &ResonanceState,
    innersense: &InnerSenseState,
) -> Result<CortexInputs, String> {
    // Extraction brute
    let field_orientation = field.orientation;
    let field_turbulence = field.turbulence;
    let swarm_consensus = swarm.consensus;
    let swarm_divergence = swarm.divergence;
    let continuum_momentum = continuum.momentum;
    let continuum_progression = continuum.progression;
    let ans_stability = 1.0 - ans.tension; // Inverser tension pour obtenir stabilité
    let resonance_flow = resonance.flow_level;
    let depth = innersense.depth;
    // Validation : toutes les valeurs doivent être finies
    let values = [
        field_orientation,
        field_turbulence,
        swarm_consensus,
        swarm_divergence,
        continuum_momentum,
        continuum_progression,
        ans_stability,
        resonance_flow,
        depth,
    ];
    for (i, &value) in values.iter().enumerate() {
        if !value.is_finite() {
            return Err(format!("Signal {} non valide (NaN ou infini)", i));
    // Clamp strict [0.0, 1.0]
    let inputs = CortexInputs {
        field_orientation: clamp(field_orientation),
        field_turbulence: clamp(field_turbulence),
        swarm_consensus: clamp(swarm_consensus),
        swarm_divergence: clamp(swarm_divergence),
        continuum_momentum: clamp(continuum_momentum),
        continuum_progression: clamp(continuum_progression),
        ans_stability: clamp(ans_stability),
        resonance_flow: clamp(resonance_flow),
        depth: clamp(depth),
    };
    Ok(inputs)
/// Borne une valeur entre 0.0 et 1.0
#[inline]
fn clamp(value: f32) -> f32 {
    if value < 0.0 {
        0.0
    } else if value > 1.0 {
        1.0
    } else {
        value
// ═══════════════════════════════════════════════════════════════════════════
// Tests
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_cortex_inputs_default() {
        let inputs = CortexInputs::default();
        assert!(inputs.field_orientation >= 0.0 && inputs.field_orientation <= 1.0);
        assert!(inputs.swarm_consensus >= 0.0 && inputs.swarm_consensus <= 1.0);
    fn test_clamp() {
        assert_eq!(clamp(-0.5), 0.0);
        assert_eq!(clamp0.5, 0.5);
        assert_eq!(clamp1.5, 1.0);
