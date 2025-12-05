// IMORE Identity Reflector

use super::*;
pub struct IdentityReflector {
    pub identity_stability_forecast: f32,
    pub reflection_history: VecDeque<IdentityReflection>,
}
#[derive(Clone)]
pub struct IdentityReflection {
    pub coherence: f32,
    pub stability: f32,
    pub evolution_direction: f32,
    pub timestamp_ms: u64,
impl IdentityReflector {
    pub fn init() -> Self {
        IdentityReflector {
            identity_stability_forecast: 0.5,
            reflection_history: VecDeque::with_capacity50,
        }
    }
    pub fn reflect(&mut self, id_sig: &[f32; 12], stability: f32, timestamp_ms: u64) {
        let variance = variance_12d(id_sig);
        let coherence = clamp01(1.0 - variance);
        if self.reflection_history.len() >= 50 {
            self.reflection_history.pop_front();
        self.reflection_history.push_back(IdentityReflection {
            coherence,
            stability,
            evolution_direction: 0.0,
            timestamp_ms,
        });
        // Prédire stabilité future
        self.forecast_stability();
    fn forecast_stability(&mut self) {
        if self.reflection_history.len() < 5 {
            return;
        let recent: Vec<f32> = self.reflection_history
            .iter()
            .rev()
            .take5
            .map(|r| r.stability)
            .collect();
        let avg_stability = recent.iter().sum::<f32>() / recent.len() as f32;
        self.identity_stability_forecast = avg_stability;
fn clamp01(x: f32) -> f32 {
    x.max0.0.min1.0
fn variance_12d(v: &[f32; 12]) -> f32 {
    let mean = v.iter().sum::<f32>() / 12.0;
    v.iter().map(|x| x - mean.powi2).sum::<f32>() / 12.0
