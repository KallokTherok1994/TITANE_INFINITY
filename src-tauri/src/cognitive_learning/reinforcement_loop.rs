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
                pattern.success_rate = (pattern.success_rate * (pattern.usage_count - 1) as f32
                    + 1.0)
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
        // FIX: Handle NaN values safely to prevent panic
        patterns.sort_by(|a, b| {
            b.strength
                .partial_cmp(&a.strength)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        patterns.into_iter().take(limit).collect()
    }

    pub async fn run_cycle(&mut self) -> ReinforcementReport {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or_else(|_| crate::core::utils::now_ms() / 1000);

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

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // Pattern Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_pattern_creation() {
        let pattern = Pattern {
            id: "pat-1".to_string(),
            name: "Test Pattern".to_string(),
            strength: 0.5,
            success_rate: 0.7,
            usage_count: 10,
        };
        assert_eq!(pattern.id, "pat-1");
        assert_eq!(pattern.strength, 0.5);
    }

    #[test]
    fn test_pattern_clone() {
        let pattern = Pattern {
            id: "id".to_string(),
            name: "name".to_string(),
            strength: 0.8,
            success_rate: 0.9,
            usage_count: 5,
        };
        let cloned = pattern.clone();
        assert_eq!(cloned.strength, 0.8);
        assert_eq!(cloned.usage_count, 5);
    }

    #[test]
    fn test_pattern_debug() {
        let pattern = Pattern {
            id: "x".to_string(),
            name: "y".to_string(),
            strength: 0.0,
            success_rate: 0.0,
            usage_count: 0,
        };
        let debug_str = format!("{:?}", pattern);
        assert!(debug_str.contains("Pattern"));
    }

    #[test]
    fn test_pattern_serialization() {
        let pattern = Pattern {
            id: "pattern-123".to_string(),
            name: "Coding Pattern".to_string(),
            strength: 0.75,
            success_rate: 0.85,
            usage_count: 100,
        };
        let json = serde_json::to_string(&pattern).expect("Pattern should serialize to JSON");
        let restored: Pattern = serde_json::from_str(&json).expect("Pattern should deserialize");
        assert_eq!(restored.id, "pattern-123");
        assert_eq!(restored.strength, 0.75);
    }

    // ─────────────────────────────────────────────────────────────
    // ReinforcementReport Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_reinforcement_report_creation() {
        let report = ReinforcementReport {
            timestamp: 12345,
            patterns_reinforced: 5,
            patterns_weakened: 2,
            top_patterns: vec![],
        };
        assert_eq!(report.patterns_reinforced, 5);
        assert_eq!(report.patterns_weakened, 2);
    }

    #[test]
    fn test_reinforcement_report_clone() {
        let report = ReinforcementReport {
            timestamp: 100,
            patterns_reinforced: 10,
            patterns_weakened: 3,
            top_patterns: vec![Pattern {
                id: "p1".to_string(),
                name: "Pattern 1".to_string(),
                strength: 0.9,
                success_rate: 0.95,
                usage_count: 50,
            }],
        };
        let cloned = report.clone();
        assert_eq!(cloned.top_patterns.len(), 1);
    }

    #[test]
    fn test_reinforcement_report_debug() {
        let report = ReinforcementReport {
            timestamp: 0,
            patterns_reinforced: 0,
            patterns_weakened: 0,
            top_patterns: vec![],
        };
        let debug_str = format!("{:?}", report);
        assert!(debug_str.contains("ReinforcementReport"));
    }

    #[test]
    fn test_reinforcement_report_serialization() {
        let report = ReinforcementReport {
            timestamp: 999999,
            patterns_reinforced: 15,
            patterns_weakened: 5,
            top_patterns: vec![],
        };
        let json = serde_json::to_string(&report)
            .expect("ReinforcementReport should serialize to JSON");
        let restored: ReinforcementReport =
            serde_json::from_str(&json).expect("ReinforcementReport should deserialize");
        assert_eq!(restored.timestamp, 999999);
        assert_eq!(restored.patterns_reinforced, 15);
    }

    // ─────────────────────────────────────────────────────────────
    // ReinforcementLoop Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_reinforcement_loop_new() {
        let rl = ReinforcementLoop::new();
        assert!(rl.patterns.is_empty());
    }

    #[test]
    fn test_reinforcement_loop_default() {
        let rl = ReinforcementLoop::default();
        assert!(rl.patterns.is_empty());
    }

    #[test]
    fn test_add_pattern() {
        let mut rl = ReinforcementLoop::new();
        let id = rl.add_pattern("Test Pattern".to_string());

        assert!(id.starts_with("pattern_"));
        assert_eq!(rl.patterns.len(), 1);

        let pattern = rl
            .patterns
            .get(&id)
            .expect("add_pattern should insert a Pattern for returned id");
        assert_eq!(pattern.name, "Test Pattern");
        assert_eq!(pattern.strength, 0.5);
        assert_eq!(pattern.success_rate, 0.5);
        assert_eq!(pattern.usage_count, 0);
    }

    #[test]
    fn test_add_multiple_patterns() {
        let mut rl = ReinforcementLoop::new();
        let id1 = rl.add_pattern("Pattern 1".to_string());
        let id2 = rl.add_pattern("Pattern 2".to_string());
        let id3 = rl.add_pattern("Pattern 3".to_string());

        assert_ne!(id1, id2);
        assert_ne!(id2, id3);
        assert_eq!(rl.patterns.len(), 3);
    }

    #[test]
    fn test_reinforce_pattern_success() {
        let mut rl = ReinforcementLoop::new();
        let id = rl.add_pattern("Test".to_string());

        rl.reinforce_pattern(&id, true);

        let pattern = rl
            .patterns
            .get(&id)
            .expect("pattern should exist after add_pattern()");
        assert_eq!(pattern.usage_count, 1);
        assert!(pattern.strength > 0.5); // Was reinforced
        assert_eq!(pattern.success_rate, 1.0); // First use was success
    }

    #[test]
    fn test_reinforce_pattern_failure() {
        let mut rl = ReinforcementLoop::new();
        let id = rl.add_pattern("Test".to_string());

        rl.reinforce_pattern(&id, false);

        let pattern = rl
            .patterns
            .get(&id)
            .expect("pattern should exist after add_pattern()");
        assert_eq!(pattern.usage_count, 1);
        assert!(pattern.strength < 0.5); // Was weakened
        assert_eq!(pattern.success_rate, 0.0); // First use was failure
    }

    #[test]
    fn test_reinforce_pattern_nonexistent() {
        let mut rl = ReinforcementLoop::new();
        // Should not panic
        rl.reinforce_pattern("nonexistent", true);
        assert!(rl.patterns.is_empty());
    }

    #[test]
    fn test_reinforce_pattern_multiple_times() {
        let mut rl = ReinforcementLoop::new();
        let id = rl.add_pattern("Test".to_string());

        // Success 3 times
        for _ in 0..3 {
            rl.reinforce_pattern(&id, true);
        }

        let pattern = rl
            .patterns
            .get(&id)
            .expect("pattern should exist after add_pattern()");
        assert_eq!(pattern.usage_count, 3);
        assert!(pattern.strength > 0.5);
        assert_eq!(pattern.success_rate, 1.0);
    }

    #[test]
    fn test_reinforce_pattern_strength_capped() {
        let mut rl = ReinforcementLoop::new();
        let id = rl.add_pattern("Test".to_string());

        // Reinforce many times
        for _ in 0..100 {
            rl.reinforce_pattern(&id, true);
        }

        let pattern = rl
            .patterns
            .get(&id)
            .expect("pattern should exist after add_pattern()");
        assert!(pattern.strength <= 1.0);
    }

    #[test]
    fn test_reinforce_pattern_strength_floor() {
        let mut rl = ReinforcementLoop::new();
        let id = rl.add_pattern("Test".to_string());

        // Weaken many times
        for _ in 0..100 {
            rl.reinforce_pattern(&id, false);
        }

        let pattern = rl
            .patterns
            .get(&id)
            .expect("pattern should exist after add_pattern()");
        assert!(pattern.strength >= 0.0);
    }

    #[test]
    fn test_get_top_patterns_empty() {
        let rl = ReinforcementLoop::new();
        let top = rl.get_top_patterns(5);
        assert!(top.is_empty());
    }

    #[test]
    fn test_get_top_patterns_limit() {
        let mut rl = ReinforcementLoop::new();
        for i in 0..10 {
            rl.add_pattern(format!("Pattern {}", i));
        }

        let top = rl.get_top_patterns(3);
        assert_eq!(top.len(), 3);
    }

    #[test]
    fn test_get_top_patterns_sorted() {
        let mut rl = ReinforcementLoop::new();
        let id1 = rl.add_pattern("Weak".to_string());
        let id2 = rl.add_pattern("Strong".to_string());

        // Make id2 stronger
        for _ in 0..5 {
            rl.reinforce_pattern(&id2, true);
        }
        // Weaken id1
        rl.reinforce_pattern(&id1, false);

        let top = rl.get_top_patterns(10);
        assert!(top[0].strength > top[1].strength);
    }

    #[tokio::test]
    async fn test_run_cycle_empty() {
        let mut rl = ReinforcementLoop::new();
        let report = rl.run_cycle().await;

        assert!(report.timestamp > 0);
        assert_eq!(report.patterns_reinforced, 0);
        assert_eq!(report.patterns_weakened, 0);
        assert!(report.top_patterns.is_empty());
    }

    #[tokio::test]
    async fn test_run_cycle_reinforces_high_success() {
        let mut rl = ReinforcementLoop::new();
        let id = rl.add_pattern("High Success".to_string());

        // Make success rate > 0.7
        for _ in 0..10 {
            rl.reinforce_pattern(&id, true);
        }

        let initial_strength = rl
            .patterns
            .get(&id)
            .expect("pattern should exist after add_pattern()")
            .strength;
        let report = rl.run_cycle().await;

        assert_eq!(report.patterns_reinforced, 1);
        // Strength should increase
        let final_strength = rl
            .patterns
            .get(&id)
            .expect("pattern should exist after run_cycle()")
            .strength;
        assert!(final_strength >= initial_strength);
    }

    #[tokio::test]
    async fn test_run_cycle_weakens_low_success() {
        let mut rl = ReinforcementLoop::new();
        let id = rl.add_pattern("Low Success".to_string());

        // Make success rate < 0.3
        for _ in 0..10 {
            rl.reinforce_pattern(&id, false);
        }

        let initial_strength = rl
            .patterns
            .get(&id)
            .expect("pattern should exist after add_pattern()")
            .strength;
        let report = rl.run_cycle().await;

        assert_eq!(report.patterns_weakened, 1);
        // Strength should decrease
        let final_strength = rl
            .patterns
            .get(&id)
            .expect("pattern should exist after run_cycle()")
            .strength;
        assert!(final_strength <= initial_strength);
    }

    #[tokio::test]
    async fn test_run_cycle_top_patterns() {
        let mut rl = ReinforcementLoop::new();
        for i in 0..10 {
            rl.add_pattern(format!("Pattern {}", i));
        }

        let report = rl.run_cycle().await;
        assert!(report.top_patterns.len() <= 5);
    }

    // ─────────────────────────────────────────────────────────────
    // Tauri Command Tests
    // ─────────────────────────────────────────────────────────────

    #[tokio::test]
    async fn test_tauri_cognitive_run_reinforcement() {
        let result = cognitive_run_reinforcement().await;
        assert!(result.is_ok());
        let report =
            result.expect("cognitive_run_reinforcement should return Ok(ReinforcementReport)");
        assert!(report.timestamp > 0);
    }
}
