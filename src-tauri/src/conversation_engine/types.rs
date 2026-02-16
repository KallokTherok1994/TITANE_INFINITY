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

    /// System prompt personnalisé (depuis InstructionMode frontend)
    #[serde(default)]
    pub custom_system_prompt: Option<String>,
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

        // Mots positifs (cumulatifs)
        // Note: garder des incréments modestes et laisser `Self::new` faire le clamp.
        if lower.contains("super") {
            valence += 0.3;
            intensity += 0.2;
            energy += 0.2;
        }
        if lower.contains("génial") {
            valence += 0.3;
            intensity += 0.2;
            energy += 0.2;
        }
        if lower.contains("excellent") {
            valence += 0.3;
            intensity += 0.2;
            energy += 0.2;
        }
        if lower.contains("fantastique") {
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
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provider_meta: Option<ProviderDecisionMeta>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProviderClass {
    Local,
    Remote,
    Hybrid,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum Mode {
    Local,
    Remote,
    Offline,
    Cached,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ReasonCode {
    Ok,
    PolicyLocalOnly,
    PolicyRemoteAllowed,
    AllowlistDenied,
    ProviderDown,
    Timeout,
    RateLimit,
    InvalidConfig,
    NetworkError,
    FallbackOffline,
    CacheHit,
    CacheMiss,
    SerializationDropped,
    ProviderUnavailable,
    ToolRequired,
    ToolDenied,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderAttemptMeta {
    pub provider_id: String,
    pub provider_class: ProviderClass,
    pub latency_ms: u128,
    pub outcome: String,
    pub reason_code: ReasonCode,
    pub network_used_attempt: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderDecisionMeta {
    pub provider_used: String,
    pub provider_class: ProviderClass,
    pub mode: Mode,
    pub reason_code: ReasonCode,
    pub latency_ms_total: u128,
    pub timeout_ms: u64,
    pub retries: u32,
    pub attempts: Vec<ProviderAttemptMeta>,
    pub network_used: bool,
    pub cache_hit: bool,
    pub policy: String,
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

// ═══════════════════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────────────
    // Tests ConversationMode
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_conversation_mode_default() {
        let mode = ConversationMode::default();
        assert_eq!(mode, ConversationMode::Default);
    }

    #[test]
    fn test_conversation_mode_variants() {
        let modes = [
            ConversationMode::Default,
            ConversationMode::Brainstorming,
            ConversationMode::Synthesis,
            ConversationMode::Planning,
            ConversationMode::Journal,
            ConversationMode::DebugCognitive,
        ];
        assert_eq!(modes.len(), 6);
    }

    #[test]
    fn test_conversation_mode_debug() {
        let mode = ConversationMode::Brainstorming;
        let debug_str = format!("{:?}", mode);
        assert!(debug_str.contains("Brainstorming"));
    }

    #[test]
    fn test_conversation_mode_clone() {
        let mode = ConversationMode::Planning;
        let cloned = mode;
        assert_eq!(mode, cloned);
    }

    #[test]
    fn test_conversation_mode_copy() {
        let mode = ConversationMode::Journal;
        let copied = mode;
        assert_eq!(mode, copied);
    }

    #[test]
    fn test_conversation_mode_serialize() {
        let mode = ConversationMode::Synthesis;
        let json = serde_json::to_string(&mode).expect("ConversationMode should serialize to JSON");
        assert!(json.contains("Synthesis"));
    }

    #[test]
    fn test_conversation_mode_deserialize() {
        let json = "\"Planning\"";
        let mode: ConversationMode =
            serde_json::from_str(json).expect("ConversationMode should deserialize from JSON");
        assert_eq!(mode, ConversationMode::Planning);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests Intention
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_intention_variants() {
        let intentions = [
            Intention::Question,
            Intention::Action,
            Intention::Emotion,
            Intention::Clarification,
            Intention::Meta,
        ];
        assert_eq!(intentions.len(), 5);
    }

    #[test]
    fn test_intention_analyze_question_mark() {
        let intention = Intention::analyze("Comment ça marche?");
        assert_eq!(intention, Intention::Question);
    }

    #[test]
    fn test_intention_analyze_comment() {
        let intention = Intention::analyze("comment faire cela");
        assert_eq!(intention, Intention::Question);
    }

    #[test]
    fn test_intention_analyze_pourquoi() {
        let intention = Intention::analyze("pourquoi est-ce ainsi");
        assert_eq!(intention, Intention::Question);
    }

    #[test]
    fn test_intention_analyze_quest_ce_que() {
        let intention = Intention::analyze("qu'est-ce que c'est");
        assert_eq!(intention, Intention::Question);
    }

    #[test]
    fn test_intention_analyze_quel() {
        let intention = Intention::analyze("quel est le résultat");
        assert_eq!(intention, Intention::Question);
    }

    #[test]
    fn test_intention_analyze_ou() {
        let intention = Intention::analyze("où se trouve le fichier");
        assert_eq!(intention, Intention::Question);
    }

    #[test]
    fn test_intention_analyze_peux_tu() {
        let intention = Intention::analyze("peux-tu m'aider");
        assert_eq!(intention, Intention::Action);
    }

    #[test]
    fn test_intention_analyze_pourrais_tu() {
        let intention = Intention::analyze("pourrais-tu faire cela");
        assert_eq!(intention, Intention::Action);
    }

    #[test]
    fn test_intention_analyze_creer() {
        let intention = Intention::analyze("créer un nouveau fichier");
        assert_eq!(intention, Intention::Action);
    }

    #[test]
    fn test_intention_analyze_faire() {
        let intention = Intention::analyze("faire une analyse");
        assert_eq!(intention, Intention::Action);
    }

    #[test]
    fn test_intention_analyze_analyser() {
        let intention = Intention::analyze("analyser ce code");
        assert_eq!(intention, Intention::Action);
    }

    #[test]
    fn test_intention_analyze_ressens() {
        let intention = Intention::analyze("je ressens de l'anxiété");
        assert_eq!(intention, Intention::Emotion);
    }

    #[test]
    fn test_intention_analyze_emotion() {
        let intention = Intention::analyze("mon émotion du jour");
        assert_eq!(intention, Intention::Emotion);
    }

    #[test]
    fn test_intention_analyze_sentiment() {
        let intention = Intention::analyze("ce sentiment est fort");
        assert_eq!(intention, Intention::Emotion);
    }

    #[test]
    fn test_intention_analyze_inquiet() {
        let intention = Intention::analyze("je suis inquiet");
        assert_eq!(intention, Intention::Emotion);
    }

    #[test]
    fn test_intention_analyze_heureux() {
        let intention = Intention::analyze("je suis heureux");
        assert_eq!(intention, Intention::Emotion);
    }

    #[test]
    fn test_intention_analyze_triste() {
        let intention = Intention::analyze("je suis triste");
        assert_eq!(intention, Intention::Emotion);
    }

    #[test]
    fn test_intention_analyze_conversation() {
        let intention = Intention::analyze("notre conversation est intéressante");
        assert_eq!(intention, Intention::Meta);
    }

    #[test]
    fn test_intention_analyze_discuter() {
        let intention = Intention::analyze("discuter de ce sujet");
        assert_eq!(intention, Intention::Meta);
    }

    #[test]
    fn test_intention_analyze_parlons() {
        let intention = Intention::analyze("parlons de autre chose");
        assert_eq!(intention, Intention::Meta);
    }

    #[test]
    fn test_intention_analyze_default_clarification() {
        let intention = Intention::analyze("bonjour monde");
        assert_eq!(intention, Intention::Clarification);
    }

    #[test]
    fn test_intention_serialize() {
        let intention = Intention::Question;
        let json = serde_json::to_string(&intention).expect("Intention should serialize to JSON");
        assert!(json.contains("Question"));
    }

    #[test]
    fn test_intention_deserialize() {
        let json = "\"Action\"";
        let intention: Intention =
            serde_json::from_str(json).expect("Intention should deserialize from JSON");
        assert_eq!(intention, Intention::Action);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests EmotionState
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_emotion_state_default() {
        let state = EmotionState::default();
        assert_eq!(state.valence, 0.0);
        assert_eq!(state.intensity, 0.5);
        assert_eq!(state.energy, 0.5);
    }

    #[test]
    fn test_emotion_state_new() {
        let state = EmotionState::new(0.5, 0.7, 0.8);
        assert_eq!(state.valence, 0.5);
        assert_eq!(state.intensity, 0.7);
        assert_eq!(state.energy, 0.8);
    }

    #[test]
    fn test_emotion_state_new_clamping_valence() {
        let state = EmotionState::new(2.0, 0.5, 0.5);
        assert_eq!(state.valence, 1.0);

        let state2 = EmotionState::new(-2.0, 0.5, 0.5);
        assert_eq!(state2.valence, -1.0);
    }

    #[test]
    fn test_emotion_state_new_clamping_intensity() {
        let state = EmotionState::new(0.0, 2.0, 0.5);
        assert_eq!(state.intensity, 1.0);

        let state2 = EmotionState::new(0.0, -1.0, 0.5);
        assert_eq!(state2.intensity, 0.0);
    }

    #[test]
    fn test_emotion_state_new_clamping_energy() {
        let state = EmotionState::new(0.0, 0.5, 2.0);
        assert_eq!(state.energy, 1.0);

        let state2 = EmotionState::new(0.0, 0.5, -1.0);
        assert_eq!(state2.energy, 0.0);
    }

    #[test]
    fn test_emotion_state_analyze_positive() {
        let state = EmotionState::analyze("super génial excellent");
        assert!(state.valence > 0.0);
        assert!(state.intensity > 0.5);
    }

    #[test]
    fn test_emotion_state_analyze_negative() {
        let state = EmotionState::analyze("problème erreur frustré");
        assert!(state.valence < 0.0);
        assert!(state.intensity > 0.5);
    }

    #[test]
    fn test_emotion_state_analyze_fatigue() {
        let state = EmotionState::analyze("fatigué épuisé");
        assert!(state.energy < 0.5);
    }

    #[test]
    fn test_emotion_state_analyze_exclamation() {
        let state = EmotionState::analyze("wow!!!");
        assert!(state.intensity > 0.5);
    }

    #[test]
    fn test_emotion_state_debug() {
        let state = EmotionState::new(0.5, 0.6, 0.7);
        let debug_str = format!("{:?}", state);
        assert!(debug_str.contains("valence"));
    }

    #[test]
    fn test_emotion_state_clone() {
        let state = EmotionState::new(0.5, 0.5, 0.5);
        let cloned = state.clone();
        assert_eq!(state.valence, cloned.valence);
    }

    #[test]
    fn test_emotion_state_serialize() {
        let state = EmotionState::new(0.5, 0.5, 0.5);
        let json = serde_json::to_string(&state).expect("EmotionState should serialize to JSON");
        assert!(json.contains("valence"));
    }

    #[test]
    fn test_emotion_state_deserialize() {
        let json = r#"{"valence":0.5,"intensity":0.6,"energy":0.7}"#;
        let state: EmotionState =
            serde_json::from_str(json).expect("EmotionState should deserialize from JSON");
        assert_eq!(state.valence, 0.5);
        assert_eq!(state.intensity, 0.6);
        assert_eq!(state.energy, 0.7);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests MemoryEffect
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_memory_effect_variants() {
        let effects = [
            MemoryEffect::New,
            MemoryEffect::Recall,
            MemoryEffect::Connect,
            MemoryEffect::Evolve,
        ];
        assert_eq!(effects.len(), 4);
    }

    #[test]
    fn test_memory_effect_eq() {
        assert_eq!(MemoryEffect::New, MemoryEffect::New);
        assert_ne!(MemoryEffect::New, MemoryEffect::Recall);
    }

    #[test]
    fn test_memory_effect_serialize() {
        let effect = MemoryEffect::Connect;
        let json = serde_json::to_string(&effect).expect("MemoryEffect should serialize to JSON");
        assert!(json.contains("Connect"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests MemoryLayers
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_memory_layers_default() {
        let layers = MemoryLayers::default();
        assert!(layers.immediate);
        assert!(!layers.episodic);
        assert!(layers.semantic.is_empty());
        assert!(layers.procedural.is_empty());
        assert!(!layers.reflective);
    }

    #[test]
    fn test_memory_layers_custom() {
        let layers = MemoryLayers {
            immediate: true,
            episodic: true,
            semantic: vec!["concept1".to_string()],
            procedural: vec!["pattern1".to_string()],
            reflective: true,
        };
        assert!(layers.episodic);
        assert_eq!(layers.semantic.len(), 1);
    }

    #[test]
    fn test_memory_layers_serialize() {
        let layers = MemoryLayers::default();
        let json = serde_json::to_string(&layers).expect("MemoryLayers should serialize to JSON");
        assert!(json.contains("immediate"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests EpisodeType
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_episode_type_variants() {
        let types = [
            EpisodeType::Milestone,
            EpisodeType::Decision,
            EpisodeType::Pivot,
            EpisodeType::ConversationKey,
        ];
        assert_eq!(types.len(), 4);
    }

    #[test]
    fn test_episode_type_serialize_snake_case() {
        let episode = EpisodeType::ConversationKey;
        let json = serde_json::to_string(&episode).expect("EpisodeType should serialize to JSON");
        assert!(json.contains("conversation_key"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests PreferenceCategory
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_preference_category_variants() {
        let categories = [
            PreferenceCategory::Format,
            PreferenceCategory::Depth,
            PreferenceCategory::Style,
            PreferenceCategory::Structure,
        ];
        assert_eq!(categories.len(), 4);
    }

    #[test]
    fn test_preference_category_eq() {
        assert_eq!(PreferenceCategory::Format, PreferenceCategory::Format);
        assert_ne!(PreferenceCategory::Format, PreferenceCategory::Style);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests EvaluationDimension
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_evaluation_dimension_variants() {
        let dimensions = [
            EvaluationDimension::Clarity,
            EvaluationDimension::Utility,
            EvaluationDimension::Coherence,
            EvaluationDimension::Depth,
        ];
        assert_eq!(dimensions.len(), 4);
    }

    #[test]
    fn test_evaluation_dimension_eq() {
        assert_eq!(EvaluationDimension::Clarity, EvaluationDimension::Clarity);
        assert_ne!(EvaluationDimension::Clarity, EvaluationDimension::Depth);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests AIConfig
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_ai_config_default() {
        let config = AIConfig::default();
        assert_eq!(config.temperature, 0.7);
        assert!(config.max_tokens.is_none());
        assert!(matches!(
            config.provider_preference,
            ProviderPreference::Auto
        ));
    }

    #[test]
    fn test_ai_config_custom() {
        let config = AIConfig {
            temperature: 0.9,
            max_tokens: Some(1000),
            provider_preference: ProviderPreference::Gemini,
        };
        assert_eq!(config.temperature, 0.9);
        assert_eq!(config.max_tokens, Some(1000));
    }

    #[test]
    fn test_ai_config_serialize() {
        let config = AIConfig::default();
        let json = serde_json::to_string(&config).expect("AIConfig should serialize to JSON");
        assert!(json.contains("temperature"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests ProviderPreference
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_provider_preference_variants() {
        let providers = [
            ProviderPreference::Auto,
            ProviderPreference::Gemini,
            ProviderPreference::Ollama,
            ProviderPreference::OpenAI,
            ProviderPreference::Claude,
            ProviderPreference::Local,
        ];
        assert_eq!(providers.len(), 6);
    }

    #[test]
    fn test_provider_preference_copy() {
        let prov = ProviderPreference::Claude;
        let copied = prov;
        assert!(matches!(copied, ProviderPreference::Claude));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests HealthStatus
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_health_status_variants() {
        let statuses = [
            HealthStatus::Healthy,
            HealthStatus::Warning,
            HealthStatus::Critical,
        ];
        assert_eq!(statuses.len(), 3);
    }

    #[test]
    fn test_health_status_serialize() {
        let status = HealthStatus::Warning;
        let json = serde_json::to_string(&status).expect("HealthStatus should serialize to JSON");
        assert!(json.contains("Warning"));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests AnomalyType
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_anomaly_type_variants() {
        let types = [
            AnomalyType::MessageLoss,
            AnomalyType::StateDrift,
            AnomalyType::MemoryCorruption,
            AnomalyType::SyncFailure,
        ];
        assert_eq!(types.len(), 4);
    }

    #[test]
    fn test_anomaly_type_hash() {
        use std::collections::HashSet;
        let mut set = HashSet::new();
        set.insert(AnomalyType::MessageLoss);
        set.insert(AnomalyType::StateDrift);
        assert_eq!(set.len(), 2);
    }

    #[test]
    fn test_anomaly_type_eq() {
        assert_eq!(AnomalyType::MessageLoss, AnomalyType::MessageLoss);
        assert_ne!(AnomalyType::MessageLoss, AnomalyType::SyncFailure);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests Structs
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_anomaly_struct() {
        let anomaly = Anomaly {
            anomaly_type: AnomalyType::MessageLoss,
            severity: 0.8,
            description: "Test anomaly".to_string(),
        };
        assert_eq!(anomaly.severity, 0.8);
    }

    #[test]
    fn test_repair_struct() {
        let repair = Repair {
            repair_type: "cleanup".to_string(),
            success: true,
            details: "Cleaned up".to_string(),
        };
        assert!(repair.success);
    }

    #[test]
    fn test_conversation_health_report() {
        let report = ConversationHealthReport {
            status: HealthStatus::Healthy,
            anomalies_detected: vec![],
            repairs_applied: vec![],
            coherence_score: 0.95,
        };
        assert!(matches!(report.status, HealthStatus::Healthy));
        assert_eq!(report.coherence_score, 0.95);
    }

    #[test]
    fn test_conversation_metadata() {
        let metadata = ConversationMetadata {
            timestamp: 1234567890,
            provider_used: "Gemini".to_string(),
            latency_ms: 150,
            tokens_used: 500,
            memory_effect: MemoryEffect::New,
            links_to_contexts: vec!["ctx1".to_string()],
            provider_meta: None,
        };
        assert_eq!(metadata.timestamp, 1234567890);
        assert_eq!(metadata.tokens_used, 500);
    }

    #[test]
    fn test_concept_struct() {
        let concept = Concept {
            name: "TestConcept".to_string(),
            definition: "A test".to_string(),
            aliases: vec![],
            related_concepts: vec![],
            first_mentioned: 0,
            usage_count: 1,
            examples: vec![],
        };
        assert_eq!(concept.name, "TestConcept");
    }

    #[test]
    fn test_preference_struct() {
        let pref = Preference {
            category: PreferenceCategory::Format,
            rule: "lists".to_string(),
            confidence: 0.9,
            evidence_count: 5,
            last_confirmed: 12345,
        };
        assert_eq!(pref.confidence, 0.9);
    }

    #[test]
    fn test_evaluation_struct() {
        let eval = Evaluation {
            timestamp: 12345,
            dimension: EvaluationDimension::Clarity,
            score: 0.85,
            evidence: "Clear text".to_string(),
            action_taken: "None".to_string(),
        };
        assert_eq!(eval.score, 0.85);
    }

    #[test]
    fn test_episodic_memory_struct() {
        let episode = EpisodicMemory {
            id: "ep-1".to_string(),
            timestamp: 12345,
            event_type: EpisodeType::Milestone,
            title: "Test".to_string(),
            summary: "Summary".to_string(),
            emotional_valence: 0.5,
            importance: 0.8,
            linked_projects: vec![],
            linked_decisions: vec![],
            tags: vec!["tag".to_string()],
        };
        assert_eq!(episode.importance, 0.8);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Tests ConversationRequest/Response
    // ─────────────────────────────────────────────────────────────────────

    #[test]
    fn test_conversation_request() {
        let request = ConversationRequest {
            user_message: "Hello".to_string(),
            conversation_id: None,
            mode: ConversationMode::Default,
            ai_config: None,
            emotion_context: None,
            custom_system_prompt: None,
        };
        assert_eq!(request.user_message, "Hello");
        assert!(request.conversation_id.is_none());
    }

    #[test]
    fn test_conversation_request_with_config() {
        let request = ConversationRequest {
            user_message: "Test".to_string(),
            conversation_id: Some("conv-1".to_string()),
            mode: ConversationMode::Brainstorming,
            ai_config: Some(AIConfig::default()),
            emotion_context: Some(EmotionState::default()),
            custom_system_prompt: None,
        };
        assert!(request.conversation_id.is_some());
        assert!(request.ai_config.is_some());
    }

    #[test]
    fn test_conversation_response() {
        let response = ConversationResponse {
            assistant_message: "Reply".to_string(),
            conversation_id: "conv-1".to_string(),
            message_id: "msg-1".to_string(),
            detected_intention: Intention::Question,
            detected_emotion: EmotionState::default(),
            cognitive_tags: vec!["tag".to_string()],
            cognitive_summary: "Summary".to_string(),
            metadata: ConversationMetadata {
                timestamp: 0,
                provider_used: "Test".to_string(),
                latency_ms: 0,
                tokens_used: 0,
                memory_effect: MemoryEffect::New,
                links_to_contexts: vec![],
                provider_meta: None,
            },
        };
        assert_eq!(response.assistant_message, "Reply");
        assert_eq!(response.message_id, "msg-1");
    }
}
