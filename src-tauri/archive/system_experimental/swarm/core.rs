// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - Swarm Core                                                   ║
// ║ Génération de micro-signaux distribués                                      ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use crate::shared::types::TitaneResult;
use crate::system::adaptive_engine::AdaptiveEngineModule;
use crate::system::cortex::CortexState;
use crate::system::resonance::ResonanceState;
use crate::system::senses::innersense::InnerSenseState;
use crate::system::senses::timesense::TimeSenseState;
use crate::system::ans::ANSState;
/// Normalise une valeur dans la plage [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    if value.is_nan() || value.is_infinite() {
        return 0.5;
    }
    value.max0.0.min1.0
}
/// Génère les micro-signaux distribués depuis tous les modules sources
/// 
/// Chaque module actif du système contribue un signal normalisé [0.0, 1.0]
/// représentant son état interne optimal.
/// Sources de signaux :
/// 1. AdaptiveEngine : stabilité adaptative
/// 2. Cortex : clarté système globale
/// 3. Resonance : niveau de flux
/// 4. InnerSense : profondeur interne
/// 5. TimeSense : direction temporelle
/// 6. ANS : niveau de stabilité autonome
/// # Arguments
/// * `adaptive` - État du moteur adaptatif
/// * `cortex` - État du Cortex Synchronique
/// * `resonance` - État de résonance
/// * `innersense` - État de perception interne
/// * `timesense` - État de perception temporelle
/// * `ans` - État du système nerveux autonome
/// # Returns
/// * `TitaneResult<Vec<f32>>` - Vecteur de 6 signaux normalisés ou erreur
pub fn generate_signals(
    adaptive: &AdaptiveEngineModule,
    cortex: &CortexState,
    resonance: &ResonanceState,
    innersense: &InnerSenseState,
    timesense: &TimeSenseState,
    ans: &ANSState,
) -> TitaneResult<Vec<f32>> {
    // Signal 1 : Stabilité adaptative du MAI
    // Représente la capacité d'adaptation du système
    let s1 = clamp(adaptive.stability);
    
    // Signal 2 : Clarté système du Cortex
    // Représente la vision globale claire du système
    let s2 = clamp(cortex.system_clarity);
    // Signal 3 : Niveau de flux de Resonance
    // Représente la fluidité des opérations
    let s3 = clamp(resonance.flow_level);
    // Signal 4 : Profondeur interne d'InnerSense
    // Représente la qualité de la perception interne
    let s4 = clamp(innersense.depth);
    // Signal 5 : Direction de TimeSense
    // Représente l'orientation temporelle évolutive
    let s5 = clamp(timesense.direction);
    // Signal 6 : Homéostasie de l'ANS
    // Représente l'équilibre autonome du système
    let s6 = clamp(ans.homeostasis as f32);
    // Vérification de sanité : tous les signaux doivent être valides
    let signals = vec![s1, s2, s3, s4, s5, s6];
    for (idx, &signal) in signals.iter().enumerate() {
        if signal.is_nan() || signal.is_infinite() {
            return Err(format!(
                "Signal {} invalide: {:?}",
                idx + 1,
                signal
            ));
        }
    Ok(signals)
/// Calcule la moyenne des signaux
/// * `signals` - Vecteur de signaux
/// * `f32` - Moyenne normalisée
pub fn calculate_mean(signals: &[f32]) -> f32 {
    if signals.is_empty() {
    let sum: f32 = signals.iter().sum();
    clamp(sum / signals.len() as f32)
/// Calcule la variance des signaux
/// * `f32` - Variance normalisée
pub fn calculate_variance(signals: &[f32]) -> f32 {
    if signals.len() < 2 {
        return 0.0;
    let mean = calculate_mean(signals);
    let variance: f32 = signals
        .iter()
        .map(|&s| {
            let diff = s - mean;
            diff * diff
        })
        .sum::<f32>() / signals.len() as f32;
    clamp(variance)
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_clamp() {
        assert_eq!(clamp0.5, 0.5);
        assert_eq!(clamp(-0.5), 0.0);
        assert_eq!(clamp1.5, 1.0);
        assert_eq!(clamp(f32::NAN), 0.5);
        assert_eq!(clamp(f32::INFINITY), 0.5);
    fn test_calculate_mean() {
        let signals = vec![0.2, 0.4, 0.6, 0.8];
        assert!((calculate_mean(&signals) - 0.5).abs() < 0.01);
        
        let empty: Vec<f32> = vec![];
        assert_eq!(calculate_mean(&empty), 0.5);
    fn test_calculate_variance() {
        let uniform = vec![0.5, 0.5, 0.5, 0.5];
        assert!(calculate_variance(&uniform) < 0.01);
        let diverse = vec![0.0, 0.5, 1.0];
        assert!(calculate_variance(&diverse) > 0.1);
