// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — MEMORY GROWTH ENGINE v∞
//   Évolution hiérarchique progressive
//   CT → MT → LT → ELT → Core Memory
// ═══════════════════════════════════════════════════════════════

use super::{MemoryEvolutionError, MemoryItem, MemoryLevel, MemoryType};
use log::info;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Résultat de croissance mémoire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrowthResult {
    pub growth_achieved: bool,
    pub levels_affected: Vec<MemoryLevel>,
    pub promotions: Vec<MemoryPromotion>,
    pub new_core_memories: Vec<MemoryItem>,
    pub stats: GrowthStats,
    pub growth_graph: GrowthGraph,
}

/// Promotion d'un item vers un niveau supérieur
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryPromotion {
    pub item_id: String,
    pub from_level: MemoryLevel,
    pub to_level: MemoryLevel,
    pub reason: String,
    pub confidence_delta: f32,
    pub timestamp: String,
}

/// Statistiques de croissance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrowthStats {
    pub items_before: HashMap<String, usize>,
    pub items_after: HashMap<String, usize>,
    pub promotions_count: usize,
    pub new_relationships: usize,
    pub core_memories_created: usize,
    pub growth_rate: f32,
}

/// Graphe de croissance mémoire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrowthGraph {
    pub nodes: Vec<GrowthNode>,
    pub edges: Vec<GrowthEdge>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrowthNode {
    pub id: String,
    pub level: MemoryLevel,
    pub label: String,
    pub size: usize, // Nombre d'items
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrowthEdge {
    pub from: String,
    pub to: String,
    pub weight: f32, // Force de la relation
    pub label: String,
}

/// Memory Growth Engine
pub struct MemoryGrowthEngine {
    config: GrowthConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrowthConfig {
    /// Seuil de confiance pour promotion
    pub promotion_confidence_threshold: f32,
    /// Seuil d'accès pour promotion
    pub promotion_access_threshold: u64,
    /// Seuil d'importance pour Core
    pub core_importance_threshold: f32,
    /// Limite d'items par niveau avant promotion forcée
    pub level_capacity: HashMap<String, usize>,
    /// Activer la création automatique de Core
    pub auto_core_creation: bool,
    /// Activer découverte de relations
    pub relationship_discovery: bool,
}

impl Default for GrowthConfig {
    fn default() -> Self {
        let mut capacity = HashMap::new();
        capacity.insert("CT".to_string(), 100);
        capacity.insert("MT".to_string(), 500);
        capacity.insert("LT".to_string(), 2000);
        capacity.insert("ELT".to_string(), 500);
        capacity.insert("Core".to_string(), 100);

        Self {
            promotion_confidence_threshold: 0.7,
            promotion_access_threshold: 3,
            core_importance_threshold: 0.85,
            level_capacity: capacity,
            auto_core_creation: true,
            relationship_discovery: true,
        }
    }
}

impl MemoryGrowthEngine {
    pub fn new(config: GrowthConfig) -> Self {
        Self { config }
    }

    /// Exécute un cycle de croissance mémoire
    pub fn grow(&self, items: &mut Vec<MemoryItem>) -> Result<GrowthResult, MemoryEvolutionError> {
        info!(
            "[MemoryGrowth] Starting growth cycle for {} items",
            items.len()
        );

        let items_before = self.count_by_level(items);

        // Identifier les promotions
        let promotions = self.identify_promotions(items)?;

        // Appliquer les promotions
        for promotion in &promotions {
            self.apply_promotion(items, promotion)?;
        }

        // Créer les Core Memories si configuré
        let new_core = if self.config.auto_core_creation {
            self.create_core_memories(items)?
        } else {
            vec![]
        };

        // Découvrir les nouvelles relations
        let relationships = if self.config.relationship_discovery {
            self.discover_relationships(items)?
        } else {
            0
        };

        // Générer le graphe de croissance
        let growth_graph = self.build_growth_graph(items);

        let items_after = self.count_by_level(items);

        // Calculer le taux de croissance
        let total_before: usize = items_before.values().sum();
        let total_after: usize = items_after.values().sum();
        let growth_rate = if total_before > 0 {
            (total_after as f32 - total_before as f32) / total_before as f32
        } else {
            0.0
        };

        let levels_affected: Vec<MemoryLevel> = promotions
            .iter()
            .flat_map(|p| vec![p.from_level, p.to_level])
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect();

        let result = GrowthResult {
            growth_achieved: !promotions.is_empty() || !new_core.is_empty(),
            levels_affected,
            promotions: promotions.clone(),
            new_core_memories: new_core.clone(),
            stats: GrowthStats {
                items_before,
                items_after,
                promotions_count: promotions.len(),
                new_relationships: relationships,
                core_memories_created: new_core.len(),
                growth_rate,
            },
            growth_graph,
        };

        info!(
            "[MemoryGrowth] Growth complete: {} promotions, {} new core, rate={:.2}%",
            promotions.len(),
            new_core.len(),
            growth_rate * 100.0
        );

        Ok(result)
    }

    /// Compte les items par niveau
    fn count_by_level(&self, items: &[MemoryItem]) -> HashMap<String, usize> {
        let mut counts = HashMap::new();
        counts.insert("CT".to_string(), 0);
        counts.insert("MT".to_string(), 0);
        counts.insert("LT".to_string(), 0);
        counts.insert("ELT".to_string(), 0);
        counts.insert("Core".to_string(), 0);

        for item in items {
            let level_str = format!("{:?}", item.level);
            *counts.entry(level_str).or_insert(0) += 1;
        }

        counts
    }

    /// Identifie les items éligibles à la promotion
    fn identify_promotions(
        &self,
        items: &[MemoryItem],
    ) -> Result<Vec<MemoryPromotion>, MemoryEvolutionError> {
        let mut promotions = Vec::new();

        for item in items {
            if item.level == MemoryLevel::Core {
                continue; // Déjà au niveau max
            }

            let should_promote = self.should_promote(item, items);

            if should_promote {
                let to_level = match item.level {
                    MemoryLevel::CT => MemoryLevel::MT,
                    MemoryLevel::MT => MemoryLevel::LT,
                    MemoryLevel::LT => MemoryLevel::ELT,
                    MemoryLevel::ELT => MemoryLevel::Core,
                    MemoryLevel::Core => MemoryLevel::Core,
                };

                let reason = self.get_promotion_reason(item);

                promotions.push(MemoryPromotion {
                    item_id: item.id.clone(),
                    from_level: item.level,
                    to_level,
                    reason,
                    confidence_delta: 0.05, // Boost de confiance
                    timestamp: chrono::Utc::now().to_rfc3339(),
                });
            }
        }

        Ok(promotions)
    }

    /// Détermine si un item doit être promu
    fn should_promote(&self, item: &MemoryItem, _all_items: &[MemoryItem]) -> bool {
        // Critères de promotion
        let high_confidence = item.confidence >= self.config.promotion_confidence_threshold;
        let high_access = item.access_count >= self.config.promotion_access_threshold;
        let high_importance = item.importance >= 0.6;
        let has_summary = item.summary.is_some();

        match item.level {
            MemoryLevel::CT => high_confidence && (high_access || high_importance),
            MemoryLevel::MT => high_confidence && high_access && has_summary,
            MemoryLevel::LT => high_confidence && high_importance && has_summary,
            MemoryLevel::ELT => {
                item.importance >= self.config.core_importance_threshold && high_confidence
            }
            MemoryLevel::Core => false,
        }
    }

    /// Génère la raison de promotion
    fn get_promotion_reason(&self, item: &MemoryItem) -> String {
        let mut reasons = Vec::new();

        if item.confidence >= self.config.promotion_confidence_threshold {
            reasons.push("haute confiance");
        }
        if item.access_count >= self.config.promotion_access_threshold {
            reasons.push("accès fréquent");
        }
        if item.importance >= 0.7 {
            reasons.push("haute importance");
        }
        if item.summary.is_some() {
            reasons.push("résumé disponible");
        }

        format!("Promotion due à: {}", reasons.join(", "))
    }

    /// Applique une promotion
    fn apply_promotion(
        &self,
        items: &mut Vec<MemoryItem>,
        promotion: &MemoryPromotion,
    ) -> Result<(), MemoryEvolutionError> {
        if let Some(item) = items.iter_mut().find(|i| i.id == promotion.item_id) {
            item.level = promotion.to_level;
            item.confidence = (item.confidence + promotion.confidence_delta).min(1.0);
            item.updated_at = chrono::Utc::now().to_rfc3339();
        }
        Ok(())
    }

    /// Crée des Core Memories à partir des ELT de haute qualité
    fn create_core_memories(
        &self,
        items: &mut Vec<MemoryItem>,
    ) -> Result<Vec<MemoryItem>, MemoryEvolutionError> {
        let mut new_core = Vec::new();

        // Trouver les ELT éligibles pour devenir Core
        let elt_items: Vec<_> = items
            .iter()
            .filter(|i| i.level == MemoryLevel::ELT)
            .filter(|i| i.importance >= self.config.core_importance_threshold)
            .filter(|i| i.confidence >= 0.9)
            .cloned()
            .collect();

        // Grouper par topic pour distillation
        let mut by_topic: HashMap<String, Vec<MemoryItem>> = HashMap::new();
        for item in elt_items {
            let topic = item.topic.clone().unwrap_or_else(|| "general".to_string());
            by_topic.entry(topic).or_default().push(item);
        }

        // Créer un Core Memory par groupe significatif
        for (topic, group) in by_topic {
            if group.len() >= 2 {
                let core_item = self.distill_to_core(&topic, &group)?;
                new_core.push(core_item.clone());
                items.push(core_item);
            }
        }

        Ok(new_core)
    }

    /// Distille un groupe en Core Memory
    fn distill_to_core(
        &self,
        topic: &str,
        items: &[MemoryItem],
    ) -> Result<MemoryItem, MemoryEvolutionError> {
        // Créer un résumé essence
        let summaries: Vec<_> = items.iter().filter_map(|i| i.summary.clone()).collect();

        let essence = if summaries.is_empty() {
            items
                .iter()
                .map(|i| i.content.chars().take(100).collect::<String>())
                .collect::<Vec<_>>()
                .join(" | ")
        } else {
            summaries.join(" ⟨⟩ ")
        };

        let avg_confidence = items.iter().map(|i| i.confidence).sum::<f32>() / items.len() as f32;
        let max_importance = items
            .iter()
            .map(|i| i.importance)
            .fold(0.0f32, |a, b| a.max(b));

        Ok(MemoryItem {
            id: format!("core-{}", uuid::Uuid::new_v4().to_string()[..8].to_string()),
            level: MemoryLevel::Core,
            memory_type: MemoryType::Meta,
            content: format!(
                "[CORE MEMORY] Topic: {} | Essence distillée de {} items ELT",
                topic,
                items.len()
            ),
            summary: Some(essence),
            topic: Some(topic.to_string()),
            cluster_id: None,
            confidence: avg_confidence.min(0.95),
            importance: max_importance.max(0.9),
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
            access_count: 0,
            last_accessed: None,
            vector_id: None,
            compressed: false,
            metadata: {
                let mut meta = HashMap::new();
                meta.insert(
                    "source_items".to_string(),
                    serde_json::json!(items.iter().map(|i| i.id.clone()).collect::<Vec<_>>()),
                );
                meta.insert(
                    "distillation_method".to_string(),
                    serde_json::json!("summary_merge"),
                );
                meta
            },
        })
    }

    /// Découvre les relations entre items
    fn discover_relationships(&self, items: &[MemoryItem]) -> Result<usize, MemoryEvolutionError> {
        let mut relationships_found = 0;

        // Grouper par topic
        let mut by_topic: HashMap<String, Vec<&MemoryItem>> = HashMap::new();
        for item in items {
            if let Some(topic) = &item.topic {
                by_topic.entry(topic.clone()).or_default().push(item);
            }
        }

        // Compter les relations intra-topic
        for (_, group) in by_topic {
            if group.len() > 1 {
                relationships_found += group.len() * (group.len() - 1) / 2;
            }
        }

        Ok(relationships_found)
    }

    /// Construit le graphe de croissance
    fn build_growth_graph(&self, items: &[MemoryItem]) -> GrowthGraph {
        let mut nodes = Vec::new();
        let mut edges = Vec::new();

        // Nœuds par niveau
        let counts = self.count_by_level(items);

        for level in [
            MemoryLevel::CT,
            MemoryLevel::MT,
            MemoryLevel::LT,
            MemoryLevel::ELT,
            MemoryLevel::Core,
        ] {
            let level_str = format!("{:?}", level);
            let size = counts.get(&level_str).copied().unwrap_or(0);

            nodes.push(GrowthNode {
                id: level_str.clone(),
                level,
                label: format!("{} ({})", level_str, size),
                size,
            });
        }

        // Edges entre niveaux
        let level_pairs = [
            (MemoryLevel::CT, MemoryLevel::MT),
            (MemoryLevel::MT, MemoryLevel::LT),
            (MemoryLevel::LT, MemoryLevel::ELT),
            (MemoryLevel::ELT, MemoryLevel::Core),
        ];

        for (from, to) in level_pairs {
            let from_str = format!("{:?}", from);
            let to_str = format!("{:?}", to);
            let from_count = counts.get(&from_str).copied().unwrap_or(0);
            let to_count = counts.get(&to_str).copied().unwrap_or(0);

            let weight = if from_count > 0 {
                to_count as f32 / from_count as f32
            } else {
                0.0
            };

            edges.push(GrowthEdge {
                from: from_str,
                to: to_str,
                weight,
                label: format!("{:.0}%", weight * 100.0),
            });
        }

        GrowthGraph { nodes, edges }
    }

    /// Évalue la santé de la hiérarchie mémoire
    pub fn evaluate_hierarchy_health(&self, items: &[MemoryItem]) -> HierarchyHealth {
        let counts = self.count_by_level(items);

        let ct = *counts.get("CT").unwrap_or(&0);
        let mt = *counts.get("MT").unwrap_or(&0);
        let lt = *counts.get("LT").unwrap_or(&0);
        let elt = *counts.get("ELT").unwrap_or(&0);
        let core = *counts.get("Core").unwrap_or(&0);

        // Ratios idéaux approximatifs
        let ct_mt_ratio = if mt > 0 { ct as f32 / mt as f32 } else { 0.0 };
        let mt_lt_ratio = if lt > 0 { mt as f32 / lt as f32 } else { 0.0 };

        let is_balanced =
            ct_mt_ratio < 5.0 && ct_mt_ratio > 0.2 && mt_lt_ratio < 3.0 && mt_lt_ratio > 0.1;

        let health_score = if is_balanced { 0.9 } else { 0.6 };

        let recommendations = if !is_balanced {
            vec![
                if ct_mt_ratio > 5.0 {
                    Some("Trop de CT, augmenter synthèse vers MT")
                } else {
                    None
                },
                if ct_mt_ratio < 0.2 {
                    Some("Peu de CT, vérifier entrée de données")
                } else {
                    None
                },
                if mt_lt_ratio > 3.0 {
                    Some("Trop de MT, promouvoir vers LT")
                } else {
                    None
                },
                if core == 0 && elt > 5 {
                    Some("Créer des Core Memories depuis ELT")
                } else {
                    None
                },
            ]
            .into_iter()
            .flatten()
            .map(String::from)
            .collect()
        } else {
            vec!["Hiérarchie mémoire équilibrée".to_string()]
        };

        HierarchyHealth {
            is_balanced,
            health_score,
            level_distribution: counts,
            recommendations,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HierarchyHealth {
    pub is_balanced: bool,
    pub health_score: f32,
    pub level_distribution: HashMap<String, usize>,
    pub recommendations: Vec<String>,
}

impl Default for MemoryGrowthEngine {
    fn default() -> Self {
        Self::new(GrowthConfig::default())
    }
}
