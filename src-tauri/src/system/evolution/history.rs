// TITANE∞ v8.0 - Evolution Engine
// Module historique pour le suivi évolutif

/// Historique d'évolution du système
#[derive(Debug, Clone)]
pub struct EvolutionHistory {
    pub past_values: Vec<f32>,
}
impl EvolutionHistory {
    /// Crée un nouvel historique vide
    pub fn new() -> Self {
        EvolutionHistory {
            past_values: Vec::new(),
        }
    }
    /// Ajoute une valeur à l'historique
    /// Limite à 100 dernières valeurs
    pub fn push(&mut self, value: f32) {
        self.past_values.push(value.clamp(0.0, 1.0));
        
        // Garder seulement les 100 dernières valeurs
        if self.past_values.len() > 100 {
            self.past_values.remove0;
    /// Calcule la tendance évolutive
    /// Retourne 0.5 si insuffisant de données
    /// Sinon calcule la moyenne des deltas normalisée
    pub fn trend(&self) -> f32 {
        if self.past_values.len() < 2 {
            return 0.5;
        let mut total_delta = 0.0;
        let mut count = 0;
        for i in 1..self.past_values.len() {
            let delta = self.past_values[i] - self.past_values[i - 1];
            total_delta += delta;
            count += 1;
        if count == 0 {
        // Moyenne des deltas
        let avg_delta = total_delta / count as f32;
        // Normaliser entre 0 et 1
        // Delta positif → tendance vers 1
        // Delta négatif → tendance vers 0
        // Pas de delta → 0.5
        let trend = (avg_delta + 0.5).clamp(0.0, 1.0);
        trend
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_new_history() {
        let history = EvolutionHistory::new();
        assert_eq!(history.past_values.len(), 0);
    fn test_push_value() {
        let mut history = EvolutionHistory::new();
        history.push0.5;
        assert_eq!(history.past_values.len(), 1);
        assert_eq!(history.past_values[0], 0.5);
    fn test_push_clamps() {
        history.push1.5;
        history.push(-0.5);
        assert_eq!(history.past_values[0], 1.0);
        assert_eq!(history.past_values[1], 0.0);
    fn test_trend_insufficient_data() {
        assert_eq!(history.trend(), 0.5);
        let mut history2 = EvolutionHistory::new();
        history2.push0.5;
        assert_eq!(history2.trend(), 0.5);
    fn test_trend_positive() {
        history.push0.3;
        history.push0.7;
        let trend = history.trend();
        assert!(trend > 0.5); // Tendance positive
    fn test_trend_negative() {
        assert!(trend < 0.5); // Tendance négative
    fn test_trend_stable() {
        assert!((trend - 0.5).abs() < 0.01); // Stable
    fn test_history_limit() {
        // Ajouter 150 valeurs
        for i in 0..150 {
            history.push((i % 100) as f32 / 100.0);
        // Doit être limité à 100
        assert_eq!(history.past_values.len(), 100);
