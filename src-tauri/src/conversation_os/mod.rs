//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — CONVERSATION OS #∞ (Presence Engine)
//! Super Prompt #9 — Intelligence Interactionnelle, Cohérence Narrative, Style
//! ═══════════════════════════════════════════════════════════════════════════════
//!
//! Le Conversation OS #∞ est la couche de conscience interactionnelle de TITANE∞.
//! Il gère: intention, ton, style, cohérence narrative, adaptation relationnelle.

pub mod intent;
pub mod narrative;
pub mod persona;
pub mod style;
pub mod coherence;
pub mod memory_context;
pub mod emotion;
pub mod safety;
pub mod formatter;
pub mod adapter;
pub mod router;
pub mod output;
pub mod diagnostics;

pub use intent::{IntentDetector, UserIntent, IntentConfidence};
pub use narrative::{NarrativeEngine, NarrativeThread, NarrativeState};
pub use persona::{PersonaEngine, PersonaConfig, PersonaProfile};
pub use style::{StyleEngine, StyleConfig, StyleLevel};
pub use coherence::{CoherenceEngine, CoherenceReport, CoherenceIssue};
pub use memory_context::{MemoryContextEngine, ConversationContext};
pub use emotion::{EmotionEngine, EmotionalState, EmotionalTone};
pub use safety::{ConversationSafety, SafetyCheck, SafetyLevel};
pub use formatter::{ResponseFormatter, FormattedOutput};
pub use adapter::{ResponseAdapter, AdaptationContext, OutputChannel};
pub use router::{ConversationRouter, ConversationStage, PipelineConfig};
pub use output::{OutputEngine, FinalResponse};
pub use diagnostics::{ConversationDiagnostics, ConversationEvent};

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Configuration globale du Conversation OS
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ConversationOSConfig {
    /// Activer le Conversation OS
    pub enabled: bool,
    /// Niveau de détail du style
    pub style_depth: u8,
    /// Activer la détection d'émotion
    pub emotion_detection: bool,
    /// Activer la cohérence narrative
    pub narrative_tracking: bool,
    /// Niveau de sécurité conversationnelle
    pub safety_level: SafetyLevel,
    /// Persona par défaut
    pub default_persona: String,
}

impl Default for ConversationOSConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            style_depth: 3,
            emotion_detection: true,
            narrative_tracking: true,
            safety_level: SafetyLevel::Standard,
            default_persona: "titane_default".to_string(),
        }
    }
}

/// État interne du Conversation OS
#[derive(Clone, Debug, Default)]
pub struct ConversationOSState {
    pub current_intent: Option<UserIntent>,
    pub narrative_state: NarrativeState,
    pub emotional_state: EmotionalState,
    pub active_persona: PersonaProfile,
    pub conversation_depth: u32,
    pub last_coherence_check: Option<CoherenceReport>,
}

/// Le Conversation OS principal
pub struct ConversationOS {
    config: ConversationOSConfig,
    state: Arc<RwLock<ConversationOSState>>,
    intent_detector: IntentDetector,
    narrative_engine: NarrativeEngine,
    persona_engine: PersonaEngine,
    style_engine: StyleEngine,
    coherence_engine: CoherenceEngine,
    memory_context: MemoryContextEngine,
    emotion_engine: EmotionEngine,
    safety: ConversationSafety,
    formatter: ResponseFormatter,
    adapter: ResponseAdapter,
    router: ConversationRouter,
    output_engine: OutputEngine,
    diagnostics: ConversationDiagnostics,
}

impl ConversationOS {
    /// Crée une nouvelle instance du Conversation OS
    pub fn new(config: ConversationOSConfig) -> Self {
        Self {
            config: config.clone(),
            state: Arc::new(RwLock::new(ConversationOSState::default())),
            intent_detector: IntentDetector::new(),
            narrative_engine: NarrativeEngine::new(),
            persona_engine: PersonaEngine::new(&config.default_persona),
            style_engine: StyleEngine::new(config.style_depth),
            coherence_engine: CoherenceEngine::new(),
            memory_context: MemoryContextEngine::new(),
            emotion_engine: EmotionEngine::new(),
            safety: ConversationSafety::new(config.safety_level),
            formatter: ResponseFormatter::new(),
            adapter: ResponseAdapter::new(),
            router: ConversationRouter::new(),
            output_engine: OutputEngine::new(),
            diagnostics: ConversationDiagnostics::new(),
        }
    }

    /// Traite une entrée utilisateur et produit une réponse stylisée
    pub async fn process(&self, input: &str, context: &ConversationContext) -> Result<FinalResponse, ConversationError> {
        let start = std::time::Instant::now();

        // 1. Détection d'intention
        let intent = self.intent_detector.detect(input, context).await;
        self.diagnostics.emit(ConversationEvent::IntentDetected(intent.clone())).await;

        // 2. Mise à jour état
        {
            let mut state = self.state.write().await;
            state.current_intent = Some(intent.clone());
            state.conversation_depth += 1;
        }

        // 3. Routage du pipeline
        let stages = self.router.route(&intent);
        self.diagnostics.emit(ConversationEvent::PipelineRouted(stages.len())).await;

        // 4. Extraction contexte mémoire
        let memory_ctx = self.memory_context.extract(context).await;

        // 5. Détection émotion (si activée)
        let emotional_state = if self.config.emotion_detection {
            self.emotion_engine.analyze(input, &memory_ctx).await
        } else {
            EmotionalState::default()
        };

        // 6. Mise à jour narrative
        let narrative = self.narrative_engine.update(input, &intent, &memory_ctx).await;

        // 7. Vérification cohérence
        let coherence = if self.config.narrative_tracking {
            Some(self.coherence_engine.check(&narrative, context).await)
        } else {
            None
        };

        // 8. Application du persona
        let persona = self.persona_engine.get_active_profile().await;

        // 9. Vérification sécurité
        let safety_check = self.safety.check(input, &intent).await;
        if !safety_check.is_safe {
            self.diagnostics.emit(ConversationEvent::SafetyTriggered(safety_check.clone())).await;
            return Err(ConversationError::SafetyViolation(safety_check.reason));
        }

        // 10. Construction contexte de sortie
        let output_context = OutputContext {
            intent: intent.clone(),
            emotional_state,
            narrative,
            persona,
            coherence,
            memory_ctx,
        };

        // 11. Formatage de la réponse
        let formatted = self.formatter.format(&output_context).await;

        // 12. Application du style
        let styled = self.style_engine.apply(&formatted, &persona).await;

        // 13. Adaptation au canal
        let adapted = self.adapter.adapt(&styled, context.channel.clone()).await;

        // 14. Production sortie finale
        let final_response = self.output_engine.produce(adapted, &output_context).await;

        // 15. Diagnostics
        let duration = start.elapsed();
        self.diagnostics.emit(ConversationEvent::ProcessingComplete {
            duration_ms: duration.as_millis() as u64,
            intent: intent.intent_type,
        }).await;

        Ok(final_response)
    }

    /// Force une mise à jour du persona actif
    pub async fn set_persona(&self, persona_id: &str) -> Result<(), ConversationError> {
        self.persona_engine.activate(persona_id).await
            .map_err(|e| ConversationError::PersonaError(e))
    }

    /// Récupère l'état actuel
    pub async fn get_state(&self) -> ConversationOSState {
        self.state.read().await.clone()
    }

    /// Récupère les diagnostics récents
    pub async fn get_diagnostics(&self) -> Vec<ConversationEvent> {
        self.diagnostics.get_recent(50).await
    }

    /// Réinitialise le fil narratif
    pub async fn reset_narrative(&self) {
        self.narrative_engine.reset().await;
        let mut state = self.state.write().await;
        state.narrative_state = NarrativeState::default();
        state.conversation_depth = 0;
    }
}

/// Contexte de sortie pour la génération
#[derive(Clone, Debug)]
pub struct OutputContext {
    pub intent: UserIntent,
    pub emotional_state: EmotionalState,
    pub narrative: NarrativeState,
    pub persona: PersonaProfile,
    pub coherence: Option<CoherenceReport>,
    pub memory_ctx: MemoryContext,
}

/// Contexte mémoire simplifié
#[derive(Clone, Debug, Default)]
pub struct MemoryContext {
    pub recent_topics: Vec<String>,
    pub user_preferences: Vec<String>,
    pub conversation_history_summary: String,
    pub relevant_facts: Vec<String>,
}

/// Erreurs du Conversation OS
#[derive(Debug, Clone)]
pub enum ConversationError {
    SafetyViolation(String),
    PersonaError(String),
    CoherenceError(String),
    FormattingError(String),
    ProcessingError(String),
}

impl std::fmt::Display for ConversationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::SafetyViolation(msg) => write!(f, "Safety violation: {}", msg),
            Self::PersonaError(msg) => write!(f, "Persona error: {}", msg),
            Self::CoherenceError(msg) => write!(f, "Coherence error: {}", msg),
            Self::FormattingError(msg) => write!(f, "Formatting error: {}", msg),
            Self::ProcessingError(msg) => write!(f, "Processing error: {}", msg),
        }
    }
}

impl std::error::Error for ConversationError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_conversation_os_creation() {
        let config = ConversationOSConfig::default();
        let _cos = ConversationOS::new(config);
    }
}
