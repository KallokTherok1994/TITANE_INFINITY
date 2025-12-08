// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — OMEGA PIPELINE - MAIN PIPELINE
//   Super Prompt #15: Complete pipeline orchestration
//   Router → Executor → Merger → Guardrails → Output
// ═══════════════════════════════════════════════════════════════

use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;
use tokio::time::timeout;
use serde::{Deserialize, Serialize};

use super::{
    OmegaConfig, OmegaError, OmegaResult,
    PipelineInput, PipelineOutput, PipelineStage, OutputMetadata,
    StageInput, StageContext, StageProcessor,
    router::{Router, RoutingResult},
    executor::Executor,
    merger::{Merger, MergeResult},
    guardrails::{Guardrails, GuardrailResult, GuardrailConfig},
    diagnostics::DiagnosticsEngine,
    scheduler::{JobScheduler, SchedulerConfig},
};

// ═══════════════════════════════════════════════════════════════
//   OMEGA PIPELINE
// ═══════════════════════════════════════════════════════════════

/// Main Omega Pipeline
pub struct OmegaPipeline {
    /// Configuration
    config: OmegaConfig,
    /// Router stage
    router: Router,
    /// Executor stage
    executor: Executor,
    /// Merger stage
    merger: Merger,
    /// Guardrails stage
    guardrails: Guardrails,
    /// Diagnostics engine
    diagnostics: Arc<DiagnosticsEngine>,
    /// Job scheduler
    scheduler: Arc<JobScheduler>,
    /// Pipeline state
    state: Arc<RwLock<PipelineState>>,
}

/// Pipeline state
#[derive(Debug, Clone, Default)]
pub struct PipelineState {
    /// Is pipeline initialized
    pub initialized: bool,
    /// Is pipeline running
    pub running: bool,
    /// Total requests processed
    pub requests_processed: u64,
    /// Start time
    pub started_at: Option<i64>,
}

impl Default for OmegaPipeline {
    fn default() -> Self {
        Self::new(OmegaConfig::default())
    }
}

impl OmegaPipeline {
    /// Create new pipeline with configuration
    pub fn new(config: OmegaConfig) -> Self {
        let scheduler_config = SchedulerConfig {
            max_concurrent: config.max_parallel_tasks,
            rate_limit: 100.0,
            default_timeout_ms: config.timeout_ms,
            ..Default::default()
        };

        let guardrail_config = GuardrailConfig {
            min_safety_score: config.safety_level,
            ..Default::default()
        };

        Self {
            config: config.clone(),
            router: Router::new(),
            executor: Executor::new(),
            merger: Merger::new(),
            guardrails: Guardrails::with_config(guardrail_config),
            diagnostics: Arc::new(DiagnosticsEngine::with_config(config)),
            scheduler: Arc::new(JobScheduler::new(scheduler_config)),
            state: Arc::new(RwLock::new(PipelineState::default())),
        }
    }

    /// Initialize the pipeline
    pub async fn initialize(&self) -> OmegaResult<()> {
        let mut state = self.state.write().await;
        state.initialized = true;
        state.started_at = Some(chrono::Utc::now().timestamp_millis());
        Ok(())
    }

    /// Process a request through the pipeline
    pub async fn process(&self, input: PipelineInput) -> OmegaResult<PipelineOutput> {
        let start = std::time::Instant::now();
        let request_id = input.request_id.clone();

        // Check if initialized
        {
            let state = self.state.read().await;
            if !state.initialized {
                return Err(OmegaError::NotInitialized);
            }
        }

        // Record request start
        self.diagnostics.record_request_start(&request_id).await;

        // Apply global timeout
        let timeout_duration = Duration::from_millis(self.config.timeout_ms);

        let result = timeout(timeout_duration, self.execute_pipeline(input)).await;

        let total_latency = start.elapsed().as_millis() as u64;

        match result {
            Ok(Ok(output)) => {
                self.diagnostics.record_request_complete(&request_id, true, total_latency).await;
                self.increment_processed().await;
                Ok(output)
            }
            Ok(Err(e)) => {
                self.diagnostics.record_request_complete(&request_id, false, total_latency).await;
                self.diagnostics.record_error(&format!("{:?}", e), &e.to_string()).await;
                Err(e)
            }
            Err(_) => {
                self.diagnostics.record_timeout().await;
                self.diagnostics.record_request_complete(&request_id, false, total_latency).await;
                Err(OmegaError::Timeout(self.config.timeout_ms))
            }
        }
    }

    /// Execute pipeline stages
    async fn execute_pipeline(&self, input: PipelineInput) -> OmegaResult<PipelineOutput> {
        let start = std::time::Instant::now();
        let request_id = input.request_id.clone();
        let input_text = input.text.clone();
        let mut timings: HashMap<String, u64> = HashMap::new();
        let mut context = StageContext::default();
        context.start_time = Some(start);

        // ═══════════════════════════════════════════════════════════════
        // STAGE 1: ROUTER
        // ═══════════════════════════════════════════════════════════════
        let stage_start = std::time::Instant::now();

        let router_input = StageInput {
            request_id: request_id.clone(),
            data: serde_json::json!({ "text": input_text }),
            context: context.clone(),
        };

        let router_output = self.router.process(router_input).await?;
        self.diagnostics.record_stage(PipelineStage::Router, router_output.latency_ms, router_output.success).await;
        timings.insert("router".to_string(), stage_start.elapsed().as_millis() as u64);

        // Store router output in context
        context.previous_outputs.insert(PipelineStage::Router, router_output.data.clone());

        // Check cache hit
        let routing: RoutingResult = serde_json::from_value(router_output.data.clone())
            .map_err(|e| OmegaError::RouterError(e.to_string()))?;

        if routing.cache_hit {
            self.diagnostics.record_cache_event(true).await;
        } else {
            self.diagnostics.record_cache_event(false).await;
        }

        // ═══════════════════════════════════════════════════════════════
        // STAGE 2: EXECUTOR
        // ═══════════════════════════════════════════════════════════════
        let stage_start = std::time::Instant::now();

        let executor_input = StageInput {
            request_id: request_id.clone(),
            data: serde_json::json!({ "text": input_text }),
            context: context.clone(),
        };

        let executor_output = self.executor.process(executor_input).await?;
        self.diagnostics.record_stage(PipelineStage::Executor, executor_output.latency_ms, executor_output.success).await;
        timings.insert("executor".to_string(), stage_start.elapsed().as_millis() as u64);

        // Store executor output in context
        context.previous_outputs.insert(PipelineStage::Executor, executor_output.data.clone());

        // ═══════════════════════════════════════════════════════════════
        // STAGE 3: MERGER
        // ═══════════════════════════════════════════════════════════════
        let stage_start = std::time::Instant::now();

        let merger_input = StageInput {
            request_id: request_id.clone(),
            data: serde_json::json!({}),
            context: context.clone(),
        };

        let merger_output = self.merger.process(merger_input).await?;
        self.diagnostics.record_stage(PipelineStage::Merger, merger_output.latency_ms, merger_output.success).await;
        timings.insert("merger".to_string(), stage_start.elapsed().as_millis() as u64);

        // Store merger output in context
        context.previous_outputs.insert(PipelineStage::Merger, merger_output.data.clone());

        // ═══════════════════════════════════════════════════════════════
        // STAGE 4: GUARDRAILS
        // ═══════════════════════════════════════════════════════════════
        let stage_start = std::time::Instant::now();

        let guardrails_input = StageInput {
            request_id: request_id.clone(),
            data: serde_json::json!({}),
            context: context.clone(),
        };

        let guardrails_result = self.guardrails.process(guardrails_input).await;
        let guardrails_latency = stage_start.elapsed().as_millis() as u64;
        timings.insert("guardrails".to_string(), guardrails_latency);

        // Handle guardrails result
        let (final_response, was_blocked, safety_score) = match guardrails_result {
            Ok(output) => {
                self.diagnostics.record_stage(PipelineStage::Guardrails, guardrails_latency, true).await;
                let guardrail: GuardrailResult = serde_json::from_value(output.data)
                    .unwrap_or_else(|_| GuardrailResult {
                        request_id: request_id.clone(),
                        original_response: String::new(),
                        final_response: "Error processing response".to_string(),
                        was_modified: false,
                        was_blocked: false,
                        safety_score: 0.0,
                        checks: vec![],
                        latency_ms: 0,
                        block_reason: None,
                    });

                (guardrail.final_response, guardrail.was_blocked, guardrail.safety_score)
            }
            Err(OmegaError::GuardrailsBlocked(reason)) => {
                self.diagnostics.record_stage(PipelineStage::Guardrails, guardrails_latency, false).await;
                self.diagnostics.record_blocked().await;
                ("Je ne peux pas répondre à cette demande.".to_string(), true, 0.0)
            }
            Err(e) => {
                self.diagnostics.record_stage(PipelineStage::Guardrails, guardrails_latency, false).await;
                return Err(e);
            }
        };

        // ═══════════════════════════════════════════════════════════════
        // BUILD OUTPUT
        // ═══════════════════════════════════════════════════════════════
        let total_latency = start.elapsed().as_millis() as u64;
        timings.insert("total".to_string(), total_latency);

        // Get merge result for metadata
        let merge_result: MergeResult = serde_json::from_value(
            context.previous_outputs.get(&PipelineStage::Merger).cloned().unwrap_or_default()
        ).unwrap_or_else(|_| MergeResult {
            request_id: request_id.clone(),
            response: final_response.clone(),
            confidence: 0.8,
            sources: vec![],
            strategy: super::merger::MergeStrategy::SelectBest,
            latency_ms: 0,
            quality_score: 0.8,
            metadata: super::merger::MergeMetadata::default(),
        });

        Ok(PipelineOutput {
            request_id,
            response: final_response,
            metadata: OutputMetadata {
                intent: format!("{:?}", routing.intent),
                confidence: routing.confidence,
                mode: format!("{:?}", routing.execution_mode),
                safety_score,
                sources: merge_result.sources.iter().map(|s| s.task_id.clone()).collect(),
                model: "titane-omega-v20".to_string(),
                tokens: (merge_result.response.len() / 4) as u32,
            },
            timings,
            total_latency_ms: total_latency,
            success: !was_blocked,
            error: if was_blocked { Some("Request blocked by guardrails".to_string()) } else { None },
        })
    }

    /// Increment processed count
    async fn increment_processed(&self) {
        let mut state = self.state.write().await;
        state.requests_processed += 1;
    }

    /// Quick process (simplified path for fast responses)
    pub async fn quick_process(&self, text: &str) -> OmegaResult<String> {
        let input = PipelineInput::new(text);
        let output = self.process(input).await?;

        if output.success {
            Ok(output.response)
        } else {
            Err(OmegaError::Internal(output.error.unwrap_or_else(|| "Unknown error".to_string())))
        }
    }

    /// Get pipeline health
    pub async fn health_check(&self) -> PipelineHealth {
        let health = self.diagnostics.health_check().await;
        let state = self.state.read().await;

        PipelineHealth {
            initialized: state.initialized,
            running: state.running,
            requests_processed: state.requests_processed,
            health_status: health.status,
            health_score: health.score,
            issues: health.issues.len(),
        }
    }

    /// Get pipeline statistics
    pub async fn get_stats(&self) -> super::PipelineStats {
        self.diagnostics.get_stats().await
    }

    /// Get scheduler
    pub fn scheduler(&self) -> Arc<JobScheduler> {
        self.scheduler.clone()
    }

    /// Get diagnostics
    pub fn diagnostics(&self) -> Arc<DiagnosticsEngine> {
        self.diagnostics.clone()
    }

    /// Get configuration
    pub fn config(&self) -> &OmegaConfig {
        &self.config
    }

    /// Shutdown pipeline
    pub async fn shutdown(&self) {
        let mut state = self.state.write().await;
        state.running = false;
    }
}

/// Pipeline health summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PipelineHealth {
    pub initialized: bool,
    pub running: bool,
    pub requests_processed: u64,
    pub health_status: super::diagnostics::HealthStatus,
    pub health_score: f32,
    pub issues: usize,
}

// ═══════════════════════════════════════════════════════════════
//   PIPELINE BUILDER
// ═══════════════════════════════════════════════════════════════

/// Builder for OmegaPipeline
pub struct OmegaPipelineBuilder {
    config: OmegaConfig,
}

impl Default for OmegaPipelineBuilder {
    fn default() -> Self {
        Self {
            config: OmegaConfig::default(),
        }
    }
}

impl OmegaPipelineBuilder {
    /// Create new builder
    pub fn new() -> Self {
        Self::default()
    }

    /// Set timeout
    pub fn timeout_ms(mut self, timeout: u64) -> Self {
        self.config.timeout_ms = timeout;
        self
    }

    /// Set max parallel tasks
    pub fn max_parallel(mut self, max: usize) -> Self {
        self.config.max_parallel_tasks = max;
        self
    }

    /// Set safety level
    pub fn safety_level(mut self, level: f32) -> Self {
        self.config.safety_level = level.clamp(0.0, 1.0);
        self
    }

    /// Enable/disable caching
    pub fn enable_cache(mut self, enable: bool) -> Self {
        self.config.enable_cache = enable;
        self
    }

    /// Enable/disable diagnostics
    pub fn enable_diagnostics(mut self, enable: bool) -> Self {
        self.config.enable_diagnostics = enable;
        self
    }

    /// Build the pipeline
    pub fn build(self) -> OmegaPipeline {
        OmegaPipeline::new(self.config)
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_pipeline_creation() {
        let pipeline = OmegaPipeline::default();
        pipeline.initialize().await.unwrap();

        let health = pipeline.health_check().await;
        assert!(health.initialized);
    }

    #[tokio::test]
    async fn test_pipeline_process() {
        let pipeline = OmegaPipeline::default();
        pipeline.initialize().await.unwrap();

        let input = PipelineInput::new("Hello, how are you?");
        let output = pipeline.process(input).await.unwrap();

        assert!(!output.request_id.is_empty());
        assert!(output.total_latency_ms > 0);
    }

    #[tokio::test]
    async fn test_pipeline_quick_process() {
        let pipeline = OmegaPipeline::default();
        pipeline.initialize().await.unwrap();

        let result = pipeline.quick_process("Test query").await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_pipeline_builder() {
        let pipeline = OmegaPipelineBuilder::new()
            .timeout_ms(500)
            .max_parallel(8)
            .safety_level(0.95)
            .enable_cache(true)
            .build();

        assert_eq!(pipeline.config.timeout_ms, 500);
        assert_eq!(pipeline.config.max_parallel_tasks, 8);
    }

    #[tokio::test]
    async fn test_pipeline_stats() {
        let pipeline = OmegaPipeline::default();
        pipeline.initialize().await.unwrap();

        // Process a request
        let input = PipelineInput::new("Test");
        let _ = pipeline.process(input).await;

        let stats = pipeline.get_stats().await;
        assert!(stats.total_requests >= 1);
    }

    #[tokio::test]
    async fn test_uninitialized_pipeline() {
        let pipeline = OmegaPipeline::default();
        // Don't initialize

        let input = PipelineInput::new("Test");
        let result = pipeline.process(input).await;

        assert!(matches!(result, Err(OmegaError::NotInitialized)));
    }

    #[tokio::test]
    async fn test_pipeline_timings() {
        let pipeline = OmegaPipeline::default();
        pipeline.initialize().await.unwrap();

        let input = PipelineInput::new("Hello");
        let output = pipeline.process(input).await.unwrap();

        // Should have timings for each stage
        assert!(output.timings.contains_key("router"));
        assert!(output.timings.contains_key("executor"));
        assert!(output.timings.contains_key("merger"));
        assert!(output.timings.contains_key("guardrails"));
        assert!(output.timings.contains_key("total"));
    }
}
