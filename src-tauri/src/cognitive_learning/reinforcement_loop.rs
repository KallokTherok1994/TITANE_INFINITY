/**
 * TITANE∞ v∞ - Reinforcement Loop
 * Renforce patterns utiles, diminue les moins pertinents
 */

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pattern {
    pub id: String,
    pub name: String,
    pub strength: f32,
    pub success_rate: f32,
    pub usage_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReinforcementReport {
    pub timestamp: u64,
    pub patterns_reinforced: usize,
    pub patterns_weakened: usize,
    pub top_patterns: Vec<Pattern>,
}

pub struct ReinforcementLoop {
    patterns: HashMap<String, Pattern>,
}

impl Default for ReinforcementLoop {
    fn default() -> Self {
        Self::new()
    }
}

impl ReinforcementLoop {
    pub fn new() -> Self {
        Self {
            patterns: HashMap::new(),
        }
    }

    pub fn reinforce_pattern(&mut self, pattern_id: &str, success: bool) {
        if let Some(pattern) = self.patterns.get_mut(pattern_id) {
            pattern.usage_count += 1;

            if success {
                pattern.strength = (pattern.strength + 0.1).min(1.0);
                pattern.success_rate = (pattern.success_rate * (pattern.usage_count - 1) as f32 + 1.0)
                    / pattern.usage_count as f32;
            } else {
                pattern.strength = (pattern.strength - 0.05).max(0.0);
                pattern.success_rate = (pattern.success_rate * (pattern.usage_count - 1) as f32)
                    / pattern.usage_count as f32;
            }
        }
    }

    pub fn add_pattern(&mut self, name: String) -> String {
        let id = format!("pattern_{}", uuid::Uuid::new_v4());
        let pattern = Pattern {
            id: id.clone(),
            name,
            strength: 0.5,
            success_rate: 0.5,
            usage_count: 0,
        };
        self.patterns.insert(id.clone(), pattern);
        id
    }

    pub fn get_top_patterns(&self, limit: usize) -> Vec<Pattern> {
        let mut patterns: Vec<Pattern> = self.patterns.values().cloned().collect();
        patterns.sort_by(|a, b| b.strength.partial_cmp(&a.strength).unwrap());
        patterns.into_iter().take(limit).collect()
    }

    pub async fn run_cycle(&mut self) -> ReinforcementReport {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        // Simule renforcement automatique
        let mut reinforced = 0;
        let mut weakened = 0;

        for pattern in self.patterns.values_mut() {
            if pattern.success_rate > 0.7 {
                pattern.strength = (pattern.strength + 0.05).min(1.0);
                reinforced += 1;
            } else if pattern.success_rate < 0.3 {
                pattern.strength = (pattern.strength - 0.05).max(0.0);
                weakened += 1;
            }
        }

        let top_patterns = self.get_top_patterns(5);

        ReinforcementReport {
            timestamp,
            patterns_reinforced: reinforced,
            patterns_weakened: weakened,
            top_patterns,
        }
    }
}

#[tauri::command]
pub async fn cognitive_run_reinforcement() -> Result<ReinforcementReport, String> {
    let mut loop_engine = ReinforcementLoop::new();
    Ok(loop_engine.run_cycle().await)
}
