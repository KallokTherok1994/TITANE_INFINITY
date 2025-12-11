/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ R05 P1 — OMEGA PIPELINE → CONVERSATION ENGINE INTEGRATION
 * Bridge: Connect OMEGA Pipeline to Chat IA
 * ═══════════════════════════════════════════════════════════════════
 */

use std::sync::Arc;
use std::collections::HashMap;

use crate::omega::{
    OmegaConfig, OmegaPipeline, PipelineInput, PipelineOutput,
};

use super::types::*;
use super::ConversationEngineError;

/// Bridge between OMEGA Pipeline and Conversation Engine
pub struct OmegaConversationBridge {
    /// OMEGA Pipeline instance
    omega_pipeline: Arc<OmegaPipeline>,
    /// Configuration
    config: OmegaBridgeConfig,
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
    pub fn new(config: OmegaBridgeConfig) -> Self {
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

        Self {
            omega_pipeline,
            config,
        }
    }

    /// Initialize OMEGA pipeline
    pub async fn initialize(&self) -> Result<(), ConversationEngineError> {
        if !self.config.enabled {
            log::info!("[OMEGA-BRIDGE] ⏸️ OMEGA pipeline disabled, using legacy path");
            return Ok(());
        }

        self.omega_pipeline
            .initialize()
            .await
            .map_err(|e| ConversationEngineError::ProcessingError(format!("OMEGA init failed: {}", e)))?;

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
            latency_avg_ms: 0, // TODO: Calculate from diagnostics
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

        self.omega_pipeline
            .quick_process(text)
            .await
            .map_err(|e| {
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
            preferences.insert("custom_system_prompt".to_string(), serde_json::json!(prompt));
        }

        PipelineInput {
            request_id,
            text: request.user_message.clone(),
            context: vec![], // TODO: Load context from memory
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

    #[tokio::test]
    async fn test_omega_bridge_initialization() {
        let bridge = OmegaConversationBridge::new(OmegaBridgeConfig::default());
        let result = bridge.initialize().await;
        assert!(result.is_ok(), "OMEGA bridge should initialize successfully");
    }

    #[tokio::test]
    async fn test_omega_bridge_health_check() {
        let bridge = OmegaConversationBridge::new(OmegaBridgeConfig::default());
        let _ = bridge.initialize().await;
        
        let health = bridge.health_check().await;
        assert!(health.enabled, "OMEGA should be enabled");
    }

    #[tokio::test]
    async fn test_omega_bridge_quick_process() {
        let bridge = OmegaConversationBridge::new(OmegaBridgeConfig::default());
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
        let bridge = OmegaConversationBridge::new(config);
        
        let health = bridge.health_check().await;
        assert!(!health.enabled, "OMEGA should be disabled");
        assert!(!health.healthy, "OMEGA should not be healthy when disabled");
    }

    #[tokio::test]
    async fn test_omega_bridge_conversion() {
        let bridge = OmegaConversationBridge::new(OmegaBridgeConfig::default());
        
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
        assert!(omega_input.request_id.len() > 0);
        
        // Verify preferences contains conversation_id
        assert!(omega_input.preferences.contains_key("conversation_id"));
    }
}
