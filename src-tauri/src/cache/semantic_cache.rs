//! ═══════════════════════════════════════════════════════════════
//!   TITANE∞ Semantic Cache v∞
//!   SP-PERF-003: Smart Response Caching with Semantic Similarity
//! ═══════════════════════════════════════════════════════════════

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Configuration du cache sémantique
#[derive(Debug, Clone)]
pub struct SemanticCacheConfig {
    /// Seuil de similarité pour considérer comme hit (0.0 - 1.0)
    pub similarity_threshold: f32,
    /// Nombre max d'entrées dans le cache
    pub max_entries: usize,
    /// TTL par défaut en secondes
    pub default_ttl_secs: u64,
    /// Dimension des embeddings
    pub embedding_dim: usize,
    /// Activer la composition de fragments
    pub enable_fragment_composition: bool,
}

impl Default for SemanticCacheConfig {
    fn default() -> Self {
        Self {
            similarity_threshold: 0.85,
            max_entries: 10000,
            default_ttl_secs: 3600,
            embedding_dim: 384,
            enable_fragment_composition: true,
        }
    }
}

/// Entrée mise en cache
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedEntry {
    /// ID unique
    pub id: String,
    /// Embedding de la requête originale
    pub query_embedding: Vec<f32>,
    /// Requête originale
    pub original_query: String,
    /// Réponse mise en cache
    pub response: CachedResponse,
    /// Date de création
    pub created_at: DateTime<Utc>,
    /// Nombre de hits
    pub hit_count: u32,
    /// Score d'utilité moyen (feedback utilisateur)
    pub avg_usefulness: f32,
    /// TTL personnalisé (None = utiliser default)
    pub custom_ttl_secs: Option<u64>,
}

impl CachedEntry {
    /// Vérifier si l'entrée a expiré
    pub fn is_expired(&self, default_ttl: u64) -> bool {
        let ttl = self.custom_ttl_secs.unwrap_or(default_ttl);
        let age = Utc::now().signed_duration_since(self.created_at);
        age.num_seconds() as u64 > ttl
    }

    /// Calculer le score de priorité pour l'éviction
    pub fn priority_score(&self) -> f32 {
        // Combine hit_count, usefulness et récence
        let recency = 1.0
            / (1.0
                + Utc::now()
                    .signed_duration_since(self.created_at)
                    .num_hours() as f32);
        self.hit_count as f32 * self.avg_usefulness * recency
    }
}

/// Réponse mise en cache
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedResponse {
    /// Type de réponse
    pub response_type: ResponseType,
    /// Contenu (texte ou template)
    pub content: String,
    /// Variables à remplir si template
    pub variables: HashMap<String, String>,
    /// IDs des fragments composant la réponse
    pub fragment_ids: Vec<String>,
    /// Métadonnées
    pub metadata: ResponseMetadata,
}

/// Type de réponse cachée
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ResponseType {
    /// Réponse complète prête à l'emploi
    Complete,
    /// Template avec variables à remplacer
    Template,
    /// Composition de plusieurs fragments
    Composite,
    /// Référence à un pattern réutilisable
    PatternRef(String),
}

/// Fragment de réponse réutilisable
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseFragment {
    /// ID unique du fragment
    pub id: String,
    /// Contenu du fragment
    pub content: String,
    /// Type de fragment
    pub fragment_type: FragmentType,
    /// Tags de contexte pour matching
    pub context_tags: Vec<String>,
    /// Nombre de réutilisations
    pub reuse_count: u32,
    /// Embedding du contenu
    pub content_embedding: Option<Vec<f32>>,
}

/// Type de fragment
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum FragmentType {
    Greeting,
    Explanation,
    Example,
    Warning,
    Conclusion,
    Transition,
    List,
    Code,
    Custom(String),
}

/// Métadonnées de la réponse
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ResponseMetadata {
    /// Ton de la réponse
    pub tone: Tone,
    /// Complexité
    pub complexity: Complexity,
    /// Longueur approximative
    pub length: Length,
    /// Sujets abordés
    pub topics: Vec<String>,
    /// Langue
    pub language: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Default)]
pub enum Tone {
    Formal,
    #[default]
    Casual,
    Technical,
    Friendly,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Default)]
pub enum Complexity {
    Simple,
    #[default]
    Medium,
    Advanced,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Default)]
pub enum Length {
    Short,
    #[default]
    Medium,
    Long,
}

/// Résultat d'une recherche dans le cache
#[derive(Debug, Clone)]
pub struct CacheHit {
    /// Score de similarité (0.0 - 1.0)
    pub similarity: f32,
    /// Entrée trouvée
    pub entry: CachedEntry,
    /// Besoin d'adaptation?
    pub needs_adaptation: bool,
    /// Suggestions d'adaptation
    pub adaptation_hints: Vec<AdaptationHint>,
}

/// Suggestion d'adaptation pour une réponse cachée
#[derive(Debug, Clone)]
pub enum AdaptationHint {
    /// Remplacer une entité par une autre
    ReplaceEntity { old: String, new: String },
    /// Ajuster le ton
    AdjustTone(Tone),
    /// Ajouter du contexte
    AddContext(String),
    /// Supprimer une section
    RemoveSection(String),
    /// Mettre à jour les dates
    UpdateDate,
}

/// Cache sémantique principal
pub struct SemanticCache {
    /// Index des entrées
    entries: Arc<RwLock<Vec<CachedEntry>>>,
    /// Fragments réutilisables
    fragments: Arc<RwLock<HashMap<String, ResponseFragment>>>,
    /// Configuration
    config: SemanticCacheConfig,
    /// Statistiques
    stats: Arc<RwLock<CacheStats>>,
}

/// Statistiques du cache
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CacheStats {
    pub total_lookups: u64,
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub partial_hits: u64,
    pub adaptations: u64,
    pub evictions: u64,
    pub fragment_reuses: u64,
}

impl CacheStats {
    /// Calculer le taux de hit
    pub fn hit_rate(&self) -> f32 {
        if self.total_lookups == 0 {
            0.0
        } else {
            (self.cache_hits + self.partial_hits) as f32 / self.total_lookups as f32
        }
    }
}

impl SemanticCache {
    /// Créer un nouveau cache sémantique
    pub fn new(config: SemanticCacheConfig) -> Self {
        Self {
            entries: Arc::new(RwLock::new(Vec::with_capacity(config.max_entries))),
            fragments: Arc::new(RwLock::new(HashMap::new())),
            config,
            stats: Arc::new(RwLock::new(CacheStats::default())),
        }
    }

    /// Rechercher dans le cache
    pub async fn lookup(&self, query: &str, query_embedding: &[f32]) -> Option<CacheHit> {
        // Incrémenter le compteur de lookups
        {
            let mut stats = self.stats.write().await;
            stats.total_lookups += 1;
        }

        let entries = self.entries.read().await;

        // Rechercher les entrées similaires
        let mut best_match: Option<(usize, f32)> = None;

        for (idx, entry) in entries.iter().enumerate() {
            // Vérifier l'expiration
            if entry.is_expired(self.config.default_ttl_secs) {
                continue;
            }

            let similarity = cosine_similarity(query_embedding, &entry.query_embedding);

            if similarity >= self.config.similarity_threshold
                && best_match.map_or(true, |(_, best_similarity)| similarity > best_similarity)
            {
                best_match = Some((idx, similarity));
            }
        }

        if let Some((idx, similarity)) = best_match {
            let entry = entries[idx].clone();
            drop(entries);

            // Incrémenter le hit count
            {
                let mut entries = self.entries.write().await;
                if let Some(e) = entries.get_mut(idx) {
                    e.hit_count += 1;
                }
            }

            // Mettre à jour les stats
            {
                let mut stats = self.stats.write().await;
                if similarity >= 0.95 {
                    stats.cache_hits += 1;
                } else {
                    stats.partial_hits += 1;
                }
            }

            // Déterminer si adaptation nécessaire
            let needs_adaptation = similarity < 0.95;
            let adaptation_hints = if needs_adaptation {
                self.get_adaptation_hints(query, &entry.original_query)
            } else {
                vec![]
            };

            return Some(CacheHit {
                similarity,
                entry,
                needs_adaptation,
                adaptation_hints,
            });
        }

        // Cache miss
        {
            let mut stats = self.stats.write().await;
            stats.cache_misses += 1;
        }

        // Essayer de composer depuis des fragments
        if self.config.enable_fragment_composition {
            if let Some(composite) = self.compose_from_fragments(query, query_embedding).await {
                return Some(composite);
            }
        }

        None
    }

    /// Stocker une nouvelle entrée dans le cache
    pub async fn store(
        &self,
        query: &str,
        query_embedding: Vec<f32>,
        response: &str,
        metadata: ResponseMetadata,
    ) {
        // Extraire les fragments de la réponse
        let fragments = self.extract_fragments(response);
        let fragment_ids: Vec<String> = fragments.iter().map(|f| f.id.clone()).collect();

        // Stocker les fragments
        {
            let mut frag_store = self.fragments.write().await;
            for fragment in fragments {
                frag_store.entry(fragment.id.clone()).or_insert(fragment);
            }
        }

        // Créer l'entrée
        let entry = CachedEntry {
            id: uuid::Uuid::new_v4().to_string(),
            query_embedding,
            original_query: query.to_string(),
            response: CachedResponse {
                response_type: ResponseType::Complete,
                content: response.to_string(),
                variables: HashMap::new(),
                fragment_ids,
                metadata,
            },
            created_at: Utc::now(),
            hit_count: 0,
            avg_usefulness: 0.5,
            custom_ttl_secs: None,
        };

        // Ajouter à l'index
        let mut entries = self.entries.write().await;
        entries.push(entry);

        // Éviction si nécessaire
        if entries.len() > self.config.max_entries {
            let evict_count = self.config.max_entries / 10;
            self.evict_least_useful(&mut entries, evict_count).await;
        }
    }

    /// Adapter une réponse cachée à une nouvelle requête
    pub async fn adapt(&self, hit: &CacheHit, _new_query: &str) -> String {
        if !hit.needs_adaptation {
            return hit.entry.response.content.clone();
        }

        let mut adapted = hit.entry.response.content.clone();

        // Appliquer les adaptations
        for hint in &hit.adaptation_hints {
            match hint {
                AdaptationHint::ReplaceEntity { old, new } => {
                    adapted = adapted.replace(old, new);
                }
                AdaptationHint::AddContext(context) => {
                    adapted = format!("{}\n\n{}", context, adapted);
                }
                AdaptationHint::UpdateDate => {
                    // Remplacer les dates par la date actuelle
                    adapted = self.update_dates(&adapted);
                }
                _ => {}
            }
        }

        // Mettre à jour les stats
        {
            let mut stats = self.stats.write().await;
            stats.adaptations += 1;
        }

        adapted
    }

    /// Enregistrer le feedback utilisateur
    pub async fn record_feedback(&self, entry_id: &str, useful: bool) {
        let mut entries = self.entries.write().await;
        if let Some(entry) = entries.iter_mut().find(|e| e.id == entry_id) {
            // Moyenne mobile exponentielle
            let feedback = if useful { 1.0 } else { 0.0 };
            entry.avg_usefulness = entry.avg_usefulness * 0.9 + feedback * 0.1;
        }
    }

    /// Obtenir les statistiques du cache
    pub async fn get_stats(&self) -> CacheStats {
        self.stats.read().await.clone()
    }

    /// Nettoyer les entrées expirées
    pub async fn cleanup_expired(&self) {
        let mut entries = self.entries.write().await;
        let before = entries.len();
        entries.retain(|e| !e.is_expired(self.config.default_ttl_secs));
        let removed = before - entries.len();

        if removed > 0 {
            let mut stats = self.stats.write().await;
            stats.evictions += removed as u64;
        }
    }

    /// Vider le cache
    pub async fn clear(&self) {
        let mut entries = self.entries.write().await;
        entries.clear();

        let mut fragments = self.fragments.write().await;
        fragments.clear();

        let mut stats = self.stats.write().await;
        *stats = CacheStats::default();
    }

    // === Méthodes privées ===

    fn get_adaptation_hints(&self, new_query: &str, original_query: &str) -> Vec<AdaptationHint> {
        let mut hints = Vec::new();

        // Détecter les différences d'entités (simple heuristique)
        let new_words: Vec<&str> = new_query.split_whitespace().collect();
        let old_words: Vec<&str> = original_query.split_whitespace().collect();

        // Chercher les mots capitalisés (potentielles entités)
        for new_word in &new_words {
            if new_word
                .chars()
                .next()
                .map(|c| c.is_uppercase())
                .unwrap_or(false)
            {
                for old_word in &old_words {
                    if old_word
                        .chars()
                        .next()
                        .map(|c| c.is_uppercase())
                        .unwrap_or(false)
                        && new_word != old_word
                    {
                        hints.push(AdaptationHint::ReplaceEntity {
                            old: old_word.to_string(),
                            new: new_word.to_string(),
                        });
                    }
                }
            }
        }

        hints
    }

    fn extract_fragments(&self, response: &str) -> Vec<ResponseFragment> {
        let mut fragments = Vec::new();

        for (i, paragraph) in response.split("\n\n").enumerate() {
            if paragraph.trim().is_empty() {
                continue;
            }

            let fragment_type = self.detect_fragment_type(paragraph);
            let id = format!("frag_{}_{}", Utc::now().timestamp_millis(), i);

            fragments.push(ResponseFragment {
                id,
                content: paragraph.to_string(),
                fragment_type,
                context_tags: self.extract_context_tags(paragraph),
                reuse_count: 0,
                content_embedding: None,
            });
        }

        fragments
    }

    fn detect_fragment_type(&self, text: &str) -> FragmentType {
        let lower = text.to_lowercase();

        if lower.starts_with("bonjour") || lower.starts_with("salut") || lower.starts_with("hello")
        {
            FragmentType::Greeting
        } else if lower.starts_with("par exemple") || lower.starts_with("exemple:") {
            FragmentType::Example
        } else if lower.starts_with("attention")
            || lower.starts_with("⚠")
            || lower.starts_with("warning")
        {
            FragmentType::Warning
        } else if lower.starts_with("en résumé")
            || lower.starts_with("conclusion")
            || lower.starts_with("pour conclure")
        {
            FragmentType::Conclusion
        } else if text.contains("\n- ") || text.contains("\n* ") || text.contains("\n• ") {
            FragmentType::List
        } else if text.contains("```") {
            FragmentType::Code
        } else {
            FragmentType::Explanation
        }
    }

    fn extract_context_tags(&self, text: &str) -> Vec<String> {
        let mut tags = Vec::new();

        // Mots-clés techniques
        let keywords = [
            "rust",
            "python",
            "javascript",
            "typescript",
            "react",
            "api",
            "database",
            "security",
            "performance",
            "error",
            "bug",
            "feature",
        ];

        let lower = text.to_lowercase();
        for kw in keywords {
            if lower.contains(kw) {
                tags.push(kw.to_string());
            }
        }

        tags
    }

    async fn compose_from_fragments(
        &self,
        _query: &str,
        _query_embedding: &[f32],
    ) -> Option<CacheHit> {
        // Implementation: Intelligent fragment composition for partial cache hits
        // - Strategy: Find multiple cache entries with partial overlap (cosine similarity > 0.7)
        // - Ranking: Score fragments by relevance, recency, and completeness
        // - Composition: Merge overlapping fragments, interpolate missing parts
        // - Gap filling: Use template sentences or LLM to bridge gaps between fragments
        // - Validation: Verify composed response makes semantic sense (coherence check)
        // - Confidence: Return confidence score based on fragment coverage percentage
        // - Fallback: Return None if coverage < 50% (insufficient data)
        // For now, return None
        None
    }

    async fn evict_least_useful(&self, entries: &mut Vec<CachedEntry>, count: usize) {
        // Trier par score de priorité (croissant)
        entries.sort_by(|a, b| {
            a.priority_score()
                .partial_cmp(&b.priority_score())
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        // Supprimer les moins utiles
        let to_remove = count.min(entries.len());
        entries.drain(0..to_remove);

        // Mettre à jour les stats
        let mut stats = self.stats.write().await;
        stats.evictions += to_remove as u64;
    }

    fn update_dates(&self, text: &str) -> String {
        // Remplacer les patterns de date courants par la date actuelle
        // Format simple pour l'exemple
        let now = Utc::now().format("%d/%m/%Y").to_string();

        // Pattern pour dates françaises (DD/MM/YYYY)
        let re = regex::Regex::new(r"\d{2}/\d{2}/\d{4}").unwrap_or_else(|_| {
            regex::Regex::new(r"$^").expect("fallback regex must compile") // Pattern impossible si regex échoue
        });

        re.replace_all(text, now.as_str()).to_string()
    }
}

/// Calcul de similarité cosinus entre deux vecteurs
pub fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() || a.is_empty() {
        return 0.0;
    }

    let dot: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();

    if norm_a == 0.0 || norm_b == 0.0 {
        0.0
    } else {
        dot / (norm_a * norm_b)
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cosine_similarity() {
        let a = vec![1.0, 0.0, 0.0];
        let b = vec![1.0, 0.0, 0.0];
        assert!((cosine_similarity(&a, &b) - 1.0).abs() < 0.001);

        let c = vec![0.0, 1.0, 0.0];
        assert!(cosine_similarity(&a, &c).abs() < 0.001);

        let d = vec![0.707, 0.707, 0.0];
        let sim = cosine_similarity(&a, &d);
        assert!(sim > 0.7 && sim < 0.72);
    }

    #[test]
    fn test_fragment_detection() {
        let cache = SemanticCache::new(SemanticCacheConfig::default());

        assert_eq!(
            cache.detect_fragment_type("Bonjour, comment puis-je vous aider?"),
            FragmentType::Greeting
        );

        assert_eq!(
            cache.detect_fragment_type("⚠️ Attention: cette opération est dangereuse"),
            FragmentType::Warning
        );

        assert_eq!(
            cache.detect_fragment_type("```rust\nfn main() {}\n```"),
            FragmentType::Code
        );

        assert_eq!(
            cache.detect_fragment_type("Voici les étapes:\n- Étape 1\n- Étape 2"),
            FragmentType::List
        );
    }

    #[tokio::test]
    async fn test_cache_store_and_lookup() {
        let cache = SemanticCache::new(SemanticCacheConfig {
            similarity_threshold: 0.9,
            ..Default::default()
        });

        let embedding = vec![1.0, 0.0, 0.0, 0.0];
        let metadata = ResponseMetadata::default();

        cache
            .store(
                "Comment fonctionne Rust?",
                embedding.clone(),
                "Rust est un langage de programmation...",
                metadata,
            )
            .await;

        // Recherche exacte
        let hit = cache.lookup("Comment fonctionne Rust?", &embedding).await;
        assert!(hit.is_some());
        assert!(!hit.unwrap().needs_adaptation);

        // Recherche différente (pas de hit car embedding différent)
        let different_embedding = vec![0.0, 1.0, 0.0, 0.0];
        let miss = cache.lookup("Autre question", &different_embedding).await;
        assert!(miss.is_none());
    }

    #[tokio::test]
    async fn test_cache_stats() {
        let cache = SemanticCache::new(SemanticCacheConfig::default());

        let embedding = vec![1.0, 0.0, 0.0];
        cache
            .store(
                "test",
                embedding.clone(),
                "response",
                ResponseMetadata::default(),
            )
            .await;

        // Lookup hit
        cache.lookup("test", &embedding).await;

        // Lookup miss
        cache.lookup("other", &[0.0, 1.0, 0.0]).await;

        let stats = cache.get_stats().await;
        assert_eq!(stats.total_lookups, 2);
        assert!(stats.cache_hits >= 1 || stats.partial_hits >= 1);
        assert!(stats.cache_misses >= 1);
    }
}
