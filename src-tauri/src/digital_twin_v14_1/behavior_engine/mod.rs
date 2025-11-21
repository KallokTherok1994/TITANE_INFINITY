// TITANE∞ v14.1 - Behavior Engine
// Observation des patterns comportementaux + cartographie dynamique

#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use chrono::Timelike;

/// Moteur comportemental
pub struct BehaviorEngine {
    interactions: VecDeque<BehaviorObservation>,
    patterns: HashMap<String, BehaviorPattern>,
    max_history: usize,
}

impl BehaviorEngine {
    pub fn new() -> Self {
        Self {
            interactions: VecDeque::new(),
            patterns: HashMap::new(),
            max_history: 1000,
        }
    }

    /// Enregistre une interaction
    pub fn track_interaction(&mut self, input: &str, context: &HashMap<String, String>) {
        let observation = BehaviorObservation {
            input: input.to_string(),
            context: context.clone(),
            timestamp: chrono::Utc::now(),
            detected_actions: self.detect_actions(input),
            detected_patterns: self.detect_patterns(input),
        };

        self.interactions.push_back(observation);
        if self.interactions.len() > self.max_history {
            self.interactions.pop_front();
        }

        self.update_patterns();
    }

    fn detect_actions(&self, input: &str) -> Vec<String> {
        let mut actions = Vec::new();
        let input_lower = input.to_lowercase();

        if input_lower.contains("créer") || input_lower.contains("génér") {
            actions.push("creation".to_string());
        }
        if input_lower.contains("analyser") || input_lower.contains("étudier") {
            actions.push("analysis".to_string());
        }
        if input_lower.contains("organiser") || input_lower.contains("structurer") {
            actions.push("organization".to_string());
        }
        if input_lower.contains("corriger") || input_lower.contains("réparer") {
            actions.push("correction".to_string());
        }

        actions
    }

    fn detect_patterns(&self, _input: &str) -> Vec<String> {
        // Analyse des patterns récurrents
        vec![]
    }

    fn update_patterns(&mut self) {
        if self.interactions.len() < 10 {
            return;
        }

        // Analyse cycles temporels
        self.analyze_time_patterns();
        
        // Analyse séquences d'actions
        self.analyze_action_sequences();
        
        // Analyse réactions émotionnelles
        self.analyze_emotional_patterns();
    }

    fn analyze_time_patterns(&mut self) {
        let mut hourly_distribution: HashMap<u32, usize> = HashMap::new();

        for obs in self.interactions.iter().rev().take(100) {
            let hour = obs.timestamp.hour();
            *hourly_distribution.entry(hour).or_insert(0) += 1;
        }

        // Identifier heures de pic
        if let Some((peak_hour, _)) = hourly_distribution.iter().max_by_key(|(_, count)| *count) {
            self.patterns.insert(
                "peak_hour".to_string(),
                BehaviorPattern {
                    pattern_type: "temporal".to_string(),
                    frequency: 0.8,
                    description: format!("Peak activity at hour {}", peak_hour),
                    discovered_at: chrono::Utc::now(),
                }
            );
        }
    }

    fn analyze_action_sequences(&mut self) {
        // Analyser séquences communes
        let recent: Vec<&BehaviorObservation> = self.interactions.iter().rev().take(50).collect();
        
        let mut sequences: HashMap<String, usize> = HashMap::new();
        
        for window in recent.windows(2) {
            if let [first, second] = window {
                for action1 in &first.detected_actions {
                    for action2 in &second.detected_actions {
                        let seq = format!("{} -> {}", action1, action2);
                        *sequences.entry(seq).or_insert(0) += 1;
                    }
                }
            }
        }

        // Enregistrer séquences fréquentes
        for (seq, count) in sequences {
            if count > 3 {
                self.patterns.insert(
                    format!("sequence_{}", seq),
                    BehaviorPattern {
                        pattern_type: "sequence".to_string(),
                        frequency: count as f32 / 50.0,
                        description: seq,
                        discovered_at: chrono::Utc::now(),
                    }
                );
            }
        }
    }

    fn analyze_emotional_patterns(&mut self) {
        // TODO: Corréler émotions et comportements
    }

    /// Génère une carte comportementale
    pub fn generate_behavior_map(&self) -> BehaviorMap {
        BehaviorMap {
            daily_cycle: self.generate_daily_cycle(),
            action_preferences: self.generate_action_preferences(),
            patterns: self.patterns.clone(),
            optimal_zones: self.identify_optimal_zones(),
            vulnerable_zones: self.identify_vulnerable_zones(),
        }
    }

    fn generate_daily_cycle(&self) -> Vec<CyclePhase> {
        // Analyser cycle journalier
        vec![
            CyclePhase {
                time_range: "08:00-12:00".to_string(),
                energy_level: 0.8,
                cognitive_capacity: 0.9,
                typical_actions: vec!["analysis".to_string(), "creation".to_string()],
            },
            CyclePhase {
                time_range: "12:00-14:00".to_string(),
                energy_level: 0.5,
                cognitive_capacity: 0.6,
                typical_actions: vec!["organization".to_string()],
            },
            CyclePhase {
                time_range: "14:00-18:00".to_string(),
                energy_level: 0.7,
                cognitive_capacity: 0.8,
                typical_actions: vec!["creation".to_string(), "correction".to_string()],
            },
        ]
    }

    fn generate_action_preferences(&self) -> HashMap<String, f32> {
        let mut preferences = HashMap::new();
        
        for obs in &self.interactions {
            for action in &obs.detected_actions {
                *preferences.entry(action.clone()).or_insert(0.0) += 1.0;
            }
        }

        // Normaliser
        let total: f32 = preferences.values().sum();
        if total > 0.0 {
            for value in preferences.values_mut() {
                *value /= total;
            }
        }

        preferences
    }

    fn identify_optimal_zones(&self) -> Vec<String> {
        vec![
            "Morning deep work (08:00-12:00)".to_string(),
            "Late afternoon focus (16:00-18:00)".to_string(),
        ]
    }

    fn identify_vulnerable_zones(&self) -> Vec<String> {
        vec![
            "Post-lunch dip (13:00-14:00)".to_string(),
            "Evening fatigue (20:00+)".to_string(),
        ]
    }

    pub fn get_patterns(&self) -> &HashMap<String, BehaviorPattern> {
        &self.patterns
    }
}

impl Default for BehaviorEngine {
    fn default() -> Self {
        Self::new()
    }
}

/// Observation comportementale
#[derive(Debug, Clone, Serialize, Deserialize)]
struct BehaviorObservation {
    input: String,
    context: HashMap<String, String>,
    timestamp: chrono::DateTime<chrono::Utc>,
    detected_actions: Vec<String>,
    detected_patterns: Vec<String>,
}

/// Pattern comportemental
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehaviorPattern {
    pub pattern_type: String,
    pub frequency: f32,
    pub description: String,
    pub discovered_at: chrono::DateTime<chrono::Utc>,
}

/// Carte comportementale
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehaviorMap {
    pub daily_cycle: Vec<CyclePhase>,
    pub action_preferences: HashMap<String, f32>,
    pub patterns: HashMap<String, BehaviorPattern>,
    pub optimal_zones: Vec<String>,
    pub vulnerable_zones: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CyclePhase {
    pub time_range: String,
    pub energy_level: f32,
    pub cognitive_capacity: f32,
    pub typical_actions: Vec<String>,
}
