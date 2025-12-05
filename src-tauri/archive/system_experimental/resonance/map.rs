// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - Coherence Map                                                ║
// ║ Représentation stable de l'état interne du système                          ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use crate::shared::types::TitaneResult;
use crate::shared::utils::current_timestamp;
use super::engine::ResonanceReport;
/// Carte de cohérence du système
/// 
/// Représente l'état interne global avec lissage temporel
/// pour éviter les oscillations brutales
#[derive(Debug, Clone)]
pub struct CoherenceMap {
    pub tension: f32,      // Tension interne [0.0, 1.0]
    pub harmony: f32,      // Harmonie globale [0.0, 1.0]
    pub stability: f32,    // Stabilité système [0.0, 1.0]
    pub updated_at: u64,   // Timestamp de dernière mise à jour
}
impl CoherenceMap {
    /// Crée une nouvelle carte de cohérence avec valeurs neutres
    pub fn new() -> Self {
        Self {
            tension: 0.0,
            harmony: 1.0,
            stability: 1.0,
            updated_at: current_timestamp(),
        }
    }
    
    /// Réinitialise la carte à l'état neutre
    pub fn reset(&mut self) {
        self.tension = 0.0;
        self.harmony = 1.0;
        self.stability = 1.0;
        self.updated_at = current_timestamp();
impl Default for CoherenceMap {
    fn default() -> Self {
        Self::new()
/// Normalise une valeur dans la plage [0.0, 1.0]
fn clamp(value: f32) -> f32 {
    if value.is_nan() || value.is_infinite() {
        return 0.0;
    value.max0.0.min1.0
/// Applique un lissage exponentiel entre deux valeurs
/// # Arguments
/// * `old` - Ancienne valeur
/// * `new` - Nouvelle valeur
/// * `factor` - Facteur de lissage [0.0, 1.0]
/// # Returns
/// * `f32` - Valeur lissée
fn smooth_transition(old: f32, new: f32, factor: f32) -> f32 {
    let f = clamp(factor);
    clamp(old * (1.0 - f) + new * f)
/// Amortit les variations trop brutales
/// * `max_delta` - Variation maximale autorisée
/// * `f32` - Valeur amortie
fn dampen_change(old: f32, new: f32, max_delta: f32) -> f32 {
    let delta = new - old;
    let max_d = max_delta.abs();
    if delta.abs() <= max_d {
        new
    } else if delta > 0.0 {
        old + max_d
    } else {
        old - max_d
/// Met à jour la carte de cohérence avec un nouveau rapport de résonance
/// Applique un lissage exponentiel pour éviter les oscillations brutales
/// et maintenir une représentation stable de l'état interne
/// * `map` - Carte de cohérence à mettre à jour
/// * `report` - Rapport de résonance source
/// * `TitaneResult<()>` - Succès ou erreur
pub fn update_map(
    map: &mut CoherenceMap,
    report: &ResonanceReport,
) -> TitaneResult<()> {
    // Facteur de lissage : 70% ancien + 30% nouveau
    // Cela crée une moyenne mobile qui lisse les variations
    const SMOOTHING_FACTOR: f32 = 0.3;
    // Variation maximale par tick (évite les sauts brutaux)
    const MAX_DELTA: f32 = 0.15;
    // Normaliser les valeurs entrantes
    let new_tension = clamp(report.tension);
    let new_harmony = clamp(report.harmony);
    // Appliquer le lissage exponentiel
    let smoothed_tension = smooth_transition(map.tension, new_tension, SMOOTHING_FACTOR);
    let smoothed_harmony = smooth_transition(map.harmony, new_harmony, SMOOTHING_FACTOR);
    // Amortir les variations trop brutales
    map.tension = dampen_change(map.tension, smoothed_tension, MAX_DELTA);
    map.harmony = dampen_change(map.harmony, smoothed_harmony, MAX_DELTA);
    // Calculer la stabilité : équilibre entre harmonie et faible tension
    map.stability = clamp((map.harmony + (1.0 - map.tension)) / 2.0);
    // Mettre à jour le timestamp
    map.updated_at = current_timestamp();
    Ok(())
/// Calcule un score de cohérence global du système
/// * `map` - Carte de cohérence
/// * `f32` - Score de cohérence [0.0, 1.0]
pub fn calculate_coherence_score(map: &CoherenceMap) -> f32 {
    // Score de cohérence = pondération des 3 métriques
    // Harmonie : 50%
    // Stabilité : 30%
    // Faible tension : 20%
    let harmony_contrib = map.harmony * 0.5;
    let stability_contrib = map.stability * 0.3;
    let tension_contrib = (1.0 - map.tension) * 0.2;
    clamp(harmony_contrib + stability_contrib + tension_contrib)
/// Détecte si le système est dans un état dégradé
/// * `bool` - True si état dégradé
pub fn is_degraded(map: &CoherenceMap) -> bool {
    map.tension > 0.7 || map.harmony < 0.3 || map.stability < 0.4
/// Détecte si le système est dans un état critique
/// * `bool` - True si état critique
pub fn is_critical(map: &CoherenceMap) -> bool {
    map.tension > 0.85 || map.harmony < 0.15 || map.stability < 0.2
/// Génère un message de status lisible
/// * `String` - Message de status
pub fn get_status_message(map: &CoherenceMap) -> String {
    if is_critical(map) {
        format!(
            "CRITICAL: tension={:.2}, harmony={:.2}, stability={:.2}",
            map.tension, map.harmony, map.stability
        )
    } else if is_degraded(map) {
            "DEGRADED: tension={:.2}, harmony={:.2}, stability={:.2}",
            "HEALTHY: tension={:.2}, harmony={:.2}, stability={:.2}",
/// Applique une correction douce vers l'état d'équilibre
/// Utilisé pour éviter que le système reste bloqué dans un état dégradé
/// * `map` - Carte de cohérence à corriger
/// * `strength` - Force de la correction [0.0, 1.0]
pub fn apply_equilibrium_correction(
    strength: f32,
    let s = clamp(strength);
    // État d'équilibre cible
    const TARGET_TENSION: f32 = 0.2;
    const TARGET_HARMONY: f32 = 0.8;
    // Appliquer une correction douce
    map.tension = smooth_transition(map.tension, TARGET_TENSION, s * 0.1);
    map.harmony = smooth_transition(map.harmony, TARGET_HARMONY, s * 0.1);
    // Recalculer la stabilité
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_coherence_map_new() {
        let map = CoherenceMap::new();
        assert_eq!(map.tension, 0.0);
        assert_eq!(map.harmony, 1.0);
        assert_eq!(map.stability, 1.0);
    fn test_clamp() {
        assert_eq!(clamp(-0.5), 0.0);
        assert_eq!(clamp0.5, 0.5);
        assert_eq!(clamp1.5, 1.0);
        assert_eq!(clamp(f32::NAN), 0.0);
    fn test_smooth_transition() {
        let smoothed = smooth_transition(0.5, 1.0, 0.3);
        assert!(smoothed > 0.5 && smoothed < 1.0);
        assert!((smoothed - 0.65).abs() < 0.01);
    fn test_dampen_change() {
        let dampened = dampen_change(0.2, 0.9, 0.15);
        assert_eq!(dampened, 0.35); // 0.2 + 0.15
    fn test_update_map() {
        let mut map = CoherenceMap::new();
        let report = ResonanceReport {
            tension: 0.8,
            harmony: 0.3,
            flow: 0.5,
        };
        
        update_map(&mut map, &report).unwrap();
        // Vérifier que le lissage a été appliqué
        assert!(map.tension < 0.8); // Lissé depuis 0.0
        assert!(map.harmony < 1.0); // Lissé depuis 1.0
    fn test_calculate_coherence_score() {
        let map = CoherenceMap {
            tension: 0.2,
            harmony: 0.9,
            stability: 0.85,
            updated_at: 0,
        let score = calculate_coherence_score(&map);
        assert!(score > 0.75);
    fn test_is_degraded() {
        assert!(!is_degraded(&map));
        map.tension = 0.75;
        assert!(is_degraded(&map));
    fn test_is_critical() {
        assert!(!is_critical(&map));
        map.tension = 0.9;
        assert!(is_critical(&map));
    fn test_apply_equilibrium_correction() {
        let mut map = CoherenceMap {
            harmony: 0.2,
            stability: 0.2,
        apply_equilibrium_correction(&mut map, 1.0).unwrap();
        // La correction devrait rapprocher des valeurs cibles
        assert!(map.tension < 0.8);
        assert!(map.harmony > 0.2);
