// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — MEMORY PARSER v∞
//   Analyse des mémoires CT/MT/LT
//   Détection incohérences, redondances, anomalies
// ═══════════════════════════════════════════════════════════════

use super::{MemoryEvolutionError, MemoryItem, MemoryLevel};
use log::{info, warn};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Résultat du parsing mémoire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryParseResult {
    pub ct_items: Vec<MemoryItem>,
    pub mt_items: Vec<MemoryItem>,
    pub lt_items: Vec<MemoryItem>,
    pub elt_items: Vec<MemoryItem>,
    pub core_items: Vec<MemoryItem>,
    pub anomalies: Vec<MemoryAnomaly>,
    pub redundancy_map: HashMap<String, Vec<String>>,
    pub cognitive_load: CognitiveLoadMetrics,
    pub confusion_pockets: Vec<ConfusionPocket>,
    pub parse_timestamp: String,
}

impl Default for MemoryParseResult {
    fn default() -> Self {
        Self {
            ct_items: vec![],
            mt_items: vec![],
            lt_items: vec![],
            elt_items: vec![],
            core_items: vec![],
            anomalies: vec![],
            redundancy_map: HashMap::new(),
            cognitive_load: CognitiveLoadMetrics::default(),
            confusion_pockets: vec![],
            parse_timestamp: chrono::Utc::now().to_rfc3339(),
        }
    }
}

/// Anomalie détectée dans la mémoire
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryAnomaly {
    pub id: String,
    pub anomaly_type: AnomalyType,
    pub severity: f32,
    pub affected_items: Vec<String>,
    pub description: String,
    pub suggested_action: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AnomalyType {
    NullContent,
    EmptyContent,
    Inconsistency,
    Redundancy,
    Corruption,
    OrphanReference,
    CircularReference,
    OverloadedCluster,
    LowConfidence,
    Stale,
}

/// Métriques de charge cognitive
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveLoadMetrics {
    pub total_items: usize,
    pub ct_load: f32,
    pub mt_load: f32,
    pub lt_load: f32,
    pub overload_threshold: f32,
    pub is_overloaded: bool,
    pub fragmentation_index: f32,
}

impl Default for CognitiveLoadMetrics {
    fn default() -> Self {
        Self {
            total_items: 0,
            ct_load: 0.0,
            mt_load: 0.0,
            lt_load: 0.0,
            overload_threshold: 0.8,
            is_overloaded: false,
            fragmentation_index: 0.0,
        }
    }
}

/// Poche de confusion détectée
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfusionPocket {
    pub id: String,
    pub topic: String,
    pub conflicting_items: Vec<String>,
    pub confusion_score: f32,
    pub resolution_hint: String,
}

/// Memory Parser Engine
pub struct MemoryParser {
    config: ParserConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParserConfig {
    pub similarity_threshold: f32,
    pub stale_days: u64,
    pub min_confidence: f32,
    pub max_ct_items: usize,
    pub max_mt_items: usize,
}

impl Default for ParserConfig {
    fn default() -> Self {
        Self {
            similarity_threshold: 0.85,
            stale_days: 30,
            min_confidence: 0.3,
            max_ct_items: 100,
            max_mt_items: 500,
        }
    }
}

impl MemoryParser {
    pub fn new(config: ParserConfig) -> Self {
        Self { config }
    }

    /// Parse toutes les mémoires et produit un résultat d'analyse
    pub fn parse(&self, items: &[MemoryItem]) -> Result<MemoryParseResult, MemoryEvolutionError> {
        info!("[MemoryParser] Parsing {} items...", items.len());

        let mut result = MemoryParseResult::default();

        // Classifier par niveau
        for item in items {
            match item.level {
                MemoryLevel::CT => result.ct_items.push(item.clone()),
                MemoryLevel::MT => result.mt_items.push(item.clone()),
                MemoryLevel::LT => result.lt_items.push(item.clone()),
                MemoryLevel::ELT => result.elt_items.push(item.clone()),
                MemoryLevel::Core => result.core_items.push(item.clone()),
            }
        }

        // Détecter anomalies
        result.anomalies = self.detect_anomalies(items)?;

        // Détecter redondances
        result.redundancy_map = self.detect_redundancies(items)?;

        // Calculer charge cognitive
        result.cognitive_load = self.calculate_cognitive_load(&result);

        // Détecter poches de confusion
        result.confusion_pockets = self.detect_confusion_pockets(items)?;

        info!(
            "[MemoryParser] Parse complete: {} CT, {} MT, {} LT, {} anomalies",
            result.ct_items.len(),
            result.mt_items.len(),
            result.lt_items.len(),
            result.anomalies.len()
        );

        Ok(result)
    }

    /// Détecte les anomalies dans les items mémoire
    fn detect_anomalies(&self, items: &[MemoryItem]) -> Result<Vec<MemoryAnomaly>, MemoryEvolutionError> {
        let mut anomalies = Vec::new();

        for item in items {
            // Null/Empty content
            if item.content.is_empty() {
                anomalies.push(MemoryAnomaly {
                    id: uuid::Uuid::new_v4().to_string(),
                    anomaly_type: AnomalyType::EmptyContent,
                    severity: 0.8,
                    affected_items: vec![item.id.clone()],
                    description: "Memory item has empty content".to_string(),
                    suggested_action: "Remove or populate content".to_string(),
                });
            }

            // Low confidence
            if item.confidence < self.config.min_confidence {
                anomalies.push(MemoryAnomaly {
                    id: uuid::Uuid::new_v4().to_string(),
                    anomaly_type: AnomalyType::LowConfidence,
                    severity: 0.5,
                    affected_items: vec![item.id.clone()],
                    description: format!("Memory item has low confidence: {:.2}", item.confidence),
                    suggested_action: "Review and validate or remove".to_string(),
                });
            }

            // Stale check
            if let Ok(created) = chrono::DateTime::parse_from_rfc3339(&item.created_at) {
                let age_days = (chrono::Utc::now() - created.with_timezone(&chrono::Utc)).num_days();
                if age_days > self.config.stale_days as i64 && item.access_count == 0 {
                    anomalies.push(MemoryAnomaly {
                        id: uuid::Uuid::new_v4().to_string(),
                        anomaly_type: AnomalyType::Stale,
                        severity: 0.4,
                        affected_items: vec![item.id.clone()],
                        description: format!("Memory item is {} days old with no access", age_days),
                        suggested_action: "Consider archiving or removing".to_string(),
                    });
                }
            }
        }

        Ok(anomalies)
    }

    /// Détecte les redondances entre items
    fn detect_redundancies(&self, items: &[MemoryItem]) -> Result<HashMap<String, Vec<String>>, MemoryEvolutionError> {
        let mut redundancy_map: HashMap<String, Vec<String>> = HashMap::new();
        let mut seen_hashes: HashMap<u64, Vec<String>> = HashMap::new();

        for item in items {
            // Hash simple du contenu
            let hash = self.simple_hash(&item.content);

            seen_hashes
                .entry(hash)
                .or_default()
                .push(item.id.clone());
        }

        // Identifier les groupes redondants
        for (hash, ids) in seen_hashes {
            if ids.len() > 1 {
                let key = format!("redundancy_{}", hash);
                redundancy_map.insert(key, ids);
            }
        }

        if !redundancy_map.is_empty() {
            warn!("[MemoryParser] Found {} redundancy groups", redundancy_map.len());
        }

        Ok(redundancy_map)
    }

    /// Calcule les métriques de charge cognitive
    fn calculate_cognitive_load(&self, result: &MemoryParseResult) -> CognitiveLoadMetrics {
        let total = result.ct_items.len() + result.mt_items.len() + result.lt_items.len();

        let ct_load = result.ct_items.len() as f32 / self.config.max_ct_items as f32;
        let mt_load = result.mt_items.len() as f32 / self.config.max_mt_items as f32;
        let lt_load = result.lt_items.len() as f32 / 1000.0; // LT has higher limit

        let avg_load = (ct_load + mt_load + lt_load) / 3.0;

        // Fragmentation = ratio d'items sans cluster
        let unclustered = result.ct_items.iter()
            .chain(result.mt_items.iter())
            .chain(result.lt_items.iter())
            .filter(|i| i.cluster_id.is_none())
            .count();
        let fragmentation = if total > 0 { unclustered as f32 / total as f32 } else { 0.0 };

        CognitiveLoadMetrics {
            total_items: total,
            ct_load,
            mt_load,
            lt_load,
            overload_threshold: 0.8,
            is_overloaded: avg_load > 0.8,
            fragmentation_index: fragmentation,
        }
    }

    /// Détecte les poches de confusion (items contradictoires)
    fn detect_confusion_pockets(&self, items: &[MemoryItem]) -> Result<Vec<ConfusionPocket>, MemoryEvolutionError> {
        let mut pockets = Vec::new();

        // Grouper par topic
        let mut by_topic: HashMap<String, Vec<&MemoryItem>> = HashMap::new();
        for item in items {
            if let Some(topic) = &item.topic {
                by_topic.entry(topic.clone()).or_default().push(item);
            }
        }

        // Chercher les conflits dans chaque groupe
        for (topic, group) in by_topic {
            if group.len() > 1 {
                // Vérifier si les confidences sont très différentes
                let confidences: Vec<f32> = group.iter().map(|i| i.confidence).collect();
                let variance = self.calculate_variance(&confidences);

                if variance > 0.2 {
                    pockets.push(ConfusionPocket {
                        id: uuid::Uuid::new_v4().to_string(),
                        topic: topic.clone(),
                        conflicting_items: group.iter().map(|i| i.id.clone()).collect(),
                        confusion_score: variance,
                        resolution_hint: "Consolidate memories with varying confidence levels".to_string(),
                    });
                }
            }
        }

        Ok(pockets)
    }

    fn simple_hash(&self, content: &str) -> u64 {
        use std::hash::{Hash, Hasher};
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        content.to_lowercase().trim().hash(&mut hasher);
        hasher.finish()
    }

    fn calculate_variance(&self, values: &[f32]) -> f32 {
        if values.is_empty() {
            return 0.0;
        }
        let mean = values.iter().sum::<f32>() / values.len() as f32;
        let variance = values.iter().map(|v| (v - mean).powi(2)).sum::<f32>() / values.len() as f32;
        variance.sqrt()
    }
}

impl Default for MemoryParser {
    fn default() -> Self {
        Self::new(ParserConfig::default())
    }
}
