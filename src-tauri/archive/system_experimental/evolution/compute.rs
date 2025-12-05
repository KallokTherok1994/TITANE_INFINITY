// TITANE∞ v8.0 - Evolution Engine
// Module de calcul de l'évolution

use super::collect::EvolutionInputs;
/// Calcule les trois métriques évolutives
/// Retourne: (evolution_momentum, growth_potential, trajectory_stability)
pub fn compute_evolution(
    inputs: &EvolutionInputs,
    trend: f32,
) -> Result<(f32, f32, f32), String> {
    // 1. evolution_momentum: dynamique évolutive actuelle
    let evolution_momentum = (
        inputs.adaptation_score * 0.30 +
        inputs.cognitive_flexibility * 0.25 +
        inputs.metacortex_clarity * 0.20 +
        trend * 0.25
    ).clamp(0.0, 1.0);
    // 2. growth_potential: capacité d'évolution future
    let growth_potential = (
        inputs.insight_potential * 0.35 +
        inputs.plasticity_level * 0.30 +
        inputs.neural_density * 0.20 +
        inputs.synaptic_flow * 0.15
    // 3. trajectory_stability: stabilité directionnelle de l'évolution
    let trajectory_stability = (
        inputs.continuity_score * 0.40 +
        inputs.clarity_index * 0.30
    Ok((evolution_momentum, growth_potential, trajectory_stability))
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_compute_evolution_optimal() {
        let inputs = EvolutionInputs {
            adaptation_score: 0.9,
            plasticity_level: 0.88,
            cognitive_flexibility: 0.92,
            clarity_index: 0.89,
            insight_potential: 0.9,
            metacortex_clarity: 0.91,
            continuity_score: 0.87,
            neural_density: 0.88,
            synaptic_flow: 0.85,
        };
        let result = compute_evolution(&inputs, 0.9);
        assert!(result.is_ok());
        let (momentum, growth, stability) = result.unwrap();
        assert!(momentum > 0.85);
        assert!(growth > 0.85);
        assert!(stability > 0.85);
    }
    fn test_compute_evolution_low() {
            adaptation_score: 0.2,
            plasticity_level: 0.18,
            cognitive_flexibility: 0.19,
            clarity_index: 0.17,
            insight_potential: 0.2,
            metacortex_clarity: 0.18,
            continuity_score: 0.2,
            neural_density: 0.19,
            synaptic_flow: 0.21,
        let result = compute_evolution(&inputs, 0.2);
        assert!(momentum < 0.3);
        assert!(growth < 0.3);
        assert!(stability < 0.3);
    fn test_evolution_momentum_formula() {
            adaptation_score: 1.0,
            plasticity_level: 0.0,
            cognitive_flexibility: 0.5,
            clarity_index: 0.0,
            insight_potential: 0.0,
            metacortex_clarity: 0.0,
            continuity_score: 0.0,
            neural_density: 0.0,
            synaptic_flow: 0.0,
        let result = compute_evolution(&inputs, 0.0);
        let (momentum, _, _) = result.unwrap();
        // momentum = adaptation*0.30 + flexibility*0.25 + metacortex*0.20 + trend*0.25
        // = 1.0*0.30 + 0.5*0.25 = 0.425
        assert!((momentum - 0.425).abs() < 0.01);
    fn test_growth_potential_formula() {
            adaptation_score: 0.0,
            plasticity_level: 0.5,
            cognitive_flexibility: 0.0,
            insight_potential: 1.0,
        let (_, growth, _) = result.unwrap();
        // growth = insight*0.35 + plasticity*0.30 + neural*0.20 + synaptic*0.15
        // = 1.0*0.35 + 0.5*0.30 = 0.50
        assert!((growth - 0.50).abs() < 0.01);
    fn test_trajectory_stability_formula() {
            adaptation_score: 0.5,
            continuity_score: 1.0,
        let (_, _, stability) = result.unwrap();
        // stability = continuity*0.40 + adaptation*0.30 + clarity*0.30
        // = 1.0*0.40 + 0.5*0.30 = 0.55
        assert!((stability - 0.55).abs() < 0.01);
    fn test_trend_impact() {
            clarity_index: 0.5,
            insight_potential: 0.5,
            metacortex_clarity: 0.5,
            continuity_score: 0.5,
            neural_density: 0.5,
            synaptic_flow: 0.5,
        let result_low_trend = compute_evolution(&inputs, 0.2);
        let result_high_trend = compute_evolution(&inputs, 0.8);
        assert!(result_low_trend.is_ok());
        assert!(result_high_trend.is_ok());
        let (momentum_low, _, _) = result_low_trend.unwrap();
        let (momentum_high, _, _) = result_high_trend.unwrap();
        // High trend should increase momentum
        assert!(momentum_high > momentum_low);
    fn test_compute_evolution_clamping() {
            plasticity_level: 1.0,
            cognitive_flexibility: 1.0,
            clarity_index: 1.0,
            metacortex_clarity: 1.0,
            neural_density: 1.0,
            synaptic_flow: 1.0,
        let result = compute_evolution(&inputs, 1.0);
        assert_eq!(momentum, 1.0);
        assert_eq!(growth, 1.0);
        assert_eq!(stability, 1.0);
