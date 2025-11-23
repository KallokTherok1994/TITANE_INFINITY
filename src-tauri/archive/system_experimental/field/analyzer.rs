// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 — Field Engine : Analyzer                                   ║
// ║ Collecte des signaux internes pour analyse de champ cognitif             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

use crate::system::{
    swarm::SwarmState,
    ans::ANSState,
    resonance::ResonanceState,
    senses::{innersense::InnerSenseState, timesense::TimeSenseState},
};
/// Inputs collectés depuis les modules internes
#[derive(Debug, Clone)]
pub struct FieldInputs {
    pub swarm_consensus: f32,
    pub swarm_divergence: f32,
    pub ans_tension: f32,
    pub flow_level: f32,
    pub depth: f32,
    pub direction: f32,
}
impl Default for FieldInputs {
    fn default() -> Self {
        Self {
            swarm_consensus: 0.5,
            swarm_divergence: 0.3,
            ans_tension: 0.4,
            flow_level: 0.5,
            depth: 0.5,
            direction: 0.5,
        }
    }
/// Collecte les signaux internes nécessaires au Field Engine
///
/// # Arguments
/// * `swarm` - État du Swarm Mode (consensus, divergence)
/// * `ans` - État de l'ANS (tension autonome)
/// * `resonance` - État de Resonance (flow_level)
/// * `innersense` - État InnerSense (depth)
/// * `timesense` - État TimeSense (direction)
/// # Returns
/// * `Ok(FieldInputs)` - Inputs normalisés [0.0, 1.0]
/// * `Err(String)` - En cas d'erreur de validation
pub fn collect_field_inputs(
    swarm: &SwarmState,
    ans: &ANSState,
    resonance: &ResonanceState,
    innersense: &InnerSenseState,
    timesense: &TimeSenseState,
) -> Result<FieldInputs, String> {
    // Extraction brute des signaux
    let swarm_consensus = swarm.consensus;
    let swarm_divergence = swarm.divergence;
    let ans_tension = ans.tension;
    let flow_level = resonance.flow_level;
    let depth = innersense.depth;
    let direction = timesense.direction as f32;
    // Validation : tous les signaux doivent être valides
    let signals = [
        swarm_consensus,
        swarm_divergence,
        ans_tension,
        flow_level,
        depth,
        direction,
    ];
    for (i, &signal) in signals.iter().enumerate() {
        if !signal.is_finite() {
            return Err(format!("Signal {} non valide (NaN ou infini)", i));
    // Clamp strict [0.0, 1.0]
    let inputs = FieldInputs {
        swarm_consensus: clamp(swarm_consensus),
        swarm_divergence: clamp(swarm_divergence),
        ans_tension: clamp(ans_tension),
        flow_level: clamp(flow_level),
        depth: clamp(depth),
        direction: clamp(direction),
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
    fn test_clamp() {
        assert_eq!(clamp(-0.5), 0.0);
        assert_eq!(clamp0.0, 0.0);
        assert_eq!(clamp0.5, 0.5);
        assert_eq!(clamp1.0, 1.0);
        assert_eq!(clamp1.5, 1.0);
    fn test_field_inputs_default() {
        let inputs = FieldInputs::default();
        assert!(inputs.swarm_consensus >= 0.0 && inputs.swarm_consensus <= 1.0);
        assert!(inputs.swarm_divergence >= 0.0 && inputs.swarm_divergence <= 1.0);
        assert!(inputs.ans_tension >= 0.0 && inputs.ans_tension <= 1.0);
        assert!(inputs.flow_level >= 0.0 && inputs.flow_level <= 1.0);
        assert!(inputs.depth >= 0.0 && inputs.depth <= 1.0);
        assert!(inputs.direction >= 0.0 && inputs.direction <= 1.0);
    fn test_collect_field_inputs_validation() {
        use crate::system::swarm::SwarmState;
        use crate::system::ans::ANSState;
        use crate::system::resonance::ResonanceState;
        use crate::system::senses::innersense::InnerSenseState;
        use crate::system::senses::timesense::TimeSenseState;
        let swarm = SwarmState {
            initialized: true,
            consensus: 0.7,
            divergence: 0.2,
            stability: 0.8,
            last_update: 1000,
        };
        let ans = ANSState::new1000;
        let resonance = ResonanceState::new1000;
        let innersense = InnerSenseState::new1000;
        let timesense = TimeSenseState::new1000;
        let result = collect_field_inputs(&swarm, &ans, &resonance, &innersense, &timesense);
        assert!(result.is_ok());
        let inputs = result.unwrap();
