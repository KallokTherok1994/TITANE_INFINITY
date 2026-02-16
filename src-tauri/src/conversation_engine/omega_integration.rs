use std::collections::HashMap;
/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ R05 P1/P2 + SINGULARITY — OMEGA PIPELINE INTEGRATION
 * Bridge: Connect OMEGA Pipeline + Singularity to Chat IA
 * ═══════════════════════════════════════════════════════════════════
 */
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::omega::{OmegaConfig, OmegaPipeline, PipelineInput, PipelineOutput};
use crate::singularity::singularity_state::{ChatContext, SingularityState};

use super::french_mastery::{
    FrenchMasteryProcessor, FrenchMasteryRequest, PostProcessingConstraints, ProcessingMode,
};
use super::meta_accumulator::build_success_meta;
use super::types::*;
use super::ConversationEngineError;

/// Bridge between OMEGA Pipeline and Conversation Engine
pub struct OmegaConversationBridge {
    /// OMEGA Pipeline instance
    omega_pipeline: Arc<OmegaPipeline>,
    /// Configuration
    config: OmegaBridgeConfig,
    /// French Mastery post-processor
    french_mastery: Arc<FrenchMasteryProcessor>,
    /// Singularity Meta-Processing Engine
    singularity: Arc<RwLock<SingularityState>>,
}

/// Configuration for OMEGA-Conversation bridge
#[derive(Debug, Clone)]
pub struct OmegaBridgeConfig {
    /// Enable OMEGA pipeline (fallback to legacy if disabled)
    pub enabled: bool,
    /// OMEGA timeout in ms
    pub timeout_ms: u64,
    /// Enable parallel execution
    pub parallel_execution: bool,
    /// Enable guardrails
    pub enable_guardrails: bool,
}

impl Default for OmegaBridgeConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            timeout_ms: 200, // <200ms target
            parallel_execution: true,
            enable_guardrails: true,
        }
    }
}

impl OmegaConversationBridge {
    /// Create new bridge with configuration
    pub fn new(config: OmegaBridgeConfig, singularity: Arc<RwLock<SingularityState>>) -> Self {
        let omega_config = OmegaConfig {
            parallel_execution: config.parallel_execution,
            max_parallel_tasks: 4,
            timeout_ms: config.timeout_ms,
            enable_cache: true,
            cache_ttl_secs: 300,
            enable_diagnostics: true,
            safety_level: if config.enable_guardrails { 0.9 } else { 0.5 },
            target_latency_ms: config.timeout_ms,
        };

        let omega_pipeline = Arc::new(OmegaPipeline::new(omega_config));
        let french_mastery = Arc::new(FrenchMasteryProcessor::new());

        Self {
            omega_pipeline,
            config,
            french_mastery,
            singularity,
        }
    }

    /// Initialize OMEGA pipeline
    pub async fn initialize(&self) -> Result<(), ConversationEngineError> {
        if !self.config.enabled {
            log::info!("[OMEGA-BRIDGE] ⏸️ OMEGA pipeline disabled, using legacy path");
            return Ok(());
        }

        self.omega_pipeline.initialize().await.map_err(|e| {
            ConversationEngineError::ProcessingError(format!("OMEGA init failed: {}", e))
        })?;

        log::info!("[OMEGA-BRIDGE] ✅ OMEGA pipeline initialized");
        Ok(())
    }

    /// Process message through OMEGA pipeline
    ///
    /// This method wraps the conversation request into OMEGA pipeline format,
    /// executes the OMEGA stages (Router → Executor → Merger → Guardrails),
    /// and converts the output back to conversation format.
    pub async fn process_through_omega(
        &self,
        request: &ConversationRequest,
    ) -> Result<OmegaPipelineResult, ConversationEngineError> {
        if !self.config.enabled {
            return Err(ConversationEngineError::ProcessingError(
                "OMEGA pipeline is disabled".to_string(),
            ));
        }

        let start = std::time::Instant::now();

        // Convert ConversationRequest to OMEGA PipelineInput
        let pipeline_input = self.convert_to_omega_input(request);

        log::info!(
            "[OMEGA-BRIDGE] 🚀 Processing through OMEGA pipeline | request_id={}",
            pipeline_input.request_id
        );

        // Execute OMEGA pipeline
        let pipeline_output = self
            .omega_pipeline
            .process(pipeline_input)
            .await
            .map_err(|e| {
                ConversationEngineError::ProcessingError(format!("OMEGA pipeline failed: {}", e))
            })?;

        let latency_ms = start.elapsed().as_millis() as u64;

        log::info!(
            "[OMEGA-BRIDGE] ✅ OMEGA pipeline complete | latency={}ms | success={}",
            latency_ms,
            pipeline_output.success
        );

        // Convert OMEGA output to conversation format
        let result = self.convert_from_omega_output(pipeline_output, latency_ms);

        Ok(result)
    }

    /// Get OMEGA pipeline health
    pub async fn health_check(&self) -> OmegaHealthReport {
        if !self.config.enabled {
            return OmegaHealthReport {
                enabled: false,
                healthy: false,
                latency_avg_ms: 0,
                requests_processed: 0,
            };
        }

        let health = self.omega_pipeline.health_check().await;

        OmegaHealthReport {
            enabled: true,
            healthy: health.health_status == crate::omega::diagnostics::HealthStatus::Healthy,
            latency_avg_ms: 0, // Implementation: Calculate average latency from diagnostics history
            // - Source: health.latency_samples vector from last N requests
            // - Calculation: latency_samples.iter().sum() / latency_samples.len()
            // - Window: Use last 100 requests for rolling average
            // - Percentiles: Also compute p50, p95, p99 for detailed monitoring
            // - Fallback: Return 0 if latency_samples is empty (no recent requests)
            requests_processed: health.requests_processed,
        }
    }

    /// Quick process for fast responses (bypass full pipeline)
    pub async fn quick_process(&self, text: &str) -> Result<String, ConversationEngineError> {
        if !self.config.enabled {
            return Err(ConversationEngineError::ProcessingError(
                "OMEGA pipeline is disabled".to_string(),
            ));
        }

        self.omega_pipeline.quick_process(text).await.map_err(|e| {
            ConversationEngineError::ProcessingError(format!("OMEGA quick process failed: {}", e))
        })
    }

    // ═══════════════════════════════════════════════════════════════
    // PRIVATE: Conversion helpers
    // ═══════════════════════════════════════════════════════════════

    fn convert_to_omega_input(&self, request: &ConversationRequest) -> PipelineInput {
        let request_id = uuid::Uuid::new_v4().to_string();

        let mut preferences = HashMap::new();
        preferences.insert(
            "conversation_id".to_string(),
            serde_json::json!(request.conversation_id),
        );
        preferences.insert(
            "mode".to_string(),
            serde_json::json!(format!("{:?}", request.mode)),
        );
        if let Some(ref emotion) = request.emotion_context {
            preferences.insert("emotion_context".to_string(), serde_json::json!(emotion));
        }
        if let Some(ref ai_config) = request.ai_config {
            preferences.insert("ai_config".to_string(), serde_json::json!(ai_config));
        }
        if let Some(ref prompt) = request.custom_system_prompt {
            preferences.insert(
                "custom_system_prompt".to_string(),
                serde_json::json!(prompt),
            );
        }

        PipelineInput {
            request_id,
            text: request.user_message.clone(),
            context: vec![], // Implementation: Load conversation context from UnifiedMemory
            // - Query: UNIFIED_MEMORY.read().await.search(&request.conversation_id)
            // - Recent messages: Retrieve last 10 messages from STM for immediate context
            // - Long-term context: Semantic search in LTM for relevant past conversations
            // - Format: Vec<String> with "[User]: {msg}" and "[Assistant]: {reply}" pairs
            // - Token limit: Truncate to ~2000 tokens to fit in LLM context window
            // - Summarization: If conversation too long, use summarizer.rs to compress
            preferences,
            timestamp: chrono::Utc::now().timestamp_millis(),
            priority: 5, // Normal priority
        }
    }

    fn convert_from_omega_output(
        &self,
        output: PipelineOutput,
        latency_ms: u64,
    ) -> OmegaPipelineResult {
        OmegaPipelineResult {
            processed_text: output.response,
            latency_ms,
            intent: output.metadata.intent,
            confidence: output.metadata.confidence,
            safety_score: output.metadata.safety_score,
            sources: output.metadata.sources,
            model: output.metadata.model,
            tokens: output.metadata.tokens,
            timings: output.timings,
        }
    }

    /// Convert OMEGA result directly to ConversationResponse (Phase 2 optimization)
    /// This bypasses the legacy pipeline while preserving FrenchMastery quality
    pub async fn convert_to_conversation_response(
        &self,
        omega_result: OmegaPipelineResult,
        request: &ConversationRequest,
        conversation_id: String,
    ) -> Result<ConversationResponse, ConversationEngineError> {
        let start = std::time::Instant::now();

        // Parse intent from OMEGA metadata
        let detected_intention = match omega_result.intent.to_lowercase().as_str() {
            "question" => Intention::Question,
            "action" => Intention::Action,
            "emotion" => Intention::Emotion,
            "clarification" => Intention::Clarification,
            "meta" => Intention::Meta,
            _ => Intention::Question, // Default fallback
        };

        // Parse emotion (simplified - OMEGA provides confidence as proxy)
        let detected_emotion = EmotionState {
            valence: if omega_result.confidence > 0.7 {
                0.5
            } else {
                0.0
            },
            intensity: omega_result.confidence,
            energy: omega_result.safety_score,
        };

        // Apply FrenchMastery post-processing (preserve quality)
        let french_request = FrenchMasteryRequest {
            context: format!("Mode: {:?}, Intent: {}", request.mode, omega_result.intent),
            draft_response: omega_result.processed_text.clone(),
            mode: ProcessingMode::Optimization,
            constraints: PostProcessingConstraints::default(),
        };

        let french_processed = match self.french_mastery.process(french_request).await {
            Ok(processed) => {
                log::info!("[OMEGA-BRIDGE] ✅ FrenchMastery applied");
                processed.finalized_response
            }
            Err(e) => {
                log::warn!("[OMEGA-BRIDGE] ⚠️ FrenchMastery failed: {}, using raw", e);
                omega_result.processed_text.clone()
            }
        };

        // ═══════════════════════════════════════════════════════════════
        // 🌌 SINGULARITY META-PROCESSING (OMEGA P2 + Singularity Integration)
        // Apply coherence validation, style check, LTM suggestions, meta-tags
        // ═══════════════════════════════════════════════════════════════
        let singularity_context = ChatContext {
            user_message: request.user_message.clone(),
            ai_response: french_processed.clone(),
            conversation_id: conversation_id.clone(),
            intention: omega_result.intent.clone(),
            emotion_state: (
                if omega_result.confidence > 0.7 {
                    0.5
                } else {
                    0.0
                }, // valence
                omega_result.confidence,   // intensity
                omega_result.safety_score, // energy
            ),
            cognitive_summary: format!(
                "OMEGA: {} | Confidence: {:.2} | Safety: {:.2}",
                omega_result.sources.join(", "),
                omega_result.confidence,
                omega_result.safety_score
            ),
            cognitive_tags: omega_result.sources.clone(),
            memory_context: format!("Mode: {:?}", request.mode),
        };

        let (finalized_message, enriched_tags) = {
            let mut singularity = self.singularity.write().await;
            match singularity
                .singularity_meta_process_conversation(singularity_context)
                .await
            {
                Ok(meta_output) => {
                    log::info!(
                        "[Ω:SINGULARITY] ✅ Meta-processing success | coherence={:.2} | corrections={}",
                        meta_output.meta_coherence,
                        meta_output.corrections_applied.len()
                    );

                    // Merge OMEGA sources + Singularity meta-tags
                    let mut merged_tags: Vec<String> = omega_result
                        .sources
                        .iter()
                        .map(|s| format!("omega:{}", s))
                        .chain(meta_output.meta_tags.iter().cloned())
                        .chain(std::iter::once(format!(
                            "coherence:{:.2}",
                            meta_output.meta_coherence
                        )))
                        .collect();

                    // Add LTM suggestions as tags
                    for ltm_suggestion in &meta_output.ltm_suggestions {
                        merged_tags.push(format!("ltm:{}", ltm_suggestion));
                    }

                    (meta_output.final_message, merged_tags)
                }
                Err(e) => {
                    log::warn!(
                        "[Ω:SINGULARITY] ⚠️ Meta-processing failed: {} | using FrenchMastery output",
                        e
                    );
                    // Fallback to OMEGA tags only
                    let basic_tags: Vec<String> = omega_result
                        .sources
                        .iter()
                        .map(|s| format!("omega:{}", s))
                        .chain(std::iter::once(format!("intent:{}", omega_result.intent)))
                        .chain(std::iter::once(format!(
                            "confidence:{:.2}",
                            omega_result.confidence
                        )))
                        .collect();
                    (french_processed.clone(), basic_tags)
                }
            }
        };

        // Generate cognitive summary (enhanced with Singularity info)
        let cognitive_summary = format!(
            "OMEGA Pipeline ({}) | FrenchMastery | Singularity meta-processing | Confidence: {:.2}",
            omega_result.sources.join(", "),
            omega_result.confidence
        );

        // Generate message ID
        let message_id = uuid::Uuid::new_v4().to_string();

        // Build metadata
        let total_latency = start.elapsed().as_millis() as u64 + omega_result.latency_ms;
        let provider_used = format!("{} (OMEGA+Singularity)", omega_result.model);
        let metadata = ConversationMetadata {
            timestamp: chrono::Utc::now().timestamp_millis() as u64,
            provider_used: provider_used.clone(),
            latency_ms: total_latency,
            tokens_used: omega_result.tokens as usize,
            memory_effect: MemoryEffect::New, // OMEGA provides new information
            links_to_contexts: omega_result.sources.clone(),
            provider_meta: Some(build_success_meta(&provider_used, total_latency as u128)),
        };

        log::info!(
            "[OMEGA-BRIDGE] ✅ Full conversion complete | omega={}ms | french+singularity={}ms | total={}ms",
            omega_result.latency_ms,
            start.elapsed().as_millis() as u64,
            total_latency
        );

        Ok(ConversationResponse {
            assistant_message: finalized_message,
            conversation_id,
            message_id,
            detected_intention,
            detected_emotion,
            cognitive_tags: enriched_tags,
            cognitive_summary,
            metadata,
        })
    }
}

/// OMEGA Pipeline processing result
#[derive(Debug, Clone)]
pub struct OmegaPipelineResult {
    /// Processed text output
    pub processed_text: String,
    /// Total latency in ms
    pub latency_ms: u64,
    /// Detected intent
    pub intent: String,
    /// Confidence score
    pub confidence: f32,
    /// Safety score (0.0-1.0)
    pub safety_score: f32,
    /// Sources used
    pub sources: Vec<String>,
    /// Model used
    pub model: String,
    /// Tokens used
    pub tokens: u32,
    /// Stage timings
    pub timings: std::collections::HashMap<String, u64>,
}

/// OMEGA health report
#[derive(Debug, Clone)]
pub struct OmegaHealthReport {
    /// Is OMEGA enabled
    pub enabled: bool,
    /// Is OMEGA healthy
    pub healthy: bool,
    /// Average latency in ms
    pub latency_avg_ms: u64,
    /// Requests processed
    pub requests_processed: u64,
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::sync::RwLock;

    fn create_test_singularity() -> Arc<RwLock<SingularityState>> {
        Arc::new(RwLock::new(SingularityState::default()))
    }

    #[tokio::test]
    async fn test_omega_bridge_initialization() {
        let bridge =
            OmegaConversationBridge::new(OmegaBridgeConfig::default(), create_test_singularity());
        let result = bridge.initialize().await;
        assert!(
            result.is_ok(),
            "OMEGA bridge should initialize successfully"
        );
    }

    #[tokio::test]
    async fn test_omega_bridge_health_check() {
        let bridge =
            OmegaConversationBridge::new(OmegaBridgeConfig::default(), create_test_singularity());
        let _ = bridge.initialize().await;

        let health = bridge.health_check().await;
        assert!(health.enabled, "OMEGA should be enabled");
    }

    #[tokio::test]
    async fn test_omega_bridge_quick_process() {
        let bridge =
            OmegaConversationBridge::new(OmegaBridgeConfig::default(), create_test_singularity());
        let _ = bridge.initialize().await;

        let result = bridge.quick_process("Hello OMEGA").await;
        assert!(result.is_ok(), "Quick process should succeed");
    }

    #[tokio::test]
    async fn test_omega_bridge_disabled() {
        let config = OmegaBridgeConfig {
            enabled: false,
            ..Default::default()
        };
        let bridge = OmegaConversationBridge::new(config, create_test_singularity());

        let health = bridge.health_check().await;
        assert!(!health.enabled, "OMEGA should be disabled");
        assert!(!health.healthy, "OMEGA should not be healthy when disabled");
    }

    #[tokio::test]
    async fn test_omega_bridge_conversion() {
        let bridge =
            OmegaConversationBridge::new(OmegaBridgeConfig::default(), create_test_singularity());

        let request = ConversationRequest {
            user_message: "Test message".to_string(),
            conversation_id: Some("test-conv-123".to_string()),
            mode: ConversationMode::Default,
            ai_config: None,
            emotion_context: None,
            custom_system_prompt: None,
        };

        let omega_input = bridge.convert_to_omega_input(&request);

        assert_eq!(omega_input.text, "Test message");
        assert!(!omega_input.request_id.is_empty());

        // Verify preferences contains conversation_id
        assert!(omega_input.preferences.contains_key("conversation_id"));
    }

    #[tokio::test]
    async fn test_omega_to_conversation_response_conversion() {
        // R05 P2: Test direct OMEGA → ConversationResponse conversion
        let bridge =
            OmegaConversationBridge::new(OmegaBridgeConfig::default(), create_test_singularity());
        let _ = bridge.initialize().await;

        let request = ConversationRequest {
            user_message: "Quelle est la capitale de la France?".to_string(),
            conversation_id: Some("test-conv-p2".to_string()),
            mode: ConversationMode::Default,
            ai_config: None,
            emotion_context: None,
            custom_system_prompt: None,
        };

        // Simulate OMEGA result
        let omega_result = OmegaPipelineResult {
            processed_text: "La capitale de la France est Paris.".to_string(),
            latency_ms: 150,
            intent: "question".to_string(),
            confidence: 0.95,
            safety_score: 0.99,
            sources: vec!["knowledge_base".to_string(), "ai_model".to_string()],
            model: "gpt-4".to_string(),
            tokens: 25,
            timings: {
                let mut map = std::collections::HashMap::new();
                map.insert("routing".to_string(), 10);
                map.insert("execution".to_string(), 120);
                map.insert("guardrails".to_string(), 20);
                map
            },
        };

        let conversation_id = "test-conv-p2".to_string();
        let result = bridge
            .convert_to_conversation_response(omega_result, &request, conversation_id.clone())
            .await;

        assert!(result.is_ok(), "P2 Conversion should succeed");

        let response = result.expect("Failed to get response");

        // Verify all 8 required fields
        assert!(
            !response.assistant_message.is_empty(),
            "assistant_message should not be empty"
        );
        assert_eq!(
            response.conversation_id, conversation_id,
            "conversation_id should match"
        );
        assert!(
            !response.message_id.is_empty(),
            "message_id should be generated"
        );
        assert_eq!(
            response.detected_intention,
            Intention::Question,
            "intent should be Question"
        );
        assert!(
            response.detected_emotion.intensity > 0.0,
            "emotion intensity should be positive"
        );
        assert!(
            !response.cognitive_tags.is_empty(),
            "cognitive_tags should contain OMEGA metadata"
        );
        assert!(
            response.cognitive_summary.contains("OMEGA"),
            "cognitive_summary should mention OMEGA"
        );
        assert!(
            response.metadata.latency_ms < 300,
            "total latency should be under 300ms"
        );

        log::info!(
            "[TEST] ✅ P2 Direct conversion validated | latency={}ms",
            response.metadata.latency_ms
        );
    }
}
