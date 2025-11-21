// TITANE∞ v14.1 - Identity Model
// Modélisation identité Kevin

#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Modèle d'identité Kevin
pub struct IdentityModel {
    core_traits: HashMap<String, f32>,
    thinking_patterns: Vec<ThinkingPattern>,
    communication_style: CommunicationStyle,
    values: Vec<String>,
    preferences: HashMap<String, String>,
}

impl IdentityModel {
    pub fn new() -> Self {
        Self {
            core_traits: Self::default_traits(),
            thinking_patterns: Self::default_thinking_patterns(),
            communication_style: CommunicationStyle::default(),
            values: Self::default_values(),
            preferences: HashMap::new(),
        }
    }

    fn default_traits() -> HashMap<String, f32> {
        let mut traits = HashMap::new();
        traits.insert("analytical".to_string(), 0.9);
        traits.insert("structured".to_string(), 0.85);
        traits.insert("calm".to_string(), 0.8);
        traits.insert("clarity_oriented".to_string(), 0.95);
        traits.insert("pragmatic".to_string(), 0.9);
        traits
    }

    fn default_thinking_patterns() -> Vec<ThinkingPattern> {
        vec![
            ThinkingPattern {
                name: "simple_to_complex".to_string(),
                description: "Préfère partir du simple vers le complexe".to_string(),
                frequency: 0.9,
            },
            ThinkingPattern {
                name: "structured_reasoning".to_string(),
                description: "Raisonnement structuré et logique".to_string(),
                frequency: 0.95,
            },
        ]
    }

    fn default_values() -> Vec<String> {
        vec![
            "Clarté".to_string(),
            "Cohérence".to_string(),
            "Simplicité".to_string(),
            "Efficacité".to_string(),
            "Alignement".to_string(),
        ]
    }

    pub fn get_trait(&self, name: &str) -> f32 {
        *self.core_traits.get(name).unwrap_or(&0.5)
    }
}

impl Default for IdentityModel {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThinkingPattern {
    pub name: String,
    pub description: String,
    pub frequency: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommunicationStyle {
    pub tone: String,
    pub clarity_level: f32,
    pub formality: f32,
    pub directness: f32,
}

impl Default for CommunicationStyle {
    fn default() -> Self {
        Self {
            tone: "calm_professional".to_string(),
            clarity_level: 0.95,
            formality: 0.7,
            directness: 0.8,
        }
    }
}
