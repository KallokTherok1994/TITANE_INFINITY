//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — MEMORY CONTEXT ENGINE
//! Super Prompt #9 — Intégration mémoire et contexte conversationnel
//! ═══════════════════════════════════════════════════════════════════════════════

use super::adapter::OutputChannel;
use super::MemoryContext;
use serde::{Deserialize, Serialize};

/// Contexte de conversation
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ConversationContext {
    /// ID de session
    pub session_id: String,
    /// ID utilisateur
    pub user_id: Option<String>,
    /// Longueur de l'historique
    pub history_length: usize,
    /// Canal de sortie
    pub channel: OutputChannel,
    /// Préférences utilisateur
    pub user_preferences: UserPreferences,
    /// Métadonnées additionnelles
    pub metadata: std::collections::HashMap<String, String>,
}

/// Préférences utilisateur
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct UserPreferences {
    /// Langue préférée
    pub language: String,
    /// Niveau de détail
    pub detail_level: DetailLevel,
    /// Style préféré
    pub preferred_style: String,
    /// Sujets d'intérêt
    pub interests: Vec<String>,
    /// Sujets à éviter
    pub avoid_topics: Vec<String>,
}

/// Niveau de détail
#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum DetailLevel {
    Minimal,
    #[default]
    Standard,
    Detailed,
    Expert,
}

/// Fait pertinent extrait de la mémoire
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RelevantFact {
    pub content: String,
    pub source: MemorySource,
    pub relevance_score: f32,
    pub timestamp: u64,
}

/// Source de la mémoire
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum MemorySource {
    /// Mémoire à court terme
    STM,
    /// Mémoire à moyen terme
    MTM,
    /// Mémoire à long terme
    LTM,
    /// Recherche vectorielle
    VectorSearch,
    /// Profil utilisateur
    UserProfile,
}

/// Moteur de contexte mémoire
pub struct MemoryContextEngine {
    /// Nombre maximum de facts à extraire
    max_facts: usize,
    /// Seuil de pertinence minimum
    relevance_threshold: f32,
    /// Cache des facts récents
    recent_facts_cache: Vec<RelevantFact>,
}

impl MemoryContextEngine {
    pub fn new() -> Self {
        Self {
            max_facts: 10,
            relevance_threshold: 0.3,
            recent_facts_cache: Vec::new(),
        }
    }

    /// Extrait le contexte mémoire pertinent
    pub async fn extract(&self, context: &ConversationContext) -> MemoryContext {
        // Extraire les topics récents
        let recent_topics = self.extract_recent_topics(context).await;

        // Extraire les préférences utilisateur
        let user_preferences = self.extract_user_preferences(context);

        // Générer le résumé de l'historique
        let history_summary = self.generate_history_summary(context).await;

        // Extraire les faits pertinents
        let relevant_facts = self.extract_relevant_facts(context).await;

        MemoryContext {
            recent_topics,
            user_preferences,
            conversation_history_summary: history_summary,
            relevant_facts,
        }
    }

    /// Extrait les topics récents
    async fn extract_recent_topics(&self, context: &ConversationContext) -> Vec<String> {
        // En production: interroger le Memory OS pour les topics récents
        // Version simplifiée: utiliser les métadonnées
        context
            .metadata
            .get("recent_topics")
            .map(|s| s.split(',').map(|t| t.trim().to_string()).collect())
            .unwrap_or_default()
    }

    /// Extrait les préférences utilisateur formatées
    fn extract_user_preferences(&self, context: &ConversationContext) -> Vec<String> {
        let mut prefs = Vec::new();

        if !context.user_preferences.language.is_empty() {
            prefs.push(format!("Langue: {}", context.user_preferences.language));
        }

        prefs.push(format!(
            "Détail: {:?}",
            context.user_preferences.detail_level
        ));

        if !context.user_preferences.preferred_style.is_empty() {
            prefs.push(format!(
                "Style: {}",
                context.user_preferences.preferred_style
            ));
        }

        for interest in &context.user_preferences.interests {
            prefs.push(format!("Intérêt: {}", interest));
        }

        prefs
    }

    /// Génère un résumé de l'historique
    async fn generate_history_summary(&self, context: &ConversationContext) -> String {
        // En production: utiliser le Memory OS pour générer un résumé
        // Version simplifiée
        if context.history_length == 0 {
            "Nouvelle conversation".to_string()
        } else if context.history_length < 5 {
            format!("Conversation courte ({} échanges)", context.history_length)
        } else {
            format!(
                "Conversation en cours ({} échanges)",
                context.history_length
            )
        }
    }

    /// Extrait les faits pertinents
    async fn extract_relevant_facts(&self, context: &ConversationContext) -> Vec<String> {
        // En production: faire une recherche vectorielle dans le Memory OS
        // Version simplifiée: utiliser le cache
        self.recent_facts_cache
            .iter()
            .filter(|f| f.relevance_score >= self.relevance_threshold)
            .take(self.max_facts)
            .map(|f| f.content.clone())
            .collect()
    }

    /// Ajoute un fait au cache
    pub fn add_fact(&mut self, fact: RelevantFact) {
        self.recent_facts_cache.push(fact);

        // Garder seulement les facts les plus récents
        if self.recent_facts_cache.len() > self.max_facts * 2 {
            // Trier par relevance et garder les meilleurs
            self.recent_facts_cache.sort_by(|a, b| {
                b.relevance_score
                    .partial_cmp(&a.relevance_score)
                    .unwrap_or(std::cmp::Ordering::Equal)
            });
            self.recent_facts_cache.truncate(self.max_facts);
        }
    }

    /// Recherche des faits similaires (version simplifiée)
    pub async fn search_similar(&self, query: &str, limit: usize) -> Vec<RelevantFact> {
        // En production: utiliser la recherche vectorielle du Memory OS
        // Version simplifiée: recherche par mots-clés
        let query_lower = query.to_lowercase();
        let query_words: std::collections::HashSet<&str> = query_lower.split_whitespace().collect();

        let mut results: Vec<_> = self
            .recent_facts_cache
            .iter()
            .map(|fact| {
                let fact_lower = fact.content.to_lowercase();
                let fact_words: std::collections::HashSet<&str> =
                    fact_lower.split_whitespace().collect();
                let intersection = query_words
                    .iter()
                    .filter(|w| fact_words.contains(*w))
                    .count();
                let score = if fact_words.is_empty() {
                    0.0
                } else {
                    intersection as f32 / fact_words.len() as f32
                };
                (fact.clone(), score)
            })
            .filter(|(_, score)| *score > 0.1)
            .collect();

        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        results
            .into_iter()
            .take(limit)
            .map(|(fact, _)| fact)
            .collect()
    }

    /// Injecte le contexte dans un prompt
    pub fn inject_context(&self, prompt: &str, memory_ctx: &MemoryContext) -> String {
        let mut enhanced_prompt = String::new();

        // Ajouter le contexte si disponible
        if !memory_ctx.conversation_history_summary.is_empty() {
            enhanced_prompt.push_str(&format!(
                "[Contexte: {}]\n\n",
                memory_ctx.conversation_history_summary
            ));
        }

        // Ajouter les topics récents
        if !memory_ctx.recent_topics.is_empty() {
            enhanced_prompt.push_str(&format!(
                "[Topics récents: {}]\n\n",
                memory_ctx.recent_topics.join(", ")
            ));
        }

        // Ajouter les faits pertinents
        if !memory_ctx.relevant_facts.is_empty() {
            enhanced_prompt.push_str("[Informations pertinentes:]\n");
            for fact in &memory_ctx.relevant_facts {
                enhanced_prompt.push_str(&format!("- {}\n", fact));
            }
            enhanced_prompt.push('\n');
        }

        enhanced_prompt.push_str(prompt);
        enhanced_prompt
    }

    /// Crée un contexte vide
    pub fn empty_context() -> ConversationContext {
        ConversationContext {
            session_id: uuid::Uuid::new_v4().to_string(),
            user_id: None,
            history_length: 0,
            channel: OutputChannel::Text,
            user_preferences: UserPreferences::default(),
            metadata: std::collections::HashMap::new(),
        }
    }

    /// Met à jour les préférences
    pub fn update_preferences(
        &mut self,
        _context: &mut ConversationContext,
        _prefs: UserPreferences,
    ) {
        // En production: persister les préférences dans le Memory OS
    }

    /// Vide le cache
    pub fn clear_cache(&mut self) {
        self.recent_facts_cache.clear();
    }
}

impl Default for MemoryContextEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_memory_context_extraction() {
        let engine = MemoryContextEngine::new();
        let context = ConversationContext::default();

        let memory = engine.extract(&context).await;
        assert!(memory.conversation_history_summary.contains("Nouvelle"));
    }

    #[test]
    fn test_add_fact() {
        let mut engine = MemoryContextEngine::new();
        engine.add_fact(RelevantFact {
            content: "Test fact".to_string(),
            source: MemorySource::STM,
            relevance_score: 0.8,
            timestamp: 0,
        });

        assert_eq!(engine.recent_facts_cache.len(), 1);
    }

    #[test]
    fn test_inject_context() {
        let engine = MemoryContextEngine::new();
        let memory = MemoryContext {
            recent_topics: vec!["Rust".to_string(), "TITANE".to_string()],
            user_preferences: vec!["Français".to_string()],
            conversation_history_summary: "Discussion technique".to_string(),
            relevant_facts: vec!["Fait 1".to_string()],
        };

        let enhanced = engine.inject_context("Hello", &memory);
        assert!(enhanced.contains("Discussion technique"));
        assert!(enhanced.contains("Rust"));
        assert!(enhanced.contains("Hello"));
    }

    #[tokio::test]
    async fn test_search_similar() {
        let mut engine = MemoryContextEngine::new();
        engine.add_fact(RelevantFact {
            content: "Rust programming language".to_string(),
            source: MemorySource::LTM,
            relevance_score: 0.9,
            timestamp: 0,
        });

        let results = engine.search_similar("programming", 5).await;
        assert!(!results.is_empty());
    }
}
