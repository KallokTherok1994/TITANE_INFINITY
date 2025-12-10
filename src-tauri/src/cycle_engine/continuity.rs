#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   CONTINUITY ENGINE — Long-term Coherence & Memory
//   SUPER PROMPT #16
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsagePattern {
    pub hour_of_day: HashMap<u8, u32>, // Usage count by hour
    pub day_of_week: HashMap<u8, u32>, // Usage count by weekday
    pub preferred_tasks: Vec<String>,  // Most common tasks
    pub user_preferences: HashMap<String, String>,
}

pub struct ContinuityEngine {
    patterns: UsagePattern,
}

impl ContinuityEngine {
    pub fn new() -> Self {
        Self {
            patterns: UsagePattern {
                hour_of_day: HashMap::new(),
                day_of_week: HashMap::new(),
                preferred_tasks: vec![],
                user_preferences: HashMap::new(),
            },
        }
    }

    /// Record usage event
    pub fn record_event(&mut self, hour: u8, weekday: u8, task: String) {
        *self.patterns.hour_of_day.entry(hour).or_insert(0) += 1;
        *self.patterns.day_of_week.entry(weekday).or_insert(0) += 1;

        if !self.patterns.preferred_tasks.contains(&task) {
            self.patterns.preferred_tasks.push(task);
        }
    }

    /// Get most active hour
    pub fn most_active_hour(&self) -> Option<u8> {
        self.patterns
            .hour_of_day
            .iter()
            .max_by_key(|(_, count)| *count)
            .map(|(hour, _)| *hour)
    }

    /// Get most active day
    pub fn most_active_day(&self) -> Option<u8> {
        self.patterns
            .day_of_week
            .iter()
            .max_by_key(|(_, count)| *count)
            .map(|(day, _)| *day)
    }

    /// Set user preference
    pub fn set_preference(&mut self, key: String, value: String) {
        self.patterns.user_preferences.insert(key, value);
    }

    /// Get user preference
    pub fn get_preference(&self, key: &str) -> Option<&String> {
        self.patterns.user_preferences.get(key)
    }

    /// Get patterns
    pub fn patterns(&self) -> &UsagePattern {
        &self.patterns
    }
}

impl Default for ContinuityEngine {
    fn default() -> Self {
        Self::new()
    }
}
