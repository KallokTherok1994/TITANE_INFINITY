// IMORE Cognitive Observer
use std::collections::HashMap;

use super::*;
pub struct CognitiveObserver {
    pub observation_buffer: VecDeque<CognitiveSnapshot>,
    pub pattern_detector: PatternDetector,
}
#[derive(Clone)]
pub struct CognitiveSnapshot {
    pub cognitive_flux: f32,
    pub meaning_clarity: f32,
    pub decision_coherence: f32,
    pub timestamp_ms: u64,
pub struct PatternDetector {
    pub detected_patterns: Vec<String>,
    pub pattern_confidence: HashMap<String, f32>,
impl CognitiveObserver {
    pub fn init() -> Self {
        CognitiveObserver {
            observation_buffer: VecDeque::with_capacity100,
            pattern_detector: PatternDetector {
                detected_patterns: Vec::new(),
                pattern_confidence: HashMap::new(),
            },
        }
    }
    pub fn observe(&mut self, cognitive_flux: f32, meaning: f32, decision: f32, timestamp_ms: u64) {
        if self.observation_buffer.len() >= 100 {
            self.observation_buffer.pop_front();
        self.observation_buffer.push_back(CognitiveSnapshot {
            cognitive_flux,
            meaning_clarity: meaning,
            decision_coherence: decision,
            timestamp_ms,
        });
        self.detect_patterns();
    fn detect_patterns(&mut self) {
        if self.observation_buffer.len() < 10 {
            return;
        // Détecter patterns récurrents
        let recent: Vec<&CognitiveSnapshot> = self.observation_buffer.iter().rev().take10.collect();
        
        // Pattern: cognition élevée stable
        let avg_cog = recent.iter().map(|s| s.cognitive_flux).sum::<f32>() / 10.0;
        if avg_cog > 0.7 {
            self.pattern_detector.detected_patterns.push("HighCognitiveFlow".to_string());
            self.pattern_detector.pattern_confidence.insert("HighCognitiveFlow".to_string(), avg_cog);
