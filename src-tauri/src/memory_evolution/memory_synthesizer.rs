// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — MEMORY SYNTHESIZER v∞
//   Distillation & Résumés hiérarchiques
//   CT → MT → LT → ELT → Core
// ═══════════════════════════════════════════════════════════════

use super::{MemoryEvolutionError, MemoryItem, MemoryLevel, MemoryType};
use log::info;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Résumé mémoire généré
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemorySummary {
    pub id: String,
    pub topic: String,
    pub summary: String,
    pub source_items: Vec<String>,
    pub source_level: MemoryLevel,
    pub target_level: MemoryLevel,
    pub confidence: f32,
    pub key_concepts: Vec<String>,
    pub created_at: String,
}

/// Résultat de synthèse
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SynthesisResult {
    pub summaries: Vec<MemorySummary>,
    pub promoted_items: Vec<MemoryItem>,
    pub distilled_essence: Option<MemoryEssence>,
    pub synthesis_stats: SynthesisStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SynthesisStats {
    pub items_processed: usize,
    pub summaries_created: usize,
    pub items_promoted: usize,
    pub compression_ratio: f32,
}

/// Essence distillée (niveau le plus haut)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEssence {
    pub id: String,
    pub core_insights: Vec<String>,
    pub learned_patterns: Vec<String>,
    pub key_knowledge: Vec<String>,
    pub confidence: f32,
    pub source_count: usize,
    pub created_at: String,
}

/// Memory Synthesizer Engine
pub struct MemorySynthesizer {
    config: SynthesizerConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SynthesizerConfig {
    /// Nombre minimum d'items pour créer un résumé
    pub min_items_for_summary: usize,
    /// Longueur maximale du résumé
    pub max_summary_length: usize,
    /// Seuil de confiance pour promotion
    pub promotion_confidence_threshold: f32,
    /// Ratio de compression cible
    pub target_compression_ratio: f32,
}

impl Default for SynthesizerConfig {
    fn default() -> Self {
        Self {
            min_items_for_summary: 3,
            max_summary_length: 500,
            promotion_confidence_threshold: 0.7,
            target_compression_ratio: 0.3,
        }
    }
}

impl MemorySynthesizer {
    pub fn new(config: SynthesizerConfig) -> Self {
        Self { config }
    }

    /// Génère des résumés hiérarchiques
    pub fn synthesize(
        &self,
        items: &[MemoryItem],
    ) -> Result<SynthesisResult, MemoryEvolutionError> {
        info!("[MemorySynthesizer] Synthesizing {} items...", items.len());

        let mut result = SynthesisResult {
            summaries: vec![],
            promoted_items: vec![],
            distilled_essence: None,
            synthesis_stats: SynthesisStats {
                items_processed: items.len(),
                summaries_created: 0,
                items_promoted: 0,
                compression_ratio: 0.0,
            },
        };

        // Grouper par topic
        let by_topic = self.group_by_topic(items);

        // Créer des résumés pour chaque groupe
        for (topic, group_items) in by_topic {
            if group_items.len() >= self.config.min_items_for_summary {
                if let Some(summary) = self.create_summary(&topic, &group_items)? {
                    result.summaries.push(summary);
                }
            }
        }

        // Promouvoir les items de haute confiance
        result.promoted_items = self.identify_promotable_items(items)?;

        // Distiller l'essence si assez de LT items
        let lt_items: Vec<_> = items
            .iter()
            .filter(|i| i.level == MemoryLevel::LT || i.level == MemoryLevel::ELT)
            .cloned()
            .collect();

        if lt_items.len() >= 10 {
            result.distilled_essence = Some(self.distill_essence(&lt_items)?);
        }

        // Calculer stats
        result.synthesis_stats.summaries_created = result.summaries.len();
        result.synthesis_stats.items_promoted = result.promoted_items.len();

        let original_size = items.iter().map(|i| i.content.len()).sum::<usize>();
        let summary_size = result
            .summaries
            .iter()
            .map(|s| s.summary.len())
            .sum::<usize>();
        result.synthesis_stats.compression_ratio = if original_size > 0 {
            summary_size as f32 / original_size as f32
        } else {
            0.0
        };

        info!(
            "[MemorySynthesizer] Created {} summaries, {} promoted, ratio: {:.2}",
            result.synthesis_stats.summaries_created,
            result.synthesis_stats.items_promoted,
            result.synthesis_stats.compression_ratio
        );

        Ok(result)
    }

    /// Groupe les items par topic
    fn group_by_topic(&self, items: &[MemoryItem]) -> HashMap<String, Vec<MemoryItem>> {
        let mut groups: HashMap<String, Vec<MemoryItem>> = HashMap::new();

        for item in items {
            let topic = item
                .topic
                .clone()
                .unwrap_or_else(|| "uncategorized".to_string());
            groups.entry(topic).or_default().push(item.clone());
        }

        groups
    }

    /// Crée un résumé pour un groupe d'items
    fn create_summary(
        &self,
        topic: &str,
        items: &[MemoryItem],
    ) -> Result<Option<MemorySummary>, MemoryEvolutionError> {
        if items.is_empty() {
            return Ok(None);
        }

        // Déterminer le niveau source dominant
        let source_level = self.get_dominant_level(items);

        // Niveau cible = niveau supérieur
        let target_level = match source_level {
            MemoryLevel::CT => MemoryLevel::MT,
            MemoryLevel::MT => MemoryLevel::LT,
            MemoryLevel::LT => MemoryLevel::ELT,
            MemoryLevel::ELT => MemoryLevel::Core,
            MemoryLevel::Core => MemoryLevel::Core,
        };

        // Extraire les concepts clés
        let key_concepts = self.extract_key_concepts(items);

        // Générer le résumé (simulation - en prod, utiliser Ollama)
        let summary = self.generate_summary_text(topic, items, &key_concepts);

        // Calculer la confiance moyenne
        let avg_confidence = items.iter().map(|i| i.confidence).sum::<f32>() / items.len() as f32;

        Ok(Some(MemorySummary {
            id: uuid::Uuid::new_v4().to_string(),
            topic: topic.to_string(),
            summary,
            source_items: items.iter().map(|i| i.id.clone()).collect(),
            source_level,
            target_level,
            confidence: avg_confidence,
            key_concepts,
            created_at: chrono::Utc::now().to_rfc3339(),
        }))
    }

    /// Détermine le niveau dominant dans un groupe
    fn get_dominant_level(&self, items: &[MemoryItem]) -> MemoryLevel {
        let mut counts: HashMap<MemoryLevel, usize> = HashMap::new();
        for item in items {
            *counts.entry(item.level).or_insert(0) += 1;
        }

        counts
            .into_iter()
            .max_by_key(|(_, count)| *count)
            .map(|(level, _)| level)
            .unwrap_or(MemoryLevel::CT)
    }

    /// Extrait les concepts clés des items
    fn extract_key_concepts(&self, items: &[MemoryItem]) -> Vec<String> {
        let mut concepts: HashMap<String, usize> = HashMap::new();

        for item in items {
            // Extraire les mots significatifs (simplifié)
            for word in item.content.split_whitespace() {
                let word_clean = word
                    .to_lowercase()
                    .trim_matches(|c: char| !c.is_alphanumeric())
                    .to_string();

                if word_clean.len() > 4 {
                    *concepts.entry(word_clean).or_insert(0) += 1;
                }
            }
        }

        // Garder les top concepts
        let mut sorted: Vec<_> = concepts.into_iter().collect();
        sorted.sort_by(|a, b| b.1.cmp(&a.1));

        sorted.into_iter().take(5).map(|(word, _)| word).collect()
    }

    /// Génère le texte du résumé
    fn generate_summary_text(
        &self,
        topic: &str,
        items: &[MemoryItem],
        concepts: &[String],
    ) -> String {
        // En production, cela appellerait Ollama pour un vrai résumé
        // Ici, on génère un résumé structuré simple

        let concepts_str = concepts.join(", ");
        let item_count = items.len();

        format!(
            "TITANE∞ a consolidé {} éléments sur le sujet '{}'. \
            Concepts clés identifiés: {}. \
            Cette synthèse représente une distillation cognitive \
            pour améliorer la cohérence mémoire.",
            item_count, topic, concepts_str
        )
    }

    /// Identifie les items qui peuvent être promus au niveau supérieur
    fn identify_promotable_items(
        &self,
        items: &[MemoryItem],
    ) -> Result<Vec<MemoryItem>, MemoryEvolutionError> {
        let mut promoted = Vec::new();

        for item in items {
            if item.confidence >= self.config.promotion_confidence_threshold
                && item.access_count > 0
                && item.level != MemoryLevel::Core
            {
                let mut promoted_item = item.clone();
                promoted_item.level = match item.level {
                    MemoryLevel::CT => MemoryLevel::MT,
                    MemoryLevel::MT => MemoryLevel::LT,
                    MemoryLevel::LT => MemoryLevel::ELT,
                    MemoryLevel::ELT => MemoryLevel::Core,
                    MemoryLevel::Core => MemoryLevel::Core,
                };
                promoted_item.updated_at = chrono::Utc::now().to_rfc3339();
                promoted.push(promoted_item);
            }
        }

        Ok(promoted)
    }

    /// Distille l'essence des mémoires long-terme
    fn distill_essence(
        &self,
        lt_items: &[MemoryItem],
    ) -> Result<MemoryEssence, MemoryEvolutionError> {
        info!(
            "[MemorySynthesizer] Distilling essence from {} LT items",
            lt_items.len()
        );

        // Extraire les insights principaux
        let core_insights: Vec<String> = lt_items
            .iter()
            .filter(|i| i.confidence > 0.8)
            .filter_map(|i| i.summary.clone())
            .take(5)
            .collect();

        // Extraire les patterns appris
        let learned_patterns: Vec<String> = lt_items
            .iter()
            .filter(|i| i.memory_type == MemoryType::Pattern)
            .map(|i| i.content.clone())
            .take(5)
            .collect();

        // Extraire les connaissances clés
        let key_knowledge: Vec<String> = lt_items
            .iter()
            .filter(|i| {
                i.memory_type == MemoryType::Factual || i.memory_type == MemoryType::Semantic
            })
            .filter(|i| i.importance > 0.7)
            .filter_map(|i| {
                i.summary
                    .clone()
                    .or_else(|| Some(i.content.chars().take(100).collect()))
            })
            .take(10)
            .collect();

        let avg_confidence =
            lt_items.iter().map(|i| i.confidence).sum::<f32>() / lt_items.len() as f32;

        Ok(MemoryEssence {
            id: uuid::Uuid::new_v4().to_string(),
            core_insights,
            learned_patterns,
            key_knowledge,
            confidence: avg_confidence,
            source_count: lt_items.len(),
            created_at: chrono::Utc::now().to_rfc3339(),
        })
    }

    /// Synthèse CT → MT
    pub fn synthesize_ct_to_mt(
        &self,
        ct_items: &[MemoryItem],
    ) -> Result<Vec<MemorySummary>, MemoryEvolutionError> {
        info!(
            "[MemorySynthesizer] CT → MT synthesis for {} items",
            ct_items.len()
        );

        let by_topic = self.group_by_topic(ct_items);
        let mut summaries = Vec::new();

        for (topic, items) in by_topic {
            if items.len() >= 2 {
                if let Some(mut summary) = self.create_summary(&topic, &items)? {
                    summary.source_level = MemoryLevel::CT;
                    summary.target_level = MemoryLevel::MT;
                    summaries.push(summary);
                }
            }
        }

        Ok(summaries)
    }

    /// Synthèse MT → LT
    pub fn synthesize_mt_to_lt(
        &self,
        mt_items: &[MemoryItem],
    ) -> Result<Vec<MemorySummary>, MemoryEvolutionError> {
        info!(
            "[MemorySynthesizer] MT → LT synthesis for {} items",
            mt_items.len()
        );

        let by_topic = self.group_by_topic(mt_items);
        let mut summaries = Vec::new();

        for (topic, items) in by_topic {
            if items.len() >= 3 {
                if let Some(mut summary) = self.create_summary(&topic, &items)? {
                    summary.source_level = MemoryLevel::MT;
                    summary.target_level = MemoryLevel::LT;
                    summaries.push(summary);
                }
            }
        }

        Ok(summaries)
    }
}

impl Default for MemorySynthesizer {
    fn default() -> Self {
        Self::new(SynthesizerConfig::default())
    }
}
