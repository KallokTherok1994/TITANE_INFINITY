// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 — Meta-Continuum : History                                  ║
// ║ Enregistrement compact des états internes du système                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

use crate::system::{
    field::FieldState,
    swarm::SwarmState,
    ans::ANSState,
    resonance::ResonanceState,
    senses::timesense::TimeSenseState,
};
/// Snapshot d'état interne à un instant T
#[derive(Debug, Clone)]
pub struct Snapshot {
    pub timestamp: u64,      // Milliseconds depuis UNIX_EPOCH
    pub direction: f32,      // Orientation globale [0.0, 1.0]
    pub flow: f32,           // Flux de résonance [0.0, 1.0]
    pub risk: f32,           // Niveau de risque (tension) [0.0, 1.0]
    pub stability: f32,      // Stabilité du système [0.0, 1.0]
}
impl Snapshot {
    /// Crée un nouveau snapshot avec valeurs par défaut
    pub fn new(timestamp: u64) -> Self {
        Self {
            timestamp,
            direction: 0.5,
            flow: 0.5,
            risk: 0.3,
            stability: 0.7,
        }
    }
/// Enregistre un snapshot dans l'historique circulaire
///
/// # Arguments
/// * `field` - État du Field Engine
/// * `swarm` - État du Swarm Mode
/// * `ans` - État de l'ANS
/// * `resonance` - État de Resonance
/// * `time` - État TimeSense
/// * `buffer` - Buffer circulaire (Vec) de snapshots
/// * `max` - Taille maximale du buffer (recommandé: 20)
/// # Comportement
/// * Ajoute un snapshot en fin de buffer
/// * Si buffer.len() > max, supprime le plus ancien (front)
/// * Clamp strict de toutes les valeurs [0.0, 1.0]
pub fn record_snapshot(
    field: &FieldState,
    swarm: &SwarmState,
    ans: &ANSState,
    resonance: &ResonanceState,
    time: &TimeSenseState,
    buffer: &mut Vec<Snapshot>,
    max: usize,
) -> Result<(), String> {
    // Obtenir timestamp actuel
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Erreur timestamp: {}", e))?
        .as_millis() as u64;
    // Extraire valeurs brutes
    let direction = field.orientation;
    let flow = resonance.flow_level;
    let risk = ans.tension;
    let stability = swarm.stability;
    // Validation : toutes les valeurs doivent être finies
    if !direction.is_finite() || !flow.is_finite() || !risk.is_finite() || !stability.is_finite() {
        return Err("Valeurs non valides dans snapshot".to_string());
    // Clamp strict [0.0, 1.0]
    let snapshot = Snapshot {
        timestamp,
        direction: clamp(direction),
        flow: clamp(flow),
        risk: clamp(risk),
        stability: clamp(stability),
    };
    // Ajouter au buffer
    buffer.push(snapshot);
    // Maintenir taille max (buffer circulaire)
    while buffer.len() > max {
        buffer.remove0; // Supprimer le plus ancien
    Ok(())
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
    fn test_snapshot_new() {
        let snapshot = Snapshot::new1000;
        assert_eq!(snapshot.timestamp, 1000);
        assert!(snapshot.direction >= 0.0 && snapshot.direction <= 1.0);
        assert!(snapshot.flow >= 0.0 && snapshot.flow <= 1.0);
        assert!(snapshot.risk >= 0.0 && snapshot.risk <= 1.0);
        assert!(snapshot.stability >= 0.0 && snapshot.stability <= 1.0);
    fn test_clamp() {
        assert_eq!(clamp(-0.5), 0.0);
        assert_eq!(clamp0.0, 0.0);
        assert_eq!(clamp0.5, 0.5);
        assert_eq!(clamp1.0, 1.0);
        assert_eq!(clamp1.5, 1.0);
    fn test_record_snapshot_buffer_limit() {
        use crate::system::field::FieldState;
        use crate::system::swarm::SwarmState;
        use crate::system::ans::ANSState;
        use crate::system::resonance::ResonanceState;
        use crate::system::senses::timesense::TimeSenseState;
        let field = FieldState::new1000;
        let swarm = SwarmState::new1000;
        let ans = ANSState::new1000;
        let resonance = ResonanceState::new1000;
        let time = TimeSenseState::new1000;
        let mut buffer = Vec::new();
        let max = 5;
        // Ajouter 10 snapshots
        for _ in 0..10 {
            let result = record_snapshot(&field, &swarm, &ans, &resonance, &time, &mut buffer, max);
            assert!(result.is_ok());
        // Le buffer ne doit jamais dépasser max
        assert_eq!(buffer.len(), max);
