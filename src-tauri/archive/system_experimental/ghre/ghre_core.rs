// GHRE Core — Centre régulateur global

use super::*;
pub struct GHRECore {
    pub hsi_baseline: f32,
    pub regulation_threshold: f32,
    pub stability_history: VecDeque<f32>,
}
impl GHRECore {
    pub fn init() -> Self {
        GHRECore {
            hsi_baseline: 0.5,
            regulation_threshold: 0.35,
            stability_history: VecDeque::with_capacity100,
        }
    }
    pub fn compute_advanced_hsi(
        &mut self,
        basic_hsi: f32,
        cycle_stability: f32,
        tonicity: f32,
        flux_variance: f32,
    ) -> f32 {
        // HSI avancé prenant en compte historique
        let historical_stability = if self.stability_history.len() > 10 {
            self.stability_history.iter().sum::<f32>() / self.stability_history.len() as f32
        } else {
            basic_hsi
        };
        let weighted_hsi = basic_hsi * 0.5
            + cycle_stability * 0.2
            + tonicity * 0.15
            + (1.0 - flux_variance) * 0.15;
        let final_hsi = weighted_hsi + historical_stability / 2.0;
        // Stocker dans historique
        if self.stability_history.len() >= 100 {
            self.stability_history.pop_front();
        self.stability_history.push_back(final_hsi);
        clamp01(final_hsi)
    pub fn needs_regulation(&self, current_hsi: f32) -> bool {
        current_hsi < self.regulation_threshold
    pub fn compute_regulation_intensity(&self, current_hsi: f32) -> f32 {
        if current_hsi < self.regulation_threshold {
            clamp01((self.regulation_threshold - current_hsi) / self.regulation_threshold)
            0.0
fn clamp01(x: f32) -> f32 {
    x.max0.0.min1.0
