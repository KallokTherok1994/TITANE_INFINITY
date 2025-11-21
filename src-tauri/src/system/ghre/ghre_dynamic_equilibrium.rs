// GHRE Dynamic Equilibrium Layer — Surveillance et régulation des flux

use std::collections::HashMap;
pub struct DynamicEquilibriumLayer {
    pub flux_thresholds: HashMap<String, (f32, f32)>,  // (min, max)
    pub flux_targets: HashMap<String, f32>,
    pub equilibrium_score: f32,
}
impl DynamicEquilibriumLayer {
    pub fn init() -> Self {
        let mut thresholds = HashMap::new();
        thresholds.insert("cognitive".to_string(), (0.2, 0.9));
        thresholds.insert("perceptive".to_string(), (0.15, 0.85));
        thresholds.insert("energetic".to_string(), (0.25, 0.95));
        thresholds.insert("memorial".to_string(), (0.3, 0.9));
        thresholds.insert("evolutionary".to_string(), (0.1, 0.8));
        thresholds.insert("identity".to_string(), (0.4, 1.0));
        thresholds.insert("behavioral".to_string(), (0.2, 0.9));
        let mut targets = HashMap::new();
        for key in thresholds.keys() {
            targets.insert(key.clone(), 0.5);
        }
        DynamicEquilibriumLayer {
            flux_thresholds: thresholds,
            flux_targets: targets,
            equilibrium_score: 0.5,
    }
    pub fn check_flux(
        &mut self,
        flux_map: &HashMap<String, f32>,
    ) -> Vec<String> {
        let mut violations = Vec::new();
        for (flux_name, &value) in flux_map.iter() {
            if let Some(&(min, max)) = self.flux_thresholds.get(flux_name) {
                if value < min || value > max {
                    violations.push(format!("{}: {:.2} (range: {:.2}-{:.2})", flux_name, value, min, max));
                }
            }
        // Calculer score équilibre
        let balance_scores: Vec<f32> = flux_map
            .iter()
            .filter_map(|(name, &value)| {
                self.flux_targets.get(name).map(|&target| 1.0 - value - target.abs())
            })
            .collect();
        self.equilibrium_score = if !balance_scores.is_empty() {
            balance_scores.iter().sum::<f32>() / balance_scores.len() as f32
        } else {
            0.5
        };
        violations
    pub fn adjust_flux_target(&mut self, flux_name: &str, new_target: f32) {
        self.flux_targets.insert(flux_name.to_string(), new_target.max0.0.min1.0);
