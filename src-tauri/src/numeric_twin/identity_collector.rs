// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ vΩ∞ — IDENTITY COLLECTOR
//   Sous-moteur de collecte d'identité Kevin
// ═══════════════════════════════════════════════════════════════════════════

#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

/// Collecteur d'identité - assimile valeurs, vision, style humain
pub struct IdentityCollector {
    /// Observations de valeurs
    value_observations: Vec<ValueObservation>,
    /// Observations de style
    style_observations: Vec<StyleObservation>,
    /// Vision détectée
    vision_fragments: Vec<VisionFragment>,
    /// Configuration
    config: CollectorConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValueObservation {
    pub value_name: String,
    pub context: String,
    pub strength: f32,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleObservation {
    pub style_aspect: String,
    pub observed_level: f32,
    pub context: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisionFragment {
    pub fragment: String,
    pub domain: String,
    pub clarity: f32,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollectorConfig {
    pub sensitivity: f32,
    pub min_confidence: f32,
    pub max_observations: usize,
}

impl Default for CollectorConfig {
    fn default() -> Self {
        Self {
            sensitivity: 0.7,
            min_confidence: 0.5,
            max_observations: 1000,
        }
    }
}

impl IdentityCollector {
    pub fn new() -> Self {
        Self {
            value_observations: Vec::new(),
            style_observations: Vec::new(),
            vision_fragments: Vec::new(),
            config: CollectorConfig::default(),
        }
    }

    /// Observe une valeur dans l'interaction
    pub fn observe_value(&mut self, value_name: &str, context: &str, strength: f32) {
        if strength < self.config.min_confidence {
            return;
        }

        self.value_observations.push(ValueObservation {
            value_name: value_name.to_string(),
            context: context.to_string(),
            strength,
            timestamp: Utc::now(),
        });

        // Limiter taille
        if self.value_observations.len() > self.config.max_observations {
            self.value_observations.remove(0);
        }
    }

    /// Observe un aspect de style
    pub fn observe_style(&mut self, aspect: &str, level: f32, context: &str) {
        self.style_observations.push(StyleObservation {
            style_aspect: aspect.to_string(),
            observed_level: level,
            context: context.to_string(),
            timestamp: Utc::now(),
        });

        if self.style_observations.len() > self.config.max_observations {
            self.style_observations.remove(0);
        }
    }

    /// Collecte un fragment de vision
    pub fn collect_vision(&mut self, fragment: &str, domain: &str, clarity: f32) {
        self.vision_fragments.push(VisionFragment {
            fragment: fragment.to_string(),
            domain: domain.to_string(),
            clarity,
            timestamp: Utc::now(),
        });
    }

    /// Agrège les valeurs observées
    pub fn aggregate_values(&self) -> HashMap<String, f32> {
        let mut aggregated: HashMap<String, (f32, u32)> = HashMap::new();

        for obs in &self.value_observations {
            let entry = aggregated.entry(obs.value_name.clone()).or_insert((0.0, 0));
            entry.0 += obs.strength;
            entry.1 += 1;
        }

        aggregated.into_iter()
            .map(|(k, (sum, count))| (k, sum / count as f32))
            .collect()
    }

    /// Obtient le profil de style moyen
    pub fn get_style_profile(&self) -> HashMap<String, f32> {
        let mut profile: HashMap<String, (f32, u32)> = HashMap::new();

        for obs in &self.style_observations {
            let entry = profile.entry(obs.style_aspect.clone()).or_insert((0.0, 0));
            entry.0 += obs.observed_level;
            entry.1 += 1;
        }

        profile.into_iter()
            .map(|(k, (sum, count))| (k, sum / count as f32))
            .collect()
    }
}

impl Default for IdentityCollector {
    fn default() -> Self {
        Self::new()
    }
}
