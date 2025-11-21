// 📊 Pattern Learning — Apprentissage des patterns de Kevin
// Analyse et mémorisation du style naturel, rythme, préférences, habitudes

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pattern {
    pub pattern_type: PatternType,
    pub frequency: u32,
    pub confidence: f32,
    pub last_observed: String,
    pub context_tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum PatternType {
    CommunicationStyle,  // Style d'écriture (formel, décontracté, technique)
    DecisionLogic,       // Logique décisionnelle (analytique, intuitive, hybride)
    WorkingRhythm,       // Rythme de travail (sprint, marathon, intermittent)
    EmotionalCycle,      // Cycles émotionnels observés
    PreferredDepth,      // Profondeur préférée (synthétique, détaillé, exhaustif)
    InteractionTone,     // Ton préféré (encourageant, direct, réflexif)
    CreativeHabits,      // Habitudes créatives (matin, soir, spontané)
}

pub struct PatternLearner {
    patterns: HashMap<PatternType, Pattern>,
    observation_count: u64,
}

impl PatternLearner {
    pub fn new() -> Self {
        Self {
            patterns: HashMap::new(),
            observation_count: 0,
        }
    }

    /// Observer et enregistrer les patterns de Kevin
    pub fn observe_patterns(&mut self, metrics: &super::KevinMetrics) {
        self.observation_count += 1;

        // Détecter style de communication
        self.detect_communication_style(metrics);

        // Détecter logique décisionnelle
        self.detect_decision_logic(metrics);

        // Détecter rythme de travail
        self.detect_working_rhythm(metrics);

        // Détecter cycles émotionnels
        self.detect_emotional_cycles(metrics);

        // Détecter préférences de profondeur
        self.detect_preferred_depth(metrics);

        // Détecter ton d'interaction
        self.detect_interaction_tone(metrics);
    }

    fn detect_communication_style(&mut self, metrics: &super::KevinMetrics) {
        let style = if metrics.cognitive_load < 0.3 {
            "décontracté"
        } else if metrics.cognitive_load > 0.7 {
            "précis-concis"
        } else {
            "équilibré"
        };

        self.update_pattern(
            PatternType::CommunicationStyle,
            vec![style.to_string(), metrics.interaction_context.clone()],
        );
    }

    fn detect_decision_logic(&mut self, metrics: &super::KevinMetrics) {
        let logic = if metrics.clarity_level > 0.7 {
            "analytique"
        } else if metrics.emotional_state.abs() > 0.5 {
            "intuitive"
        } else {
            "hybride"
        };

        self.update_pattern(
            PatternType::DecisionLogic,
            vec![logic.to_string()],
        );
    }

    fn detect_working_rhythm(&mut self, metrics: &super::KevinMetrics) {
        let rhythm = if metrics.energy_level > 0.8 && metrics.focus_level > 0.7 {
            "sprint-intensif"
        } else if metrics.energy_level > 0.5 {
            "marathon-stable"
        } else {
            "intermittent"
        };

        self.update_pattern(
            PatternType::WorkingRhythm,
            vec![rhythm.to_string()],
        );
    }

    fn detect_emotional_cycles(&mut self, metrics: &super::KevinMetrics) {
        let cycle = if metrics.emotional_state > 0.5 {
            "phase-positive"
        } else if metrics.emotional_state < -0.5 {
            "phase-difficile"
        } else {
            "phase-neutre"
        };

        self.update_pattern(
            PatternType::EmotionalCycle,
            vec![cycle.to_string()],
        );
    }

    fn detect_preferred_depth(&mut self, metrics: &super::KevinMetrics) {
        let depth = if metrics.cognitive_load > 0.7 {
            "synthétique"
        } else if metrics.clarity_level > 0.7 && metrics.energy_level > 0.6 {
            "exhaustif"
        } else {
            "détaillé"
        };

        self.update_pattern(
            PatternType::PreferredDepth,
            vec![depth.to_string()],
        );
    }

    fn detect_interaction_tone(&mut self, metrics: &super::KevinMetrics) {
        let tone = if metrics.stress_level > 0.6 {
            "rassurant"
        } else if metrics.energy_level > 0.7 {
            "encourageant"
        } else if metrics.clarity_level < 0.4 {
            "clarificateur"
        } else {
            "direct"
        };

        self.update_pattern(
            PatternType::InteractionTone,
            vec![tone.to_string()],
        );
    }

    fn update_pattern(&mut self, pattern_type: PatternType, context_tags: Vec<String>) {
        let pattern = self.patterns.entry(pattern_type.clone()).or_insert(Pattern {
            pattern_type: pattern_type.clone(),
            frequency: 0,
            confidence: 0.0,
            last_observed: chrono::Utc::now().to_rfc3339(),
            context_tags: vec![],
        });

        pattern.frequency += 1;
        pattern.confidence = (pattern.frequency as f32 / self.observation_count as f32).min(1.0);
        pattern.last_observed = chrono::Utc::now().to_rfc3339();
        pattern.context_tags = context_tags;
    }

    /// Renforcer les patterns qui fonctionnent bien
    pub fn reinforce_successful_patterns(&mut self, _metrics: &super::KevinMetrics) {
        for pattern in self.patterns.values_mut() {
            if pattern.confidence > 0.7 {
                // Renforcer les patterns très fréquents
                pattern.confidence = (pattern.confidence * 1.05).min(1.0);
            }
        }
    }

    /// Récupérer un pattern spécifique
    pub fn get_pattern(&self, pattern_type: &PatternType) -> Option<&Pattern> {
        self.patterns.get(pattern_type)
    }

    /// Obtenir tous les patterns
    pub fn get_all_patterns(&self) -> Vec<Pattern> {
        self.patterns.values().cloned().collect()
    }
}

impl Default for PatternLearner {
    fn default() -> Self {
        Self::new()
    }
}
