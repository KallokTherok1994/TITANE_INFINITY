// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — MEMORY PATTERNS v∞
//   Extraction de patterns cognitifs
//   Reconnaissance comportements, erreurs, forces
// ═══════════════════════════════════════════════════════════════

use super::{MemoryEvolutionError, MemoryItem, MemoryLevel, MemoryType};
use log::info;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Pattern cognitif détecté
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryPattern {
    pub id: String,
    pub pattern_type: PatternType,
    pub name: String,
    pub description: String,
    pub trigger: String,
    pub action: String,
    pub confidence: f32,
    pub occurrences: usize,
    pub affected_items: Vec<String>,
    pub first_seen: String,
    pub last_seen: String,
    pub is_positive: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PatternType {
    /// Pattern répétitif
    Repetitive,
    /// Comportement cognitif
    Behavioral,
    /// Erreur récurrente
    RecurrentError,
    /// Lacune identifiée
    Gap,
    /// Force détectée
    Strength,
    /// Évolution observée
    Evolution,
    /// Sujet récurrent
    RecurrentTopic,
    /// Succès Self-Healing
    SelfHealSuccess,
    /// Confusion contextuelle
    ContextConfusion,
}

/// Résultat d'extraction de patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternExtractionResult {
    pub patterns: Vec<MemoryPattern>,
    pub stats: PatternStats,
    pub recommendations: Vec<PatternRecommendation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternStats {
    pub total_patterns: usize,
    pub positive_patterns: usize,
    pub negative_patterns: usize,
    pub high_confidence_patterns: usize,
    pub patterns_by_type: HashMap<String, usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternRecommendation {
    pub pattern_id: String,
    pub recommendation: String,
    pub priority: RecommendationPriority,
    pub expected_impact: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RecommendationPriority {
    Critical,
    High,
    Medium,
    Low,
}

/// Memory Pattern Extractor
pub struct MemoryPatternExtractor {
    config: PatternConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternConfig {
    /// Minimum d'occurrences pour détecter un pattern
    pub min_occurrences: usize,
    /// Seuil de confiance minimum
    pub min_confidence: f32,
    /// Activer détection des patterns négatifs
    pub detect_negative: bool,
    /// Activer détection des patterns positifs
    pub detect_positive: bool,
    /// Fenêtre temporelle pour patterns (jours)
    pub time_window_days: u64,
}

impl Default for PatternConfig {
    fn default() -> Self {
        Self {
            min_occurrences: 2,
            min_confidence: 0.5,
            detect_negative: true,
            detect_positive: true,
            time_window_days: 30,
        }
    }
}

impl MemoryPatternExtractor {
    pub fn new(config: PatternConfig) -> Self {
        Self { config }
    }

    /// Extrait tous les patterns des mémoires
    pub fn extract_patterns(&self, items: &[MemoryItem]) -> Result<PatternExtractionResult, MemoryEvolutionError> {
        info!("[MemoryPatterns] Extracting patterns from {} items", items.len());

        let mut all_patterns = Vec::new();

        // Détecter différents types de patterns
        all_patterns.extend(self.detect_repetitive_patterns(items)?);
        all_patterns.extend(self.detect_behavioral_patterns(items)?);
        all_patterns.extend(self.detect_recurrent_errors(items)?);
        all_patterns.extend(self.detect_gaps(items)?);
        all_patterns.extend(self.detect_strengths(items)?);
        all_patterns.extend(self.detect_topic_patterns(items)?);
        all_patterns.extend(self.detect_context_confusion(items)?);

        // Filtrer par confiance
        all_patterns.retain(|p| p.confidence >= self.config.min_confidence);

        // Calculer les stats
        let stats = self.calculate_stats(&all_patterns);

        // Générer des recommandations
        let recommendations = self.generate_recommendations(&all_patterns);

        info!("[MemoryPatterns] Extracted {} patterns", all_patterns.len());

        Ok(PatternExtractionResult {
            patterns: all_patterns,
            stats,
            recommendations,
        })
    }

    /// Détecte les patterns répétitifs
    fn detect_repetitive_patterns(&self, items: &[MemoryItem]) -> Result<Vec<MemoryPattern>, MemoryEvolutionError> {
        let mut patterns = Vec::new();
        let mut content_hash_count: HashMap<u64, Vec<&MemoryItem>> = HashMap::new();

        for item in items {
            let hash = self.simple_hash(&item.content);
            content_hash_count.entry(hash).or_default().push(item);
        }

        for (_, group) in content_hash_count {
            if group.len() >= self.config.min_occurrences {
                patterns.push(MemoryPattern {
                    id: uuid::Uuid::new_v4().to_string(),
                    pattern_type: PatternType::Repetitive,
                    name: "Contenu répétitif".to_string(),
                    description: format!("{} items avec contenu similaire détectés", group.len()),
                    trigger: "duplicate_content".to_string(),
                    action: "consolidate_or_deduplicate".to_string(),
                    confidence: 0.9,
                    occurrences: group.len(),
                    affected_items: group.iter().map(|i| i.id.clone()).collect(),
                    first_seen: group.first().map(|i| i.created_at.clone()).unwrap_or_default(),
                    last_seen: group.last().map(|i| i.created_at.clone()).unwrap_or_default(),
                    is_positive: false,
                });
            }
        }

        Ok(patterns)
    }

    /// Détecte les patterns comportementaux
    fn detect_behavioral_patterns(&self, items: &[MemoryItem]) -> Result<Vec<MemoryPattern>, MemoryEvolutionError> {
        let mut patterns = Vec::new();

        // Pattern: accès fréquent
        let high_access: Vec<_> = items.iter()
            .filter(|i| i.access_count > 5)
            .collect();

        if high_access.len() >= self.config.min_occurrences {
            patterns.push(MemoryPattern {
                id: uuid::Uuid::new_v4().to_string(),
                pattern_type: PatternType::Behavioral,
                name: "Accès fréquent".to_string(),
                description: format!("{} items consultés fréquemment", high_access.len()),
                trigger: "high_access_count".to_string(),
                action: "promote_to_higher_level".to_string(),
                confidence: 0.85,
                occurrences: high_access.len(),
                affected_items: high_access.iter().map(|i| i.id.clone()).collect(),
                first_seen: chrono::Utc::now().to_rfc3339(),
                last_seen: chrono::Utc::now().to_rfc3339(),
                is_positive: true,
            });
        }

        // Pattern: haute importance
        let high_importance: Vec<_> = items.iter()
            .filter(|i| i.importance > 0.8)
            .collect();

        if high_importance.len() >= 3 {
            patterns.push(MemoryPattern {
                id: uuid::Uuid::new_v4().to_string(),
                pattern_type: PatternType::Strength,
                name: "Contenu à haute importance".to_string(),
                description: format!("{} items marqués comme très importants", high_importance.len()),
                trigger: "high_importance_score".to_string(),
                action: "ensure_persistence".to_string(),
                confidence: 0.9,
                occurrences: high_importance.len(),
                affected_items: high_importance.iter().map(|i| i.id.clone()).collect(),
                first_seen: chrono::Utc::now().to_rfc3339(),
                last_seen: chrono::Utc::now().to_rfc3339(),
                is_positive: true,
            });
        }

        Ok(patterns)
    }

    /// Détecte les erreurs récurrentes
    fn detect_recurrent_errors(&self, items: &[MemoryItem]) -> Result<Vec<MemoryPattern>, MemoryEvolutionError> {
        let mut patterns = Vec::new();

        // Pattern: basse confiance récurrente
        let low_confidence: Vec<_> = items.iter()
            .filter(|i| i.confidence < 0.4)
            .collect();

        if low_confidence.len() >= self.config.min_occurrences {
            patterns.push(MemoryPattern {
                id: uuid::Uuid::new_v4().to_string(),
                pattern_type: PatternType::RecurrentError,
                name: "Confiance systémique faible".to_string(),
                description: format!("{} items avec confiance < 0.4", low_confidence.len()),
                trigger: "low_confidence_pattern".to_string(),
                action: "review_and_validate".to_string(),
                confidence: 0.8,
                occurrences: low_confidence.len(),
                affected_items: low_confidence.iter().map(|i| i.id.clone()).collect(),
                first_seen: chrono::Utc::now().to_rfc3339(),
                last_seen: chrono::Utc::now().to_rfc3339(),
                is_positive: false,
            });
        }

        // Pattern: items sans topic
        let no_topic: Vec<_> = items.iter()
            .filter(|i| i.topic.is_none())
            .collect();

        if no_topic.len() >= 5 {
            patterns.push(MemoryPattern {
                id: uuid::Uuid::new_v4().to_string(),
                pattern_type: PatternType::Gap,
                name: "Catégorisation manquante".to_string(),
                description: format!("{} items sans topic assigné", no_topic.len()),
                trigger: "missing_topic".to_string(),
                action: "auto_categorize".to_string(),
                confidence: 0.75,
                occurrences: no_topic.len(),
                affected_items: no_topic.iter().map(|i| i.id.clone()).collect(),
                first_seen: chrono::Utc::now().to_rfc3339(),
                last_seen: chrono::Utc::now().to_rfc3339(),
                is_positive: false,
            });
        }

        Ok(patterns)
    }

    /// Détecte les lacunes
    fn detect_gaps(&self, items: &[MemoryItem]) -> Result<Vec<MemoryPattern>, MemoryEvolutionError> {
        let mut patterns = Vec::new();

        // Gap: items sans résumé
        let no_summary: Vec<_> = items.iter()
            .filter(|i| i.summary.is_none() && i.content.len() > 200)
            .collect();

        if no_summary.len() >= 3 {
            patterns.push(MemoryPattern {
                id: uuid::Uuid::new_v4().to_string(),
                pattern_type: PatternType::Gap,
                name: "Résumés manquants".to_string(),
                description: format!("{} items longs sans résumé", no_summary.len()),
                trigger: "missing_summary".to_string(),
                action: "generate_summaries".to_string(),
                confidence: 0.7,
                occurrences: no_summary.len(),
                affected_items: no_summary.iter().map(|i| i.id.clone()).collect(),
                first_seen: chrono::Utc::now().to_rfc3339(),
                last_seen: chrono::Utc::now().to_rfc3339(),
                is_positive: false,
            });
        }

        // Gap: déséquilibre des niveaux
        let ct_count = items.iter().filter(|i| i.level == MemoryLevel::CT).count();
        let lt_count = items.iter().filter(|i| i.level == MemoryLevel::LT).count();

        if ct_count > lt_count * 5 {
            patterns.push(MemoryPattern {
                id: uuid::Uuid::new_v4().to_string(),
                pattern_type: PatternType::Gap,
                name: "Déséquilibre CT/LT".to_string(),
                description: format!("Trop de CT ({}) par rapport à LT ({})", ct_count, lt_count),
                trigger: "level_imbalance".to_string(),
                action: "promote_and_synthesize".to_string(),
                confidence: 0.8,
                occurrences: ct_count,
                affected_items: vec![],
                first_seen: chrono::Utc::now().to_rfc3339(),
                last_seen: chrono::Utc::now().to_rfc3339(),
                is_positive: false,
            });
        }

        Ok(patterns)
    }

    /// Détecte les forces
    fn detect_strengths(&self, items: &[MemoryItem]) -> Result<Vec<MemoryPattern>, MemoryEvolutionError> {
        let mut patterns = Vec::new();

        // Force: items pattern type
        let pattern_items: Vec<_> = items.iter()
            .filter(|i| i.memory_type == MemoryType::Pattern)
            .collect();

        if pattern_items.len() >= 3 {
            patterns.push(MemoryPattern {
                id: uuid::Uuid::new_v4().to_string(),
                pattern_type: PatternType::Strength,
                name: "Apprentissage de patterns".to_string(),
                description: format!("{} patterns cognitifs appris", pattern_items.len()),
                trigger: "learned_patterns".to_string(),
                action: "reinforce_and_apply".to_string(),
                confidence: 0.85,
                occurrences: pattern_items.len(),
                affected_items: pattern_items.iter().map(|i| i.id.clone()).collect(),
                first_seen: chrono::Utc::now().to_rfc3339(),
                last_seen: chrono::Utc::now().to_rfc3339(),
                is_positive: true,
            });
        }

        Ok(patterns)
    }

    /// Détecte les sujets récurrents
    fn detect_topic_patterns(&self, items: &[MemoryItem]) -> Result<Vec<MemoryPattern>, MemoryEvolutionError> {
        let mut patterns = Vec::new();
        let mut topic_count: HashMap<String, Vec<&MemoryItem>> = HashMap::new();

        for item in items {
            if let Some(topic) = &item.topic {
                topic_count.entry(topic.clone()).or_default().push(item);
            }
        }

        for (topic, group) in topic_count {
            if group.len() >= 5 {
                patterns.push(MemoryPattern {
                    id: uuid::Uuid::new_v4().to_string(),
                    pattern_type: PatternType::RecurrentTopic,
                    name: format!("Sujet récurrent: {}", topic),
                    description: format!("{} items sur le sujet '{}'", group.len(), topic),
                    trigger: "frequent_topic".to_string(),
                    action: "create_topic_cluster".to_string(),
                    confidence: 0.9,
                    occurrences: group.len(),
                    affected_items: group.iter().map(|i| i.id.clone()).collect(),
                    first_seen: group.first().map(|i| i.created_at.clone()).unwrap_or_default(),
                    last_seen: group.last().map(|i| i.created_at.clone()).unwrap_or_default(),
                    is_positive: true,
                });
            }
        }

        Ok(patterns)
    }

    /// Détecte la confusion contextuelle
    fn detect_context_confusion(&self, items: &[MemoryItem]) -> Result<Vec<MemoryPattern>, MemoryEvolutionError> {
        let mut patterns = Vec::new();

        // Items dans plusieurs clusters potentiels
        let multi_topic: Vec<_> = items.iter()
            .filter(|i| {
                i.topic.as_ref().map_or(false, |t| t.contains(',') || t.contains('&'))
            })
            .collect();

        if multi_topic.len() >= 2 {
            patterns.push(MemoryPattern {
                id: uuid::Uuid::new_v4().to_string(),
                pattern_type: PatternType::ContextConfusion,
                name: "Confusion de contexte".to_string(),
                description: format!("{} items avec topics multiples", multi_topic.len()),
                trigger: "multiple_topics".to_string(),
                action: "clarify_context".to_string(),
                confidence: 0.7,
                occurrences: multi_topic.len(),
                affected_items: multi_topic.iter().map(|i| i.id.clone()).collect(),
                first_seen: chrono::Utc::now().to_rfc3339(),
                last_seen: chrono::Utc::now().to_rfc3339(),
                is_positive: false,
            });
        }

        Ok(patterns)
    }

    /// Calcule les statistiques des patterns
    fn calculate_stats(&self, patterns: &[MemoryPattern]) -> PatternStats {
        let mut by_type: HashMap<String, usize> = HashMap::new();

        for pattern in patterns {
            let type_str = format!("{:?}", pattern.pattern_type);
            *by_type.entry(type_str).or_insert(0) += 1;
        }

        PatternStats {
            total_patterns: patterns.len(),
            positive_patterns: patterns.iter().filter(|p| p.is_positive).count(),
            negative_patterns: patterns.iter().filter(|p| !p.is_positive).count(),
            high_confidence_patterns: patterns.iter().filter(|p| p.confidence > 0.8).count(),
            patterns_by_type: by_type,
        }
    }

    /// Génère des recommandations basées sur les patterns
    fn generate_recommendations(&self, patterns: &[MemoryPattern]) -> Vec<PatternRecommendation> {
        let mut recommendations = Vec::new();

        for pattern in patterns {
            let (recommendation, priority) = match pattern.pattern_type {
                PatternType::RecurrentError => (
                    format!("Corriger le pattern d'erreur '{}' pour améliorer la qualité mémoire", pattern.name),
                    RecommendationPriority::High
                ),
                PatternType::Gap => (
                    format!("Combler la lacune '{}' pour une mémoire plus complète", pattern.name),
                    RecommendationPriority::Medium
                ),
                PatternType::Repetitive => (
                    format!("Dédupliquer les contenus répétitifs identifiés dans '{}'", pattern.name),
                    RecommendationPriority::Low
                ),
                PatternType::ContextConfusion => (
                    format!("Clarifier le contexte pour les items dans '{}'", pattern.name),
                    RecommendationPriority::High
                ),
                PatternType::Strength => (
                    format!("Renforcer et exploiter la force identifiée: '{}'", pattern.name),
                    RecommendationPriority::Medium
                ),
                _ => (
                    format!("Examiner le pattern '{}'", pattern.name),
                    RecommendationPriority::Low
                ),
            };

            recommendations.push(PatternRecommendation {
                pattern_id: pattern.id.clone(),
                recommendation,
                priority,
                expected_impact: format!("Amélioration de {:.0}% estimée", pattern.confidence * 100.0),
            });
        }

        // Trier par priorité
        recommendations.sort_by(|a, b| {
            let priority_order = |p: &RecommendationPriority| match p {
                RecommendationPriority::Critical => 0,
                RecommendationPriority::High => 1,
                RecommendationPriority::Medium => 2,
                RecommendationPriority::Low => 3,
            };
            priority_order(&a.priority).cmp(&priority_order(&b.priority))
        });

        recommendations
    }

    fn simple_hash(&self, content: &str) -> u64 {
        use std::hash::{Hash, Hasher};
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        content.to_lowercase().trim().hash(&mut hasher);
        hasher.finish()
    }
}

impl Default for MemoryPatternExtractor {
    fn default() -> Self {
        Self::new(PatternConfig::default())
    }
}
