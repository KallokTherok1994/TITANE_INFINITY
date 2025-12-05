// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - Resonance Engine                                             ║
// ║ Analyse des signaux internes et détection de patterns                       ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use crate::shared::types::TitaneResult;
/// Types de signaux reconnus par le Resonance Engine
#[derive(Debug, Clone, PartialEq)]
pub enum SignalType {
    Load,          // Charge système
    Harmony,       // Harmonie inter-modules
    Alert,         // Alertes et tensions
    MemoryEvent,   // Événements mémoire
    Vitality,      // Vitalité système
    Coherence,     // Cohérence globale
}
/// Signal individuel provenant du Neural Mesh
#[derive(Debug, Clone)]
pub struct Signal {
    pub signal_type: SignalType,
    pub value: f32,
    pub timestamp: u64,
/// Rapport d'analyse de résonance
pub struct ResonanceReport {
    pub tension: f32,    // Niveau de tension [0.0, 1.0]
    pub harmony: f32,    // Niveau d'harmonie [0.0, 1.0]
    pub flow: f32,       // Niveau de flux [0.0, 1.0]
impl ResonanceReport {
    /// Crée un rapport par défaut
    pub fn default() -> Self {
        Self {
            tension: 0.0,
            harmony: 1.0,
            flow: 1.0,
        }
    }
/// Normalise une valeur dans la plage [0.0, 1.0]
fn normalize(value: f32) -> f32 {
    if value.is_nan() || value.is_infinite() {
        return 0.0;
    value.max0.0.min1.0
/// Calcule la moyenne d'un vecteur de valeurs
fn calculate_average(values: &[f32]) -> f32 {
    if values.is_empty() {
    
    let sum: f32 = values.iter().sum();
    let count = values.len() as f32;
    normalizesum / count
/// Lisse une valeur avec un facteur d'amortissement
fn smooth_value(old: f32, new: f32, smoothing_factor: f32) -> f32 {
    let factor = normalize(smoothing_factor);
    normalize(old * (1.0 - factor) + new * factor)
/// Analyse les signaux et génère un rapport de résonance
/// 
/// # Arguments
/// * `signals` - Slice de signaux à analyser
/// # Returns
/// * `TitaneResult<ResonanceReport>` - Rapport d'analyse ou erreur
pub fn analyze_resonance(signals: &[Signal]) -> TitaneResult<ResonanceReport> {
    if signals.is_empty() {
        // Pas de signaux = état neutre stable
        return Ok(ResonanceReport::default());
    // Séparer les signaux par type
    let mut load_values: Vec<f32> = Vec::new();
    let mut harmony_values: Vec<f32> = Vec::new();
    let mut alert_values: Vec<f32> = Vec::new();
    let mut vitality_values: Vec<f32> = Vec::new();
    let mut coherence_values: Vec<f32> = Vec::new();
    for signal in signals {
        let normalized_value = normalize(signal.value);
        
        match signal.signal_type {
            SignalType::Load => load_values.push(normalized_value),
            SignalType::Harmony => harmony_values.push(normalized_value),
            SignalType::Alert => alert_values.push(normalized_value),
            SignalType::Vitality => vitality_values.push(normalized_value),
            SignalType::Coherence => coherence_values.push(normalized_value),
            SignalType::MemoryEvent => {
                // Les événements mémoire contribuent à la cohérence
                coherence_values.push(normalized_value);
            }
    // Calcul de la tension : moyenne des alertes et de la charge
    let alert_avg = calculate_average(&alert_values);
    let load_avg = calculate_average(&load_values);
    let tension = normalize(alert_avg + load_avg / 2.0);
    // Calcul de l'harmonie : moyenne des signaux Harmony et Coherence
    let harmony_avg = calculate_average(&harmony_values);
    let coherence_avg = calculate_average(&coherence_values);
    // Si aucun signal d'harmonie, utiliser l'inverse de la tension
    let harmony = if harmony_values.is_empty() && coherence_values.is_empty() {
        normalize(1.0 - tension)
    } else {
        normalize(harmony_avg + coherence_avg / 2.0)
    };
    // Calcul du flux : combinaison de vitalité et faible tension
    let vitality_avg = if vitality_values.is_empty() {
        0.5 // Valeur neutre par défaut
        calculate_average(&vitality_values)
    let flow = normalize((vitality_avg + (1.0 - tension)) / 2.0);
    Ok(ResonanceReport {
        tension,
        harmony,
        flow,
    })
/// Filtre les signaux obsolètes (plus de 5 secondes)
/// * `signals` - Slice de signaux à filtrer
/// * `current_time` - Timestamp actuel
/// * `Vec<Signal>` - Signaux filtrés
pub fn filter_old_signals(signals: &[Signal], current_time: u64) -> Vec<Signal> {
    const MAX_AGE: u64 = 5000; // 5 secondes en millisecondes
    signals
        .iter()
        .filter(|s| current_time.saturating_sub(s.timestamp) <= MAX_AGE)
        .cloned()
        .collect()
/// Détecte les oscillations dans les signaux
/// * `f32` - Score d'oscillation [0.0, 1.0]
pub fn detect_oscillations(signals: &[Signal]) -> f32 {
    if signals.len() < 3 {
    // Calculer la variance des valeurs
    let values: Vec<f32> = signals.iter().map(|s| normalize(s.value)).collect();
    let mean = calculate_average(&values);
    let variance: f32 = values
        .map(|v| v - mean.powi2)
        .sum::<f32>() / values.len() as f32;
    // Variance élevée = oscillations
    normalize(variance.sqrt())
/// Calcule un score de stabilité basé sur la cohérence des signaux
/// * `report` - Rapport de résonance
/// * `f32` - Score de stabilité [0.0, 1.0]
pub fn calculate_stability(report: &ResonanceReport) -> f32 {
    // Stabilité = harmonie élevée + tension faible + flux constant
    let harmony_factor = report.harmony * 0.5;
    let tension_factor = (1.0 - report.tension) * 0.3;
    let flow_factor = report.flow * 0.2;
    normalize(harmony_factor + tension_factor + flow_factor)
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_normalize() {
        assert_eq!(normalize(-0.5), 0.0);
        assert_eq!(normalize0.5, 0.5);
        assert_eq!(normalize1.5, 1.0);
        assert_eq!(normalize(f32::NAN), 0.0);
        assert_eq!(normalize(f32::INFINITY), 1.0);
    fn test_calculate_average() {
        assert_eq!(calculate_average(&[]), 0.0);
        assert_eq!(calculate_average(&[0.5]), 0.5);
        assert_eq!(calculate_average(&[0.2, 0.4, 0.6]), 0.4);
    fn test_analyze_resonance_empty() {
        let signals: Vec<Signal> = vec![];
        let report = analyze_resonance(&signals).unwrap();
        assert_eq!(report.tension, 0.0);
        assert_eq!(report.harmony, 1.0);
        assert_eq!(report.flow, 1.0);
    fn test_analyze_resonance_high_tension() {
        let signals = vec![
            Signal {
                signal_type: SignalType::Alert,
                value: 0.8,
                timestamp: 1000,
            },
                signal_type: SignalType::Load,
                value: 0.9,
        ];
        assert!(report.tension > 0.7);
        assert!(report.flow < 0.5);
    fn test_analyze_resonance_high_harmony() {
                signal_type: SignalType::Harmony,
                signal_type: SignalType::Coherence,
                value: 0.95,
        assert!(report.harmony > 0.85);
        assert!(report.tension < 0.2);
    fn test_filter_old_signals() {
                value: 0.5,
                value: 0.6,
                timestamp: 8000,
        let filtered = filter_old_signals(&signals, 10000);
        assert_eq!(filtered.len(), 1);
        assert_eq!(filtered[0].timestamp, 8000);
    fn test_calculate_stability() {
        let report = ResonanceReport {
            tension: 0.2,
            harmony: 0.9,
            flow: 0.8,
        };
        let stability = calculate_stability(&report);
        assert!(stability > 0.6);
