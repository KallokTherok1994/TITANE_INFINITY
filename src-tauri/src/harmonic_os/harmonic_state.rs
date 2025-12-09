// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! État harmonique global

#![allow(unused_imports)]
#![allow(dead_code)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarmonicState {
    pub cognitive_resonance: f32,
    pub emotional_coherence: f32,
    pub logical_alignment: f32,
    pub memory_alignment: f32,
    pub energy_alignment: f32,
    pub temporal_alignment: f32,
    pub agent_sync: f32,
    pub global_score: f32,
    pub stability: f32,
    pub harmony_level: HarmonyLevel,
    pub last_update: i64,
    pub cycle_count: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HarmonyLevel {
    Critical,
    Low,
    Moderate,
    High,
    Excellent,
}

impl HarmonicState {
    pub fn new() -> Self {
        Self {
            cognitive_resonance: 0.5,
            emotional_coherence: 0.5,
            logical_alignment: 0.5,
            memory_alignment: 0.5,
            energy_alignment: 0.5,
            temporal_alignment: 0.5,
            agent_sync: 0.5,
            global_score: 0.5,
            stability: 0.5,
            harmony_level: HarmonyLevel::Moderate,
            last_update: chrono::Utc::now().timestamp_millis(),
            cycle_count: 0,
        }
    }
    
    pub fn calculate_global_score(&mut self, weights: &[f32; 7]) {
        self.global_score = (
            self.cognitive_resonance * weights[0] +
            self.emotional_coherence * weights[1] +
            self.logical_alignment * weights[2] +
            self.memory_alignment * weights[3] +
            self.energy_alignment * weights[4] +
            self.temporal_alignment * weights[5] +
            self.agent_sync * weights[6]
        ).clamp(0.0, 1.0);
        
        self.harmony_level = Self::compute_harmony_level(self.global_score);
    }
    
    pub fn calculate_stability(&mut self) {
        let values = [
            self.cognitive_resonance, self.emotional_coherence, self.logical_alignment,
            self.memory_alignment, self.energy_alignment, self.temporal_alignment, self.agent_sync,
        ];
        let mean = values.iter().sum::<f32>() / values.len() as f32;
        let variance = values.iter().map(|v| (v - mean).powi(2)).sum::<f32>() / values.len() as f32;
        self.stability = (1.0 - variance).clamp(0.0, 1.0);
    }
    
    fn compute_harmony_level(score: f32) -> HarmonyLevel {
        match score {
            s if s < 0.3 => HarmonyLevel::Critical,
            s if s < 0.5 => HarmonyLevel::Low,
            s if s < 0.7 => HarmonyLevel::Moderate,
            s if s < 0.9 => HarmonyLevel::High,
            _ => HarmonyLevel::Excellent,
        }
    }
    
    pub fn is_critical(&self) -> bool {
        self.harmony_level == HarmonyLevel::Critical
    }
    
    pub fn is_stable(&self, threshold: f32) -> bool {
        self.stability >= threshold
    }
    
    pub fn increment_cycle(&mut self) {
        self.cycle_count += 1;
        self.last_update = chrono::Utc::now().timestamp_millis();
    }
}

impl Default for HarmonicState {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_harmonic_state() {
        let state = HarmonicState::new();
        assert_eq!(state.harmony_level, HarmonyLevel::Moderate);
    }
}
