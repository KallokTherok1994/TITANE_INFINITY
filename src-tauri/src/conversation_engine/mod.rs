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
pub mod pipeline;
pub mod memory;
pub mod intent;
pub mod emotion;
pub mod cognitive;
pub mod self_healing;
pub mod api_neutralizer;
pub mod commands;
pub mod multilayer_memory;
pub mod french_mastery;
pub mod realism;
pub mod emotional_subtlety;
pub mod behavioral_consistency;
pub mod literary_engine;
pub mod anthology_engine;

use std::sync::Arc;
use tokio::sync::RwLock;

use crate::memory::storage::MemoryStorage;
use crate::singularity::singularity_state::SingularityState;
use crate::ai::router::AIRouter;

pub use types::*;
pub use pipeline::ConversationPipeline;
pub use memory::ConversationMemoryEngine;
pub use self_healing::SelfHealingConversation;
pub use multilayer_memory::MultiLayerMemoryManager;
pub use french_mastery::FrenchMasteryProcessor;
pub use realism::ConversationalRealismProcessor;
pub use emotional_subtlety::EmotionalSubtletyProcessor;
pub use behavioral_consistency::BehavioralConsistencyProcessor;
pub use literary_engine::LiteraryEngine;
pub use anthology_engine::AnthologyEngine;

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
                .map_err(|e| ConversationEngineError::MemoryError(e.to_string()))?
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

        let pipeline = Arc::new(ConversationPipeline::new(
            memory.clone(),
            ai_router.clone(),
            self_healing.clone(),
            singularity.clone(),
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
        })
    }

    /// Traiter un message utilisateur (point d'entrée principal)
    pub async fn process_message(
        &self,
        request: ConversationRequest,
    ) -> Result<ConversationResponse, ConversationEngineError> {
        self.pipeline.process(request).await
    }

    /// Vérifier et réparer l'état si nécessaire
    pub async fn health_check(&self) -> Result<ConversationHealthReport, ConversationEngineError> {
        let mut healing = self.self_healing.write().await;
        let report = healing.scan_and_repair().await?;
        Ok(report)
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
