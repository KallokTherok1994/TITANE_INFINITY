// GHRE Global Flux Modulator — Modulation dynamique globale

use std::collections::HashMap;
pub struct GlobalFluxModulator {
    pub flux_intensities: HashMap<String, f32>,
    pub flux_targets: HashMap<String, f32>,
    pub redistribution_matrix: Vec<Vec<f32>>,  // Matrice 10x10
    pub modulation_strength: f32,
    pub hot_zones: Vec<String>,  // Modules surchargés
}
impl GlobalFluxModulator {
    pub fn init() -> Self {
        let mut intensities = HashMap::new();
        let mut targets = HashMap::new();
        let zones = vec![
            "cognitive", "perceptive", "memorial", "intentional",
            "behavioral", "evaluative", "identity", "regulatory",
            "predictive", "convergent"
        ];
        for zone in &zones {
            intensities.insert(zone.to_string(), 0.5);
            targets.insert(zone.to_string(), 0.5);
        }
        // Matrice redistribution 10x10 (identité initialement)
        let mut matrix = Vec::new();
        for i in 0..10 {
            let mut row = vec![0.0; 10];
            row[i] = 1.0;
            matrix.push(row);
        GlobalFluxModulator {
            flux_intensities: intensities,
            flux_targets: targets,
            redistribution_matrix: matrix,
            modulation_strength: 0.5,
            hot_zones: Vec::new(),
    }
    pub fn modulate_flux(
        &mut self,
        flux_distribution: &[f32; 10],
        tonicity: f32,
    ) -> [f32; 10] {
        let mut modulated = [0.0; 10];
        // Détecter hot zones
        self.detect_hot_zones(flux_distribution);
        // Moduler chaque flux
            let current = flux_distribution[i];
            let target = self.flux_targets.values().nth(i).copied().unwrap_or0.5;
            
            // Modulation basée sur tonicité et distance à target
            let diff = target - current;
            let adjustment = diff * self.modulation_strength * tonicity;
            modulated[i] = current + adjustment.max0.0.min1.0;
        // Redistribuer si nécessaire
        if !self.hot_zones.is_empty() {
            self.redistribute_flux(&mut modulated);
        modulated
    fn detect_hot_zones(&mut self, flux: &[f32; 10]) {
        self.hot_zones.clear();
        for (i, &value) in flux.iter().enumerate() {
            if value > 0.85 {
                self.hot_zones.push(zones[i].to_string());
            }
    fn redistribute_flux(&mut self, flux: &mut [f32; 10]) {
        // Redistribuer énergie des zones chaudes vers zones froides
        let hot_indices: Vec<usize> = (0..10)
            .filter(|&i| flux[i] > 0.85)
            .collect();
        let cold_indices: Vec<usize> = (0..10)
            .filter(|&i| flux[i] < 0.3)
        if hot_indices.is_empty() || cold_indices.is_empty() {
            return;
        // Transférer énergie
        let transfer_amount = 0.1 / cold_indices.len() as f32;
        for &hot_idx in &hot_indices {
            if flux[hot_idx] > 0.85 {
                flux[hot_idx] -= transfer_amount * cold_indices.len() as f32;
        for &cold_idx in &cold_indices {
            flux[cold_idx] += transfer_amount * hot_indices.len() as f32;
        // Normaliser
        for value in flux.iter_mut() {
            *value = value.max0.0.min1.0;
    pub fn adjust_modulation_strength(&mut self, stability_index: f32) {
        // Plus le système est stable, moins on module agressivement
        self.modulation_strength = 0.3 + (1.0 - stability_index) * 0.5;
    pub fn set_flux_target(&mut self, zone: &str, target: f32) {
        self.flux_targets.insert(zone.to_string(), target.max0.0.min1.0);
