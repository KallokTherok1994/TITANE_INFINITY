/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — CONVERSATION PIPELINE
 * Pipeline unifié de traitement conversationnel
 * ═══════════════════════════════════════════════════════════════════
 */

use std::sync::Arc;
use std::time::Instant;
use tokio::sync::RwLock;

use crate::ai::router::AIRouter;
use crate::ai::{AIRequest, AIResponse};
use crate::singularity::singularity_state::SingularityState;

use super::types::*;
use super::memory::ConversationMemoryEngine;
use super::intent::IntentAnalyzer;
use super::emotion::EmotionAnalyzer;
use super::cognitive::CognitiveCompressor;
use super::self_healing::SelfHealingConversation;
use super::api_neutralizer::ApiNeutralizer;
use super::ConversationEngineError;

/// Pipeline unifié de traitement conversationnel
pub struct ConversationPipeline {
    memory: Arc<ConversationMemoryEngine>,
    ai_router: Arc<RwLock<AIRouter>>,
    self_healing: Arc<RwLock<SelfHealingConversation>>,
    singularity: Arc<RwLock<SingularityState>>,
    intent_analyzer: IntentAnalyzer,
    emotion_analyzer: EmotionAnalyzer,
    cognitive_compressor: CognitiveCompressor,
    api_neutralizer: ApiNeutralizer,
}

impl ConversationPipeline {
    pub fn new(
        memory: Arc<ConversationMemoryEngine>,
        ai_router: Arc<RwLock<AIRouter>>,
        self_healing: Arc<RwLock<SelfHealingConversation>>,
        singularity: Arc<RwLock<SingularityState>>,
    ) -> Self {
        Self {
            memory,
            ai_router,
            self_healing,
            singularity,
            intent_analyzer: IntentAnalyzer::new(),
            emotion_analyzer: EmotionAnalyzer::new(),
            cognitive_compressor: CognitiveCompressor::new(),
            api_neutralizer: ApiNeutralizer::new(),
        }
    }

    /// Traiter un message à travers le pipeline complet
    pub async fn process(
        &self,
        request: ConversationRequest,
    ) -> Result<ConversationResponse, ConversationEngineError> {
        let start = Instant::now();

        // ÉTAPE 1: Préprocessing et validation
        let validated_message = self.preprocess(&request.user_message)?;

        // ÉTAPE 2: Analyse d'intention
        let intention = self.intent_analyzer.analyze(&validated_message);

        // ÉTAPE 3: Analyse émotionnelle
        let emotion = self.emotion_analyzer.analyze(&validated_message, request.emotion_context);

        // ÉTAPE 4: Récupération du contexte mémoire
        let conversation_id = self.memory.ensure_conversation_id(request.conversation_id).await?;
        let memory_context = self.memory.load_context(&conversation_id).await?;

        // ÉTAPE 5: Construction du prompt enrichi
        let enriched_prompt = self.build_prompt(
            &validated_message,
            &request.mode,
            &intention,
            &emotion,
            &memory_context,
        );

        // ÉTAPE 6: Génération IA
        let ai_response = self.generate_ai_response(
            enriched_prompt,
            request.ai_config.unwrap_or_default(),
        ).await?;

        // ÉTAPE 7: Neutralisation API (capture + reconstruction)
        let neutralized_response = self.api_neutralizer.neutralize(ai_response);

        // ÉTAPE 8: Compression cognitive
        let cognitive_summary = self.cognitive_compressor.compress(
            &validated_message,
            &neutralized_response.content,
            &intention,
            &emotion,
        );

        // ÉTAPE 9: Sauvegarde mémoire
        let message_id = self.memory.save_exchange(
            &conversation_id,
            &validated_message,
            &neutralized_response.content,
            &intention,
            &emotion,
            &cognitive_summary,
            &neutralized_response.provider,
            start.elapsed().as_millis() as u64,
        ).await?;

        // ÉTAPE 10: Synchronisation SingularityState
        self.sync_singularity(&emotion, &cognitive_summary).await?;

        // ÉTAPE 11: Self-Healing check
        self.self_healing.write().await.verify_state(&conversation_id).await?;

        // Construction réponse
        Ok(ConversationResponse {
            assistant_message: neutralized_response.content,
            conversation_id,
            message_id,
            detected_intention: intention,
            detected_emotion: emotion,
            cognitive_tags: cognitive_summary.tags,
            cognitive_summary: cognitive_summary.summary,
            metadata: ConversationMetadata {
                timestamp: chrono::Utc::now().timestamp_millis() as u64,
                provider_used: neutralized_response.provider,
                latency_ms: start.elapsed().as_millis() as u64,
                tokens_used: neutralized_response.tokens_used,
                memory_effect: cognitive_summary.memory_effect,
                links_to_contexts: cognitive_summary.links,
            },
        })
    }

    /// Prétraitement et validation du message
    fn preprocess(&self, message: &str) -> Result<String, ConversationEngineError> {
        let trimmed = message.trim();

        if trimmed.is_empty() {
            return Err(ConversationEngineError::ValidationError(
                "Message vide".to_string()
            ));
        }

        if trimmed.len() > 10000 {
            return Err(ConversationEngineError::ValidationError(
                "Message trop long (max 10000 caractères)".to_string()
            ));
        }

        Ok(trimmed.to_string())
    }

    /// Construire le prompt enrichi
    fn build_prompt(
        &self,
        message: &str,
        mode: &ConversationMode,
        intention: &Intention,
        emotion: &EmotionState,
        memory_context: &str,
    ) -> String {
        let mode_instruction = match mode {
            ConversationMode::Default => "Réponds de manière claire et naturelle.",
            ConversationMode::Brainstorming => "Explore des idées créatives et divergentes.",
            ConversationMode::Synthesis => "Connecte les idées et synthétise.",
            ConversationMode::Planning => "Structure et propose des actions concrètes.",
            ConversationMode::Journal => "Accompagne la réflexion personnelle avec empathie.",
            ConversationMode::DebugCognitive => "Analyse la charge cognitive et propose des clarifications.",
        };

        let intention_context = match intention {
            Intention::Question => "L'utilisateur pose une question.",
            Intention::Action => "L'utilisateur demande une action.",
            Intention::Emotion => "L'utilisateur exprime une émotion.",
            Intention::Clarification => "L'utilisateur cherche à clarifier.",
            Intention::Meta => "L'utilisateur réfléchit sur la conversation.",
        };

        format!(
            "# CONTEXTE SYSTÈME\n\
            Tu es TITANE∞, assistant IA avancé en français.\n\
            Mode: {:?}\n\
            Instruction: {}\n\n\
            # CONTEXTE CONVERSATION\n\
            {}\n\n\
            # ANALYSE\n\
            Intention: {}\n\
            État émotionnel: valence={:.2}, intensité={:.2}, énergie={:.2}\n\n\
            # MESSAGE UTILISATEUR\n\
            {}",
            mode,
            mode_instruction,
            if memory_context.is_empty() { "Nouvelle conversation" } else { memory_context },
            intention_context,
            emotion.valence,
            emotion.intensity,
            emotion.energy,
            message
        )
    }

    /// Générer réponse IA
    async fn generate_ai_response(
        &self,
        prompt: String,
        config: AIConfig,
    ) -> Result<AIResponse, ConversationEngineError> {
        let ai_request = AIRequest {
            prompt,
            temperature: config.temperature,
            max_tokens: config.max_tokens.unwrap_or(2000),
            stream: false,
        };

        let router = self.ai_router.read().await;
        router.query(ai_request)
            .await
            .map_err(|e| ConversationEngineError::AIError(e.to_string()))
    }

    /// Synchroniser avec SingularityState
    async fn sync_singularity(
        &self,
        emotion: &EmotionState,
        cognitive_summary: &CognitiveSummary,
    ) -> Result<(), ConversationEngineError> {
        // TODO: Synchroniser avec le SingularityState une fois l'API accessible
        // let mut singularity = self.singularity.write().await;
        // singularity.cognitive.emotional.valence = emotion.valence;
        // ...

        log::info!(
            "[ConversationEngine] Sync SingularityState: valence={:.2}, coherence={:.2}",
            emotion.valence,
            cognitive_summary.coherence_score
        );

        Ok(())
    }
}

/// Structure de résumé cognitif
#[derive(Debug, Clone)]
pub struct CognitiveSummary {
    pub summary: String,
    pub tags: Vec<String>,
    pub memory_effect: MemoryEffect,
    pub memory_layers: MemoryLayers,
    pub links: Vec<String>,
    pub coherence_score: f32,
}
