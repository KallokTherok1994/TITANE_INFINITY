//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — TRANSFER ENGINE
//! Super Prompt #11 — Transfert de connaissances entre domaines
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use super::AGIContext;
use super::abstraction::Concept;

/// Contexte de transfert
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct TransferContext {
    pub source_domain: String,
    pub target_domain: String,
    pub knowledge_items: Vec<KnowledgeItem>,
    pub similarity_score: f32,
}

/// Item de connaissance
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct KnowledgeItem {
    pub id: String,
    pub content: String,
    pub domain: String,
    pub transferability: f32,
    pub dependencies: Vec<String>,
}

/// Résultat de transfert
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct TransferResult {
    pub success: bool,
    pub transferred_items: Vec<TransferredItem>,
    pub adaptations_needed: Vec<String>,
    pub confidence: f32,
    pub warnings: Vec<String>,
}

/// Item transféré
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TransferredItem {
    pub original_id: String,
    pub adapted_content: String,
    pub adaptation_level: AdaptationLevel,
    pub success: bool,
}

/// Niveau d'adaptation nécessaire
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum AdaptationLevel {
    /// Transfert direct (pas de changement)
    Direct,
    /// Adaptation mineure
    Minor,
    /// Adaptation modérée
    Moderate,
    /// Adaptation majeure
    Major,
    /// Transformation complète
    Complete,
}

/// Moteur de transfert
pub struct TransferEngine {
    transfer_history: RwLock<Vec<TransferRecord>>,
    domain_mappings: RwLock<DomainMappings>,
}

/// Enregistrement de transfert
#[derive(Clone, Debug, Serialize, Deserialize)]
struct TransferRecord {
    source_domain: String,
    target_domain: String,
    success: bool,
    items_transferred: usize,
    timestamp: u64,
}

/// Mappings entre domaines
struct DomainMappings {
    mappings: std::collections::HashMap<String, Vec<DomainMapping>>,
}

impl Default for DomainMappings {
    fn default() -> Self {
        let mut mappings = std::collections::HashMap::new();

        // Mappings prédéfinis entre domaines
        mappings.insert("programming".to_string(), vec![
            DomainMapping {
                target: "software_engineering".to_string(),
                similarity: 0.9,
                common_concepts: vec!["code".to_string(), "algorithm".to_string()],
            },
            DomainMapping {
                target: "mathematics".to_string(),
                similarity: 0.6,
                common_concepts: vec!["logic".to_string(), "algorithm".to_string()],
            },
        ]);

        mappings.insert("machine_learning".to_string(), vec![
            DomainMapping {
                target: "statistics".to_string(),
                similarity: 0.7,
                common_concepts: vec!["probability".to_string(), "distribution".to_string()],
            },
            DomainMapping {
                target: "programming".to_string(),
                similarity: 0.8,
                common_concepts: vec!["algorithm".to_string(), "optimization".to_string()],
            },
        ]);

        Self { mappings }
    }
}

#[derive(Clone, Debug)]
struct DomainMapping {
    target: String,
    similarity: f32,
    common_concepts: Vec<String>,
}

impl TransferEngine {
    pub fn new() -> Self {
        Self {
            transfer_history: RwLock::new(Vec::new()),
            domain_mappings: RwLock::new(DomainMappings::default()),
        }
    }

    /// Applique un transfert de connaissances
    pub async fn apply(&self, context: &AGIContext, concepts: &[Concept]) -> TransferResult {
        let mut result = TransferResult::default();

        if context.domain.is_empty() {
            result.warnings.push("No target domain specified".to_string());
            return result;
        }

        // Analyser la similarité des domaines
        let domain_similarity = self.calculate_domain_similarity(context).await;

        if domain_similarity < 0.3 {
            result.warnings.push("Domains are too different for effective transfer".to_string());
            result.confidence = 0.3;
            return result;
        }

        // Transférer chaque concept
        for concept in concepts {
            let transferred = self.transfer_concept(concept, context, domain_similarity).await;
            result.transferred_items.push(transferred);
        }

        // Identifier les adaptations nécessaires
        result.adaptations_needed = self.identify_adaptations(concepts, context);

        // Calculer le succès global
        let success_count = result.transferred_items.iter()
            .filter(|t| t.success)
            .count();

        result.success = success_count as f32 / result.transferred_items.len().max(1) as f32 > 0.5;
        result.confidence = domain_similarity * (success_count as f32 / result.transferred_items.len().max(1) as f32);

        // Enregistrer le transfert
        self.record_transfer(context, &result).await;

        result
    }

    /// Calcule la similarité entre domaines
    async fn calculate_domain_similarity(&self, context: &AGIContext) -> f32 {
        let mappings = self.domain_mappings.read().await;

        // Chercher un mapping direct
        if let Some(domain_maps) = mappings.mappings.get(&context.domain) {
            // Si on a des connaissances préalables, chercher une correspondance
            for prior in &context.prior_knowledge {
                if let Some(mapping) = domain_maps.iter().find(|m| m.target.contains(prior) || prior.contains(&m.target)) {
                    return mapping.similarity;
                }
            }

            // Utiliser la première correspondance par défaut
            if let Some(first) = domain_maps.first() {
                return first.similarity;
            }
        }

        // Similarité par défaut basée sur le contexte
        let base_similarity = 0.5;
        let prior_boost = (context.prior_knowledge.len() as f32 * 0.05).min(0.3);

        (base_similarity + prior_boost).min(1.0)
    }

    /// Transfère un concept individuel
    async fn transfer_concept(
        &self,
        concept: &Concept,
        context: &AGIContext,
        domain_similarity: f32,
    ) -> TransferredItem {
        // Déterminer le niveau d'adaptation
        let adaptation_level = if domain_similarity > 0.8 {
            AdaptationLevel::Direct
        } else if domain_similarity > 0.6 {
            AdaptationLevel::Minor
        } else if domain_similarity > 0.4 {
            AdaptationLevel::Moderate
        } else if domain_similarity > 0.2 {
            AdaptationLevel::Major
        } else {
            AdaptationLevel::Complete
        };

        // Adapter le contenu
        let adapted_content = match adaptation_level {
            AdaptationLevel::Direct => concept.description.clone(),
            AdaptationLevel::Minor => format!("{} (adapted for {})", concept.description, context.domain),
            AdaptationLevel::Moderate => format!(
                "In the context of {}: {}",
                context.domain,
                concept.description
            ),
            AdaptationLevel::Major => format!(
                "Reimagined for {}: Based on the concept of '{}', consider...",
                context.domain,
                concept.name
            ),
            AdaptationLevel::Complete => format!(
                "New interpretation for {}: Starting from '{}' principles...",
                context.domain,
                concept.name
            ),
        };

        let success = concept.confidence * domain_similarity > 0.3;

        TransferredItem {
            original_id: concept.id.clone(),
            adapted_content,
            adaptation_level,
            success,
        }
    }

    /// Identifie les adaptations nécessaires
    fn identify_adaptations(&self, concepts: &[Concept], context: &AGIContext) -> Vec<String> {
        let mut adaptations = Vec::new();

        // Adaptations basées sur les contraintes
        for constraint in &context.constraints {
            adaptations.push(format!("Consider constraint: {}", constraint));
        }

        // Adaptations basées sur les concepts à haut niveau d'abstraction
        let high_level_concepts: Vec<_> = concepts.iter()
            .filter(|c| matches!(c.level, super::abstraction::AbstractionLevel::High | super::abstraction::AbstractionLevel::VeryHigh))
            .collect();

        if !high_level_concepts.is_empty() {
            adaptations.push(format!(
                "{} abstract concepts may need domain-specific instantiation",
                high_level_concepts.len()
            ));
        }

        adaptations
    }

    /// Enregistre un transfert
    async fn record_transfer(&self, context: &AGIContext, result: &TransferResult) {
        let mut history = self.transfer_history.write().await;

        history.push(TransferRecord {
            source_domain: context.prior_knowledge.first()
                .cloned()
                .unwrap_or_else(|| "unknown".to_string()),
            target_domain: context.domain.clone(),
            success: result.success,
            items_transferred: result.transferred_items.len(),
            timestamp: Self::now(),
        });

        // Garder les 100 derniers enregistrements
        if history.len() > 100 {
            history.remove(0);
        }
    }

    /// Récupère l'historique des transferts
    pub async fn get_history(&self, limit: usize) -> Vec<(String, String, bool)> {
        let history = self.transfer_history.read().await;
        history.iter()
            .rev()
            .take(limit)
            .map(|r| (r.source_domain.clone(), r.target_domain.clone(), r.success))
            .collect()
    }

    /// Récupère le taux de succès des transferts
    pub async fn get_success_rate(&self) -> f32 {
        let history = self.transfer_history.read().await;

        if history.is_empty() {
            return 0.0;
        }

        let success_count = history.iter().filter(|r| r.success).count();
        success_count as f32 / history.len() as f32
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for TransferEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_transfer_engine_creation() {
        let engine = TransferEngine::new();
        let rate = engine.get_success_rate().await;
        assert_eq!(rate, 0.0); // No history yet
    }

    #[tokio::test]
    async fn test_apply_transfer() {
        let engine = TransferEngine::new();
        let context = AGIContext {
            domain: "machine_learning".to_string(),
            prior_knowledge: vec!["programming".to_string()],
            ..Default::default()
        };

        let concepts = vec![
            Concept {
                id: "1".to_string(),
                name: "algorithm".to_string(),
                description: "A step-by-step procedure".to_string(),
                confidence: 0.8,
                ..Default::default()
            }
        ];

        let result = engine.apply(&context, &concepts).await;
        assert!(!result.transferred_items.is_empty());
    }

    #[tokio::test]
    async fn test_empty_domain() {
        let engine = TransferEngine::new();
        let context = AGIContext::default();
        let concepts = Vec::new();

        let result = engine.apply(&context, &concepts).await;
        assert!(!result.warnings.is_empty());
    }
}
