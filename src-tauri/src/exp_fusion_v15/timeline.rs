// ⏱️ Timeline — Historique temporel et analyse
// Suivi XP dans le temps avec graphiques et tendances
#![allow(dead_code)]

use super::ExpEvent;
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

/// Entrée timeline simplifiée
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEntry {
    pub timestamp: String,
    pub exp_gained: u64,
    pub category: String,
    pub project: Option<String>,
    pub source: String,
}

impl From<ExpEvent> for TimelineEntry {
    fn from(event: ExpEvent) -> Self {
        Self {
            timestamp: event.timestamp,
            exp_gained: event.amount,
            category: event.category,
            project: event.project,
            source: format!("{:?}", event.source),
        }
    }
}

pub struct ExpTimeline {
    entries: VecDeque<TimelineEntry>,
    max_entries: usize,
}

impl ExpTimeline {
    pub fn new() -> Self {
        Self {
            entries: VecDeque::new(),
            max_entries: 10000, // 10K derniers événements
        }
    }

    /// Ajouter événement
    pub fn add_event(&mut self, event: ExpEvent) {
        self.entries.push_back(event.into());

        // Limiter taille
        if self.entries.len() > self.max_entries {
            self.entries.pop_front();
        }
    }

    /// Obtenir récents (N derniers jours)
    pub fn get_recent(&self, days: u32) -> Vec<TimelineEntry> {
        let cutoff = chrono::Utc::now() - chrono::Duration::days(days as i64);

        self.entries
            .iter()
            .filter(|entry| {
                if let Ok(timestamp) = chrono::DateTime::parse_from_rfc3339(&entry.timestamp) {
                    timestamp.with_timezone(&chrono::Utc) > cutoff
                } else {
                    false
                }
            })
            .cloned()
            .collect()
    }

    /// Statistiques timeline
    pub fn get_stats(&self, days: u32) -> TimelineStats {
        let recent = self.get_recent(days);

        let total_exp: u64 = recent.iter().map(|e| e.exp_gained).sum();
        let event_count = recent.len();
        let avg_exp = if event_count > 0 {
            total_exp / event_count as u64
        } else {
            0
        };

        // Pic XP
        let peak_exp = recent.iter().map(|e| e.exp_gained).max().unwrap_or(0);

        // Catégories actives
        let mut categories = std::collections::HashSet::new();
        for entry in &recent {
            categories.insert(entry.category.clone());
        }

        TimelineStats {
            days,
            total_exp,
            event_count,
            avg_exp,
            peak_exp,
            active_categories: categories.len(),
        }
    }

    /// XP par jour (derniers N jours)
    pub fn get_daily_exp(&self, days: u32) -> Vec<DailyExp> {
        let recent = self.get_recent(days);
        let mut daily_map: std::collections::HashMap<String, u64> = std::collections::HashMap::new();

        for entry in recent {
            if let Ok(timestamp) = chrono::DateTime::parse_from_rfc3339(&entry.timestamp) {
                let date = timestamp.format("%Y-%m-%d").to_string();
                *daily_map.entry(date).or_insert(0) += entry.exp_gained;
            }
        }

        let mut daily_vec: Vec<DailyExp> = daily_map
            .into_iter()
            .map(|(date, exp)| DailyExp { date, exp })
            .collect();

        daily_vec.sort_by(|a, b| a.date.cmp(&b.date));
        daily_vec
    }
}

impl Default for ExpTimeline {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineStats {
    pub days: u32,
    pub total_exp: u64,
    pub event_count: usize,
    pub avg_exp: u64,
    pub peak_exp: u64,
    pub active_categories: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DailyExp {
    pub date: String,
    pub exp: u64,
}
