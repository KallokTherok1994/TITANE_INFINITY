// IMORE Process Analyzer
use std::collections::HashMap;

use super::*;
pub struct ProcessAnalyzer {
    pub process_quality_map: HashMap<String, f32>,
    pub contradiction_log: Vec<Contradiction>,
}
#[derive(Clone)]
pub struct Contradiction {
    pub source_a: String,
    pub source_b: String,
    pub intensity: f32,
    pub timestamp_ms: u64,
impl ProcessAnalyzer {
    pub fn init() -> Self {
        ProcessAnalyzer {
            process_quality_map: HashMap::new(),
            contradiction_log: Vec::new(),
        }
    }
    pub fn analyze_processes(&mut self, processes: &HashMap<String, f32>) {
        self.process_quality_map = processes.clone();
        self.detect_contradictions();
    fn detect_contradictions(&mut self) {
        // Chercher incohérences entre processus
        let processes: Vec<(&String, &f32)> = self.process_quality_map.iter().collect();
        
        for i in 0..processes.len() {
            for j in i + 1..processes.len() {
                let diff = (processes[i].1 - processes[j].1).abs();
                if diff > 0.5 {
                    self.contradiction_log.push(Contradiction {
                        source_a: processes[i].0.clone(),
                        source_b: processes[j].0.clone(),
                        intensity: diff,
                        timestamp_ms: now_ms(),
                    });
                }
            }
        // Limiter log
        if self.contradiction_log.len() > 30 {
            self.contradiction_log.drain(0..10);
fn now_ms() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64
