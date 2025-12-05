// TITANE∞ v14.1 - Emotion Engine
// Perception émotionnelle en temps réel (voix + texte)

#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

/// Moteur émotionnel
pub struct EmotionEngine {
    history: VecDeque<EmotionalAnalysis>,
    max_history: usize,
}

impl EmotionEngine {
    pub fn new() -> Self {
        Self {
            history: VecDeque::new(),
            max_history: 100,
        }
    }

    /// Analyse émotionnelle d'un input (texte/voix)
    pub fn analyze(&mut self, input: &str) -> EmotionalAnalysis {
        let analysis = EmotionalAnalysis {
            primary_emotion: self.detect_primary_emotion(input),
            intensity: self.calculate_intensity(input),
            stress_level: self.detect_stress(input),
            cognitive_load: self.estimate_cognitive_load(input),
            energy_level: self.estimate_energy(input),
            clarity: self.assess_clarity(input),
            stability: self.assess_stability(input),
            tone_variations: self.detect_tone_variations(input),
            timestamp: chrono::Utc::now(),
        };

        self.history.push_back(analysis.clone());
        if self.history.len() > self.max_history {
            self.history.pop_front();
        }

        analysis
    }

    fn detect_primary_emotion(&self, input: &str) -> String {
        let input_lower = input.to_lowercase();

        // Détection calme/serein
        if input_lower.contains("calme") || input_lower.contains("serein") || input_lower.contains("zen") {
            return "calm".to_string();
        }

        // Détection surcharge/stress
        if input_lower.contains("trop") || input_lower.contains("surcharge") || input_lower.contains("débordé") {
            return "overwhelmed".to_string();
        }

        // Détection fatigue
        if input_lower.contains("fatigué") || input_lower.contains("épuisé") || input_lower.contains("crevé") {
            return "tired".to_string();
        }

        // Détection motivation
        if input_lower.contains("motivé") || input_lower.contains("excité") || input_lower.contains("prêt") {
            return "motivated".to_string();
        }

        // Détection confusion
        if input_lower.contains("perdu") || input_lower.contains("confus") || input_lower.contains("flou") {
            return "confused".to_string();
        }

        "neutral".to_string()
    }

    fn calculate_intensity(&self, input: &str) -> f32 {
        let markers = ["!!!", "vraiment", "trop", "très", "extrêmement", "totalement"];
        let mut intensity: f32 = 0.5;

        for marker in markers {
            if input.to_lowercase().contains(marker) {
                intensity += 0.15;
            }
        }

        intensity.min(1.0)
    }

    fn detect_stress(&self, input: &str) -> f32 {
        let stress_words = ["stress", "anxieux", "angoisse", "pression", "urgence", "débordé"];
        let mut stress: f32 = 0.0;

        for word in stress_words {
            if input.to_lowercase().contains(word) {
                stress += 0.2;
            }
        }

        stress.min(1.0)
    }

    fn estimate_cognitive_load(&self, input: &str) -> f32 {
        // Heuristique basée sur complexité syntaxique
        let word_count = input.split_whitespace().count();
        let avg_word_length = input.chars().filter(|c| !c.is_whitespace()).count() as f32 / word_count.max(1) as f32;

        let complexity = (word_count as f32 / 50.0 + avg_word_length / 10.0) / 2.0;
        complexity.min(1.0)
    }

    fn estimate_energy(&self, input: &str) -> f32 {
        let energy_words = ["énergique", "prêt", "go", "action", "fonce"];
        let fatigue_words = ["fatigué", "épuisé", "crevé", "mou", "lent"];

        let mut energy: f32 = 0.5;

        for word in energy_words {
            if input.to_lowercase().contains(word) {
                energy += 0.15;
            }
        }

        for word in fatigue_words {
            if input.to_lowercase().contains(word) {
                energy -= 0.2;
            }
        }

        energy.clamp(0.0, 1.0)
    }

    fn assess_clarity(&self, input: &str) -> f32 {
        let clarity_markers = ["clair", "précis", "évident", "simple"];
        let confusion_markers = ["flou", "confus", "perdu", "embrouillé"];

        let mut clarity: f32 = 0.7;

        for marker in clarity_markers {
            if input.to_lowercase().contains(marker) {
                clarity += 0.1;
            }
        }

        for marker in confusion_markers {
            if input.to_lowercase().contains(marker) {
                clarity -= 0.2;
            }
        }

        clarity.clamp(0.0, 1.0)
    }

    fn assess_stability(&self, _input: &str) -> f32 {
        // Stabilité basée sur cohérence
        if self.history.len() < 3 {
            return 0.7;
        }

        let recent: Vec<&EmotionalAnalysis> = self.history.iter().rev().take(3).collect();
        let avg_stress: f32 = recent.iter().map(|a| a.stress_level).sum::<f32>() / recent.len() as f32;
        let variance = recent.iter().map(|a| (a.stress_level - avg_stress).powi(2)).sum::<f32>() / recent.len() as f32;

        (1.0 - variance).clamp(0.0, 1.0)
    }

    fn detect_tone_variations(&self, _input: &str) -> Vec<String> {
        // TODO: Analyse plus fine des variations de ton
        vec![]
    }

    pub fn get_history(&self) -> &VecDeque<EmotionalAnalysis> {
        &self.history
    }
}

impl Default for EmotionEngine {
    fn default() -> Self {
        Self::new()
    }
}

/// Analyse émotionnelle complète
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionalAnalysis {
    pub primary_emotion: String,
    pub intensity: f32,
    pub stress_level: f32,
    pub cognitive_load: f32,
    pub energy_level: f32,
    pub clarity: f32,
    pub stability: f32,
    pub tone_variations: Vec<String>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

impl EmotionalAnalysis {
    pub fn neutral() -> Self {
        Self {
            primary_emotion: "neutral".to_string(),
            intensity: 0.5,
            stress_level: 0.3,
            cognitive_load: 0.5,
            energy_level: 0.7,
            clarity: 0.8,
            stability: 0.9,
            tone_variations: vec![],
            timestamp: chrono::Utc::now(),
        }
    }
}
