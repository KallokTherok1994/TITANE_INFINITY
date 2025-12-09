// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — OMEGA PIPELINE v20Ω
//   Super Prompt #4 + #15: Final optimized cognitive pipeline
//   Router → Executor → Merger → Guardrails → Output + Self-Healing
// ═══════════════════════════════════════════════════════════════

pub mod router;
pub mod executor;
pub mod merger;
pub mod guardrails;
pub mod diagnostics;
pub mod scheduler;
pub mod pipeline;
pub mod self_healing_hook;

pub use router::*;
pub use executor::*;
pub use merger::*;
pub use guardrails::*;
pub use diagnostics::*;
pub use scheduler::*;
pub use pipeline::*;
pub use self_healing_hook::{SelfHealingHook, SelfHealingHookConfig, HealingReport, RequestContext};

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use thiserror::Error;

// ═══════════════════════════════════════════════════════════════
//   CORE TYPES
// ═══════════════════════════════════════════════════════════════

/// Omega Pipeline Configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OmegaConfig {
    /// Enable parallel execution
    pub parallel_execution: bool,
    /// Maximum parallel tasks
    pub max_parallel_tasks: usize,
    /// Pipeline timeout in ms
    pub timeout_ms: u64,
    /// Enable caching
    pub enable_cache: bool,
    /// Cache TTL in seconds
    pub cache_ttl_secs: u64,
    /// Enable diagnostics
    pub enable_diagnostics: bool,
    /// Safety level (0.0 - 1.0)
    pub safety_level: f32,
    /// Target latency in ms
    pub target_latency_ms: u64,
}

impl Default for OmegaConfig {
    fn default() -> Self {
        Self {
            parallel_execution: true,
            max_parallel_tasks: 4,
            timeout_ms: 200,  // <200ms target
            enable_cache: true,
            cache_ttl_secs: 300,
            enable_diagnostics: true,
            safety_level: 0.9,
            target_latency_ms: 200,
        }
    }
}

/// Pipeline Stage
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum PipelineStage {
    /// Input validation and routing
    Router,
    /// Parallel execution of tasks
    Executor,
    /// Merging results
    Merger,
    /// Safety guardrails
    Guardrails,
    /// Final output
    Output,
}

impl PipelineStage {
    pub fn next(&self) -> Option<PipelineStage> {
        match self {
            PipelineStage::Router => Some(PipelineStage::Executor),
            PipelineStage::Executor => Some(PipelineStage::Merger),
            PipelineStage::Merger => Some(PipelineStage::Guardrails),
            PipelineStage::Guardrails => Some(PipelineStage::Output),
            PipelineStage::Output => None,
        }
    }

    pub fn all() -> Vec<PipelineStage> {
        vec![
            PipelineStage::Router,
            PipelineStage::Executor,
            PipelineStage::Merger,
            PipelineStage::Guardrails,
            PipelineStage::Output,
        ]
    }
}

/// Pipeline Input
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PipelineInput {
    /// Request ID
    pub request_id: String,
    /// User input text
    pub text: String,
    /// Context from previous turns
    pub context: Vec<String>,
    /// User preferences
    pub preferences: HashMap<String, serde_json::Value>,
    /// Timestamp
    pub timestamp: i64,
    /// Priority (0-10)
    pub priority: u8,
}

impl PipelineInput {
    pub fn new(text: impl Into<String>) -> Self {
        Self {
            request_id: uuid::Uuid::new_v4().to_string(),
            text: text.into(),
            context: vec![],
            preferences: HashMap::new(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            priority: 5,
        }
    }

    pub fn with_context(mut self, context: Vec<String>) -> Self {
        self.context = context;
        self
    }

    pub fn with_priority(mut self, priority: u8) -> Self {
        self.priority = priority.min(10);
        self
    }
}

/// Pipeline Output
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PipelineOutput {
    /// Request ID (matches input)
    pub request_id: String,
    /// Generated response
    pub response: String,
    /// Response metadata
    pub metadata: OutputMetadata,
    /// Stage timings
    pub timings: HashMap<String, u64>,
    /// Total latency in ms
    pub total_latency_ms: u64,
    /// Success status
    pub success: bool,
    /// Error message if failed
    pub error: Option<String>,
}

/// Output Metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutputMetadata {
    /// Detected intent
    pub intent: String,
    /// Confidence score
    pub confidence: f32,
    /// Conversation mode used
    pub mode: String,
    /// Safety score
    pub safety_score: f32,
    /// Sources used
    pub sources: Vec<String>,
    /// Model used
    pub model: String,
    /// Tokens used
    pub tokens: u32,
}

impl Default for OutputMetadata {
    fn default() -> Self {
        Self {
            intent: "unknown".to_string(),
            confidence: 0.0,
            mode: "neutral".to_string(),
            safety_score: 1.0,
            sources: vec![],
            model: "titane-omega".to_string(),
            tokens: 0,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   ERRORS
// ═══════════════════════════════════════════════════════════════

/// Omega Pipeline Errors
#[derive(Debug, Error)]
pub enum OmegaError {
    #[error("Router error: {0}")]
    RouterError(String),

    #[error("Executor error: {0}")]
    ExecutorError(String),

    #[error("Merger error: {0}")]
    MergerError(String),

    #[error("Guardrails blocked: {0}")]
    GuardrailsBlocked(String),

    #[error("Timeout after {0}ms")]
    Timeout(u64),

    #[error("Pipeline not initialized")]
    NotInitialized,

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Cache error: {0}")]
    CacheError(String),

    #[error("Scheduler error: {0}")]
    SchedulerError(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

pub type OmegaResult<T> = Result<T, OmegaError>;

// ═══════════════════════════════════════════════════════════════
//   TRAITS
// ═══════════════════════════════════════════════════════════════

/// Pipeline Stage Processor trait
#[async_trait::async_trait]
pub trait StageProcessor: Send + Sync {
    /// Process input and return output
    async fn process(&self, input: StageInput) -> OmegaResult<StageOutput>;

    /// Get stage name
    fn name(&self) -> &str;

    /// Get stage type
    fn stage(&self) -> PipelineStage;
}

/// Stage Input
#[derive(Debug, Clone)]
pub struct StageInput {
    pub request_id: String,
    pub data: serde_json::Value,
    pub context: StageContext,
}

/// Stage Context
#[derive(Debug, Clone, Default)]
pub struct StageContext {
    pub previous_outputs: HashMap<PipelineStage, serde_json::Value>,
    pub metadata: HashMap<String, serde_json::Value>,
    pub start_time: Option<std::time::Instant>,
}

/// Stage Output
#[derive(Debug, Clone)]
pub struct StageOutput {
    pub request_id: String,
    pub data: serde_json::Value,
    pub latency_ms: u64,
    pub success: bool,
    pub error: Option<String>,
}

// ═══════════════════════════════════════════════════════════════
//   STATISTICS
// ═══════════════════════════════════════════════════════════════

/// Pipeline Statistics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct PipelineStats {
    /// Total requests processed
    pub total_requests: u64,
    /// Successful requests
    pub successful_requests: u64,
    /// Failed requests
    pub failed_requests: u64,
    /// Average latency in ms
    pub avg_latency_ms: f64,
    /// P50 latency
    pub p50_latency_ms: u64,
    /// P95 latency
    pub p95_latency_ms: u64,
    /// P99 latency
    pub p99_latency_ms: u64,
    /// Requests per second
    pub requests_per_second: f64,
    /// Cache hit rate
    pub cache_hit_rate: f64,
    /// Guardrail block rate
    pub guardrail_block_rate: f64,
    /// Stage-specific stats
    pub stage_stats: HashMap<String, StageStats>,
}

/// Stage Statistics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct StageStats {
    pub invocations: u64,
    pub avg_latency_ms: f64,
    pub error_count: u64,
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_default() {
        let config = OmegaConfig::default();
        assert!(config.parallel_execution);
        assert_eq!(config.timeout_ms, 200);
        assert!(config.safety_level > 0.8);
    }

    #[test]
    fn test_pipeline_stages() {
        let stages = PipelineStage::all();
        assert_eq!(stages.len(), 5);
        assert_eq!(stages[0], PipelineStage::Router);
        assert_eq!(stages[4], PipelineStage::Output);
    }

    #[test]
    fn test_stage_next() {
        assert_eq!(PipelineStage::Router.next(), Some(PipelineStage::Executor));
        assert_eq!(PipelineStage::Output.next(), None);
    }

    #[test]
    fn test_pipeline_input() {
        let input = PipelineInput::new("Hello")
            .with_priority(8)
            .with_context(vec!["Previous message".to_string()]);

        assert_eq!(input.text, "Hello");
        assert_eq!(input.priority, 8);
        assert_eq!(input.context.len(), 1);
    }

    #[test]
    fn test_output_metadata() {
        let meta = OutputMetadata::default();
        assert_eq!(meta.intent, "unknown");
        assert_eq!(meta.safety_score, 1.0);
    }
}
