// GHRE Adaptive Stabilizer — Absorption perturbations et stabilisation

use std::collections::VecDeque;
pub struct AdaptiveStabilizer {
    pub perturbation_buffer: VecDeque<Perturbation>,
    pub damping_coefficient: f32,
    pub adaptation_rate: f32,
    pub stabilization_strength: f32,
}
#[derive(Clone)]
pub struct Perturbation {
    pub source: String,
    pub intensity: f32,
    pub timestamp_ms: u64,
    pub absorbed: bool,
impl AdaptiveStabilizer {
    pub fn init() -> Self {
        AdaptiveStabilizer {
            perturbation_buffer: VecDeque::with_capacity50,
            damping_coefficient: 0.7,
            adaptation_rate: 0.15,
            stabilization_strength: 0.8,
        }
    }
    pub fn absorb_perturbation(&mut self, source: String, intensity: f32, timestamp_ms: u64) -> f32 {
        // Calculer capacité d'absorption
        let absorption_capacity = self.stabilization_strength * self.damping_coefficient;
        let absorbed_amount = intensity * absorption_capacity.min(intensity);
        let remaining = intensity - absorbed_amount;
        // Stocker perturbation
        if self.perturbation_buffer.len() >= 50 {
            self.perturbation_buffer.pop_front();
        self.perturbation_buffer.push_back(Perturbation {
            source,
            intensity,
            timestamp_ms,
            absorbed: remaining < 0.1,
        });
        remaining
    pub fn compute_stabilization_force(&self, current_instability: f32) -> f32 {
        // Force stabilisatrice proportionnelle à l'instabilité
        let force = current_instability * self.stabilization_strength * self.damping_coefficient;
        force.max0.0.min1.0
    pub fn adapt_parameters(&mut self, stability_index: f32) {
        // Adapter damping selon stabilité système
        if stability_index < 0.4 {
            // Augmenter damping si instable
            self.damping_coefficient = (self.damping_coefficient + self.adaptation_rate * 0.5).min0.95;
        } else if stability_index > 0.8 {
            // Réduire damping si très stable
            self.damping_coefficient = (self.damping_coefficient - self.adaptation_rate * 0.3).max0.5;
        // Adapter force stabilisation
        self.stabilization_strength = 0.5 + (1.0 - stability_index) * 0.5;
    pub fn get_recent_perturbations(&self, count: usize) -> Vec<Perturbation> {
        self.perturbation_buffer
            .iter()
            .rev()
            .take(count)
            .cloned()
            .collect()
