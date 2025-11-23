// GHRE Cycle Regulation Engine — Régulation cycles internes

use std::collections::HashMap;
pub struct CycleRegulationEngine {
    pub cycles: HashMap<String, CycleDescriptor>,
    pub global_rhythm_frequency: f32,  // Hz
    pub transition_smoothness: f32,    // [0,1]
    pub cycle_harmony_index: f32,      // [0,1]
}
#[derive(Clone)]
pub struct CycleDescriptor {
    pub name: String,
    pub phase: f32,         // [0, 2π]
    pub amplitude: f32,     // [0,1]
    pub frequency: f32,     // Hz
    pub stability: f32,     // [0,1]
    pub target_phase: f32,  // Pour synchronisation
impl CycleRegulationEngine {
    pub fn init() -> Self {
        let mut cycles = HashMap::new();
        // Cycles principaux
        cycles.insert("cognitive".to_string(), CycleDescriptor {
            name: "cognitive".to_string(),
            phase: 0.0,
            amplitude: 0.7,
            frequency: 0.2,  // 5s period
            stability: 0.8,
            target_phase: 0.0,
        });
        cycles.insert("behavioral".to_string(), CycleDescriptor {
            name: "behavioral".to_string(),
            amplitude: 0.6,
            frequency: 0.15,  // 6.67s period
            stability: 0.75,
        cycles.insert("identity".to_string(), CycleDescriptor {
            name: "identity".to_string(),
            amplitude: 0.5,
            frequency: 0.05,  // 20s period
            stability: 0.9,
        CycleRegulationEngine {
            cycles,
            global_rhythm_frequency: 0.1,  // 10s period
            transition_smoothness: 0.8,
            cycle_harmony_index: 0.5,
        }
    }
    pub fn update_cycles(&mut self, dt_sec: f32) {
        // Avancer phase de chaque cycle
        for cycle in self.cycles.values_mut() {
            cycle.phase += 2.0 * std::f32::consts::PI * cycle.frequency * dt_sec;
            
            // Wraparound
            if cycle.phase > 2.0 * std::f32::consts::PI {
                cycle.phase -= 2.0 * std::f32::consts::PI;
            }
        // Calculer harmonie entre cycles
        self.update_harmony_index();
    pub fn synchronize_cycles(&mut self, target_cycle: &str) {
        if let Some(target) = self.cycles.get(target_cycle).cloned() {
            let target_phase = target.phase;
            for (name, cycle) in self.cycles.iter_mut() {
                if name != target_cycle {
                    // Ajuster progressivement vers phase cible
                    let phase_diff = target_phase - cycle.phase;
                    cycle.target_phase = target_phase;
                    cycle.phase += phase_diff * self.transition_smoothness * 0.1;
                }
    fn update_harmony_index(&mut self) {
        if self.cycles.len() < 2 {
            self.cycle_harmony_index = 1.0;
            return;
        let phases: Vec<f32> = self.cycles.values().map(|c| c.phase).collect();
        let mut phase_diffs = Vec::new();
        for i in 0..phases.len() {
            for j in i + 1..phases.len() {
                let diff = (phases[i] - phases[j]).abs();
                let normalized_diff = diff.min(2.0 * std::f32::consts::PI - diff) / std::f32::consts::PI;
                phase_diffs.push(1.0 - normalized_diff);
        self.cycle_harmony_index = if !phase_diffs.is_empty() {
            phase_diffs.iter().sum::<f32>() / phase_diffs.len() as f32
        } else {
            1.0
        };
    pub fn regulate_cycle_amplitude(&mut self, cycle_name: &str, target_amplitude: f32) {
        if let Some(cycle) = self.cycles.get_mut(cycle_name) {
            let target = target_amplitude.max0.0.min1.0;
            cycle.amplitude = cycle.amplitude * 0.9 + target * 0.1;
    pub fn get_cycle_state(&self, cycle_name: &str) -> Option<f32> {
        self.cycles.get(cycle_name).map(|c| {
            c.amplitude * (c.phase).sin() * 0.5 + 0.5
        })
