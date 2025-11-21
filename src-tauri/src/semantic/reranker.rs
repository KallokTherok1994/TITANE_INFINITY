// TITANE∞ v13 - Contextual Reranker
// Reranking contextuel des résultats de recherche avec scoring composite

use crate::semantic::vector_store::SearchResultKNN;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Configuration du reranker
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RerankerConfig {
    pub vector_similarity_weight: f32,
    pub context_weight: f32,
    pub recency_weight: f32,
    pub authority_weight: f32,
    pub graph_position_weight: f32,
    pub enable_explainability: bool,
}

impl Default for RerankerConfig {
    fn default() -> Self {
        Self {
            vector_similarity_weight: 0.40,
            context_weight: 0.20,
            recency_weight: 0.15,
            authority_weight: 0.15,
            graph_position_weight: 0.10,
            enable_explainability: true,
        }
    }
}

/// Reranker contextuel
pub struct ContextualReranker {
    config: RerankerConfig,
    current_context: Option<String>,
}

impl ContextualReranker {
    pub fn new(config: RerankerConfig) -> Self {
        Self {
            config,
            current_context: None,
        }
    }

    /// Définit le contexte actuel (depuis Helios)
    pub fn set_context(&mut self, context: String) {
        self.current_context = Some(context);
    }

    /// Reranke les résultats
    pub fn rerank(
        &self,
        mut results: Vec<SearchResultKNN>,
        query_context: Option<&str>,
    ) -> Vec<RankedResult> {
        let mut ranked_results = Vec::new();

        for result in results.iter_mut() {
            let scores = self.calculate_composite_score(result, query_context);
            
            let explanation = if self.config.enable_explainability {
                self.generate_explanation(&scores)
            } else {
                None
            };

            ranked_results.push(RankedResult {
                id: result.id.clone(),
                original_similarity: result.similarity,
                composite_score: scores.total,
                scores,
                metadata: result.metadata.clone(),
                explanation,
            });
        }

        // Trie par score composite décroissant
        ranked_results.sort_by(|a, b| b.composite_score.partial_cmp(&a.composite_score).unwrap());

        ranked_results
    }

    /// Calcule le score composite
    fn calculate_composite_score(
        &self,
        result: &SearchResultKNN,
        query_context: Option<&str>,
    ) -> CompositeScores {
        let vector_score = result.similarity * self.config.vector_similarity_weight;
        
        let context_score = self.calculate_context_score(&result.metadata, query_context)
            * self.config.context_weight;
        
        let recency_score = self.calculate_recency_score(&result.metadata)
            * self.config.recency_weight;
        
        let authority_score = self.calculate_authority_score(&result.metadata)
            * self.config.authority_weight;
        
        let graph_score = self.calculate_graph_score(&result.metadata)
            * self.config.graph_position_weight;

        let total = vector_score + context_score + recency_score + authority_score + graph_score;

        CompositeScores {
            vector_similarity: vector_score,
            context_relevance: context_score,
            recency: recency_score,
            authority: authority_score,
            graph_position: graph_score,
            total,
        }
    }

    /// Calcule le score de pertinence contextuelle
    fn calculate_context_score(
        &self,
        metadata: &HashMap<String, String>,
        query_context: Option<&str>,
    ) -> f32 {
        let active_context = query_context.or(self.current_context.as_deref());

        if let Some(context) = active_context {
            if let Some(doc_context) = metadata.get("context") {
                // Matching exact
                if doc_context == context {
                    return 1.0;
                }

                // Matching partiel
                let context_lower = context.to_lowercase();
                let doc_context_lower = doc_context.to_lowercase();
                
                if doc_context_lower.contains(&context_lower) 
                    || context_lower.contains(&doc_context_lower) {
                    return 0.7;
                }

                // Matching par tags
                if let Some(tags) = metadata.get("tags") {
                    if tags.to_lowercase().contains(&context_lower) {
                        return 0.5;
                    }
                }
            }
        }

        0.3 // Score par défaut si pas de contexte
    }

    /// Calcule le score de récence
    fn calculate_recency_score(&self, metadata: &HashMap<String, String>) -> f32 {
        if let Some(created_at) = metadata.get("created_at") {
            if let Ok(date) = chrono::DateTime::parse_from_rfc3339(created_at) {
                let now = chrono::Utc::now();
                let age_days = (now - date.with_timezone(&chrono::Utc)).num_days();

                // Score décroissant exponentiel
                // 0 jours = 1.0, 30 jours = 0.5, 90 jours = 0.2
                return (-(age_days as f32) / 50.0).exp().clamp(0.1, 1.0);
            }
        }

        0.5 // Score moyen si pas de date
    }

    /// Calcule le score d'autorité
    fn calculate_authority_score(&self, metadata: &HashMap<String, String>) -> f32 {
        let mut score = 0.5; // Baseline

        // Boost si document officiel
        if let Some(doc_type) = metadata.get("doc_type") {
            match doc_type.as_str() {
                "official" | "legal" | "contract" => score += 0.3,
                "technical" | "architecture" => score += 0.2,
                "editorial" | "article" => score += 0.1,
                _ => {}
            }
        }

        // Boost si document validé
        if let Some(validated) = metadata.get("validated") {
            if validated == "true" {
                score += 0.2;
            }
        }

        // Boost si auteur reconnu
        if let Some(author) = metadata.get("author") {
            if author == "TITANE" || author == "System" {
                score += 0.1;
            }
        }

        score.clamp(0.0, 1.0)
    }

    /// Calcule le score de position dans le graphe
    fn calculate_graph_score(&self, metadata: &HashMap<String, String>) -> f32 {
        // Score basé sur le nombre de connexions (centralité)
        if let Some(connections_str) = metadata.get("graph_connections") {
            if let Ok(connections) = connections_str.parse::<usize>() {
                // Normalisation logarithmique
                let normalized = (connections as f32 + 1.0).ln() / 10.0_f32.ln();
                return normalized.clamp(0.0, 1.0);
            }
        }

        0.3 // Score par défaut
    }

    /// Génère une explication humaine du score
    fn generate_explanation(&self, scores: &CompositeScores) -> Option<String> {
        let mut parts = Vec::new();

        // Analyse chaque composante
        if scores.vector_similarity > 0.35 {
            parts.push("forte similarité sémantique".to_string());
        } else if scores.vector_similarity > 0.25 {
            parts.push("similarité sémantique moyenne".to_string());
        }

        if scores.context_relevance > 0.15 {
            parts.push("très pertinent dans le contexte actuel".to_string());
        }

        if scores.recency > 0.12 {
            parts.push("document récent".to_string());
        }

        if scores.authority > 0.12 {
            parts.push("source fiable".to_string());
        }

        if scores.graph_position > 0.08 {
            parts.push("document central dans le graphe".to_string());
        }

        if parts.is_empty() {
            return None;
        }

        Some(format!("Ce résultat est pertinent car : {}", parts.join(", ")))
    }

    /// Élimine les faux positifs évidents
    pub fn filter_false_positives(&self, results: Vec<RankedResult>) -> Vec<RankedResult> {
        results
            .into_iter()
            .filter(|r| {
                // Élimine si score composite trop faible
                if r.composite_score < 0.3 {
                    return false;
                }

                // Élimine si seulement bon sur graph mais pas sémantique
                if r.scores.vector_similarity < 0.2 && r.scores.graph_position > 0.08 {
                    return false;
                }

                true
            })
            .collect()
    }
}

/// Résultat reranké
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RankedResult {
    pub id: String,
    pub original_similarity: f32,
    pub composite_score: f32,
    pub scores: CompositeScores,
    pub metadata: HashMap<String, String>,
    pub explanation: Option<String>,
}

/// Scores composites détaillés
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompositeScores {
    pub vector_similarity: f32,
    pub context_relevance: f32,
    pub recency: f32,
    pub authority: f32,
    pub graph_position: f32,
    pub total: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_result(id: &str, similarity: f32) -> SearchResultKNN {
        let mut metadata = HashMap::new();
        metadata.insert("doc_type".to_string(), "technical".to_string());
        metadata.insert("created_at".to_string(), chrono::Utc::now().to_rfc3339());
        metadata.insert("context".to_string(), "development".to_string());

        SearchResultKNN {
            id: id.to_string(),
            similarity,
            distance: 1.0 - similarity,
            metadata,
        }
    }

    #[test]
    fn test_reranker_basic() {
        let reranker = ContextualReranker::new(RerankerConfig::default());
        
        let results = vec![
            create_test_result("doc1", 0.8),
            create_test_result("doc2", 0.9),
            create_test_result("doc3", 0.7),
        ];

        let ranked = reranker.rerank(results, Some("development"));
        
        assert_eq!(ranked.len(), 3);
        assert!(ranked[0].composite_score >= ranked[1].composite_score);
    }

    #[test]
    fn test_context_boost() {
        let mut reranker = ContextualReranker::new(RerankerConfig::default());
        reranker.set_context("development".to_string());

        let mut metadata_matching = HashMap::new();
        metadata_matching.insert("context".to_string(), "development".to_string());

        let mut metadata_other = HashMap::new();
        metadata_other.insert("context".to_string(), "production".to_string());

        let score_matching = reranker.calculate_context_score(&metadata_matching, None);
        let score_other = reranker.calculate_context_score(&metadata_other, None);

        assert!(score_matching > score_other);
    }

    #[test]
    fn test_recency_score() {
        let reranker = ContextualReranker::new(RerankerConfig::default());

        let mut metadata_recent = HashMap::new();
        metadata_recent.insert("created_at".to_string(), chrono::Utc::now().to_rfc3339());

        let mut metadata_old = HashMap::new();
        let old_date = chrono::Utc::now() - chrono::Duration::days(90);
        metadata_old.insert("created_at".to_string(), old_date.to_rfc3339());

        let score_recent = reranker.calculate_recency_score(&metadata_recent);
        let score_old = reranker.calculate_recency_score(&metadata_old);

        assert!(score_recent > score_old);
    }

    #[test]
    fn test_filter_false_positives() {
        let reranker = ContextualReranker::new(RerankerConfig::default());
        
        let results = vec![
            RankedResult {
                id: "good".to_string(),
                original_similarity: 0.8,
                composite_score: 0.75,
                scores: CompositeScores {
                    vector_similarity: 0.32,
                    context_relevance: 0.16,
                    recency: 0.12,
                    authority: 0.10,
                    graph_position: 0.05,
                    total: 0.75,
                },
                metadata: HashMap::new(),
                explanation: None,
            },
            RankedResult {
                id: "bad".to_string(),
                original_similarity: 0.3,
                composite_score: 0.2,
                scores: CompositeScores {
                    vector_similarity: 0.12,
                    context_relevance: 0.04,
                    recency: 0.02,
                    authority: 0.01,
                    graph_position: 0.01,
                    total: 0.2,
                },
                metadata: HashMap::new(),
                explanation: None,
            },
        ];

        let filtered = reranker.filter_false_positives(results);
        assert_eq!(filtered.len(), 1);
        assert_eq!(filtered[0].id, "good");
    }
}
