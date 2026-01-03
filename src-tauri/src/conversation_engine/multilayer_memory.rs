use chrono::Utc;
/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — MÉMOIRE CONVERSATIONNELLE MULTI-COUCHES
 * Système de mémoire évolutif à 5 niveaux
 * ═══════════════════════════════════════════════════════════════════
 */
use std::collections::HashMap;
use uuid::Uuid;

use super::types::{
    Concept, EmotionState, EpisodeType, EpisodicMemory, Evaluation, EvaluationDimension, Intention,
    MemoryLayers, Preference, PreferenceCategory,
};

// ═══════════════════════════════════════════════════════════════════
// MULTI-LAYER MEMORY MANAGER
// ═══════════════════════════════════════════════════════════════════

pub struct MultiLayerMemoryManager {
    /// Mémoire immédiate (session courante)
    immediate: ImmediateMemory,

    /// Mémoire épisodique (événements significatifs)
    episodic: Vec<EpisodicMemory>,

    /// Mémoire sémantique (concepts)
    semantic: HashMap<String, Concept>,

    /// Mémoire procédurale (préférences)
    procedural: Vec<Preference>,

    /// Mémoire réflexive (évaluations)
    reflective: Vec<Evaluation>,
}

impl MultiLayerMemoryManager {
    pub fn new() -> Self {
        Self {
            immediate: ImmediateMemory::new(),
            episodic: Vec::new(),
            semantic: HashMap::new(),
            procedural: Vec::new(),
            reflective: Vec::new(),
        }
    }

    /// Analyser quelles couches de mémoire activer pour un message
    pub fn analyze_memory_layers(
        &self,
        intention: &Intention,
        emotion: &EmotionState,
        message: &str,
    ) -> MemoryLayers {
        let mut layers = MemoryLayers::default();

        // Toujours dans immédiate
        layers.immediate = true;

        // Épisodique si événement significatif
        layers.episodic = self.is_significant_event(intention, emotion, message);

        // Sémantique : extraire concepts
        layers.semantic = self.extract_concepts(message);

        // Procédurale : détecter patterns
        layers.procedural = self.detect_patterns(intention, message);

        // Réflexive si besoin d'évaluation
        layers.reflective = self.needs_reflection(intention, emotion);

        layers
    }

    /// Déterminer si c'est un événement significatif (épisodique)
    fn is_significant_event(
        &self,
        intention: &Intention,
        emotion: &EmotionState,
        message: &str,
    ) -> bool {
        // Décision explicite
        if message.contains("décidé") || message.contains("choisir") {
            return true;
        }

        // Émotion forte
        if emotion.intensity > 0.7 || emotion.valence.abs() > 0.7 {
            return true;
        }

        // Meta-conversation importante
        if matches!(intention, Intention::Meta) && message.len() > 200 {
            return true;
        }

        false
    }

    /// Extraire concepts nouveaux/existants
    fn extract_concepts(&self, message: &str) -> Vec<String> {
        let mut concepts = Vec::new();

        // Détection concepts TITANE∞
        if message.contains("SingularityState") || message.contains("Singularité") {
            concepts.push("SingularityState".to_string());
        }
        if message.contains("Humain Total") || message.contains("HT") {
            concepts.push("Humain Total".to_string());
        }
        if message.contains("charge mentale") {
            concepts.push("Charge mentale".to_string());
        }
        if message.contains("Architecture") && message.contains("Code") {
            concepts.push("Architecture Humain-Code™".to_string());
        }

        concepts
    }

    /// Détecter patterns de préférences
    fn detect_patterns(&self, intention: &Intention, message: &str) -> Vec<String> {
        let mut patterns = Vec::new();

        // Format préféré
        if message.contains("liste") || message.contains("puces") {
            patterns.push("prefers_lists".to_string());
        }
        if message.contains("synthèse") || message.contains("résumé") {
            patterns.push("prefers_summary".to_string());
        }

        // Profondeur
        if message.contains("détail") || message.contains("approfondi") {
            patterns.push("depth_high".to_string());
        }
        if message.contains("court") || message.contains("simple") {
            patterns.push("depth_low".to_string());
        }

        patterns
    }

    /// Déterminer si nécessite réflexion
    fn needs_reflection(&self, intention: &Intention, emotion: &EmotionState) -> bool {
        matches!(intention, Intention::Meta) || emotion.valence < -0.5
    }

    // ───────────────────────────────────────────────────────────────
    // IMMEDIATE MEMORY OPERATIONS
    // ───────────────────────────────────────────────────────────────

    pub fn add_to_immediate(&mut self, user_msg: String, assistant_msg: String) {
        self.immediate.add(user_msg, assistant_msg);
    }

    pub fn get_immediate_context(&self) -> Vec<(String, String)> {
        self.immediate.get_recent(5)
    }

    // ───────────────────────────────────────────────────────────────
    // EPISODIC MEMORY OPERATIONS
    // ───────────────────────────────────────────────────────────────

    pub fn save_episode(
        &mut self,
        title: String,
        summary: String,
        event_type: EpisodeType,
        emotion: &EmotionState,
        importance: f64,
        tags: Vec<String>,
    ) {
        let episode = EpisodicMemory {
            id: Uuid::new_v4().to_string(),
            timestamp: Utc::now().timestamp(),
            event_type,
            title,
            summary,
            emotional_valence: emotion.valence as f64,
            importance,
            linked_projects: Vec::new(),
            linked_decisions: Vec::new(),
            tags,
        };

        self.episodic.push(episode);

        // Limiter taille (garder 100 plus récents)
        if self.episodic.len() > 100 {
            self.episodic.remove(0);
        }
    }

    pub fn get_recent_episodes(&self, count: usize) -> Vec<&EpisodicMemory> {
        self.episodic.iter().rev().take(count).collect()
    }

    // ───────────────────────────────────────────────────────────────
    // SEMANTIC MEMORY OPERATIONS
    // ───────────────────────────────────────────────────────────────

    pub fn update_concept(&mut self, name: String, definition: String, example: String) {
        self.semantic
            .entry(name.clone())
            .and_modify(|c| {
                c.usage_count += 1;
                if !c.examples.contains(&example) {
                    c.examples.push(example.clone());
                }
            })
            .or_insert_with(|| Concept {
                name: name.clone(),
                definition,
                aliases: Vec::new(),
                related_concepts: Vec::new(),
                first_mentioned: Utc::now().timestamp(),
                usage_count: 1,
                examples: vec![example],
            });
    }

    pub fn get_concept(&self, name: &str) -> Option<&Concept> {
        self.semantic.get(name)
    }

    // ───────────────────────────────────────────────────────────────
    // PROCEDURAL MEMORY OPERATIONS
    // ───────────────────────────────────────────────────────────────

    pub fn learn_preference(
        &mut self,
        category: PreferenceCategory,
        rule: String,
        confidence: f64,
    ) {
        // Chercher préférence existante
        if let Some(pref) = self.procedural.iter_mut().find(|p| p.rule == rule) {
            pref.confidence = (pref.confidence + confidence) / 2.0;
            pref.evidence_count += 1;
            pref.last_confirmed = Utc::now().timestamp();
        } else {
            self.procedural.push(Preference {
                category,
                rule,
                confidence,
                evidence_count: 1,
                last_confirmed: Utc::now().timestamp(),
            });
        }

        // Limiter taille
        if self.procedural.len() > 50 {
            self.procedural.remove(0);
        }
    }

    pub fn get_preferences(&self, category: &PreferenceCategory) -> Vec<&Preference> {
        self.procedural
            .iter()
            .filter(|p| &p.category == category)
            .collect()
    }

    // ───────────────────────────────────────────────────────────────
    // REFLECTIVE MEMORY OPERATIONS
    // ───────────────────────────────────────────────────────────────

    pub fn add_evaluation(
        &mut self,
        dimension: EvaluationDimension,
        score: f64,
        evidence: String,
        action_taken: String,
    ) {
        self.reflective.push(Evaluation {
            timestamp: Utc::now().timestamp(),
            dimension,
            score,
            evidence,
            action_taken,
        });

        // Limiter historique
        if self.reflective.len() > 100 {
            self.reflective.remove(0);
        }
    }

    pub fn get_evaluation_average(&self, dimension: &EvaluationDimension) -> f64 {
        let evals: Vec<&Evaluation> = self
            .reflective
            .iter()
            .filter(|e| &e.dimension == dimension)
            .collect();

        if evals.is_empty() {
            return 0.5; // Neutre par défaut
        }

        let sum: f64 = evals.iter().map(|e| e.score).sum();
        sum / evals.len() as f64
    }

    // ───────────────────────────────────────────────────────────────
    // MEMORY CONSOLIDATION
    // ───────────────────────────────────────────────────────────────

    /// Consolider la mémoire immédiate en épisodique/sémantique
    pub fn consolidate_session(&mut self) {
        // Analyser session pour extraire concepts récurrents
        let messages = self.immediate.get_recent(10);

        for (user_msg, _assistant_msg) in messages {
            let concepts = self.extract_concepts(&user_msg);
            for concept in concepts {
                self.update_concept(
                    concept.clone(),
                    "Concept mentionné en session".to_string(),
                    user_msg.clone(),
                );
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// IMMEDIATE MEMORY (Session courante)
// ═══════════════════════════════════════════════════════════════════

struct ImmediateMemory {
    messages: Vec<(String, String)>, // (user, assistant)
    max_size: usize,
}

impl ImmediateMemory {
    fn new() -> Self {
        Self {
            messages: Vec::new(),
            max_size: 10,
        }
    }

    fn add(&mut self, user_msg: String, assistant_msg: String) {
        self.messages.push((user_msg, assistant_msg));

        // FIFO rotation
        if self.messages.len() > self.max_size {
            self.messages.remove(0);
        }
    }

    fn get_recent(&self, count: usize) -> Vec<(String, String)> {
        self.messages.iter().rev().take(count).cloned().collect()
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────────────
    // Tests MultiLayerMemoryManager création
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_multilayer_memory_manager_new() {
        let manager = MultiLayerMemoryManager::new();
        let context = manager.get_immediate_context();
        assert!(context.is_empty());
    }

    #[test]
    fn test_multilayer_manager_initial_state() {
        let manager = MultiLayerMemoryManager::new();
        assert!(manager.episodic.is_empty());
        assert!(manager.semantic.is_empty());
        assert!(manager.procedural.is_empty());
        assert!(manager.reflective.is_empty());
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests analyze_memory_layers
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_analyze_layers_immediate_always_true() {
        let manager = MultiLayerMemoryManager::new();
        let layers = manager.analyze_memory_layers(
            &Intention::Question,
            &EmotionState::default(),
            "Test message",
        );
        assert!(layers.immediate);
    }

    #[test]
    fn test_analyze_layers_episodic_on_decision() {
        let manager = MultiLayerMemoryManager::new();
        let layers = manager.analyze_memory_layers(
            &Intention::Action,
            &EmotionState::default(),
            "J'ai décidé de faire cela",
        );
        assert!(layers.episodic);
    }

    #[test]
    fn test_analyze_layers_episodic_on_choisir() {
        let manager = MultiLayerMemoryManager::new();
        let layers = manager.analyze_memory_layers(
            &Intention::Action,
            &EmotionState::default(),
            "Je vais choisir cette option",
        );
        assert!(layers.episodic);
    }

    #[test]
    fn test_analyze_layers_episodic_on_high_emotion() {
        let manager = MultiLayerMemoryManager::new();
        let emotion = EmotionState::new(0.0, 0.9, 0.5); // Haute intensité
        let layers =
            manager.analyze_memory_layers(&Intention::Question, &emotion, "Message normal");
        assert!(layers.episodic);
    }

    #[test]
    fn test_analyze_layers_episodic_on_high_valence() {
        let manager = MultiLayerMemoryManager::new();
        let emotion = EmotionState::new(0.9, 0.5, 0.5); // Haute valence
        let layers =
            manager.analyze_memory_layers(&Intention::Question, &emotion, "Message normal");
        assert!(layers.episodic);
    }

    #[test]
    fn test_analyze_layers_semantic_singularity() {
        let manager = MultiLayerMemoryManager::new();
        let layers = manager.analyze_memory_layers(
            &Intention::Question,
            &EmotionState::default(),
            "Le SingularityState est important",
        );
        assert!(layers.semantic.contains(&"SingularityState".to_string()));
    }

    #[test]
    fn test_analyze_layers_semantic_humain_total() {
        let manager = MultiLayerMemoryManager::new();
        let layers = manager.analyze_memory_layers(
            &Intention::Question,
            &EmotionState::default(),
            "Humain Total concept",
        );
        assert!(layers.semantic.contains(&"Humain Total".to_string()));
    }

    #[test]
    fn test_analyze_layers_semantic_charge_mentale() {
        let manager = MultiLayerMemoryManager::new();
        let layers = manager.analyze_memory_layers(
            &Intention::Question,
            &EmotionState::default(),
            "Ma charge mentale est élevée",
        );
        assert!(layers.semantic.contains(&"Charge mentale".to_string()));
    }

    #[test]
    fn test_analyze_layers_procedural_lists() {
        let manager = MultiLayerMemoryManager::new();
        let layers = manager.analyze_memory_layers(
            &Intention::Action,
            &EmotionState::default(),
            "Fais-moi une liste de choses",
        );
        assert!(layers.procedural.contains(&"prefers_lists".to_string()));
    }

    #[test]
    fn test_analyze_layers_procedural_summary() {
        let manager = MultiLayerMemoryManager::new();
        let layers = manager.analyze_memory_layers(
            &Intention::Action,
            &EmotionState::default(),
            "Fais une synthèse du document",
        );
        assert!(layers.procedural.contains(&"prefers_summary".to_string()));
    }

    #[test]
    fn test_analyze_layers_reflective_on_meta() {
        let manager = MultiLayerMemoryManager::new();
        let layers = manager.analyze_memory_layers(
            &Intention::Meta,
            &EmotionState::default(),
            "Parlons de notre conversation",
        );
        assert!(layers.reflective);
    }

    #[test]
    fn test_analyze_layers_reflective_on_negative_valence() {
        let manager = MultiLayerMemoryManager::new();
        let emotion = EmotionState::new(-0.6, 0.5, 0.5); // Valence négative
        let layers = manager.analyze_memory_layers(
            &Intention::Question,
            &emotion,
            "Je ne suis pas satisfait",
        );
        assert!(layers.reflective);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests Immediate Memory
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_add_to_immediate() {
        let mut manager = MultiLayerMemoryManager::new();
        manager.add_to_immediate("User 1".to_string(), "Assistant 1".to_string());

        let context = manager.get_immediate_context();
        assert_eq!(context.len(), 1);
        assert_eq!(context[0].0, "User 1");
        assert_eq!(context[0].1, "Assistant 1");
    }

    #[test]
    fn test_immediate_context_order() {
        let mut manager = MultiLayerMemoryManager::new();
        manager.add_to_immediate("User 1".to_string(), "Assistant 1".to_string());
        manager.add_to_immediate("User 2".to_string(), "Assistant 2".to_string());
        manager.add_to_immediate("User 3".to_string(), "Assistant 3".to_string());

        let context = manager.get_immediate_context();
        // get_recent retourne les plus récents en premier
        assert_eq!(context[0].0, "User 3");
        assert_eq!(context[1].0, "User 2");
        assert_eq!(context[2].0, "User 1");
    }

    #[test]
    fn test_immediate_context_limit() {
        let mut manager = MultiLayerMemoryManager::new();
        for i in 0..10 {
            manager.add_to_immediate(format!("User {}", i), format!("Asst {}", i));
        }

        let context = manager.get_immediate_context();
        // Par défaut, get_immediate_context retourne 5
        assert_eq!(context.len(), 5);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests Episodic Memory
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_save_episode() {
        let mut manager = MultiLayerMemoryManager::new();
        let emotion = EmotionState::new(0.5, 0.5, 0.5);

        manager.save_episode(
            "Test Episode".to_string(),
            "Description".to_string(),
            EpisodeType::Milestone,
            &emotion,
            0.8,
            vec!["tag1".to_string()],
        );

        assert_eq!(manager.episodic.len(), 1);
    }

    #[test]
    fn test_save_episode_fields() {
        let mut manager = MultiLayerMemoryManager::new();
        let emotion = EmotionState::new(0.7, 0.5, 0.5);

        manager.save_episode(
            "Test Title".to_string(),
            "Test Summary".to_string(),
            EpisodeType::Decision,
            &emotion,
            0.9,
            vec!["decision".to_string(), "important".to_string()],
        );

        let episodes = manager.get_recent_episodes(1);
        assert_eq!(episodes.len(), 1);
        let ep = episodes[0];
        assert_eq!(ep.title, "Test Title");
        assert_eq!(ep.summary, "Test Summary");
        assert_eq!(ep.importance, 0.9);
        assert!(matches!(ep.event_type, EpisodeType::Decision));
    }

    #[test]
    fn test_get_recent_episodes() {
        let mut manager = MultiLayerMemoryManager::new();
        let emotion = EmotionState::default();

        for i in 0..5 {
            manager.save_episode(
                format!("Episode {}", i),
                "Summary".to_string(),
                EpisodeType::Milestone,
                &emotion,
                0.5,
                vec![],
            );
        }

        let recent = manager.get_recent_episodes(3);
        assert_eq!(recent.len(), 3);
        // Plus récent en premier
        assert_eq!(recent[0].title, "Episode 4");
    }

    #[test]
    fn test_episodic_limit_100() {
        let mut manager = MultiLayerMemoryManager::new();
        let emotion = EmotionState::default();

        // Ajouter 110 épisodes
        for i in 0..110 {
            manager.save_episode(
                format!("Episode {}", i),
                "Summary".to_string(),
                EpisodeType::Milestone,
                &emotion,
                0.5,
                vec![],
            );
        }

        // Devrait être limité à 100
        assert_eq!(manager.episodic.len(), 100);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests Semantic Memory
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_update_concept_new() {
        let mut manager = MultiLayerMemoryManager::new();
        manager.update_concept(
            "TestConcept".to_string(),
            "A test concept".to_string(),
            "Example usage".to_string(),
        );

        let concept = manager.get_concept("TestConcept");
        assert!(concept.is_some());
        let c = concept.expect("concept should exist after update");
        assert_eq!(c.name, "TestConcept");
        assert_eq!(c.definition, "A test concept");
        assert_eq!(c.usage_count, 1);
    }

    #[test]
    fn test_update_concept_existing() {
        let mut manager = MultiLayerMemoryManager::new();

        // Premier ajout
        manager.update_concept(
            "Concept".to_string(),
            "Definition".to_string(),
            "Example 1".to_string(),
        );

        // Deuxième ajout (même concept)
        manager.update_concept(
            "Concept".to_string(),
            "New Definition".to_string(),
            "Example 2".to_string(),
        );

        let concept = manager
            .get_concept("Concept")
            .expect("concept should exist after multiple updates");
        assert_eq!(concept.usage_count, 2);
        assert!(concept.examples.contains(&"Example 1".to_string()));
        assert!(concept.examples.contains(&"Example 2".to_string()));
    }

    #[test]
    fn test_get_concept_nonexistent() {
        let manager = MultiLayerMemoryManager::new();
        assert!(manager.get_concept("NonExistent").is_none());
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests Procedural Memory
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_learn_preference_new() {
        let mut manager = MultiLayerMemoryManager::new();
        manager.learn_preference(PreferenceCategory::Format, "prefers_lists".to_string(), 0.8);

        let prefs = manager.get_preferences(&PreferenceCategory::Format);
        assert_eq!(prefs.len(), 1);
        assert_eq!(prefs[0].rule, "prefers_lists");
        assert_eq!(prefs[0].confidence, 0.8);
    }

    #[test]
    fn test_learn_preference_update() {
        let mut manager = MultiLayerMemoryManager::new();

        // Premier apprentissage
        manager.learn_preference(PreferenceCategory::Format, "prefers_lists".to_string(), 0.6);

        // Deuxième apprentissage (même règle)
        manager.learn_preference(PreferenceCategory::Format, "prefers_lists".to_string(), 1.0);

        let prefs = manager.get_preferences(&PreferenceCategory::Format);
        assert_eq!(prefs.len(), 1);
        // Confidence = (0.6 + 1.0) / 2 = 0.8
        assert_eq!(prefs[0].confidence, 0.8);
        assert_eq!(prefs[0].evidence_count, 2);
    }

    #[test]
    fn test_get_preferences_by_category() {
        let mut manager = MultiLayerMemoryManager::new();
        manager.learn_preference(PreferenceCategory::Format, "format_rule".to_string(), 0.7);
        manager.learn_preference(PreferenceCategory::Depth, "depth_rule".to_string(), 0.8);
        manager.learn_preference(PreferenceCategory::Style, "style_rule".to_string(), 0.9);

        let format_prefs = manager.get_preferences(&PreferenceCategory::Format);
        assert_eq!(format_prefs.len(), 1);
        assert_eq!(format_prefs[0].rule, "format_rule");

        let depth_prefs = manager.get_preferences(&PreferenceCategory::Depth);
        assert_eq!(depth_prefs.len(), 1);
    }

    #[test]
    fn test_procedural_limit_50() {
        let mut manager = MultiLayerMemoryManager::new();

        // Ajouter 60 préférences différentes
        for i in 0..60 {
            manager.learn_preference(PreferenceCategory::Format, format!("rule_{}", i), 0.5);
        }

        // Devrait être limité à 50
        assert_eq!(manager.procedural.len(), 50);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests Reflective Memory
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_add_evaluation() {
        let mut manager = MultiLayerMemoryManager::new();
        manager.add_evaluation(
            EvaluationDimension::Clarity,
            0.9,
            "Clear response".to_string(),
            "No action needed".to_string(),
        );

        assert_eq!(manager.reflective.len(), 1);
    }

    #[test]
    fn test_evaluation_average_single() {
        let mut manager = MultiLayerMemoryManager::new();
        manager.add_evaluation(
            EvaluationDimension::Clarity,
            0.8,
            "Evidence".to_string(),
            "Action".to_string(),
        );

        let avg = manager.get_evaluation_average(&EvaluationDimension::Clarity);
        assert_eq!(avg, 0.8);
    }

    #[test]
    fn test_evaluation_average_multiple() {
        let mut manager = MultiLayerMemoryManager::new();
        manager.add_evaluation(
            EvaluationDimension::Utility,
            0.6,
            "E1".to_string(),
            "A1".to_string(),
        );
        manager.add_evaluation(
            EvaluationDimension::Utility,
            0.8,
            "E2".to_string(),
            "A2".to_string(),
        );
        manager.add_evaluation(
            EvaluationDimension::Utility,
            1.0,
            "E3".to_string(),
            "A3".to_string(),
        );

        let avg = manager.get_evaluation_average(&EvaluationDimension::Utility);
        // (0.6 + 0.8 + 1.0) / 3 = 0.8
        assert!((avg - 0.8).abs() < 0.001);
    }

    #[test]
    fn test_evaluation_average_none() {
        let manager = MultiLayerMemoryManager::new();
        let avg = manager.get_evaluation_average(&EvaluationDimension::Clarity);
        // Par défaut neutre
        assert_eq!(avg, 0.5);
    }

    #[test]
    fn test_evaluation_average_by_dimension() {
        let mut manager = MultiLayerMemoryManager::new();
        manager.add_evaluation(
            EvaluationDimension::Clarity,
            0.9,
            "E".to_string(),
            "A".to_string(),
        );
        manager.add_evaluation(
            EvaluationDimension::Depth,
            0.5,
            "E".to_string(),
            "A".to_string(),
        );

        let clarity_avg = manager.get_evaluation_average(&EvaluationDimension::Clarity);
        let depth_avg = manager.get_evaluation_average(&EvaluationDimension::Depth);

        assert_eq!(clarity_avg, 0.9);
        assert_eq!(depth_avg, 0.5);
    }

    #[test]
    fn test_reflective_limit_100() {
        let mut manager = MultiLayerMemoryManager::new();

        for _ in 0..110 {
            manager.add_evaluation(
                EvaluationDimension::Clarity,
                0.7,
                "E".to_string(),
                "A".to_string(),
            );
        }

        assert_eq!(manager.reflective.len(), 100);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests Consolidation
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_consolidate_session_extracts_concepts() {
        let mut manager = MultiLayerMemoryManager::new();

        // Ajouter messages avec concepts TITANE
        manager.add_to_immediate(
            "Le SingularityState est important".to_string(),
            "Réponse".to_string(),
        );

        manager.consolidate_session();

        // Devrait avoir extrait le concept
        let concept = manager.get_concept("SingularityState");
        assert!(concept.is_some());
    }

    #[test]
    fn test_consolidate_session_multiple_concepts() {
        let mut manager = MultiLayerMemoryManager::new();

        manager.add_to_immediate(
            "Humain Total et charge mentale".to_string(),
            "Réponse".to_string(),
        );

        manager.consolidate_session();

        assert!(manager.get_concept("Humain Total").is_some());
        assert!(manager.get_concept("Charge mentale").is_some());
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests ImmediateMemory interne
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_immediate_memory_new() {
        let mem = ImmediateMemory::new();
        assert!(mem.messages.is_empty());
        assert_eq!(mem.max_size, 10);
    }

    #[test]
    fn test_immediate_memory_add() {
        let mut mem = ImmediateMemory::new();
        mem.add("user".to_string(), "assistant".to_string());
        assert_eq!(mem.messages.len(), 1);
    }

    #[test]
    fn test_immediate_memory_fifo() {
        let mut mem = ImmediateMemory::new();

        // Ajouter 15 messages (max est 10)
        for i in 0..15 {
            mem.add(format!("user {}", i), format!("asst {}", i));
        }

        // Devrait garder seulement les 10 derniers
        assert_eq!(mem.messages.len(), 10);
        // Le premier message devrait être "user 5"
        assert_eq!(mem.messages[0].0, "user 5");
    }

    #[test]
    fn test_immediate_memory_get_recent() {
        let mut mem = ImmediateMemory::new();
        mem.add("user 1".to_string(), "asst 1".to_string());
        mem.add("user 2".to_string(), "asst 2".to_string());
        mem.add("user 3".to_string(), "asst 3".to_string());

        let recent = mem.get_recent(2);
        assert_eq!(recent.len(), 2);
        // Plus récent d'abord
        assert_eq!(recent[0].0, "user 3");
        assert_eq!(recent[1].0, "user 2");
    }

    #[test]
    fn test_immediate_memory_get_recent_more_than_exists() {
        let mut mem = ImmediateMemory::new();
        mem.add("user".to_string(), "asst".to_string());

        let recent = mem.get_recent(100);
        // Ne peut retourner que 1 car c'est tout ce qu'on a
        assert_eq!(recent.len(), 1);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests d'intégration
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_full_workflow() {
        let mut manager = MultiLayerMemoryManager::new();
        let emotion = EmotionState::new(0.7, 0.6, 0.8);

        // 1. Ajouter des messages
        manager.add_to_immediate(
            "Question sur SingularityState".to_string(),
            "Réponse".to_string(),
        );

        // 2. Sauvegarder un épisode
        manager.save_episode(
            "Découverte importante".to_string(),
            "L'utilisateur découvre SingularityState".to_string(),
            EpisodeType::Milestone,
            &emotion,
            0.9,
            vec!["discovery".to_string()],
        );

        // 3. Apprendre une préférence
        manager.learn_preference(
            PreferenceCategory::Depth,
            "prefers_deep_analysis".to_string(),
            0.85,
        );

        // 4. Ajouter une évaluation
        manager.add_evaluation(
            EvaluationDimension::Clarity,
            0.9,
            "Clear explanation".to_string(),
            "Continue this approach".to_string(),
        );

        // 5. Consolider
        manager.consolidate_session();

        // Vérifications
        assert!(!manager.get_immediate_context().is_empty());
        assert_eq!(manager.episodic.len(), 1);
        assert!(manager.get_concept("SingularityState").is_some());
        assert!(!manager
            .get_preferences(&PreferenceCategory::Depth)
            .is_empty());
        assert_eq!(
            manager.get_evaluation_average(&EvaluationDimension::Clarity),
            0.9
        );
    }
}
