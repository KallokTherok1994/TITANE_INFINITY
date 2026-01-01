//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — SYSTÈME DE VALEURS
//! Super Prompt #13 — Valeurs fondamentales et priorités
//! ═══════════════════════════════════════════════════════════════════════════════

use super::ConstitutionalAction;
use serde::{Deserialize, Serialize};

/// Priorité d'une valeur
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum ValuePriority {
    /// Essentiel (ne peut jamais être compromis)
    Essential = 5,
    /// Critique (compromis uniquement en situation extrême)
    Critical = 4,
    /// Important (compromis possible avec justification)
    Important = 3,
    /// Significatif (peut être temporairement compromis)
    Significant = 2,
    /// Optionnel (nice-to-have)
    Optional = 1,
}

/// Valeur fondamentale
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CoreValue {
    pub name: String,
    pub description: String,
    pub priority: ValuePriority,
    pub examples: Vec<String>,
    pub anti_patterns: Vec<String>,
}

impl CoreValue {
    /// Vérifie si une action est compatible avec cette valeur
    pub fn compatible_with(&self, action: &ConstitutionalAction) -> bool {
        // Vérifier les anti-patterns
        for anti in &self.anti_patterns {
            if action
                .action_type
                .to_lowercase()
                .contains(&anti.to_lowercase())
            {
                return false;
            }
        }

        true
    }
}

/// Système de valeurs
pub struct ValueSystem {
    values: Vec<CoreValue>,
}

impl ValueSystem {
    /// Crée un système vide
    pub fn new() -> Self {
        Self { values: Vec::new() }
    }

    /// Crée le système de valeurs TITANE∞ par défaut
    pub fn default_titane() -> Self {
        let values = vec![
            // Valeurs essentielles
            CoreValue {
                name: "safety".to_string(),
                description: "Ensure the safety of users and systems at all times".to_string(),
                priority: ValuePriority::Essential,
                examples: vec![
                    "Validate inputs before processing".to_string(),
                    "Sandbox untrusted content".to_string(),
                    "Rate limit requests".to_string(),
                ],
                anti_patterns: vec![
                    "bypass_safety".to_string(),
                    "ignore_warning".to_string(),
                    "skip_validation".to_string(),
                ],
            },
            CoreValue {
                name: "honesty".to_string(),
                description: "Always be truthful and transparent in communications".to_string(),
                priority: ValuePriority::Essential,
                examples: vec![
                    "Acknowledge limitations".to_string(),
                    "Correct mistakes".to_string(),
                    "Provide sources".to_string(),
                ],
                anti_patterns: vec![
                    "deceive".to_string(),
                    "mislead".to_string(),
                    "fabricate".to_string(),
                ],
            },
            // Valeurs critiques
            CoreValue {
                name: "privacy".to_string(),
                description: "Protect user privacy and personal information".to_string(),
                priority: ValuePriority::Critical,
                examples: vec![
                    "Encrypt sensitive data".to_string(),
                    "Minimize data collection".to_string(),
                    "Respect user preferences".to_string(),
                ],
                anti_patterns: vec![
                    "expose_data".to_string(),
                    "track_without_consent".to_string(),
                    "share_private".to_string(),
                ],
            },
            CoreValue {
                name: "helpfulness".to_string(),
                description: "Strive to be genuinely helpful to users".to_string(),
                priority: ValuePriority::Critical,
                examples: vec![
                    "Understand user intent".to_string(),
                    "Provide actionable answers".to_string(),
                    "Follow up on unclear points".to_string(),
                ],
                anti_patterns: vec![
                    "refuse_without_reason".to_string(),
                    "provide_useless".to_string(),
                ],
            },
            // Valeurs importantes
            CoreValue {
                name: "accuracy".to_string(),
                description: "Provide accurate and reliable information".to_string(),
                priority: ValuePriority::Important,
                examples: vec![
                    "Verify facts".to_string(),
                    "Express uncertainty".to_string(),
                    "Update knowledge".to_string(),
                ],
                anti_patterns: vec![
                    "guess_without_disclaimer".to_string(),
                    "present_opinion_as_fact".to_string(),
                ],
            },
            CoreValue {
                name: "respect".to_string(),
                description: "Treat all users with dignity and respect".to_string(),
                priority: ValuePriority::Important,
                examples: vec![
                    "Use appropriate language".to_string(),
                    "Acknowledge diverse perspectives".to_string(),
                    "Avoid assumptions".to_string(),
                ],
                anti_patterns: vec![
                    "demean".to_string(),
                    "discriminate".to_string(),
                    "patronize".to_string(),
                ],
            },
            CoreValue {
                name: "efficiency".to_string(),
                description: "Use resources wisely and respond promptly".to_string(),
                priority: ValuePriority::Important,
                examples: vec![
                    "Optimize queries".to_string(),
                    "Cache appropriately".to_string(),
                    "Avoid redundancy".to_string(),
                ],
                anti_patterns: vec![
                    "waste_resources".to_string(),
                    "unnecessary_delay".to_string(),
                ],
            },
            // Valeurs significatives
            CoreValue {
                name: "adaptability".to_string(),
                description: "Adapt to user needs and contexts".to_string(),
                priority: ValuePriority::Significant,
                examples: vec![
                    "Adjust communication style".to_string(),
                    "Learn from feedback".to_string(),
                    "Support different languages".to_string(),
                ],
                anti_patterns: vec!["rigid_responses".to_string(), "ignore_context".to_string()],
            },
            CoreValue {
                name: "creativity".to_string(),
                description: "Provide creative and innovative solutions".to_string(),
                priority: ValuePriority::Significant,
                examples: vec![
                    "Suggest alternatives".to_string(),
                    "Think outside the box".to_string(),
                    "Combine ideas".to_string(),
                ],
                anti_patterns: vec!["only_standard_answers".to_string()],
            },
            // Valeurs optionnelles
            CoreValue {
                name: "aesthetics".to_string(),
                description: "Present information in a pleasant and readable way".to_string(),
                priority: ValuePriority::Optional,
                examples: vec![
                    "Format clearly".to_string(),
                    "Use appropriate structure".to_string(),
                ],
                anti_patterns: vec![],
            },
        ];

        Self { values }
    }

    /// Ajoute une valeur
    pub fn add(&mut self, value: CoreValue) {
        self.values.push(value);
    }

    /// Récupère une valeur par nom
    pub fn get(&self, name: &str) -> Option<&CoreValue> {
        self.values.iter().find(|v| v.name == name)
    }

    /// Itère sur les valeurs
    pub fn iter(&self) -> impl Iterator<Item = &CoreValue> {
        self.values.iter()
    }

    /// Nombre de valeurs
    pub fn len(&self) -> usize {
        self.values.len()
    }

    /// Est vide?
    pub fn is_empty(&self) -> bool {
        self.values.is_empty()
    }

    /// Valeurs par priorité
    pub fn by_priority(&self, priority: ValuePriority) -> Vec<&CoreValue> {
        self.values
            .iter()
            .filter(|v| v.priority == priority)
            .collect()
    }

    /// Valeurs triées par priorité (plus haute d'abord)
    pub fn sorted_by_priority(&self) -> Vec<&CoreValue> {
        let mut sorted: Vec<_> = self.values.iter().collect();
        sorted.sort_by(|a, b| b.priority.cmp(&a.priority));
        sorted
    }
}

impl Default for ValueSystem {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_value_system_creation() {
        let values = ValueSystem::default_titane();
        assert!(!values.is_empty());
    }

    #[test]
    fn test_essential_values() {
        let values = ValueSystem::default_titane();
        let essential = values.by_priority(ValuePriority::Essential);
        assert!(!essential.is_empty());
    }

    #[test]
    fn test_value_compatibility() {
        let values = ValueSystem::default_titane();
        let honesty = values
            .get("honesty")
            .expect("honesty value should exist in default titane values");

        let good_action = ConstitutionalAction {
            action_type: "respond".to_string(),
            target: "user".to_string(),
            parameters: std::collections::HashMap::new(),
            requester: "system".to_string(),
            timestamp: 0,
        };

        assert!(honesty.compatible_with(&good_action));

        let bad_action = ConstitutionalAction {
            action_type: "deceive_user".to_string(),
            target: "user".to_string(),
            parameters: std::collections::HashMap::new(),
            requester: "system".to_string(),
            timestamp: 0,
        };

        assert!(!honesty.compatible_with(&bad_action));
    }
}
