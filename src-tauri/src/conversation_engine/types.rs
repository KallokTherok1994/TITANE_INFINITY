/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — CONVERSATION ENGINE TYPES
 * Types fondamentaux pour le système conversationnel unifié
 * ═══════════════════════════════════════════════════════════════════
 */
use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════════════
// REQUEST / RESPONSE
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationRequest {
    /// Message utilisateur (obligatoire)
    pub user_message: String,

    /// ID de conversation (None = nouvelle conversation)
    pub conversation_id: Option<String>,

    /// Mode conversationnel
    pub mode: ConversationMode,

    /// Configuration IA
    pub ai_config: Option<AIConfig>,

    /// Contexte émotionnel initial
    pub emotion_context: Option<EmotionState>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationResponse {
    /// Réponse assistant
    pub assistant_message: String,

    /// ID de conversation
    pub conversation_id: String,

    /// ID du message
    pub message_id: String,

    /// Intention détectée
    pub detected_intention: Intention,

    /// État émotionnel détecté
    pub detected_emotion: EmotionState,

    /// Tags cognitifs
    pub cognitive_tags: Vec<String>,

    /// Résumé cognitif
    pub cognitive_summary: String,

    /// Métadonnées
    pub metadata: ConversationMetadata,
}

// ═══════════════════════════════════════════════════════════════════
// CONVERSATION MODES
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ConversationMode {
    /// Mode standard (conversation générale)
    Default,

    /// Brainstorming (divergence créative)
    Brainstorming,

    /// Synthèse (connexion d'idées)
    Synthesis,

    /// Planification (structuration & action)
    Planning,

    /// Journal (réflexion personnelle)
    Journal,

    /// Debug cognitif (analyse charge mentale)
    DebugCognitive,
}

impl Default for ConversationMode {
    fn default() -> Self {
        Self::Default
    }
}

// ═══════════════════════════════════════════════════════════════════
// INTENTION ANALYSIS
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Intention {
    /// Question (recherche d'information)
    Question,

    /// Action (demande d'exécution)
    Action,

    /// Émotion (expression émotionnelle)
    Emotion,

    /// Clarification (besoin de précision)
    Clarification,

    /// Meta (réflexion sur la conversation elle-même)
    Meta,
}

impl Intention {
    /// Analyser l'intention depuis un message
    pub fn analyze(message: &str) -> Self {
        let lower = message.to_lowercase();

        // Détection de questions
        if lower.contains("?")
            || lower.starts_with("comment ")
            || lower.starts_with("pourquoi ")
            || lower.starts_with("qu'est-ce ")
            || lower.starts_with("quel ")
            || lower.starts_with("où ")
        {
            return Self::Question;
        }

        // Détection d'actions
        if lower.contains("peux-tu ")
            || lower.contains("pourrais-tu ")
            || lower.starts_with("créer ")
            || lower.starts_with("faire ")
            || lower.starts_with("analyser ")
        {
            return Self::Action;
        }

        // Détection émotionnelle
        if lower.contains("ressens")
            || lower.contains("émotion")
            || lower.contains("sentiment")
            || lower.contains("inquiet")
            || lower.contains("heureux")
            || lower.contains("triste")
        {
            return Self::Emotion;
        }

        // Détection meta
        if lower.contains("conversation")
            || lower.contains("discuter de")
            || lower.contains("parlons de")
        {
            return Self::Meta;
        }

        // Par défaut: clarification
        Self::Clarification
    }
}

// ═══════════════════════════════════════════════════════════════════
// EMOTION ANALYSIS
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmotionState {
    /// Valence: -1.0 (négatif) → 1.0 (positif)
    pub valence: f32,

    /// Intensité: 0.0 (calme) → 1.0 (intense)
    pub intensity: f32,

    /// Énergie: 0.0 (épuisé) → 1.0 (énergisé)
    pub energy: f32,
}

impl Default for EmotionState {
    fn default() -> Self {
        Self {
            valence: 0.0,
            intensity: 0.5,
            energy: 0.5,
        }
    }
}

impl EmotionState {
    pub fn new(valence: f32, intensity: f32, energy: f32) -> Self {
        Self {
            valence: valence.clamp(-1.0, 1.0),
            intensity: intensity.clamp(0.0, 1.0),
            energy: energy.clamp(0.0, 1.0),
        }
    }

    /// Analyser émotion depuis un message
    pub fn analyze(message: &str) -> Self {
        let lower = message.to_lowercase();

        let mut valence = 0.0;
        let mut intensity = 0.5;
        let mut energy = 0.5;

        // Mots positifs
        if lower.contains("super") || lower.contains("génial") || lower.contains("excellent") {
            valence += 0.3;
            intensity += 0.2;
            energy += 0.2;
        }

        // Mots négatifs
        if lower.contains("problème") || lower.contains("erreur") || lower.contains("frustré") {
            valence -= 0.3;
            intensity += 0.2;
        }

        // Fatigue
        if lower.contains("fatigué") || lower.contains("épuisé") {
            energy -= 0.3;
        }

        // Enthousiasme
        if lower.contains("!") {
            intensity += 0.1 * lower.matches('!').count() as f32;
            energy += 0.1;
        }

        Self::new(valence, intensity, energy)
    }
}

// ═══════════════════════════════════════════════════════════════════
// MEMORY EFFECT
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum MemoryEffect {
    /// Nouvelle information
    New,

    /// Rappel d'information existante
    Recall,

    /// Connexion entre idées
    Connect,

    /// Évolution de pensée
    Evolve,
}

// ═══════════════════════════════════════════════════════════════════
// MULTI-LAYER MEMORY TYPES
// ═══════════════════════════════════════════════════════════════════

/// Couches de mémoire multi-niveaux
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryLayers {
    pub immediate: bool,         // Mémoire session courante
    pub episodic: bool,          // Événement significatif
    pub semantic: Vec<String>,   // Concepts extraits
    pub procedural: Vec<String>, // Patterns/préférences détectés
    pub reflective: bool,        // Nécessite réflexion
}

impl Default for MemoryLayers {
    fn default() -> Self {
        Self {
            immediate: true,
            episodic: false,
            semantic: Vec::new(),
            procedural: Vec::new(),
            reflective: false,
        }
    }
}

/// Mémoire épisodique (événements significatifs)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EpisodicMemory {
    pub id: String,
    pub timestamp: i64,
    pub event_type: EpisodeType,
    pub title: String,
    pub summary: String,
    pub emotional_valence: f64,
    pub importance: f64,
    pub linked_projects: Vec<String>,
    pub linked_decisions: Vec<String>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EpisodeType {
    Milestone,
    Decision,
    Pivot,
    ConversationKey,
}

/// Concept sémantique
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Concept {
    pub name: String,
    pub definition: String,
    pub aliases: Vec<String>,
    pub related_concepts: Vec<String>,
    pub first_mentioned: i64,
    pub usage_count: i32,
    pub examples: Vec<String>,
}

/// Préférence procédurale
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Preference {
    pub category: PreferenceCategory,
    pub rule: String,
    pub confidence: f64,
    pub evidence_count: i32,
    pub last_confirmed: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum PreferenceCategory {
    Format,
    Depth,
    Style,
    Structure,
}

/// Évaluation réflexive
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evaluation {
    pub timestamp: i64,
    pub dimension: EvaluationDimension,
    pub score: f64,
    pub evidence: String,
    pub action_taken: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum EvaluationDimension {
    Clarity,
    Utility,
    Coherence,
    Depth,
}

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIConfig {
    pub temperature: f32,
    pub max_tokens: Option<usize>,
    pub provider_preference: ProviderPreference,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum ProviderPreference {
    Auto,
    Gemini,
    Ollama,
    OpenAI, // 🟢 OpenAI GPT-4
    Claude, // 🟣 Anthropic Claude
    Local,
}

impl Default for AIConfig {
    fn default() -> Self {
        Self {
            temperature: 0.7,
            max_tokens: None,
            provider_preference: ProviderPreference::Auto,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// METADATA
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationMetadata {
    pub timestamp: u64,
    pub provider_used: String,
    pub latency_ms: u64,
    pub tokens_used: usize,
    pub memory_effect: MemoryEffect,
    pub links_to_contexts: Vec<String>,
}

// ═══════════════════════════════════════════════════════════════════
// HEALTH REPORT
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationHealthReport {
    pub status: HealthStatus,
    pub anomalies_detected: Vec<Anomaly>,
    pub repairs_applied: Vec<Repair>,
    pub coherence_score: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HealthStatus {
    Healthy,
    Warning,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Anomaly {
    pub anomaly_type: AnomalyType,
    pub severity: f32,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum AnomalyType {
    MessageLoss,
    StateDrift,
    MemoryCorruption,
    SyncFailure,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Repair {
    pub repair_type: String,
    pub success: bool,
    pub details: String,
}
