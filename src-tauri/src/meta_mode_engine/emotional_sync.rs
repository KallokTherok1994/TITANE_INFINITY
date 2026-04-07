#![allow(dead_code)]
//! ❤️‍🩹 EMOTIONAL SYNCHRONIZATION ENGINE
//! Synchronisation émotionnelle temps réel avec Kevin

use super::KevinState;
use std::collections::VecDeque;

pub struct EmotionalSynchronizer {
    emotional_history: VecDeque<String>,
    pub stress_history: VecDeque<f32>,
}

impl EmotionalSynchronizer {
    pub fn new() -> Self {
        Self {
            emotional_history: VecDeque::with_capacity(50),
            stress_history: VecDeque::with_capacity(50),
        }
    }

    /// Synchroniser avec l'état émotionnel actuel de Kevin
    pub fn synchronize(&mut self, state: &KevinState) {
        self.emotional_history
            .push_back(state.emotional_tone.clone());
        self.stress_history.push_back(state.stress_level);

        if self.emotional_history.len() > 50 {
            self.emotional_history.pop_front();
        }
        if self.stress_history.len() > 50 {
            self.stress_history.pop_front();
        }
    }

    /// Détecter une dégradation émotionnelle
    pub fn detect_emotional_degradation(&self) -> bool {
        if self.stress_history.len() < 3 {
            return false;
        }

        let recent: Vec<f32> = self.stress_history.iter().rev().take(3).copied().collect();
        recent[0] > recent[1] && recent[1] > recent[2]
    }

    /// Moyenne du stress récent
    pub fn average_recent_stress(&self) -> f32 {
        if self.stress_history.is_empty() {
            return 0.5;
        }
        let recent: Vec<f32> = self.stress_history.iter().rev().take(5).copied().collect();
        recent.iter().sum::<f32>() / recent.len() as f32
    }
}
