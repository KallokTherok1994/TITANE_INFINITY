// PLAN v25.x: Migrer vers unified_memory_v2
#![allow(deprecated)]

pub mod anthology_engine;
pub mod api_neutralizer;
pub mod behavioral_consistency;
pub mod cognitive;
pub mod commands;
pub mod emotion;
pub mod emotional_subtlety;
pub mod french_mastery;
pub mod intent;
pub mod literary_engine;
pub mod memory;
pub mod multilayer_memory;
mod meta_accumulator;
pub mod omega_integration; // R05 P1: OMEGA Pipeline integration
pub mod pipeline;
pub mod realism;
pub mod self_healing;
/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — CONVERSATION ENGINE (Module Principal)
 * Moteur conversationnel unifié avec mémoire permanente et self-healing
 * ═══════════════════════════════════════════════════════════════════
 *
 * Architecture:
 * - Pipeline unifié: Input → Preprocessing → Intent → Emotion → Generation → Memory → Sync
 * - Memory Map v∞: Sauvegarde cognitive complète de chaque échange
 * - Self-Healing: Détection et réparation automatique
 * - SingularityState Sync: Synchronisation émotionnelle et cognitive
 * - API Neutralizer: Capture et reconstruction interne des réponses externes
 */
pub mod types;

use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::time::{timeout, Duration};

use meta_accumulator::{build_offline_meta, build_timeout_meta};

use crate::ai::router::AIRouter;
use crate::memory::storage::MemoryStorage;
use crate::singularity::singularity_state::SingularityState;

pub use anthology_engine::AnthologyEngine;
pub use behavioral_consistency::BehavioralConsistencyProcessor;
pub use emotional_subtlety::EmotionalSubtletyProcessor;
pub use french_mastery::FrenchMasteryProcessor;
pub use literary_engine::LiteraryEngine;
pub use memory::ConversationMemoryEngine;
pub use multilayer_memory::MultiLayerMemoryManager;
pub use omega_integration::{
    OmegaBridgeConfig, OmegaConversationBridge, OmegaHealthReport, OmegaPipelineResult,
}; // R05 P1
pub use pipeline::ConversationPipeline;
pub use realism::ConversationalRealismProcessor;
pub use self_healing::SelfHealingConversation;
pub use types::*;

/// État global du Conversation Engine
pub struct ConversationEngineState {
    /// Pipeline de traitement unifié
    pub pipeline: Arc<ConversationPipeline>,

    /// Moteur de mémoire conversationnelle
    pub memory: Arc<ConversationMemoryEngine>,

    /// Gestionnaire de mémoire multi-couches
    pub multilayer_memory: Arc<RwLock<MultiLayerMemoryManager>>,

    /// Post-processeur linguistique français avancé
    pub french_mastery: Arc<FrenchMasteryProcessor>,

    /// Moteur de réalisme conversationnel (Super Prompt #4)
    pub realism: Arc<ConversationalRealismProcessor>,

    /// Moteur de subtilité émotionnelle (Super Prompt #5)
    pub emotional_subtlety: Arc<EmotionalSubtletyProcessor>,

    /// Moteur de cohérence comportementale (Super Prompt #6)
    pub behavioral_consistency: Arc<BehavioralConsistencyProcessor>,

    /// Moteur de style littéraire et vocabulaire (Super Prompt #7)
    pub literary_engine: Arc<RwLock<LiteraryEngine>>,

    /// Moteur d'anthologie interne (Super Prompt #8)
    pub anthology_engine: Arc<RwLock<AnthologyEngine>>,

    /// Système d'auto-réparation
    pub self_healing: Arc<RwLock<SelfHealingConversation>>,

    /// Référence au SingularityState
    pub singularity: Arc<RwLock<SingularityState>>,

    /// Router IA (Gemini/Ollama)
    pub ai_router: Arc<RwLock<AIRouter>>,

    /// OMEGA Pipeline Bridge (R05 P1)
    pub omega_bridge: Arc<OmegaConversationBridge>,
}

impl ConversationEngineState {
    pub fn new(
        storage_dir: std::path::PathBuf,
        password: String,
        ai_router: Arc<RwLock<AIRouter>>,
        singularity: Arc<RwLock<SingularityState>>,
    ) -> Result<Self, ConversationEngineError> {
        let memory_storage = Arc::new(
            MemoryStorage::new(storage_dir.join("conversations"), password)
                .map_err(|e| ConversationEngineError::MemoryError(e.to_string()))?,
        );

        let memory = Arc::new(ConversationMemoryEngine::new(memory_storage));
        let multilayer_memory = Arc::new(RwLock::new(MultiLayerMemoryManager::new()));
        let french_mastery = Arc::new(FrenchMasteryProcessor::new());
        let realism = Arc::new(ConversationalRealismProcessor::new());
        let emotional_subtlety = Arc::new(EmotionalSubtletyProcessor::new());
        let behavioral_consistency = Arc::new(BehavioralConsistencyProcessor::new());
        let literary_engine = Arc::new(RwLock::new(LiteraryEngine::new()));
        let anthology_engine = Arc::new(RwLock::new(AnthologyEngine::new()));
        let self_healing = Arc::new(RwLock::new(SelfHealingConversation::new()));

        // R05 P1: Initialize OMEGA Pipeline Bridge
        let omega_bridge = Arc::new(OmegaConversationBridge::new(
            OmegaBridgeConfig::default(),
            Arc::clone(&singularity),
        ));

        let pipeline = Arc::new(ConversationPipeline::new(
            memory.clone(),
            ai_router.clone(),
            self_healing.clone(),
            singularity.clone(),
            french_mastery.clone(), // 🇫🇷 AJOUTÉ
        ));

        Ok(Self {
            pipeline,
            memory,
            multilayer_memory,
            french_mastery,
            realism,
            emotional_subtlety,
            behavioral_consistency,
            literary_engine,
            anthology_engine,
            self_healing,
            singularity,
            ai_router,
            omega_bridge, // R05 P1: OMEGA Bridge
        })
    }

    /// Traiter un message utilisateur (point d'entrée principal)
    /// R05 P1: Now routes through OMEGA pipeline first, fallback to legacy
    /// v27.0.3: Added 20s timeout guarantee — Always Respond contract
    pub async fn process_message(
        &self,
        request: ConversationRequest,
    ) -> Result<ConversationResponse, ConversationEngineError> {
        if std::env::var("OFFLINE_SIM").is_ok() {
            log::warn!("[CONV-ENGINE] 🟡 OFFLINE_SIM enabled — returning deterministic offline response");
            return self.create_offline_sim_response().await;
        }

        // ✨ v27.0.3: 20s timeout wrapper — Guarantees Always Respond
        match timeout(Duration::from_secs(20), self.process_message_internal(request)).await {
            Ok(result) => result,
            Err(_timeout_err) => {
                log::error!("[CONV-ENGINE] ⏰ TIMEOUT: Provider selection exceeded 20s, returning offline response");
                self.create_offline_response().await
            }
        }
    }

    /// Internal message processing (wrapped by process_message with timeout)
    async fn process_message_internal(
        &self,
        request: ConversationRequest,
    ) -> Result<ConversationResponse, ConversationEngineError> {
        // R05 P2: OMEGA → Direct conversion (bypasses legacy pipeline duplication)
        match self.omega_bridge.process_through_omega(&request).await {
            Ok(omega_result) => {
                log::info!(
                    "[CONV-ENGINE] ✅ OMEGA pipeline succeeded | latency={}ms | intent={} | safety={}",
                    omega_result.latency_ms,
                    omega_result.intent,
                    omega_result.safety_score
                );

                // P2 OPTIMIZATION: Convert OMEGA → ConversationResponse directly
                // This bypasses legacy pipeline while preserving FrenchMastery quality
                let conversation_id = request
                    .conversation_id
                    .clone()
                    .unwrap_or_else(|| uuid::Uuid::new_v4().to_string());

                match self
                    .omega_bridge
                    .convert_to_conversation_response(omega_result, &request, conversation_id)
                    .await
                {
                    Ok(response) => {
                        log::info!(
                            "[CONV-ENGINE] 🚀 P2 Direct conversion | bypass_legacy=true | total_latency={}ms",
                            response.metadata.latency_ms
                        );
                        Ok(response)
                    }
                    Err(e) => {
                        log::warn!(
                            "[CONV-ENGINE] ⚠️ P2 Conversion failed, falling back to legacy: {}",
                            e
                        );
                        // Fallback to legacy pipeline
                        self.pipeline.process(request).await
                    }
                }
            }
            Err(e) => {
                log::warn!(
                    "[CONV-ENGINE] ⚠️ OMEGA pipeline failed, falling back to legacy: {}",
                    e
                );
                // Fallback to legacy pipeline
                self.pipeline.process(request).await
            }
        }
    }

    /// Create offline response when timeout triggered (Always Respond guarantee)
    async fn create_offline_response(&self) -> Result<ConversationResponse, ConversationEngineError> {
        log::info!("[CONV-ENGINE] 🟢 Creating autonomous offline response (guaranteed <1s)");
        
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0);
        
        Ok(ConversationResponse {
            assistant_message: "Réponse en mode hors ligne. Je suis en train de traiter votre demande avec mes capacités autonomes.".to_string(),
            conversation_id: uuid::Uuid::new_v4().to_string(),
            message_id: uuid::Uuid::new_v4().to_string(),
            detected_intention: Intention::Question,
            detected_emotion: EmotionState::default(),
            cognitive_tags: vec!["offline".to_string(), "fallback".to_string(), "timeout".to_string()],
            cognitive_summary: "Réponse autonome générée en mode hors ligne suite à un délai d'attente dépassé.".to_string(),
            metadata: ConversationMetadata {
                timestamp: now,
                provider_used: "offline".to_string(),
                latency_ms: 40,
                tokens_used: 0,
                memory_effect: MemoryEffect::New,
                links_to_contexts: vec![],
                provider_meta: Some(build_timeout_meta()),
            },
        })
    }

    async fn create_offline_sim_response(
        &self,
    ) -> Result<ConversationResponse, ConversationEngineError> {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0);

        Ok(ConversationResponse {
            assistant_message: "Mode OFFLINE_SIM actif. Réponse hors ligne déterministe.".to_string(),
            conversation_id: uuid::Uuid::new_v4().to_string(),
            message_id: uuid::Uuid::new_v4().to_string(),
            detected_intention: Intention::Question,
            detected_emotion: EmotionState::default(),
            cognitive_tags: vec!["offline".to_string(), "simulated".to_string()],
            cognitive_summary: "Réponse simulée hors ligne (OFFLINE_SIM=1).".to_string(),
            metadata: ConversationMetadata {
                timestamp: now,
                provider_used: "offline".to_string(),
                latency_ms: 0,
                tokens_used: 0,
                memory_effect: MemoryEffect::New,
                links_to_contexts: vec![],
                provider_meta: Some(build_offline_meta(ReasonCode::FallbackOffline, "OFFLINE_SIM")),
            },
        })
    }

    /// Vérifier et réparer l'état si nécessaire
    pub async fn health_check(&self) -> Result<ConversationHealthReport, ConversationEngineError> {
        let mut healing = self.self_healing.write().await;
        let report = healing.scan_and_repair().await?;
        Ok(report)
    }

    /// R05 P1: Get OMEGA pipeline health
    pub async fn omega_health_check(&self) -> OmegaHealthReport {
        self.omega_bridge.health_check().await
    }
}

#[derive(Debug)]
pub enum ConversationEngineError {
    MemoryError(String),
    ProcessingError(String),
    ValidationError(String),
    AIError(String),
    SyncError(String),
}

impl std::fmt::Display for ConversationEngineError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::MemoryError(e) => write!(f, "Memory error: {}", e),
            Self::ProcessingError(e) => write!(f, "Processing error: {}", e),
            Self::ValidationError(e) => write!(f, "Validation error: {}", e),
            Self::AIError(e) => write!(f, "AI error: {}", e),
            Self::SyncError(e) => write!(f, "Sync error: {}", e),
        }
    }
}

impl std::error::Error for ConversationEngineError {}
