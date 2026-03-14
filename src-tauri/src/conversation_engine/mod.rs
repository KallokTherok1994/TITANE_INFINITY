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
use std::time::Instant;
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

fn conversation_timeout_secs() -> u64 {
    const DEFAULT_TIMEOUT_SECS: u64 = 20;
    const MIN_TIMEOUT_SECS: u64 = 5;
    const MAX_TIMEOUT_SECS: u64 = 180;

    let raw = match std::env::var("TITANE_CONVERSATION_TIMEOUT_SECS") {
        Ok(value) => value,
        Err(_) => return DEFAULT_TIMEOUT_SECS,
    };

    match raw.parse::<u64>() {
        Ok(value) if (MIN_TIMEOUT_SECS..=MAX_TIMEOUT_SECS).contains(&value) => value,
        _ => {
            log::warn!(
                "[CONV-ENGINE] Invalid TITANE_CONVERSATION_TIMEOUT_SECS='{}' (expected {}..={}), fallback={}",
                raw,
                MIN_TIMEOUT_SECS,
                MAX_TIMEOUT_SECS,
                DEFAULT_TIMEOUT_SECS
            );
            DEFAULT_TIMEOUT_SECS
        }
    }
}

fn timeout_trace_enabled() -> bool {
    match std::env::var("TITANE_TIMEOUT_TRACE") {
        Ok(raw) => {
            let normalized = raw.to_ascii_lowercase();
            matches!(normalized.as_str(), "1" | "true" | "yes" | "on")
        }
        Err(_) => false,
    }
}

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

fn is_offline_sim_enabled() -> bool {
    match std::env::var("OFFLINE_SIM") {
        Ok(raw) => {
            let normalized = raw.trim().to_ascii_lowercase();
            !normalized.is_empty() && !matches!(normalized.as_str(), "0" | "false" | "no" | "off")
        }
        Err(_) => false,
    }
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
    /// v27.0.3: Added timeout guarantee — Always Respond contract
    /// v27.0.5: Timeout can be overridden via TITANE_CONVERSATION_TIMEOUT_SECS
    /// v27.0.4: NO_LYING_FALLBACK — check network_available before deciding OFFLINE
    pub async fn process_message(
        &self,
        request: ConversationRequest,
    ) -> Result<ConversationResponse, ConversationEngineError> {
        if is_offline_sim_enabled() {
            log::warn!("[CONV-ENGINE] 🟡 OFFLINE_SIM enabled — returning deterministic offline response");
            return self.create_offline_sim_response().await;
        }

        let timeout_secs = conversation_timeout_secs();

        // ✨ Timeout wrapper — Guarantees Always Respond (configurable for controlled probes)
        match timeout(
            Duration::from_secs(timeout_secs),
            self.process_message_internal(request),
        )
        .await
        {
            Ok(result) => result,
            Err(_timeout_err) => {
                // v27.0.4: Check router status before deciding OFFLINE mode
                // NO_LYING_FALLBACK: Only claim OFFLINE if router reports no connectivity
                let router_status = self.ai_router.read().await.get_status().await;
                let network_available = matches!(router_status, crate::ai::router::AIRouterStatus::Online | crate::ai::router::AIRouterStatus::Degraded);
                log::error!(
                    "[CONV-ENGINE] ⏰ TIMEOUT: Provider selection exceeded {}s | router_status={:?} | mode={}",
                    timeout_secs,
                    router_status,
                    if network_available { "DEGRADED" } else { "OFFLINE" }
                );
                self.create_offline_response(network_available, timeout_secs)
                    .await
            }
        }
    }

    /// Internal message processing (wrapped by process_message with timeout)
    async fn process_message_internal(
        &self,
        request: ConversationRequest,
    ) -> Result<ConversationResponse, ConversationEngineError> {
        let trace_enabled = timeout_trace_enabled();
        let overall_start = Instant::now();
        let conv_id = request.conversation_id.as_deref().unwrap_or("<new>");

        if trace_enabled {
            log::info!(
                "[CONV-TRACE] process_message_internal start | conversation_id={} | mode=omega_first",
                conv_id
            );
        }

        let omega_start = Instant::now();

        // R05 P2: OMEGA → Direct conversion (bypasses legacy pipeline duplication)
        match self.omega_bridge.process_through_omega(&request).await {
            Ok(omega_result) => {
                if trace_enabled {
                    log::info!(
                        "[CONV-TRACE] omega_bridge ok | elapsed={}ms | intent={} | safety={}",
                        omega_start.elapsed().as_millis(),
                        omega_result.intent,
                        omega_result.safety_score
                    );
                }

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

                let convert_start = Instant::now();

                match self
                    .omega_bridge
                    .convert_to_conversation_response(omega_result, &request, conversation_id)
                    .await
                {
                    Ok(response) => {
                        if trace_enabled {
                            log::info!(
                                "[CONV-TRACE] convert ok | elapsed={}ms | total={}ms | provider_used={}",
                                convert_start.elapsed().as_millis(),
                                overall_start.elapsed().as_millis(),
                                response.metadata.provider_used
                            );
                        }

                        log::info!(
                            "[CONV-ENGINE] 🚀 P2 Direct conversion | bypass_legacy=true | total_latency={}ms",
                            response.metadata.latency_ms
                        );
                        Ok(response)
                    }
                    Err(e) => {
                        if trace_enabled {
                            log::warn!(
                                "[CONV-TRACE] convert failed -> legacy fallback | convert_elapsed={}ms | total_before_legacy={}ms | error={}",
                                convert_start.elapsed().as_millis(),
                                overall_start.elapsed().as_millis(),
                                e
                            );
                        }

                        log::warn!(
                            "[CONV-ENGINE] ⚠️ P2 Conversion failed, falling back to legacy: {}",
                            e
                        );
                        // Fallback to legacy pipeline
                        let legacy_start = Instant::now();
                        let legacy_result = self.pipeline.process(request).await;

                        if trace_enabled {
                            match &legacy_result {
                                Ok(response) => log::info!(
                                    "[CONV-TRACE] legacy ok | elapsed={}ms | total={}ms | provider_used={}",
                                    legacy_start.elapsed().as_millis(),
                                    overall_start.elapsed().as_millis(),
                                    response.metadata.provider_used
                                ),
                                Err(err) => log::warn!(
                                    "[CONV-TRACE] legacy failed | elapsed={}ms | total={}ms | error={}",
                                    legacy_start.elapsed().as_millis(),
                                    overall_start.elapsed().as_millis(),
                                    err
                                ),
                            }
                        }

                        legacy_result
                    }
                }
            }
            Err(e) => {
                if trace_enabled {
                    log::warn!(
                        "[CONV-TRACE] omega_bridge failed -> legacy fallback | omega_elapsed={}ms | error={}",
                        omega_start.elapsed().as_millis(),
                        e
                    );
                }

                log::warn!(
                    "[CONV-ENGINE] ⚠️ OMEGA pipeline failed, falling back to legacy: {}",
                    e
                );
                // Fallback to legacy pipeline
                let legacy_start = Instant::now();
                let legacy_result = self.pipeline.process(request).await;

                if trace_enabled {
                    match &legacy_result {
                        Ok(response) => log::info!(
                            "[CONV-TRACE] legacy ok | elapsed={}ms | total={}ms | provider_used={}",
                            legacy_start.elapsed().as_millis(),
                            overall_start.elapsed().as_millis(),
                            response.metadata.provider_used
                        ),
                        Err(err) => log::warn!(
                            "[CONV-TRACE] legacy failed | elapsed={}ms | total={}ms | error={}",
                            legacy_start.elapsed().as_millis(),
                            overall_start.elapsed().as_millis(),
                            err
                        ),
                    }
                }

                legacy_result
            }
        }
    }

    /// Create offline/degraded response when timeout triggered (Always Respond guarantee)
    /// v27.0.4: NO_LYING_FALLBACK — only use OFFLINE if network is truly unavailable
    async fn create_offline_response(
        &self,
        network_available: bool,
        timeout_secs: u64,
    ) -> Result<ConversationResponse, ConversationEngineError> {
        let mode_label = if network_available { "DÉGRADÉ" } else { "hors ligne" };
        log::info!(
            "[CONV-ENGINE] 🟢 Creating {} response (guaranteed <1s) | network_available={} | timeout_guard={}s",
            mode_label,
            network_available,
            timeout_secs
        );
        
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0);
        
        let (mut message, mut tags, summary) = if network_available {
            (
                "Service momentanément en-degradé. Je traite votre demande avec mes ressources locales.".to_string(),
                vec!["degraded".to_string(), "timeout".to_string(), "online".to_string()],
                "Réponse en mode dégradé suite à un délai provider dépassé (réseau disponible).".to_string(),
            )
        } else {
            (
                "Réponse en mode hors ligne. Je suis en train de traiter votre demande avec mes capacités autonomes.".to_string(),
                vec!["offline".to_string(), "fallback".to_string(), "timeout".to_string()],
                "Réponse autonome générée en mode hors ligne suite à un délai d'attente dépassé.".to_string(),
            )
        };

        // Trace-only runtime witness to prove which timeout guard triggered the fallback.
        if timeout_trace_enabled() {
            message = format!("{} TRACE_TIMEOUT_GUARD_{}S", message, timeout_secs);
            let mut trace_tags = vec![
                "outer-timeout-guard".to_string(),
                format!("timeout-guard-{}s", timeout_secs),
            ];
            trace_tags.extend(tags);
            tags = trace_tags;
        }
        
        Ok(ConversationResponse {
            assistant_message: message,
            conversation_id: uuid::Uuid::new_v4().to_string(),
            message_id: uuid::Uuid::new_v4().to_string(),
            detected_intention: Intention::Question,
            detected_emotion: EmotionState::default(),
            cognitive_tags: tags,
            cognitive_summary: summary,
            metadata: ConversationMetadata {
                timestamp: now,
                provider_used: if network_available { "timeout-degraded" } else { "offline" }.to_string(),
                latency_ms: 40,
                tokens_used: 0,
                memory_effect: MemoryEffect::New,
                links_to_contexts: vec![],
                provider_meta: Some(build_timeout_meta(
                    network_available,
                    timeout_secs.saturating_mul(1000),
                )),
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

#[cfg(test)]
mod tests {
    use super::is_offline_sim_enabled;
    use std::sync::{Mutex, OnceLock};

    fn env_lock() -> &'static Mutex<()> {
        static LOCK: OnceLock<Mutex<()>> = OnceLock::new();
        LOCK.get_or_init(|| Mutex::new(()))
    }

    #[test]
    fn offline_sim_disabled_for_unset_and_falsey_values() {
        let _guard = env_lock().lock().expect("env lock poisoned");
        let previous = std::env::var("OFFLINE_SIM").ok();

        unsafe {
            std::env::remove_var("OFFLINE_SIM");
        }
        assert!(!is_offline_sim_enabled());

        for value in ["", "0", "false", "FALSE", "off", "NO"] {
            unsafe {
                std::env::set_var("OFFLINE_SIM", value);
            }
            assert!(!is_offline_sim_enabled(), "value '{value}' must disable OFFLINE_SIM");
        }

        if let Some(v) = previous {
            unsafe {
                std::env::set_var("OFFLINE_SIM", v);
            }
        } else {
            unsafe {
                std::env::remove_var("OFFLINE_SIM");
            }
        }
    }

    #[test]
    fn offline_sim_enabled_for_truthy_or_non_falsey_values() {
        let _guard = env_lock().lock().expect("env lock poisoned");
        let previous = std::env::var("OFFLINE_SIM").ok();

        for value in ["1", "true", "yes", "on", "unexpected"] {
            unsafe {
                std::env::set_var("OFFLINE_SIM", value);
            }
            assert!(is_offline_sim_enabled(), "value '{value}' must enable OFFLINE_SIM");
        }

        if let Some(v) = previous {
            unsafe {
                std::env::set_var("OFFLINE_SIM", v);
            }
        } else {
            unsafe {
                std::env::remove_var("OFFLINE_SIM");
            }
        }
    }
}
