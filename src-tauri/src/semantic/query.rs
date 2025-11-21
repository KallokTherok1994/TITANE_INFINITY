// TITANE∞ v13 - Query Engine
// Moteur de recherche avec détection d'intention et expansion de requête

use crate::semantic::{SearchFilters, SearchIntent, SearchQuery, SearchResult};
use crate::semantic::vector_store::{VectorStore, SearchResultKNN};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Configuration du query engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryConfig {
    pub default_k: usize,
    pub similarity_threshold: f32,
    pub enable_expansion: bool,
    pub enable_intent_detection: bool,
    pub max_results: usize,
}

impl Default for QueryConfig {
    fn default() -> Self {
        Self {
            default_k: 20,
            similarity_threshold: 0.7,
            enable_expansion: true,
            enable_intent_detection: true,
            max_results: 50,
        }
    }
}

/// Moteur de requêtes
pub struct QueryEngine {
    config: QueryConfig,
    synonym_map: HashMap<String, Vec<String>>,
}

impl QueryEngine {
    pub fn new(config: QueryConfig) -> Self {
        Self {
            config,
            synonym_map: Self::build_synonym_map(),
        }
    }

    /// Exécute une recherche
    pub async fn search(
        &self,
        query: SearchQuery,
        vector_store: &VectorStore,
        query_embedding: &[f32],
    ) -> Result<Vec<SearchResultKNN>, QueryError> {
        // Détecte l'intention si activé
        let intent = if self.config.enable_intent_detection {
            query.intent.clone().or_else(|| Some(self.detect_intent(&query.text)))
        } else {
            query.intent.clone()
        };

        // Expand la requête si activé
        let expanded_terms = if self.config.enable_expansion {
            self.expand_query(&query.text)
        } else {
            vec![query.text.clone()]
        };

        // Calcule k en fonction de l'intention
        let k = self.calculate_k(&intent);

        // Recherche dans le vector store
        let mut results = if let Some(filters) = &query.filters {
            // Recherche avec filtres
            vector_store.search_filtered(query_embedding, k, |metadata| {
                self.apply_filters(metadata, filters)
            }).map_err(|e| QueryError::VectorStoreError(e.to_string()))?
        } else {
            // Recherche sans filtres
            vector_store.search_knn(query_embedding, k)
                .map_err(|e| QueryError::VectorStoreError(e.to_string()))?
        };

        // Filtre par seuil de similarité
        results.retain(|r| r.similarity >= self.config.similarity_threshold);

        // Limite le nombre de résultats
        results.truncate(self.config.max_results);

        Ok(results)
    }

    /// Détecte l'intention de la recherche
    fn detect_intent(&self, query: &str) -> SearchIntent {
        let query_lower = query.to_lowercase();

        // Mots-clés pour chaque intention
        let informational_keywords = ["quoi", "comment", "pourquoi", "qu'est-ce", "définition", "expliquer"];
        let navigational_keywords = ["trouver", "chercher", "document", "fichier", "page"];
        let transactional_keywords = ["créer", "générer", "faire", "produire", "exécuter"];
        let exploratory_keywords = ["explorer", "découvrir", "voir", "lister", "tout"];

        // Score pour chaque intention
        let mut scores = HashMap::new();
        scores.insert(SearchIntent::Informational, 0);
        scores.insert(SearchIntent::Navigational, 0);
        scores.insert(SearchIntent::Transactional, 0);
        scores.insert(SearchIntent::Exploratory, 0);

        // Calcule les scores
        for keyword in informational_keywords {
            if query_lower.contains(keyword) {
                *scores.get_mut(&SearchIntent::Informational).unwrap() += 1;
            }
        }
        for keyword in navigational_keywords {
            if query_lower.contains(keyword) {
                *scores.get_mut(&SearchIntent::Navigational).unwrap() += 1;
            }
        }
        for keyword in transactional_keywords {
            if query_lower.contains(keyword) {
                *scores.get_mut(&SearchIntent::Transactional).unwrap() += 1;
            }
        }
        for keyword in exploratory_keywords {
            if query_lower.contains(keyword) {
                *scores.get_mut(&SearchIntent::Exploratory).unwrap() += 1;
            }
        }

        // Retourne l'intention avec le score le plus élevé
        scores
            .into_iter()
            .max_by_key(|(_, score)| *score)
            .map(|(intent, _)| intent)
            .unwrap_or(SearchIntent::Informational)
    }

    /// Expand la requête avec des synonymes
    fn expand_query(&self, query: &str) -> Vec<String> {
        let mut expanded = vec![query.to_string()];
        let words: Vec<&str> = query.split_whitespace().collect();

        for word in words {
            if let Some(synonyms) = self.synonym_map.get(&word.to_lowercase()) {
                for synonym in synonyms {
                    let expanded_query = query.replace(word, synonym);
                    if expanded_query != query {
                        expanded.push(expanded_query);
                    }
                }
            }
        }

        expanded
    }

    /// Calcule k optimal selon l'intention
    fn calculate_k(&self, intent: &Option<SearchIntent>) -> usize {
        match intent {
            Some(SearchIntent::Navigational) => self.config.default_k / 2, // Plus précis
            Some(SearchIntent::Exploratory) => self.config.default_k * 2, // Plus large
            _ => self.config.default_k,
        }
    }

    /// Applique les filtres aux métadonnées
    fn apply_filters(&self, metadata: &HashMap<String, String>, filters: &SearchFilters) -> bool {
        // Filtre par type de document
        if let Some(doc_types) = &filters.doc_types {
            if let Some(doc_type) = metadata.get("doc_type") {
                if !doc_types.contains(doc_type) {
                    return false;
                }
            } else {
                return false;
            }
        }

        // Filtre par tags
        if let Some(tags) = &filters.tags {
            if let Some(doc_tags) = metadata.get("tags") {
                let doc_tags_vec: Vec<&str> = doc_tags.split(',').collect();
                let has_tag = tags.iter().any(|tag| doc_tags_vec.contains(&tag.as_str()));
                if !has_tag {
                    return false;
                }
            } else {
                return false;
            }
        }

        // Filtre par date
        if let Some(date_range) = &filters.date_range {
            if let Some(date_str) = metadata.get("created_at") {
                if let Ok(date) = chrono::DateTime::parse_from_rfc3339(date_str) {
                    let date_utc = date.with_timezone(&chrono::Utc);
                    if date_utc < date_range.start || date_utc > date_range.end {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }

        true
    }

    /// Construit la map de synonymes (simplifiée)
    fn build_synonym_map() -> HashMap<String, Vec<String>> {
        let mut map = HashMap::new();

        // Synonymes français courants
        map.insert("document".to_string(), vec!["fichier".to_string(), "doc".to_string()]);
        map.insert("recherche".to_string(), vec!["chercher".to_string(), "trouver".to_string()]);
        map.insert("créer".to_string(), vec!["générer".to_string(), "produire".to_string(), "faire".to_string()]);
        map.insert("projet".to_string(), vec!["travail".to_string(), "tâche".to_string()]);
        map.insert("erreur".to_string(), vec!["bug".to_string(), "problème".to_string()]);
        map.insert("fonction".to_string(), vec!["méthode".to_string(), "procédure".to_string()]);
        map.insert("données".to_string(), vec!["data".to_string(), "informations".to_string()]);
        map.insert("système".to_string(), vec!["plateforme".to_string(), "infrastructure".to_string()]);

        map
    }

    /// Ajoute des synonymes personnalisés
    pub fn add_synonym(&mut self, word: String, synonyms: Vec<String>) {
        self.synonym_map.insert(word.to_lowercase(), synonyms);
    }

    /// Suggère des requêtes similaires
    pub fn suggest_queries(&self, partial_query: &str) -> Vec<String> {
        let mut suggestions = Vec::new();
        let partial_lower = partial_query.to_lowercase();

        // Suggestions basées sur les synonymes
        for (word, synonyms) in &self.synonym_map {
            if word.starts_with(&partial_lower) {
                suggestions.push(word.clone());
            }
            for syn in synonyms {
                if syn.to_lowercase().starts_with(&partial_lower) {
                    suggestions.push(syn.clone());
                }
            }
        }

        suggestions.truncate(10);
        suggestions
    }
}

/// Erreurs du query engine
#[derive(Debug)]
pub enum QueryError {
    VectorStoreError(String),
    InvalidQuery(String),
    EmbeddingError(String),
}

impl std::fmt::Display for QueryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            QueryError::VectorStoreError(e) => write!(f, "Vector store error: {}", e),
            QueryError::InvalidQuery(e) => write!(f, "Invalid query: {}", e),
            QueryError::EmbeddingError(e) => write!(f, "Embedding error: {}", e),
        }
    }
}

impl std::error::Error for QueryError {}

/// Gestionnaire de pagination
pub struct PaginationManager {
    page_size: usize,
}

impl PaginationManager {
    pub fn new(page_size: usize) -> Self {
        Self { page_size }
    }

    /// Pagine les résultats
    pub fn paginate<T: Clone>(&self, results: &[T], page: usize) -> Vec<T> {
        let start = page * self.page_size;
        let end = (start + self.page_size).min(results.len());

        if start >= results.len() {
            return Vec::new();
        }

        results[start..end].to_vec()
    }

    /// Calcule le nombre total de pages
    pub fn total_pages(&self, total_results: usize) -> usize {
        (total_results + self.page_size - 1) / self.page_size
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_intent() {
        let engine = QueryEngine::new(QueryConfig::default());

        let intent1 = engine.detect_intent("Qu'est-ce que la recherche sémantique ?");
        assert!(matches!(intent1, SearchIntent::Informational));

        let intent2 = engine.detect_intent("Trouver le document contrat.pdf");
        assert!(matches!(intent2, SearchIntent::Navigational));

        let intent3 = engine.detect_intent("Créer un nouveau projet");
        assert!(matches!(intent3, SearchIntent::Transactional));
    }

    #[test]
    fn test_expand_query() {
        let engine = QueryEngine::new(QueryConfig::default());
        let expanded = engine.expand_query("créer un document");
        
        assert!(expanded.len() > 1);
        assert!(expanded.iter().any(|q| q.contains("générer") || q.contains("fichier")));
    }

    #[test]
    fn test_pagination() {
        let paginator = PaginationManager::new(10);
        let results: Vec<i32> = (0..25).collect();

        let page1 = paginator.paginate(&results, 0);
        assert_eq!(page1.len(), 10);
        assert_eq!(page1[0], 0);

        let page2 = paginator.paginate(&results, 1);
        assert_eq!(page2.len(), 10);
        assert_eq!(page2[0], 10);

        let page3 = paginator.paginate(&results, 2);
        assert_eq!(page3.len(), 5);
        assert_eq!(page3[0], 20);

        assert_eq!(paginator.total_pages(25), 3);
    }

    #[test]
    fn test_suggest_queries() {
        let engine = QueryEngine::new(QueryConfig::default());
        let suggestions = engine.suggest_queries("doc");
        
        assert!(!suggestions.is_empty());
        assert!(suggestions.iter().any(|s| s.contains("doc")));
    }
}
