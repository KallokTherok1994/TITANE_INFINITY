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
