// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ vΩ∞ — COGNITIVE MODELER
//   Sous-moteur de modélisation cognitive Kevin
// ═══════════════════════════════════════════════════════════════════════════

#![allow(dead_code)]

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Modélisateur cognitif - patterns de pensée Kevin
pub struct CognitiveModeler {
    /// Patterns de raisonnement observés
    reasoning_patterns: Vec<ObservedReasoning>,
    /// Séquences de pensée
    thought_sequences: Vec<ThoughtSequence>,
    /// Préférences de structuration
    structuring_preferences: StructuringPreferences,
    /// Modèle actuel
    current_model: CognitiveModel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObservedReasoning {
    pub pattern_type: ReasoningType,
    pub context: String,
    pub effectiveness: f32,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ReasoningType {
    /// Simple vers complexe
    SimpleToComplex,
    /// Analytique
    Analytical,
    /// Systémique
    Systemic,
    /// Intuitif
    Intuitive,
    /// Structuré
    Structured,
    /// Pragmatique
    Pragmatic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThoughtSequence {
    pub steps: Vec<String>,
    pub domain: String,
    pub success: bool,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StructuringPreferences {
    /// Préférence pour les hiérarchies
    pub hierarchy: f32,
    /// Préférence pour les couches
    pub layering: f32,
    /// Préférence pour le minimalisme
    pub minimalism: f32,
    /// Préférence pour la clarté
    pub clarity: f32,
}

impl Default for StructuringPreferences {
    fn default() -> Self {
        Self {
            hierarchy: 0.70,
            layering: 0.85,
            minimalism: 0.80,
            clarity: 0.95,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveModel {
    /// Distribution des types de raisonnement
    pub reasoning_distribution: HashMap<String, f32>,
    /// Vitesse de décision par contexte
    pub decision_speeds: HashMap<String, f32>,
    /// Niveau de confiance typique
    pub typical_confidence: f32,
    /// Score de cohérence
    pub coherence_score: f32,
}

impl Default for CognitiveModel {
    fn default() -> Self {
        let mut distribution = HashMap::new();
        distribution.insert("simple_to_complex".to_string(), 0.90);
        distribution.insert("analytical".to_string(), 0.85);
        distribution.insert("systemic".to_string(), 0.80);
        distribution.insert("structured".to_string(), 0.88);
        distribution.insert("pragmatic".to_string(), 0.85);

        let mut speeds = HashMap::new();
        speeds.insert("architecture".to_string(), 0.4);
        speeds.insert("operational".to_string(), 0.7);
        speeds.insert("creative".to_string(), 0.5);

        Self {
            reasoning_distribution: distribution,
            decision_speeds: speeds,
            typical_confidence: 0.75,
            coherence_score: 0.85,
        }
    }
}

impl CognitiveModeler {
    pub fn new() -> Self {
        Self {
            reasoning_patterns: Vec::new(),
            thought_sequences: Vec::new(),
            structuring_preferences: StructuringPreferences::default(),
            current_model: CognitiveModel::default(),
        }
    }

    /// Observe un pattern de raisonnement
    pub fn observe_reasoning(
        &mut self,
        pattern_type: ReasoningType,
        context: &str,
        effectiveness: f32,
    ) {
        self.reasoning_patterns.push(ObservedReasoning {
            pattern_type,
            context: context.to_string(),
            effectiveness,
            timestamp: Utc::now(),
        });

        self.update_model();
    }

    /// Enregistre une séquence de pensée
    pub fn record_thought_sequence(&mut self, steps: Vec<String>, domain: &str, success: bool) {
        self.thought_sequences.push(ThoughtSequence {
            steps,
            domain: domain.to_string(),
            success,
            timestamp: Utc::now(),
        });
    }

    /// Met à jour le modèle cognitif
    fn update_model(&mut self) {
        if self.reasoning_patterns.is_empty() {
            return;
        }

        // Calculer distribution
        let mut counts: HashMap<String, (f32, u32)> = HashMap::new();

        for pattern in &self.reasoning_patterns {
            let key = format!("{:?}", pattern.pattern_type).to_lowercase();
            let entry = counts.entry(key).or_insert((0.0, 0));
            entry.0 += pattern.effectiveness;
            entry.1 += 1;
        }

        for (key, (sum, count)) in counts {
            self.current_model
                .reasoning_distribution
                .insert(key, sum / count as f32);
        }

        // Calculer cohérence
        let total_effectiveness: f32 = self
            .reasoning_patterns
            .iter()
            .map(|p| p.effectiveness)
            .sum();
        let avg_effectiveness = total_effectiveness / self.reasoning_patterns.len() as f32;
        self.current_model.coherence_score = avg_effectiveness;
    }

    /// Obtient le modèle actuel
    pub fn get_model(&self) -> &CognitiveModel {
        &self.current_model
    }

    /// Prédit le type de raisonnement pour un contexte
    pub fn predict_reasoning(&self, context: &str) -> ReasoningType {
        let context_lower = context.to_lowercase();

        if context_lower.contains("architecture") || context_lower.contains("structure") {
            ReasoningType::Systemic
        } else if context_lower.contains("analyse") || context_lower.contains("étudi") {
            ReasoningType::Analytical
        } else if context_lower.contains("créa") || context_lower.contains("innov") {
            ReasoningType::Intuitive
        } else if context_lower.contains("rapid") || context_lower.contains("vite") {
            ReasoningType::Pragmatic
        } else {
            ReasoningType::SimpleToComplex
        }
    }
}

impl Default for CognitiveModeler {
    fn default() -> Self {
        Self::new()
    }
}
