/**
 * TITANE∞ v∞ - NeuroSymbolic State (Phase X)
 * État hybride neuronal + symbolique
 */

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NeuroSymbolicState {
    pub last_context_map: HashMap<String, String>,
    pub last_reasoning_vector: Vec<f32>,
    pub fused_state: HashMap<String, f32>,
    pub cognitive_links: usize,
    pub symbolic_links: usize,
    pub hybrid_xp: f32,
}

impl Default for NeuroSymbolicState {
    fn default() -> Self {
        Self {
            last_context_map: HashMap::new(),
            last_reasoning_vector: vec![0.5; 10],
            fused_state: HashMap::new(),
            cognitive_links: 0,
            symbolic_links: 0,
            hybrid_xp: 0.0,
        }
    }
}

impl NeuroSymbolicState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn update_context(&mut self, key: String, value: String) {
        self.last_context_map.insert(key, value);
    }

    pub fn update_reasoning(&mut self, vector: Vec<f32>) {
        self.last_reasoning_vector = vector;
    }

    pub fn add_cognitive_link(&mut self) {
        self.cognitive_links += 1;
        self.hybrid_xp += 0.1;
    }

    pub fn add_symbolic_link(&mut self) {
        self.symbolic_links += 1;
        self.hybrid_xp += 0.1;
    }

    pub fn get_fusion_level(&self) -> f32 {
        if self.cognitive_links + self.symbolic_links == 0 {
            return 0.0;
        }

        (self.cognitive_links.min(self.symbolic_links) * 2) as f32
            / (self.cognitive_links + self.symbolic_links) as f32
    }
}

#[tauri::command]
pub async fn neuro_get_state() -> Result<NeuroSymbolicState, String> {
    Ok(NeuroSymbolicState::new())
}
