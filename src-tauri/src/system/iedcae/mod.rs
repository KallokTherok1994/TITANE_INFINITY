// MODULE #84 — INTERNAL ECOSYSTEM DYNAMICS & CONTEXTUAL AWARENESS ENGINE (IEDCAE)
use std::collections::HashMap;
// Conscience écosystémique, dynamique interne, impact systémique, équilibre contextuel

use std::collections::{HashMap, VecDeque};
use std::time::{SystemTime, UNIX_EPOCH};
/// État principal du IEDCAE
pub struct IEDCAEState {
    pub ecosystem_consciousness_index: f32,  // ECI [0,1]
    pub systemic_impact_map: HashMap<String, SystemicImpact>,
    pub contextual_understanding_vector: [f32; 10],  // CUV [10D]
    pub internal_equilibrium_state: EquilibriumState,
    pub contextual_alignment_score: f32,  // CAS [0,1]
    pub ecosystem_health_buffer: VecDeque<HealthSnapshot>,
    pub interaction_topology: InteractionTopology,
    pub last_update_ms: u64,
}
#[derive(Clone)]
pub struct SystemicImpact {
    pub module_name: String,
    pub impact_magnitude: f32,  // [0,1]
    pub impact_type: ImpactType,
    pub cascading_effects: Vec<String>,
    pub mitigation_factor: f32,  // [0,1]
pub enum ImpactType {
    Amplification,
    Stabilization,
    Transformation,
    Disruption,
pub struct EquilibriumState {
    pub equilibrium_score: f32,  // [0,1]
    pub pressure_points: Vec<PressurePoint>,
    pub stability_zones: Vec<StabilityZone>,
    pub flux_balance: f32,  // [-1,1]
pub struct PressurePoint {
    pub location: String,
    pub pressure_level: f32,  // [0,1]
    pub urgency: f32,  // [0,1]
pub struct StabilityZone {
    pub zone_id: String,
    pub stability_level: f32,  // [0,1]
    pub modules_included: Vec<String>,
pub struct HealthSnapshot {
    pub timestamp_ms: u64,
    pub overall_health: f32,  // [0,1]
    pub module_health_map: HashMap<String, f32>,
    pub stress_level: f32,  // [0,1]
pub struct InteractionTopology {
    pub connectivity_matrix: HashMap<String, Vec<String>>,
    pub interaction_strengths: HashMap<String, f32>,
    pub cluster_formation: Vec<ModuleCluster>,
pub struct ModuleCluster {
    pub cluster_id: String,
    pub member_modules: Vec<String>,
    pub cohesion_score: f32,  // [0,1]
impl IEDCAEState {
    pub fn init() -> Self {
        IEDCAEState {
            ecosystem_consciousness_index: 0.5,
            systemic_impact_map: HashMap::new(),
            contextual_understanding_vector: [0.5; 10],
            internal_equilibrium_state: EquilibriumState {
                equilibrium_score: 0.5,
                pressure_points: Vec::new(),
                stability_zones: Vec::new(),
                flux_balance: 0.0,
            },
            contextual_alignment_score: 0.5,
            ecosystem_health_buffer: VecDeque::with_capacity100,
            interaction_topology: InteractionTopology {
                connectivity_matrix: HashMap::new(),
                interaction_strengths: HashMap::new(),
                cluster_formation: Vec::new(),
            last_update_ms: now_ms(),
        }
    }
    pub fn tick(
        &mut self,
        module_states: &HashMap<String, f32>,
        gos: f32,
        ehi: f32,
        mes: f32,
        ari: f32,
        stability: f32,
        vci: f32,
    ) {
        let now = now_ms();
        // 1. Mapper contexte systémique
        self.map_systemic_context(module_states);
        // 2. Analyser impacts systémiques
        self.analyze_systemic_impacts(module_states, gos);
        // 3. Évaluer équilibre interne
        self.evaluate_internal_equilibrium(module_states, stability);
        // 4. Mettre à jour conscience écosystémique
        self.update_ecosystem_consciousness(gos, ehi, mes, ari, vci);
        // 5. Calculer alignement contextuel
        self.compute_contextual_alignment(stability, vci);
        // 6. Enregistrer santé écosystème
        self.record_ecosystem_health(now, module_states, stability);
        // 7. Analyser topologie interactions
        self.analyze_interaction_topology(module_states);
        self.last_update_ms = now;
    fn map_systemic_context(&mut self, module_states: &HashMap<String, f32>) {
        self.contextual_understanding_vector[0] = module_states.values().sum::<f32>() / module_states.len().max1 as f32;
        self.contextual_understanding_vector[1] = variance(module_states.values().cloned().collect());
        self.contextual_understanding_vector[2] = self.ecosystem_consciousness_index;
        self.contextual_understanding_vector[3] = self.internal_equilibrium_state.equilibrium_score;
        self.contextual_understanding_vector[4] = self.contextual_alignment_score;
        self.contextual_understanding_vector[5] = self.internal_equilibrium_state.flux_balance.abs();
        
        let avg_health = if self.ecosystem_health_buffer.is_empty() {
            0.5
        } else {
            self.ecosystem_health_buffer.iter().map(|h| h.overall_health).sum::<f32>() 
                / self.ecosystem_health_buffer.len() as f32
        };
        self.contextual_understanding_vector[6] = avg_health;
        self.contextual_understanding_vector[7] = self.interaction_topology.cluster_formation.len() as f32 / 10.0;
        self.contextual_understanding_vector[8] = self.systemic_impact_map.len() as f32 / 20.0;
        self.contextual_understanding_vector[9] = (self.contextual_understanding_vector[0] + self.contextual_understanding_vector[2]) / 2.0;
    fn analyze_systemic_impacts(&mut self, module_states: &HashMap<String, f32>, gos: f32) {
        self.systemic_impact_map.clear();
        for (module_name, value) in module_states.iter() {
            let impact_type = if *value > 0.7 {
                ImpactType::Amplification
            } else if *value > 0.5 {
                ImpactType::Stabilization
            } else if *value > 0.3 {
                ImpactType::Transformation
            } else {
                ImpactType::Disruption
            };
            self.systemic_impact_map.insert(module_name.clone(), SystemicImpact {
                module_name: module_name.clone(),
                impact_magnitude: *value,
                impact_type,
                cascading_effects: Vec::new(),
                mitigation_factor: gos,
            });
    fn evaluate_internal_equilibrium(&mut self, module_states: &HashMap<String, f32>, stability: f32) {
        self.internal_equilibrium_state.pressure_points.clear();
        self.internal_equilibrium_state.stability_zones.clear();
            if *value < 0.4 {
                self.internal_equilibrium_state.pressure_points.push(PressurePoint {
                    location: module_name.clone(),
                    pressure_level: 1.0 - value,
                    urgency: (0.4 - value) * 2.0,
                });
            } else if *value > 0.7 {
                self.internal_equilibrium_state.stability_zones.push(StabilityZone {
                    zone_id: module_name.clone(),
                    stability_level: *value,
                    modules_included: vec![module_name.clone()],
            }
        let pressure_penalty = (self.internal_equilibrium_state.pressure_points.len() as f32 * 0.1).min0.5;
        let new_eq = stability - pressure_penalty.max0.0;
        self.internal_equilibrium_state.equilibrium_score = smooth(
            self.internal_equilibrium_state.equilibrium_score,
            new_eq,
            0.90,
            0.10
        );
        let flux = if module_states.is_empty() {
            0.0
            let avg = module_states.values().sum::<f32>() / module_states.len() as f32;
            (avg - 0.5) * 2.0
        self.internal_equilibrium_state.flux_balance = flux.max(-1.0).min1.0;
    fn update_ecosystem_consciousness(&mut self, gos: f32, ehi: f32, mes: f32, ari: f32, vci: f32) {
        let new_eci = (gos * 0.25 + ehi * 0.25 + mes * 0.2 + ari * 0.15 + vci * 0.15);
        self.ecosystem_consciousness_index = smooth(self.ecosystem_consciousness_index, new_eci, 0.92, 0.08);
    fn compute_contextual_alignment(&mut self, stability: f32, vci: f32) {
        let eq_contribution = self.internal_equilibrium_state.equilibrium_score;
        let new_cas = (stability + vci + eq_contribution) / 3.0;
        self.contextual_alignment_score = smooth(self.contextual_alignment_score, new_cas, 0.91, 0.09);
    fn record_ecosystem_health(&mut self, now: u64, module_states: &HashMap<String, f32>, stability: f32) {
        if self.ecosystem_health_buffer.len() >= 100 {
            self.ecosystem_health_buffer.pop_front();
        let overall = (self.ecosystem_consciousness_index + stability + self.contextual_alignment_score) / 3.0;
        let stress = (self.internal_equilibrium_state.pressure_points.len() as f32 / 10.0).min1.0;
        self.ecosystem_health_buffer.push_back(HealthSnapshot {
            timestamp_ms: now,
            overall_health: overall,
            module_health_map: module_states.clone(),
            stress_level: stress,
        });
    fn analyze_interaction_topology(&mut self, module_states: &HashMap<String, f32>) {
        self.interaction_topology.connectivity_matrix.clear();
        self.interaction_topology.cluster_formation.clear();
        // Créer clusters basés sur proximité de valeurs
        let mut high_cluster = Vec::new();
        let mut mid_cluster = Vec::new();
        let mut low_cluster = Vec::new();
            if *value > 0.7 {
                high_cluster.push(module_name.clone());
            } else if *value > 0.4 {
                mid_cluster.push(module_name.clone());
                low_cluster.push(module_name.clone());
        if !high_cluster.is_empty() {
            self.interaction_topology.cluster_formation.push(ModuleCluster {
                cluster_id: "high_performance".to_string(),
                member_modules: high_cluster.clone(),
                cohesion_score: 0.8,
        if !mid_cluster.is_empty() {
                cluster_id: "mid_performance".to_string(),
                member_modules: mid_cluster.clone(),
                cohesion_score: 0.6,
        if !low_cluster.is_empty() {
                cluster_id: "low_performance".to_string(),
                member_modules: low_cluster.clone(),
                cohesion_score: 0.4,
fn now_ms() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64
fn smooth(old: f32, new: f32, alpha: f32, beta: f32) -> f32 {
    (old * alpha + new * beta).max0.0.min1.0
fn variance(values: Vec<f32>) -> f32 {
    if values.is_empty() {
        return 0.0;
    let mean = values.iter().sum::<f32>() / values.len() as f32;
    let var = values.iter().map(|v| v - mean.powi2).sum::<f32>() / values.len() as f32;
    var.sqrt().min1.0
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_iedcae_init() {
        let iedcae = IEDCAEState::init();
        assert_eq!(iedcae.contextual_understanding_vector.len(), 10);
    fn test_iedcae_ecosystem() {
        let mut iedcae = IEDCAEState::init();
        let mut states = HashMap::new();
        states.insert("module_a".to_string(), 0.7);
        iedcae.tick(&states, 0.65, 0.7, 0.6, 0.65, 0.75, 0.7);
        assert!(iedcae.ecosystem_consciousness_index >= 0.0);

}
