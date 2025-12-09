//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — ABSTRACTION ENGINE
//! Super Prompt #11 — Extraction de concepts et niveaux d'abstraction
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use super::reasoning::ReasoningChain;

/// Concept abstrait
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Concept {
    pub id: String,
    pub name: String,
    pub description: String,
    pub level: AbstractionLevel,
    pub related_concepts: Vec<String>,
    pub instances: Vec<String>,
    pub properties: Vec<ConceptProperty>,
    pub confidence: f32,
}

impl Default for Concept {
    fn default() -> Self {
        Self {
            id: String::new(),
            name: String::new(),
            description: String::new(),
            level: AbstractionLevel::Medium,
            related_concepts: Vec::new(),
            instances: Vec::new(),
            properties: Vec::new(),
            confidence: 0.5,
        }
    }
}

/// Niveau d'abstraction
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum AbstractionLevel {
    /// Très concret (instance spécifique)
    VeryLow,
    /// Concret
    Low,
    /// Moyen
    Medium,
    /// Abstrait
    High,
    /// Très abstrait (catégorie générale)
    VeryHigh,
}

impl Default for AbstractionLevel {
    fn default() -> Self {
        Self::Medium
    }
}

/// Propriété d'un concept
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ConceptProperty {
    pub name: String,
    pub value: String,
    pub is_essential: bool,
}

/// Moteur d'abstraction
pub struct AbstractionEngine {
    concept_cache: std::collections::HashMap<String, Concept>,
}

impl AbstractionEngine {
    pub fn new() -> Self {
        Self {
            concept_cache: std::collections::HashMap::new(),
        }
    }

    /// Extrait les concepts d'une entrée
    pub async fn extract(&self, input: &str, reasoning: &ReasoningChain) -> Vec<Concept> {
        let mut concepts = Vec::new();

        // Extraire les concepts du texte
        let text_concepts = self.extract_from_text(input);
        concepts.extend(text_concepts);

        // Extraire les concepts du raisonnement
        let reasoning_concepts = self.extract_from_reasoning(reasoning);
        concepts.extend(reasoning_concepts);

        // Dédupliquer et enrichir
        self.deduplicate_and_enrich(&mut concepts);

        // Établir les relations
        self.establish_relations(&mut concepts);

        concepts
    }

    /// Extrait les concepts du texte
    fn extract_from_text(&self, input: &str) -> Vec<Concept> {
        let mut concepts = Vec::new();
        let words: Vec<&str> = input.split_whitespace().collect();

        // Identifier les mots clés (simplifiée)
        let key_patterns = [
            ("programming", AbstractionLevel::Medium),
            ("code", AbstractionLevel::Low),
            ("software", AbstractionLevel::Medium),
            ("system", AbstractionLevel::High),
            ("architecture", AbstractionLevel::High),
            ("data", AbstractionLevel::Medium),
            ("algorithm", AbstractionLevel::Medium),
            ("function", AbstractionLevel::Low),
            ("class", AbstractionLevel::Low),
            ("module", AbstractionLevel::Medium),
            ("design", AbstractionLevel::High),
            ("pattern", AbstractionLevel::High),
            ("process", AbstractionLevel::Medium),
            ("service", AbstractionLevel::Medium),
            ("interface", AbstractionLevel::Medium),
        ];

        for (pattern, level) in key_patterns {
            if input.to_lowercase().contains(pattern) {
                concepts.push(Concept {
                    id: uuid::Uuid::new_v4().to_string(),
                    name: pattern.to_string(),
                    description: format!("Concept derived from keyword: {}", pattern),
                    level,
                    related_concepts: Vec::new(),
                    instances: Vec::new(),
                    properties: Vec::new(),
                    confidence: 0.7,
                });
            }
        }

        // Identifier les noms propres (capitalisés)
        for word in &words {
            if word.chars().next().map(|c| c.is_uppercase()).unwrap_or(false)
                && word.len() > 2
                && !["The", "This", "That", "What", "How", "Why", "When"].contains(word)
            {
                concepts.push(Concept {
                    id: uuid::Uuid::new_v4().to_string(),
                    name: word.to_string(),
                    description: format!("Named entity: {}", word),
                    level: AbstractionLevel::VeryLow,
                    related_concepts: Vec::new(),
                    instances: vec![word.to_string()],
                    properties: Vec::new(),
                    confidence: 0.6,
                });
            }
        }

        concepts
    }

    /// Extrait les concepts du raisonnement
    fn extract_from_reasoning(&self, reasoning: &ReasoningChain) -> Vec<Concept> {
        let mut concepts = Vec::new();

        for step in &reasoning.steps {
            // Extraire des conclusions
            if step.confidence > 0.7 {
                concepts.push(Concept {
                    id: uuid::Uuid::new_v4().to_string(),
                    name: format!("reasoning_step_{}", step.order),
                    description: step.conclusion.clone(),
                    level: AbstractionLevel::Medium,
                    related_concepts: Vec::new(),
                    instances: Vec::new(),
                    properties: vec![
                        ConceptProperty {
                            name: "source".to_string(),
                            value: "reasoning_chain".to_string(),
                            is_essential: true,
                        },
                        ConceptProperty {
                            name: "confidence".to_string(),
                            value: format!("{:.2}", step.confidence),
                            is_essential: false,
                        },
                    ],
                    confidence: step.confidence,
                });
            }
        }

        concepts
    }

    /// Déduplique et enrichit les concepts
    fn deduplicate_and_enrich(&self, concepts: &mut Vec<Concept>) {
        // Trier par confiance décroissante
        concepts.sort_by(|a, b| b.confidence.partial_cmp(&a.confidence).unwrap_or(std::cmp::Ordering::Equal));

        // Dédupliquer par nom (garder la plus haute confiance)
        let mut seen = std::collections::HashSet::new();
        concepts.retain(|c| seen.insert(c.name.clone()));
    }

    /// Établit les relations entre concepts
    fn establish_relations(&self, concepts: &mut [Concept]) {
        let names: Vec<String> = concepts.iter().map(|c| c.name.clone()).collect();

        for concept in concepts.iter_mut() {
            // Relations basées sur le niveau d'abstraction
            for name in &names {
                if *name != concept.name {
                    // Les concepts de niveau supérieur sont liés aux niveaux inférieurs
                    concept.related_concepts.push(name.clone());
                }
            }

            // Limiter à 5 relations
            concept.related_concepts.truncate(5);
        }
    }

    /// Généralise un concept (monte en abstraction)
    pub fn generalize(&self, concept: &Concept) -> Concept {
        let new_level = match concept.level {
            AbstractionLevel::VeryLow => AbstractionLevel::Low,
            AbstractionLevel::Low => AbstractionLevel::Medium,
            AbstractionLevel::Medium => AbstractionLevel::High,
            AbstractionLevel::High => AbstractionLevel::VeryHigh,
            AbstractionLevel::VeryHigh => AbstractionLevel::VeryHigh,
        };

        Concept {
            id: uuid::Uuid::new_v4().to_string(),
            name: format!("{}_generalized", concept.name),
            description: format!("Generalization of: {}", concept.description),
            level: new_level,
            related_concepts: vec![concept.id.clone()],
            instances: vec![concept.name.clone()],
            properties: concept.properties.iter()
                .filter(|p| p.is_essential)
                .cloned()
                .collect(),
            confidence: concept.confidence * 0.9,
        }
    }

    /// Spécialise un concept (descend en abstraction)
    pub fn specialize(&self, concept: &Concept, instance: &str) -> Concept {
        let new_level = match concept.level {
            AbstractionLevel::VeryHigh => AbstractionLevel::High,
            AbstractionLevel::High => AbstractionLevel::Medium,
            AbstractionLevel::Medium => AbstractionLevel::Low,
            AbstractionLevel::Low => AbstractionLevel::VeryLow,
            AbstractionLevel::VeryLow => AbstractionLevel::VeryLow,
        };

        Concept {
            id: uuid::Uuid::new_v4().to_string(),
            name: format!("{}_{}", concept.name, instance),
            description: format!("Specialization of {} for {}", concept.name, instance),
            level: new_level,
            related_concepts: vec![concept.id.clone()],
            instances: vec![instance.to_string()],
            properties: concept.properties.clone(),
            confidence: concept.confidence * 0.95,
        }
    }

    /// Trouve les concepts similaires
    pub fn find_similar(&self, concept: &Concept, all_concepts: &[Concept]) -> Vec<Concept> {
        all_concepts.iter()
            .filter(|c| {
                c.id != concept.id &&
                (c.level == concept.level || self.adjacent_levels(&c.level, &concept.level))
            })
            .take(5)
            .cloned()
            .collect()
    }

    /// Vérifie si deux niveaux sont adjacents
    fn adjacent_levels(&self, a: &AbstractionLevel, b: &AbstractionLevel) -> bool {
        let level_value = |l: &AbstractionLevel| match l {
            AbstractionLevel::VeryLow => 0,
            AbstractionLevel::Low => 1,
            AbstractionLevel::Medium => 2,
            AbstractionLevel::High => 3,
            AbstractionLevel::VeryHigh => 4,
        };

        (level_value(a) as i32 - level_value(b) as i32).abs() <= 1
    }
}

impl Default for AbstractionEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_abstraction_engine_creation() {
        let engine = AbstractionEngine::new();
        assert!(engine.concept_cache.is_empty());
    }

    #[tokio::test]
    async fn test_extract_concepts() {
        let engine = AbstractionEngine::new();
        let reasoning = ReasoningChain::default();

        let concepts = engine.extract("This is about software architecture and design patterns", &reasoning).await;

        assert!(!concepts.is_empty());
        assert!(concepts.iter().any(|c| c.name == "software" || c.name == "architecture" || c.name == "design" || c.name == "pattern"));
    }

    #[test]
    fn test_generalize() {
        let engine = AbstractionEngine::new();
        let concept = Concept {
            id: "1".to_string(),
            name: "rust_code".to_string(),
            description: "Rust programming code".to_string(),
            level: AbstractionLevel::Low,
            ..Default::default()
        };

        let generalized = engine.generalize(&concept);
        assert_eq!(generalized.level, AbstractionLevel::Medium);
    }

    #[test]
    fn test_specialize() {
        let engine = AbstractionEngine::new();
        let concept = Concept {
            id: "1".to_string(),
            name: "code".to_string(),
            description: "Programming code".to_string(),
            level: AbstractionLevel::Medium,
            ..Default::default()
        };

        let specialized = engine.specialize(&concept, "rust");
        assert_eq!(specialized.level, AbstractionLevel::Low);
        assert!(specialized.name.contains("rust"));
    }
}
