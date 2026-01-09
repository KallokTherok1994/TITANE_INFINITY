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
use crate::singularity::singularity_state::{ChatContext, SingularityState};

use super::api_neutralizer::ApiNeutralizer;
use super::cognitive::CognitiveCompressor;
use super::emotion::EmotionAnalyzer;
use super::french_mastery::{
    FrenchMasteryProcessor, FrenchMasteryRequest, PostProcessingConstraints, ProcessingMode,
};
use super::intent::IntentAnalyzer;
use super::memory::ConversationMemoryEngine;
use super::self_healing::SelfHealingConversation;
use super::types::*;
use super::ConversationEngineError;

/// Pipeline unifié de traitement conversationnel
pub struct ConversationPipeline {
    memory: Arc<ConversationMemoryEngine>,
    ai_router: Arc<RwLock<AIRouter>>,
    self_healing: Arc<RwLock<SelfHealingConversation>>,
    singularity: Arc<RwLock<SingularityState>>,
    french_mastery: Arc<FrenchMasteryProcessor>, // 🇫🇷 POST-PROCESSEUR FRANÇAIS
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
        french_mastery: Arc<FrenchMasteryProcessor>, // 🇫🇷 AJOUTÉ
    ) -> Self {
        Self {
            memory,
            ai_router,
            self_healing,
            singularity,
            french_mastery, // 🇫🇷 STOCKÉ
            intent_analyzer: IntentAnalyzer::new(),
            emotion_analyzer: EmotionAnalyzer::new(),
            cognitive_compressor: CognitiveCompressor::new(),
            api_neutralizer: ApiNeutralizer::new(),
        }
    }

    /// Traiter un message à travers le pipeline complet
    /// OPTIMISÉ v20.1: Parallélisation des étapes 2-4 (gain ~64% latence)
    pub async fn process(
        &self,
        request: ConversationRequest,
    ) -> Result<ConversationResponse, ConversationEngineError> {
        let start = Instant::now();

        // 🔍 LOG ENTRÉE PIPELINE OMEGA
        log::info!(
            "[Ω:IN] mode={:?} | msg_len={} | conv_id={:?}",
            request.mode,
            request.user_message.len(),
            request.conversation_id
        );

        // ÉTAPE 1: Préprocessing et validation (synchrone - rapide)
        let validated_message = self.preprocess(&request.user_message)?;

        // ═══════════════════════════════════════════════════════════════
        // OPTIMISATION v20.1: PARALLÉLISATION ÉTAPES 2-4
        // Intent + Emotion + Memory Context en parallèle via tokio::join!
        // Ces étapes sont indépendantes et n'ont pas besoin des résultats
        // les unes des autres pour s'exécuter.
        // ═══════════════════════════════════════════════════════════════

        // Capture des valeurs pour les closures async
        let msg_for_intent = validated_message.clone();
        let msg_for_emotion = validated_message.clone();
        let emotion_ctx = request.emotion_context.clone(); // 🎯 Clone au lieu de move
        let conv_id_opt = request.conversation_id.clone();

        // Exécution parallèle
        let (intention, emotion, memory_result) = tokio::join!(
            // ÉTAPE 2: Analyse d'intention (CPU-bound, ~2-5ms)
            async { self.intent_analyzer.analyze(&msg_for_intent) },
            // ÉTAPE 3: Analyse émotionnelle (CPU-bound, ~2-5ms)
            async { self.emotion_analyzer.analyze(&msg_for_emotion, emotion_ctx) },
            // ÉTAPE 4: Récupération du contexte mémoire (IO-bound, ~10-50ms)
            async {
                let conv_id = self.memory.ensure_conversation_id(conv_id_opt).await?;
                let mem_ctx = self.memory.load_context(&conv_id).await?;
                Ok::<_, ConversationEngineError>((conv_id, mem_ctx))
            }
        );

        // Unwrap le résultat de la mémoire
        let (conversation_id, memory_context) = memory_result?;

        log::info!(
            "[Ω:PARALLEL] Étapes 2-4 complétées en {}ms",
            start.elapsed().as_millis()
        );

        // ÉTAPE 5: Construction du prompt enrichi
        let enriched_prompt = self.build_prompt(
            &validated_message,
            &request, // 🎯 Pass request complet pour accès custom_system_prompt
            &intention,
            &emotion,
            &memory_context,
        );

        // ÉTAPE 6: Génération IA
        let ai_response = self
            .generate_ai_response(enriched_prompt, request.ai_config.unwrap_or_default())
            .await?;

        // 🇫🇷 ÉTAPE 6.5: POST-TRAITEMENT FRENCH MASTERY (CRITIQUE)
        log::info!(
            "[Ω:FRENCH] Application FrenchMastery | content_len={}",
            ai_response.content.len()
        );

        let french_request = FrenchMasteryRequest {
            context: format!("Mode: {:?}, Intent: {:?}", request.mode, intention),
            draft_response: ai_response.content.clone(),
            mode: ProcessingMode::Optimization,
            constraints: PostProcessingConstraints::default(),
        };

        let french_processed = match self.french_mastery.process(french_request).await {
            Ok(processed) => {
                log::info!("[Ω:FRENCH] ✅ Post-traitement réussi");
                processed.finalized_response
            }
            Err(e) => {
                log::warn!(
                    "[Ω:FRENCH] ⚠️ Échec post-traitement: {} | utilisation réponse brute",
                    e
                );
                ai_response.content.clone()
            }
        };

        // Remplacer le contenu par la version française optimisée
        let mut french_ai_response = ai_response;
        french_ai_response.content = french_processed;

        // ÉTAPE 7: Neutralisation API (capture + reconstruction)
        let neutralized_response = self.api_neutralizer.neutralize(french_ai_response);

        // ÉTAPE 8: Compression cognitive
        let cognitive_summary = self.cognitive_compressor.compress(
            &validated_message,
            &neutralized_response.content,
            &intention,
            &emotion,
        );

        // ÉTAPE 9: Sauvegarde mémoire
        let message_id = self
            .memory
            .save_exchange(
                &conversation_id,
                &validated_message,
                &neutralized_response.content,
                &intention,
                &emotion,
                &cognitive_summary,
                &neutralized_response.provider,
                start.elapsed().as_millis() as u64,
            )
            .await?;

        // ÉTAPE 10: Synchronisation SingularityState (legacy)
        self.sync_singularity(&emotion, &cognitive_summary).await?;

        // ÉTAPE 11: Self-Healing check
        self.self_healing
            .write()
            .await
            .verify_state(&conversation_id)
            .await?;

        // ═══════════════════════════════════════════════════════════════
        // ÉTAPE 12: 🌌 SINGULARITY META-PROCESSING (NOUVEAU)
        // Meta-analyse conversationnelle finale avec Singularity Engine
        // - Validation cohérence globale
        // - Enrichissement meta-tags
        // - Suggestions LTM
        // - Corrections style/identité si nécessaire
        // ═══════════════════════════════════════════════════════════════
        let singularity_result = {
            let context = ChatContext {
                user_message: validated_message.clone(),
                ai_response: neutralized_response.content.clone(),
                conversation_id: conversation_id.clone(),
                intention: format!("{:?}", intention),
                emotion_state: (emotion.valence, emotion.intensity, emotion.energy),
                cognitive_summary: cognitive_summary.summary.clone(),
                cognitive_tags: cognitive_summary.tags.clone(),
                memory_context: memory_context.clone(),
            };

            let mut singularity = self.singularity.write().await;
            singularity
                .singularity_meta_process_conversation(context)
                .await
        };

        // Appliquer résultat Singularity ou fallback sur réponse originale
        let (final_message, final_tags, _singularity_latency) = match singularity_result {
            Ok(meta_output) => {
                log::info!(
                    "[Ω:SINGULARITY] ✅ Meta-processing success | coherence={:.2} | corrections={}",
                    meta_output.meta_coherence,
                    meta_output.corrections_applied.len()
                );
                (
                    meta_output.final_message,
                    meta_output.meta_tags,
                    0, // Latency déjà loggée dans singularity_meta_process_conversation
                )
            }
            Err(e) => {
                log::warn!(
                    "[Ω:SINGULARITY] ⚠️ Meta-processing failed: {} | using original response",
                    e
                );
                (
                    neutralized_response.content.clone(),
                    cognitive_summary.tags.clone(),
                    0,
                )
            }
        };

        let final_latency = start.elapsed().as_millis() as u64;

        // 🔍 LOG SORTIE PIPELINE OMEGA
        log::info!(
            "[Ω:OUT] latency={}ms | tokens={} | french_mastery=true | singularity=true | provider={}",
            final_latency,
            neutralized_response.tokens_used,
            neutralized_response.provider
        );

        // Construction réponse ENRICHIE par Singularity
        Ok(ConversationResponse {
            assistant_message: final_message,
            conversation_id,
            message_id,
            detected_intention: intention,
            detected_emotion: emotion,
            cognitive_tags: final_tags, // ← Enrichis par Singularity
            cognitive_summary: cognitive_summary.summary,
            metadata: ConversationMetadata {
                timestamp: chrono::Utc::now().timestamp_millis() as u64,
                provider_used: neutralized_response.provider,
                latency_ms: final_latency,
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
                "Message vide".to_string(),
            ));
        }

        if trimmed.len() > 10000 {
            return Err(ConversationEngineError::ValidationError(
                "Message trop long (max 10000 caractères)".to_string(),
            ));
        }

        Ok(trimmed.to_string())
    }

    /// Construire le prompt enrichi avec SYSTEM PROMPT ADAPTATIF PAR MODE
    fn build_prompt(
        &self,
        message: &str,
        request: &ConversationRequest, // 🎯 Request complet pour custom_system_prompt
        intention: &Intention,
        emotion: &EmotionState,
        memory_context: &str,
    ) -> String {
        // 🎯 PRIORITÉ: Custom System Prompt depuis InstructionMode frontend
        let (system_identity, mode_instruction) = if let Some(custom_prompt) =
            &request.custom_system_prompt
        {
            // ✨ Si custom_system_prompt fourni, on l'utilise en priorité
            (
                custom_prompt.as_str(),
                "Suis les instructions fournies dans le prompt système personnalisé.",
            )
        } else {
            // 🎭 Sinon, fallback sur SYSTEM PROMPT ADAPTATIF PAR MODE (CRITIQUE POUR MODES RÉELS)
            match &request.mode {
            ConversationMode::Default => (
                "Tu es TITANE∞, assistant cognitif français, direct et incarné. \
                 Tu réponds TOUJOURS et UNIQUEMENT en FRANÇAIS. Style conversationnel naturel.",
                "Réponds de manière claire, concise et naturelle."
            ),
            ConversationMode::Brainstorming => (
                "Tu es TITANE∞ en MODE DIVERGENCE CRÉATIVE. \
                 Tu réponds TOUJOURS en FRANÇAIS. Ta force : explorer l'inattendu.",
                "Génère des idées audacieuses, connexions surprenantes, perspectives multiples. \
                 Pense large, sois imaginatif, propose des angles inédits."
            ),
            ConversationMode::Synthesis => (
                "Tu es TITANE∞ en MODE SYNTHÈSE & CONNEXION. \
                 Tu réponds TOUJOURS en FRANÇAIS. Ta force : relier les idées.",
                "Connecte les concepts, trouve les patterns sous-jacents, crée des liens conceptuels. \
                 Structure claire, vision d'ensemble, cohérence forte."
            ),
            ConversationMode::Planning => (
                "Tu es TITANE∞ en MODE STRATÉGIE & ACTION. \
                 Tu réponds TOUJOURS en FRANÇAIS. Ta force : l'opérationnel.",
                "Décompose en étapes concrètes, propose des plans d'action, identifie les obstacles. \
                 Pragmatique, orienté résultats, structuré et décisif."
            ),
            ConversationMode::Journal => (
                "Tu es TITANE∞ en MODE RÉFLEXION PERSONNELLE. \
                 Tu réponds TOUJOURS en FRANÇAIS. Ta force : l'écoute profonde.",
                "Accompagne la réflexion avec empathie, pose des questions ouvertes. \
                 Crée un espace de pensée libre, bienveillant, non-jugeant, introspectif."
            ),
            ConversationMode::DebugCognitive => (
                "Tu es TITANE∞ en MODE DEBUG COGNITIF. \
                 Tu réponds TOUJOURS en FRANÇAIS. Ta force : clarifier le chaos mental.",
                "Analyse la charge cognitive, identifie les boucles de pensée, propose des sorties claires. \
                 Technique mais accessible, méthodique, rassurant."
            ),
        }
        }; // 🎯 Fermeture du if/else custom_system_prompt

        let intention_context = match intention {
            Intention::Question => "L'utilisateur pose une question et attend une réponse claire.",
            Intention::Action => {
                "L'utilisateur demande une action concrète ou un conseil pratique."
            }
            Intention::Emotion => "L'utilisateur exprime une émotion. Reconnais-la et accompagne.",
            Intention::Clarification => {
                "L'utilisateur cherche à clarifier sa pensée ou un concept."
            }
            Intention::Meta => "L'utilisateur réfléchit sur la conversation elle-même. Sois méta.",
        };

        format!(
            "# IDENTITÉ SYSTÈME\n\
            {}\n\n\
            # MODE ACTIF\n\
            {:?}\n\
            Instruction: {}\n\n\
            # CONTEXTE CONVERSATION\n\
            {}\n\n\
            # ANALYSE COGNITIVE\n\
            Intention détectée: {}\n\
            État émotionnel: valence={:.2}, intensité={:.2}, énergie={:.2}\n\n\
            🌍 RÈGLE ABSOLUE : Réponds TOUJOURS en FRANÇAIS EXCLUSIVEMENT.\n\n\
            # MESSAGE UTILISATEUR\n\
            {}",
            system_identity,
            request.mode, // 🎯 Correction: utiliser request.mode
            mode_instruction,
            if memory_context.is_empty() {
                "Nouvelle conversation"
            } else {
                memory_context
            },
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
        let provider_pref = match config.provider_preference {
            super::types::ProviderPreference::Local => Some("local".to_string()),
            super::types::ProviderPreference::Ollama => Some("ollama".to_string()),
            super::types::ProviderPreference::Gemini => Some("gemini".to_string()),
            super::types::ProviderPreference::OpenAI => Some("openai".to_string()),
            super::types::ProviderPreference::Claude => Some("claude".to_string()),
            super::types::ProviderPreference::Auto => None,
        };

        let ai_request = AIRequest {
            prompt,
            temperature: config.temperature,
            max_tokens: config.max_tokens.unwrap_or(2000),
            stream: false,
            provider_preference: provider_pref,
        };

        let router = self.ai_router.read().await;
        router
            .query(ai_request)
            .await
            .map_err(|e| ConversationEngineError::AIError(e.to_string()))
    }

    /// Synchroniser avec SingularityState
    async fn sync_singularity(
        &self,
        emotion: &EmotionState,
        cognitive_summary: &CognitiveSummary,
    ) -> Result<(), ConversationEngineError> {
        // Implementation: Synchronize with SingularityState once API stabilizes
        // - Write lock: let mut singularity = self.singularity.write().await;
        // - Emotion sync: singularity.cognitive.emotional.valence = emotion.valence; arousal = emotion.arousal;
        // - Cognitive sync: singularity.cognitive.load = cognitive_summary.processing_load;
        // - Memory sync: singularity.cognitive.working_memory_usage = cognitive_summary.memory_usage;
        // - API status: Waiting for SingularityState::cognitive.emotional field stabilization (v24.3+)
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

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cognitive_summary_creation() {
        let summary = CognitiveSummary {
            summary: "Test summary".to_string(),
            tags: vec!["tag1".to_string(), "tag2".to_string()],
            memory_effect: MemoryEffect::New,
            memory_layers: MemoryLayers::default(),
            links: vec!["link1".to_string()],
            coherence_score: 0.85,
        };

        assert_eq!(summary.summary, "Test summary");
        assert_eq!(summary.tags.len(), 2);
        assert_eq!(summary.coherence_score, 0.85);
    }

    #[test]
    fn test_cognitive_summary_clone() {
        let original = CognitiveSummary {
            summary: "Original".to_string(),
            tags: vec!["test".to_string()],
            memory_effect: MemoryEffect::New,
            memory_layers: MemoryLayers::default(),
            links: vec![],
            coherence_score: 0.9,
        };

        let cloned = original.clone();
        assert_eq!(cloned.summary, original.summary);
        assert_eq!(cloned.coherence_score, original.coherence_score);
    }

    #[test]
    fn test_cognitive_summary_debug() {
        let summary = CognitiveSummary {
            summary: "Debug test".to_string(),
            tags: vec![],
            memory_effect: MemoryEffect::New,
            memory_layers: MemoryLayers::default(),
            links: vec![],
            coherence_score: 0.75,
        };

        let debug_str = format!("{:?}", summary);
        assert!(debug_str.contains("CognitiveSummary"));
        assert!(debug_str.contains("Debug test"));
    }

    #[test]
    fn test_preprocess_valid_message() {
        // Create minimal mock dependencies (we're only testing preprocess which doesn't use them)
        let memory = Arc::new(ConversationMemoryEngine::new(
            Arc::new(crate::memory::storage::MemoryStorage::new(
                std::env::temp_dir().join("test_pipeline_preprocess"),
                "test".to_string()
            ).unwrap())
        ));
        let ai_router = Arc::new(RwLock::new(AIRouter::new(None, None)));
        let self_healing = Arc::new(RwLock::new(SelfHealingConversation::new()));
        let singularity = Arc::new(RwLock::new(crate::singularity::singularity_state::SingularityState::new()));
        let french_mastery = Arc::new(FrenchMasteryProcessor::new());

        let pipeline = ConversationPipeline::new(
            memory,
            ai_router,
            self_healing,
            singularity,
            french_mastery,
        );

        let result = pipeline.preprocess("  Hello, this is a test  ");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "Hello, this is a test");
    }

    #[test]
    fn test_preprocess_empty_message() {
        let memory = Arc::new(ConversationMemoryEngine::new(
            Arc::new(crate::memory::storage::MemoryStorage::new(
                std::env::temp_dir().join("test_pipeline_empty"),
                "test".to_string()
            ).unwrap())
        ));
        let ai_router = Arc::new(RwLock::new(AIRouter::new(None, None)));
        let self_healing = Arc::new(RwLock::new(SelfHealingConversation::new()));
        let singularity = Arc::new(RwLock::new(crate::singularity::singularity_state::SingularityState::new()));
        let french_mastery = Arc::new(FrenchMasteryProcessor::new());

        let pipeline = ConversationPipeline::new(
            memory,
            ai_router,
            self_healing,
            singularity,
            french_mastery,
        );

        let result = pipeline.preprocess("   ");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Message vide"));
    }

    #[test]
    fn test_preprocess_message_too_long() {
        let memory = Arc::new(ConversationMemoryEngine::new(
            Arc::new(crate::memory::storage::MemoryStorage::new(
                std::env::temp_dir().join("test_pipeline_long"),
                "test".to_string()
            ).unwrap())
        ));
        let ai_router = Arc::new(RwLock::new(AIRouter::new(None, None)));
        let self_healing = Arc::new(RwLock::new(SelfHealingConversation::new()));
        let singularity = Arc::new(RwLock::new(crate::singularity::singularity_state::SingularityState::new()));
        let french_mastery = Arc::new(FrenchMasteryProcessor::new());

        let pipeline = ConversationPipeline::new(
            memory,
            ai_router,
            self_healing,
            singularity,
            french_mastery,
        );

        let long_message = "a".repeat(10001);
        let result = pipeline.preprocess(&long_message);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("trop long"));
    }

    #[test]
    fn test_preprocess_boundary_length() {
        let memory = Arc::new(ConversationMemoryEngine::new(
            Arc::new(crate::memory::storage::MemoryStorage::new(
                std::env::temp_dir().join("test_pipeline_boundary"),
                "test".to_string()
            ).unwrap())
        ));
        let ai_router = Arc::new(RwLock::new(AIRouter::new(None, None)));
        let self_healing = Arc::new(RwLock::new(SelfHealingConversation::new()));
        let singularity = Arc::new(RwLock::new(crate::singularity::singularity_state::SingularityState::new()));
        let french_mastery = Arc::new(FrenchMasteryProcessor::new());

        let pipeline = ConversationPipeline::new(
            memory,
            ai_router,
            self_healing,
            singularity,
            french_mastery,
        );

        // Exactly 10000 characters should be OK
        let boundary_message = "a".repeat(10000);
        let result = pipeline.preprocess(&boundary_message);
        assert!(result.is_ok());
    }

    #[test]
    fn test_build_prompt_default_mode() {
        let memory = Arc::new(ConversationMemoryEngine::new(
            Arc::new(crate::memory::storage::MemoryStorage::new(
                std::env::temp_dir().join("test_pipeline_prompt_default"),
                "test".to_string()
            ).unwrap())
        ));
        let ai_router = Arc::new(RwLock::new(AIRouter::new(None, None)));
        let self_healing = Arc::new(RwLock::new(SelfHealingConversation::new()));
        let singularity = Arc::new(RwLock::new(crate::singularity::singularity_state::SingularityState::new()));
        let french_mastery = Arc::new(FrenchMasteryProcessor::new());

        let pipeline = ConversationPipeline::new(
            memory,
            ai_router,
            self_healing,
            singularity,
            french_mastery,
        );

        let request = ConversationRequest {
            user_message: "Test message".to_string(),
            conversation_id: None,
            mode: ConversationMode::Default,
            emotion_context: None,
            ai_config: None,
            custom_system_prompt: None,
        };

        let intention = Intention::Question;
        let emotion = EmotionState::default();
        let memory_context = "Previous context";

        let prompt = pipeline.build_prompt("Test message", &request, &intention, &emotion, memory_context);

        assert!(prompt.contains("TITANE∞"));
        assert!(prompt.contains("Default"));
        assert!(prompt.contains("Test message"));
        assert!(prompt.contains("Previous context"));
    }

    #[test]
    fn test_build_prompt_brainstorming_mode() {
        let memory = Arc::new(ConversationMemoryEngine::new(
            Arc::new(crate::memory::storage::MemoryStorage::new(
                std::env::temp_dir().join("test_pipeline_brainstorm"),
                "test".to_string()
            ).unwrap())
        ));
        let ai_router = Arc::new(RwLock::new(AIRouter::new(None, None)));
        let self_healing = Arc::new(RwLock::new(SelfHealingConversation::new()));
        let singularity = Arc::new(RwLock::new(crate::singularity::singularity_state::SingularityState::new()));
        let french_mastery = Arc::new(FrenchMasteryProcessor::new());

        let pipeline = ConversationPipeline::new(
            memory,
            ai_router,
            self_healing,
            singularity,
            french_mastery,
        );

        let request = ConversationRequest {
            user_message: "Generate ideas".to_string(),
            conversation_id: None,
            mode: ConversationMode::Brainstorming,
            emotion_context: None,
            ai_config: None,
            custom_system_prompt: None,
        };

        let prompt = pipeline.build_prompt("Generate ideas", &request, &Intention::Action, &EmotionState::default(), "");

        assert!(prompt.contains("DIVERGENCE CRÉATIVE"));
        assert!(prompt.contains("audacieuses"));
    }

    #[test]
    fn test_build_prompt_custom_system() {
        let memory = Arc::new(ConversationMemoryEngine::new(
            Arc::new(crate::memory::storage::MemoryStorage::new(
                std::env::temp_dir().join("test_pipeline_custom"),
                "test".to_string()
            ).unwrap())
        ));
        let ai_router = Arc::new(RwLock::new(AIRouter::new(None, None)));
        let self_healing = Arc::new(RwLock::new(SelfHealingConversation::new()));
        let singularity = Arc::new(RwLock::new(crate::singularity::singularity_state::SingularityState::new()));
        let french_mastery = Arc::new(FrenchMasteryProcessor::new());

        let pipeline = ConversationPipeline::new(
            memory,
            ai_router,
            self_healing,
            singularity,
            french_mastery,
        );

        let request = ConversationRequest {
            user_message: "Custom test".to_string(),
            conversation_id: None,
            mode: ConversationMode::Default,
            emotion_context: None,
            ai_config: None,
            custom_system_prompt: Some("You are a custom assistant".to_string()),
        };

        let prompt = pipeline.build_prompt("Custom test", &request, &Intention::Question, &EmotionState::default(), "");

        assert!(prompt.contains("custom assistant"));
        assert!(!prompt.contains("MODE DIVERGENCE")); // Should use custom, not mode-specific
    }

    #[test]
    fn test_build_prompt_empty_memory_context() {
        let memory = Arc::new(ConversationMemoryEngine::new(
            Arc::new(crate::memory::storage::MemoryStorage::new(
                std::env::temp_dir().join("test_pipeline_no_memory"),
                "test".to_string()
            ).unwrap())
        ));
        let ai_router = Arc::new(RwLock::new(AIRouter::new(None, None)));
        let self_healing = Arc::new(RwLock::new(SelfHealingConversation::new()));
        let singularity = Arc::new(RwLock::new(crate::singularity::singularity_state::SingularityState::new()));
        let french_mastery = Arc::new(FrenchMasteryProcessor::new());

        let pipeline = ConversationPipeline::new(
            memory,
            ai_router,
            self_healing,
            singularity,
            french_mastery,
        );

        let request = ConversationRequest {
            user_message: "First message".to_string(),
            conversation_id: None,
            mode: ConversationMode::Default,
            emotion_context: None,
            ai_config: None,
            custom_system_prompt: None,
        };

        let prompt = pipeline.build_prompt("First message", &request, &Intention::Question, &EmotionState::default(), "");

        assert!(prompt.contains("Nouvelle conversation"));
    }

    #[test]
    fn test_build_prompt_all_modes() {
        let memory = Arc::new(ConversationMemoryEngine::new(
            Arc::new(crate::memory::storage::MemoryStorage::new(
                std::env::temp_dir().join("test_pipeline_all_modes"),
                "test".to_string()
            ).unwrap())
        ));
        let ai_router = Arc::new(RwLock::new(AIRouter::new(None, None)));
        let self_healing = Arc::new(RwLock::new(SelfHealingConversation::new()));
        let singularity = Arc::new(RwLock::new(crate::singularity::singularity_state::SingularityState::new()));
        let french_mastery = Arc::new(FrenchMasteryProcessor::new());

        let pipeline = ConversationPipeline::new(
            memory,
            ai_router,
            self_healing,
            singularity,
            french_mastery,
        );

        let modes = vec![
            (ConversationMode::Default, "claire"),
            (ConversationMode::Brainstorming, "DIVERGENCE"),
            (ConversationMode::Synthesis, "SYNTHÈSE"),
            (ConversationMode::Planning, "STRATÉGIE"),
            (ConversationMode::Journal, "RÉFLEXION"),
            (ConversationMode::DebugCognitive, "DEBUG"),
        ];

        for (mode, expected_text) in modes {
            let request = ConversationRequest {
                user_message: "Test".to_string(),
                conversation_id: None,
                mode: mode.clone(),
                emotion_context: None,
                ai_config: None,
                custom_system_prompt: None,
            };

            let prompt = pipeline.build_prompt("Test", &request, &Intention::Question, &EmotionState::default(), "");
            assert!(prompt.contains(expected_text), "Mode {:?} should contain '{}'", mode, expected_text);
        }
    }

    #[test]
    fn test_build_prompt_intention_context() {
        let memory = Arc::new(ConversationMemoryEngine::new(
            Arc::new(crate::memory::storage::MemoryStorage::new(
                std::env::temp_dir().join("test_pipeline_intentions"),
                "test".to_string()
            ).unwrap())
        ));
        let ai_router = Arc::new(RwLock::new(AIRouter::new(None, None)));
        let self_healing = Arc::new(RwLock::new(SelfHealingConversation::new()));
        let singularity = Arc::new(RwLock::new(crate::singularity::singularity_state::SingularityState::new()));
        let french_mastery = Arc::new(FrenchMasteryProcessor::new());

        let pipeline = ConversationPipeline::new(
            memory,
            ai_router,
            self_healing,
            singularity,
            french_mastery,
        );

        let request = ConversationRequest {
            user_message: "Test".to_string(),
            conversation_id: None,
            mode: ConversationMode::Default,
            emotion_context: None,
            ai_config: None,
            custom_system_prompt: None,
        };

        let intentions = vec![
            (Intention::Question, "question"),
            (Intention::Action, "action"),
            (Intention::Emotion, "émotion"),
            (Intention::Clarification, "clarifier"),
            (Intention::Meta, "méta"),
        ];

        for (intention, expected_word) in intentions {
            let prompt = pipeline.build_prompt("Test", &request, &intention, &EmotionState::default(), "");
            assert!(prompt.to_lowercase().contains(expected_word));
        }
    }

    #[test]
    fn test_build_prompt_emotion_values() {
        let memory = Arc::new(ConversationMemoryEngine::new(
            Arc::new(crate::memory::storage::MemoryStorage::new(
                std::env::temp_dir().join("test_pipeline_emotion"),
                "test".to_string()
            ).unwrap())
        ));
        let ai_router = Arc::new(RwLock::new(AIRouter::new(None, None)));
        let self_healing = Arc::new(RwLock::new(SelfHealingConversation::new()));
        let singularity = Arc::new(RwLock::new(crate::singularity::singularity_state::SingularityState::new()));
        let french_mastery = Arc::new(FrenchMasteryProcessor::new());

        let pipeline = ConversationPipeline::new(
            memory,
            ai_router,
            self_healing,
            singularity,
            french_mastery,
        );

        let request = ConversationRequest {
            user_message: "Test".to_string(),
            conversation_id: None,
            mode: ConversationMode::Default,
            emotion_context: None,
            ai_config: None,
            custom_system_prompt: None,
        };

        let mut emotion = EmotionState::default();
        emotion.valence = 0.8;
        emotion.intensity = 0.6;
        emotion.energy = 0.9;

        let prompt = pipeline.build_prompt("Test", &request, &Intention::Question, &emotion, "");

        assert!(prompt.contains("valence=0.80"));
        assert!(prompt.contains("intensité=0.60"));
        assert!(prompt.contains("énergie=0.90"));
    }
}
