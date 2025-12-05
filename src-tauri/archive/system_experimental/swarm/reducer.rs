// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - Swarm Reducer                                                ║
// ║ Réduction émergente et calcul de consensus distribué                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use crate::shared::types::TitaneResult;
/// Rapport de réduction du Swarm
/// 
/// Synthèse de l'état émergent du système distribué
#[derive(Debug, Clone)]
pub struct SwarmReport {
    /// Consensus global (moyenne des signaux) [0.0, 1.0]
    pub consensus: f32,
    
    /// Divergence (variance normalisée) [0.0, 1.0]
    pub divergence: f32,
    /// Stabilité émergente [0.0, 1.0]
    pub stability: f32,
}
impl SwarmReport {
    /// Crée un rapport par défaut avec valeurs neutres
    pub fn default() -> Self {
        Self {
            consensus: 0.5,
            divergence: 0.2,
            stability: 0.7,
        }
    }
/// Normalise une valeur dans la plage [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    if value.is_nan() || value.is_infinite() {
        return 0.5;
    value.max0.0.min1.0
/// Calcule la moyenne des signaux (consensus)
/// # Arguments
/// * `signals` - Vecteur de signaux
/// # Returns
/// * `f32` - Moyenne normalisée
fn calculate_consensus(signals: &[f32]) -> f32 {
    if signals.is_empty() {
    let sum: f32 = signals.iter().sum();
    clamp(sum / signals.len() as f32)
/// Calcule la variance normalisée (divergence)
/// Mesure l'écart-type entre les signaux distribués.
/// Une divergence faible indique un alignement fort.
/// Une divergence élevée indique une désynchronisation.
/// * `f32` - Variance normalisée [0.0, 1.0]
fn calculate_divergence(signals: &[f32]) -> f32 {
    if signals.len() < 2 {
        return 0.0;
    let mean = calculate_consensus(signals);
    let variance: f32 = signals
        .iter()
        .map(|&signal| {
            let diff = signal - mean;
            diff * diff
        })
        .sum::<f32>() / signals.len() as f32;
    // Normaliser la variance (max théorique = 0.25 pour [0,1])
    // Donc on multiplie par 4 pour obtenir [0, 1]
    clamp(variance * 4.0)
/// Calcule la stabilité émergente du swarm
/// Stabilité = équilibre entre consensus élevé et divergence faible
/// Formule : (consensus + 1 - divergence) / 2
/// * `consensus` - Consensus global
/// * `divergence` - Divergence normalisée
/// * `f32` - Stabilité émergente [0.0, 1.0]
fn calculate_stability(consensus: f32, divergence: f32) -> f32 {
    clamp((consensus + (1.0 - divergence)) / 2.0)
/// Réduit les signaux distribués en un rapport émergent cohérent
/// Cette fonction effectue une réduction statistique simple et déterministe :
/// 1. Calcule le consensus (moyenne)
/// 2. Calcule la divergence (variance normalisée)
/// 3. Calcule la stabilité émergente
/// * `signals` - Vecteur de signaux normalisés [0.0, 1.0]
/// * `TitaneResult<SwarmReport>` - Rapport de réduction ou erreur
pub fn reduce_swarm(signals: &[f32]) -> TitaneResult<SwarmReport> {
    // Vérification : au moins 2 signaux requis
        return Err(format!(
            "Nombre insuffisant de signaux: {} (minimum: 2)",
            signals.len()
        ));
    // Vérification : tous les signaux doivent être valides
    for (idx, &signal) in signals.iter().enumerate() {
        if signal.is_nan() || signal.is_infinite() {
            return Err(format!(
                "Signal {} invalide: {:?}",
                idx,
                signal
            ));
        if signal < 0.0 || signal > 1.0 {
                "Signal {} hors plage [0,1]: {}",
    // Calcul du consensus (moyenne)
    let consensus = calculate_consensus(signals);
    // Calcul de la divergence (variance normalisée)
    let divergence = calculate_divergence(signals);
    // Calcul de la stabilité émergente
    let stability = calculate_stability(consensus, divergence);
    Ok(SwarmReport {
        consensus,
        divergence,
        stability,
    })
/// Calcule un score de cohérence du swarm
/// Score basé sur la stabilité et le consensus
/// * `report` - Rapport de réduction
/// * `f32` - Score de cohérence [0.0, 1.0]
pub fn calculate_coherence_score(report: &SwarmReport) -> f32 {
    // Cohérence = combinaison de stabilité (70%) et consensus (30%)
    clamp(0.7 * report.stability + 0.3 * report.consensus)
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_calculate_consensus() {
        let signals = vec![0.2, 0.4, 0.6, 0.8];
        let consensus = calculate_consensus(&signals);
        assert!((consensus - 0.5).abs() < 0.01);
    fn test_calculate_divergence() {
        // Signaux uniformes = divergence nulle
        let uniform = vec![0.5, 0.5, 0.5, 0.5];
        let div = calculate_divergence(&uniform);
        assert!(div < 0.01);
        
        // Signaux dispersés = divergence élevée
        let dispersed = vec![0.0, 0.5, 1.0];
        let div2 = calculate_divergence(&dispersed);
        assert!(div2 > 0.3);
    fn test_calculate_stability() {
        // Consensus élevé + divergence faible = stabilité élevée
        let stab1 = calculate_stability(0.8, 0.1);
        assert!(stab1 > 0.8);
        // Consensus faible + divergence élevée = stabilité faible
        let stab2 = calculate_stability(0.3, 0.7);
        assert!(stab2 < 0.4);
    fn test_reduce_swarm() {
        let signals = vec![0.7, 0.75, 0.8, 0.78, 0.72, 0.76];
        let report = reduce_swarm(&signals).unwrap();
        assert!(report.consensus > 0.7);
        assert!(report.consensus < 0.8);
        assert!(report.divergence < 0.2);
        assert!(report.stability > 0.7);
    fn test_reduce_swarm_invalid() {
        // Trop peu de signaux
        let empty: Vec<f32> = vec![];
        assert!(reduce_swarm(&empty).is_err());
        let single = vec![0.5];
        assert!(reduce_swarm(&single).is_err());
        // Signal invalide
        let invalid = vec![0.5, f32::NAN, 0.7];
        assert!(reduce_swarm(&invalid).is_err());
    fn test_calculate_coherence_score() {
        let report = SwarmReport {
            consensus: 0.8,
            stability: 0.9,
        };
        let score = calculate_coherence_score(&report);
        assert!(score > 0.8);
