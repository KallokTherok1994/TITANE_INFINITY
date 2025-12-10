//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — OUTPUT ENGINE
//! Super Prompt #9 — Production de la réponse finale
//! ═══════════════════════════════════════════════════════════════════════════════

use super::adapter::AdaptedText;
use super::OutputContext;
use serde::{Deserialize, Serialize};

/// Réponse finale
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FinalResponse {
    /// Contenu de la réponse
    pub content: String,
    /// Métadonnées de la réponse
    pub metadata: ResponseMetadata,
    /// Statistiques de génération
    pub stats: GenerationStats,
    /// État de la conversation après réponse
    pub conversation_state: ConversationStateSnapshot,
}

/// Métadonnées de la réponse
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ResponseMetadata {
    /// ID unique de la réponse
    pub response_id: String,
    /// Timestamp de génération
    pub timestamp: u64,
    /// Type d'intention traitée
    pub intent_type: String,
    /// Persona utilisé
    pub persona_id: String,
    /// Canal de sortie
    pub output_channel: String,
    /// Confiance globale
    pub confidence: f32,
    /// Tags sémantiques
    pub tags: Vec<String>,
}

/// Statistiques de génération
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct GenerationStats {
    /// Temps total de traitement (ms)
    pub processing_time_ms: u64,
    /// Nombre de mots
    pub word_count: usize,
    /// Nombre de caractères
    pub char_count: usize,
    /// Étapes exécutées
    pub stages_executed: usize,
    /// Transformations appliquées
    pub transformations: Vec<String>,
}

/// Snapshot de l'état conversationnel
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ConversationStateSnapshot {
    /// Profondeur de conversation
    pub depth: u32,
    /// Score de cohérence
    pub coherence_score: f32,
    /// État émotionnel détecté
    pub emotional_state: String,
    /// Topic principal
    pub main_topic: Option<String>,
}

/// Moteur de sortie
pub struct OutputEngine {
    /// Compteur de réponses
    response_counter: std::sync::atomic::AtomicU64,
}

impl OutputEngine {
    pub fn new() -> Self {
        Self {
            response_counter: std::sync::atomic::AtomicU64::new(0),
        }
    }

    /// Produit la réponse finale
    pub async fn produce(&self, adapted: AdaptedText, context: &OutputContext) -> FinalResponse {
        let response_id = self.generate_response_id();
        let timestamp = Self::now();

        // Construire les métadonnées
        let metadata = ResponseMetadata {
            response_id: response_id.clone(),
            timestamp,
            intent_type: format!("{:?}", context.intent.intent_type),
            persona_id: context.persona.config.id.clone(),
            output_channel: format!("{:?}", adapted.channel),
            confidence: context.intent.confidence.primary,
            tags: self.extract_tags(context),
        };

        // Construire les statistiques
        let stats = GenerationStats {
            processing_time_ms: 0, // Sera mis à jour par l'appelant
            word_count: adapted.content.split_whitespace().count(),
            char_count: adapted.content.chars().count(),
            stages_executed: 0, // Sera mis à jour par l'appelant
            transformations: adapted.adaptations_applied,
        };

        // Snapshot de l'état
        let conversation_state = ConversationStateSnapshot {
            depth: context.narrative.depth,
            coherence_score: context.narrative.coherence_score,
            emotional_state: format!("{:?}", context.emotional_state.primary_tone),
            main_topic: context
                .narrative
                .current_thread
                .as_ref()
                .and_then(|t| t.main_topic.clone()),
        };

        FinalResponse {
            content: adapted.content,
            metadata,
            stats,
            conversation_state,
        }
    }

    /// Génère un ID unique pour la réponse
    fn generate_response_id(&self) -> String {
        let count = self
            .response_counter
            .fetch_add(1, std::sync::atomic::Ordering::SeqCst);
        let timestamp = Self::now();
        format!("resp_{}_{}", timestamp, count)
    }

    /// Extrait les tags sémantiques du contexte
    fn extract_tags(&self, context: &OutputContext) -> Vec<String> {
        let mut tags = Vec::new();

        // Tag d'intention
        tags.push(format!("intent:{:?}", context.intent.intent_type).to_lowercase());

        // Tags de mots-clés
        for keyword in context.intent.keywords.iter().take(5) {
            tags.push(format!("kw:{}", keyword.to_lowercase()));
        }

        // Tag émotionnel
        tags.push(format!("emotion:{:?}", context.emotional_state.primary_tone).to_lowercase());

        // Tag de complexité
        tags.push(format!("complexity:{:?}", context.intent.complexity).to_lowercase());

        tags
    }

    /// Formate la réponse pour le log
    pub fn format_for_log(&self, response: &FinalResponse) -> String {
        format!(
            "[{}] {} | {} words | {:?}ms | coherence: {:.2}",
            response.metadata.response_id,
            response.metadata.intent_type,
            response.stats.word_count,
            response.stats.processing_time_ms,
            response.conversation_state.coherence_score
        )
    }

    /// Crée une réponse d'erreur
    pub fn error_response(&self, error: &str) -> FinalResponse {
        FinalResponse {
            content: format!("Une erreur s'est produite: {}", error),
            metadata: ResponseMetadata {
                response_id: self.generate_response_id(),
                timestamp: Self::now(),
                intent_type: "error".to_string(),
                persona_id: "system".to_string(),
                output_channel: "text".to_string(),
                confidence: 0.0,
                tags: vec!["error".to_string()],
            },
            stats: GenerationStats::default(),
            conversation_state: ConversationStateSnapshot::default(),
        }
    }

    /// Crée une réponse de fallback
    pub fn fallback_response(&self, message: &str) -> FinalResponse {
        FinalResponse {
            content: message.to_string(),
            metadata: ResponseMetadata {
                response_id: self.generate_response_id(),
                timestamp: Self::now(),
                intent_type: "fallback".to_string(),
                persona_id: "system".to_string(),
                output_channel: "text".to_string(),
                confidence: 0.5,
                tags: vec!["fallback".to_string()],
            },
            stats: GenerationStats::default(),
            conversation_state: ConversationStateSnapshot::default(),
        }
    }

    /// Met à jour les statistiques de temps
    pub fn update_processing_time(response: &mut FinalResponse, time_ms: u64) {
        response.stats.processing_time_ms = time_ms;
    }

    /// Met à jour le nombre d'étapes
    pub fn update_stages_count(response: &mut FinalResponse, count: usize) {
        response.stats.stages_executed = count;
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for OutputEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::conversation_os::{
        adapter::OutputChannel,
        emotion::{EmotionalState, EmotionalTone},
        intent::{ComplexityLevel, IntentConfidence, IntentType, UrgencyLevel, UserIntent},
        narrative::NarrativeState,
        persona::PersonaProfile,
        MemoryContext,
    };

    fn create_test_context() -> OutputContext {
        OutputContext {
            intent: UserIntent {
                intent_type: IntentType::Question,
                confidence: IntentConfidence {
                    primary: 0.8,
                    secondary: None,
                },
                keywords: vec!["test".to_string()],
                urgency: UrgencyLevel::Normal,
                complexity: ComplexityLevel::Simple,
                requires_memory: false,
                requires_reflection: false,
                timestamp: 0,
            },
            emotional_state: EmotionalState {
                primary_tone: EmotionalTone::Neutral,
                ..Default::default()
            },
            narrative: NarrativeState::default(),
            persona: PersonaProfile::default(),
            coherence: None,
            memory_ctx: MemoryContext::default(),
        }
    }

    fn create_test_adapted() -> AdaptedText {
        AdaptedText {
            content: "Test response content".to_string(),
            channel: OutputChannel::Text,
            truncated: false,
            voice_optimized: false,
            adaptations_applied: vec!["test".to_string()],
        }
    }

    #[tokio::test]
    async fn test_output_production() {
        let engine = OutputEngine::new();
        let context = create_test_context();
        let adapted = create_test_adapted();

        let response = engine.produce(adapted, &context).await;
        assert!(!response.content.is_empty());
        assert!(!response.metadata.response_id.is_empty());
    }

    #[test]
    fn test_error_response() {
        let engine = OutputEngine::new();
        let response = engine.error_response("Test error");
        assert!(response.content.contains("erreur"));
        assert!(response.metadata.tags.contains(&"error".to_string()));
    }

    #[test]
    fn test_response_id_generation() {
        let engine = OutputEngine::new();
        let id1 = engine.generate_response_id();
        let id2 = engine.generate_response_id();
        assert_ne!(id1, id2);
    }
}
