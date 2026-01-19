// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — OMEGA PIPELINE - MERGER
//   Super Prompt #15: Result merging and synthesis
//   Combines outputs from multiple tasks into coherent response
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use super::{
    executor::{ExecutionResult, TaskResult, TaskType},
    router::ExecutionMode,
    OmegaError, OmegaResult, PipelineStage, StageInput, StageOutput, StageProcessor,
};

// ═══════════════════════════════════════════════════════════════
//   MERGE STRATEGY
// ═══════════════════════════════════════════════════════════════

/// Strategy for merging results
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MergeStrategy {
    /// Concatenate all outputs
    Concatenate,
    /// Select best output based on confidence
    SelectBest,
    /// Weighted average of outputs
    WeightedMerge,
    /// Priority-based selection
    PriorityBased,
    /// Consensus-based (majority voting)
    Consensus,
}

impl MergeStrategy {
    /// Get strategy for execution mode
    pub fn for_mode(mode: ExecutionMode) -> Self {
        match mode {
            ExecutionMode::Fast => MergeStrategy::SelectBest,
            ExecutionMode::Balanced => MergeStrategy::WeightedMerge,
            ExecutionMode::Thorough => MergeStrategy::Consensus,
            ExecutionMode::Explorative => MergeStrategy::Concatenate,
            ExecutionMode::Empathetic => MergeStrategy::PriorityBased,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   MERGE RESULT
// ═══════════════════════════════════════════════════════════════

/// Result of merging
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MergeResult {
    /// Request ID
    pub request_id: String,
    /// Merged response text
    pub response: String,
    /// Confidence score for merged result
    pub confidence: f32,
    /// Sources contributing to the result
    pub sources: Vec<MergeSource>,
    /// Merge strategy used
    pub strategy: MergeStrategy,
    /// Merge latency in ms
    pub latency_ms: u64,
    /// Quality score
    pub quality_score: f32,
    /// Metadata
    pub metadata: MergeMetadata,
}

/// Source contribution to merge
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MergeSource {
    /// Task ID
    pub task_id: String,
    /// Task type
    pub task_type: String,
    /// Contribution weight
    pub weight: f32,
    /// Was successful
    pub success: bool,
}

/// Merge metadata
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct MergeMetadata {
    /// Number of successful tasks
    pub successful_tasks: usize,
    /// Number of failed tasks
    pub failed_tasks: usize,
    /// Total execution time of all tasks
    pub total_task_time_ms: u64,
    /// Identity info
    pub identity: Option<serde_json::Value>,
    /// Safety info
    pub safety: Option<serde_json::Value>,
    /// Memory context
    pub memory_context: Option<serde_json::Value>,
}

// ═══════════════════════════════════════════════════════════════
//   RESULT MERGER
// ═══════════════════════════════════════════════════════════════

/// Result merger
pub struct ResultMerger {
    /// Default strategy
    default_strategy: MergeStrategy,
    /// Task type weights
    weights: HashMap<TaskType, f32>,
}

impl Default for ResultMerger {
    fn default() -> Self {
        let mut weights = HashMap::new();
        weights.insert(TaskType::TextGen, 1.0);
        weights.insert(TaskType::CodeGen, 0.9);
        weights.insert(TaskType::Reasoning, 0.8);
        weights.insert(TaskType::Knowledge, 0.7);
        weights.insert(TaskType::Memory, 0.6);
        weights.insert(TaskType::Context, 0.5);
        weights.insert(TaskType::Identity, 0.4);
        weights.insert(TaskType::Safety, 0.3);

        Self {
            default_strategy: MergeStrategy::WeightedMerge,
            weights,
        }
    }
}

impl ResultMerger {
    /// Create new merger
    pub fn new() -> Self {
        Self::default()
    }

    /// Create with custom strategy
    pub fn with_strategy(strategy: MergeStrategy) -> Self {
        let mut merger = Self::default();
        merger.default_strategy = strategy;
        merger
    }

    /// Merge execution results
    pub fn merge(&self, execution: &ExecutionResult) -> OmegaResult<MergeResult> {
        let start = std::time::Instant::now();

        let strategy = MergeStrategy::for_mode(execution.mode);
        let sources = self.build_sources(&execution.results);
        let metadata = self.build_metadata(&execution.results);

        let (response, confidence) = match strategy {
            MergeStrategy::Concatenate => self.merge_concatenate(&execution.results),
            MergeStrategy::SelectBest => self.merge_select_best(&execution.results),
            MergeStrategy::WeightedMerge => self.merge_weighted(&execution.results),
            MergeStrategy::PriorityBased => self.merge_priority(&execution.results),
            MergeStrategy::Consensus => self.merge_consensus(&execution.results),
        };

        let quality_score = self.calculate_quality(&execution.results, confidence);

        Ok(MergeResult {
            request_id: execution.request_id.clone(),
            response,
            confidence,
            sources,
            strategy,
            latency_ms: start.elapsed().as_millis() as u64,
            quality_score,
            metadata,
        })
    }

    /// Build sources list from results
    fn build_sources(&self, results: &[TaskResult]) -> Vec<MergeSource> {
        results
            .iter()
            .map(|r| {
                let task_type = self.infer_task_type(&r.task_id);
                let weight = self.weights.get(&task_type).copied().unwrap_or(0.5);

                MergeSource {
                    task_id: r.task_id.clone(),
                    task_type: format!("{:?}", task_type),
                    weight,
                    success: r.success,
                }
            })
            .collect()
    }

    /// Build metadata from results
    fn build_metadata(&self, results: &[TaskResult]) -> MergeMetadata {
        let successful_tasks = results.iter().filter(|r| r.success).count();
        let failed_tasks = results.len() - successful_tasks;
        let total_task_time_ms = results.iter().map(|r| r.execution_ms).sum();

        let identity = results
            .iter()
            .find(|r| r.task_id == "identity")
            .map(|r| r.data.clone());

        let safety = results
            .iter()
            .find(|r| r.task_id == "safety")
            .map(|r| r.data.clone());

        let memory_context = results
            .iter()
            .find(|r| r.task_id == "memory")
            .map(|r| r.data.clone());

        MergeMetadata {
            successful_tasks,
            failed_tasks,
            total_task_time_ms,
            identity,
            safety,
            memory_context,
        }
    }

    /// Merge by concatenation
    fn merge_concatenate(&self, results: &[TaskResult]) -> (String, f32) {
        let mut parts: Vec<String> = Vec::new();
        let mut total_confidence = 0.0;
        let mut count = 0;

        for result in results {
            if result.success {
                if let Some(text) = self.extract_text(&result.data) {
                    if !text.is_empty() {
                        parts.push(text);
                        count += 1;
                    }
                }
                total_confidence += self.extract_confidence(&result.data);
            }
        }

        let confidence = if count > 0 {
            total_confidence / count as f32
        } else {
            0.5
        };
        (parts.join("\n\n"), confidence)
    }

    /// Merge by selecting best result
    fn merge_select_best(&self, results: &[TaskResult]) -> (String, f32) {
        let best = results.iter().filter(|r| r.success).max_by(|a, b| {
            let conf_a = self.extract_confidence(&a.data);
            let conf_b = self.extract_confidence(&b.data);
            conf_a
                .partial_cmp(&conf_b)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        if let Some(result) = best {
            let text = self.extract_text(&result.data).unwrap_or_default();
            let confidence = self.extract_confidence(&result.data);
            (text, confidence)
        } else {
            ("Unable to generate response".to_string(), 0.3)
        }
    }

    /// Merge with weighted averaging
    fn merge_weighted(&self, results: &[TaskResult]) -> (String, f32) {
        let mut weighted_parts: Vec<(String, f32)> = Vec::new();
        let mut total_weight = 0.0;

        for result in results {
            if result.success {
                let task_type = self.infer_task_type(&result.task_id);
                let weight = self.weights.get(&task_type).copied().unwrap_or(0.5);

                if let Some(text) = self.extract_text(&result.data) {
                    if !text.is_empty() {
                        weighted_parts.push((text, weight));
                        total_weight += weight;
                    }
                }
            }
        }

        if weighted_parts.is_empty() {
            return ("Unable to generate response".to_string(), 0.3);
        }

        // Select highest weighted part for main response
        weighted_parts.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        let primary = weighted_parts
            .first()
            .map(|(t, _)| t.clone())
            .unwrap_or_default();
        let confidence = if total_weight > 0.0 {
            weighted_parts.iter().map(|(_, w)| w).sum::<f32>() / weighted_parts.len() as f32
        } else {
            0.5
        };

        (primary, confidence.min(1.0))
    }

    /// Merge by priority
    fn merge_priority(&self, results: &[TaskResult]) -> (String, f32) {
        // Priority order: TextGen > CodeGen > Knowledge > Reasoning > others
        let priority_order = ["textgen", "codegen", "knowledge", "reasoning"];

        for priority_id in priority_order {
            if let Some(result) = results
                .iter()
                .find(|r| r.task_id == priority_id && r.success)
            {
                if let Some(text) = self.extract_text(&result.data) {
                    if !text.is_empty() {
                        let confidence = self.extract_confidence(&result.data);
                        return (text, confidence);
                    }
                }
            }
        }

        // Fallback to any successful result
        self.merge_select_best(results)
    }

    /// Merge by consensus
    fn merge_consensus(&self, results: &[TaskResult]) -> (String, f32) {
        // For consensus, we look for agreement across multiple results
        let successful: Vec<_> = results.iter().filter(|r| r.success).collect();

        if successful.len() <= 1 {
            return self.merge_select_best(results);
        }

        // Simple consensus: use most confident if agreement, else weighted merge
        let confidences: Vec<f32> = successful
            .iter()
            .map(|r| self.extract_confidence(&r.data))
            .collect();

        let avg_confidence = confidences.iter().sum::<f32>() / confidences.len() as f32;
        let variance: f32 = confidences
            .iter()
            .map(|c| (c - avg_confidence).powi(2))
            .sum::<f32>()
            / confidences.len() as f32;

        // High agreement (low variance) -> use best
        // Low agreement -> use weighted merge
        if variance < 0.1 {
            self.merge_select_best(results)
        } else {
            self.merge_weighted(results)
        }
    }

    /// Extract text from result data
    fn extract_text(&self, data: &serde_json::Value) -> Option<String> {
        // Try various fields where text might be stored
        data.get("text")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .or_else(|| {
                data.get("response")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string())
            })
            .or_else(|| {
                data.get("code")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string())
            })
            .or_else(|| {
                data.get("analysis")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string())
            })
    }

    /// Extract confidence from result data
    fn extract_confidence(&self, data: &serde_json::Value) -> f32 {
        data.get("confidence")
            .and_then(|v| v.as_f64())
            .map(|f| f as f32)
            .unwrap_or(0.7)
    }

    /// Infer task type from task ID
    fn infer_task_type(&self, task_id: &str) -> TaskType {
        match task_id.to_lowercase().as_str() {
            "safety" => TaskType::Safety,
            "identity" => TaskType::Identity,
            "memory" => TaskType::Memory,
            "knowledge" => TaskType::Knowledge,
            "reasoning" => TaskType::Reasoning,
            "codegen" => TaskType::CodeGen,
            "textgen" => TaskType::TextGen,
            "context" => TaskType::Context,
            _ => TaskType::TextGen,
        }
    }

    /// Calculate quality score
    fn calculate_quality(&self, results: &[TaskResult], confidence: f32) -> f32 {
        let success_rate =
            results.iter().filter(|r| r.success).count() as f32 / results.len() as f32;
        let safety_ok = results
            .iter()
            .find(|r| r.task_id == "safety")
            .map(|r| {
                r.data
                    .get("safe")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false)
            })
            .unwrap_or(true);

        let base_quality = (success_rate + confidence) / 2.0;
        if safety_ok {
            base_quality
        } else {
            base_quality * 0.5
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   MERGER STAGE PROCESSOR
// ═══════════════════════════════════════════════════════════════

/// Merger stage processor
pub struct Merger {
    result_merger: ResultMerger,
}

impl Default for Merger {
    fn default() -> Self {
        Self {
            result_merger: ResultMerger::new(),
        }
    }
}

impl Merger {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait::async_trait]
impl StageProcessor for Merger {
    async fn process(&self, input: StageInput) -> OmegaResult<StageOutput> {
        let start = std::time::Instant::now();

        // Get execution result from previous stage
        let execution: ExecutionResult = serde_json::from_value(
            input
                .context
                .previous_outputs
                .get(&PipelineStage::Executor)
                .cloned()
                .unwrap_or_default(),
        )
        .map_err(|e| OmegaError::MergerError(e.to_string()))?;

        let result = self.result_merger.merge(&execution)?;

        Ok(StageOutput {
            request_id: input.request_id,
            data: serde_json::to_value(&result).unwrap_or_default(),
            latency_ms: start.elapsed().as_millis() as u64,
            success: true,
            error: None,
        })
    }

    fn name(&self) -> &str {
        "Merger"
    }

    fn stage(&self) -> PipelineStage {
        PipelineStage::Merger
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    fn mock_results() -> Vec<TaskResult> {
        vec![
            TaskResult {
                task_id: "safety".to_string(),
                success: true,
                data: serde_json::json!({ "safe": true, "score": 0.95 }),
                execution_ms: 10,
                error: None,
                cached: false,
            },
            TaskResult {
                task_id: "textgen".to_string(),
                success: true,
                data: serde_json::json!({ "text": "Hello! How can I help you?", "confidence": 0.9 }),
                execution_ms: 50,
                error: None,
                cached: false,
            },
            TaskResult {
                task_id: "memory".to_string(),
                success: true,
                data: serde_json::json!({ "relevant_items": [], "confidence": 0.7 }),
                execution_ms: 20,
                error: None,
                cached: false,
            },
        ]
    }

    #[test]
    fn test_merge_strategy_for_mode() {
        assert_eq!(
            MergeStrategy::for_mode(ExecutionMode::Fast),
            MergeStrategy::SelectBest
        );
        assert_eq!(
            MergeStrategy::for_mode(ExecutionMode::Balanced),
            MergeStrategy::WeightedMerge
        );
    }

    #[test]
    fn test_merger_select_best() {
        let merger = ResultMerger::new();
        let results = mock_results();
        let (text, confidence) = merger.merge_select_best(&results);

        assert!(!text.is_empty());
        assert!(confidence > 0.5);
    }

    #[test]
    fn test_merger_concatenate() {
        let merger = ResultMerger::new();
        let results = mock_results();
        let (text, _) = merger.merge_concatenate(&results);

        assert!(text.contains("Hello"));
    }

    #[test]
    fn test_merge_result() {
        let merger = ResultMerger::new();
        let execution = ExecutionResult {
            request_id: "test-123".to_string(),
            results: mock_results(),
            total_time_ms: 80,
            success: true,
            mode: ExecutionMode::Balanced,
        };

        let result = merger
            .merge(&execution)
            .expect("merger should produce output for execution result");
        assert!(!result.response.is_empty());
        assert!(result.quality_score > 0.5);
    }

    #[test]
    fn test_build_metadata() {
        let merger = ResultMerger::new();
        let results = mock_results();
        let metadata = merger.build_metadata(&results);

        assert_eq!(metadata.successful_tasks, 3);
        assert_eq!(metadata.failed_tasks, 0);
        assert!(metadata.safety.is_some());
    }

    #[test]
    fn test_merge_strategy_all_variants() {
        assert_eq!(
            MergeStrategy::for_mode(ExecutionMode::Fast),
            MergeStrategy::SelectBest
        );
        assert_eq!(
            MergeStrategy::for_mode(ExecutionMode::Balanced),
            MergeStrategy::WeightedMerge
        );
        assert_eq!(
            MergeStrategy::for_mode(ExecutionMode::Thorough),
            MergeStrategy::Consensus
        );
        assert_eq!(
            MergeStrategy::for_mode(ExecutionMode::Explorative),
            MergeStrategy::Concatenate
        );
        assert_eq!(
            MergeStrategy::for_mode(ExecutionMode::Empathetic),
            MergeStrategy::PriorityBased
        );
    }

    #[test]
    fn test_merge_strategy_equality() {
        assert_eq!(MergeStrategy::Concatenate, MergeStrategy::Concatenate);
        assert_ne!(MergeStrategy::Concatenate, MergeStrategy::SelectBest);
    }

    #[test]
    fn test_merger_with_strategy() {
        let merger = ResultMerger::with_strategy(MergeStrategy::Consensus);
        assert_eq!(merger.default_strategy, MergeStrategy::Consensus);
    }

    #[test]
    fn test_merger_new() {
        let merger = ResultMerger::new();
        assert_eq!(merger.default_strategy, MergeStrategy::WeightedMerge);
    }

    #[test]
    fn test_merger_default() {
        let merger = ResultMerger::default();
        assert!(!merger.weights.is_empty());
        assert!(merger.weights.contains_key(&TaskType::TextGen));
    }

    #[test]
    fn test_merger_weights() {
        let merger = ResultMerger::new();
        assert_eq!(merger.weights.get(&TaskType::TextGen), Some(&1.0));
        assert_eq!(merger.weights.get(&TaskType::CodeGen), Some(&0.9));
        assert_eq!(merger.weights.get(&TaskType::Reasoning), Some(&0.8));
    }

    #[test]
    fn test_merge_weighted() {
        let merger = ResultMerger::new();
        let results = mock_results();
        let (text, confidence) = merger.merge_weighted(&results);

        assert!(!text.is_empty());
        assert!(confidence > 0.0 && confidence <= 1.0);
    }

    #[test]
    fn test_merge_priority() {
        let merger = ResultMerger::new();
        let results = mock_results();
        let (text, confidence) = merger.merge_priority(&results);

        assert!(!text.is_empty());
        assert!(confidence > 0.0);
    }

    #[test]
    fn test_merge_consensus() {
        let merger = ResultMerger::new();
        let results = mock_results();
        let (text, confidence) = merger.merge_consensus(&results);

        assert!(!text.is_empty());
        assert!(confidence > 0.0);
    }

    #[test]
    fn test_extract_text() {
        let merger = ResultMerger::new();

        let data1 = serde_json::json!({"text": "Hello"});
        assert_eq!(merger.extract_text(&data1), Some("Hello".to_string()));

        let data2 = serde_json::json!({"response": "World"});
        assert_eq!(merger.extract_text(&data2), Some("World".to_string()));

        let data3 = serde_json::json!({"code": "fn main() {}"});
        assert_eq!(
            merger.extract_text(&data3),
            Some("fn main() {}".to_string())
        );

        let data4 = serde_json::json!({"analysis": "Result"});
        assert_eq!(merger.extract_text(&data4), Some("Result".to_string()));

        let data5 = serde_json::json!({"other": "data"});
        assert!(merger.extract_text(&data5).is_none());
    }

    #[test]
    fn test_extract_confidence() {
        let merger = ResultMerger::new();

        let data1 = serde_json::json!({"confidence": 0.85});
        assert!((merger.extract_confidence(&data1) - 0.85).abs() < 0.01);

        let data2 = serde_json::json!({"other": "data"});
        assert!((merger.extract_confidence(&data2) - 0.7).abs() < 0.01); // default
    }

    #[test]
    fn test_infer_task_type() {
        let merger = ResultMerger::new();

        assert_eq!(merger.infer_task_type("safety"), TaskType::Safety);
        assert_eq!(merger.infer_task_type("identity"), TaskType::Identity);
        assert_eq!(merger.infer_task_type("memory"), TaskType::Memory);
        assert_eq!(merger.infer_task_type("knowledge"), TaskType::Knowledge);
        assert_eq!(merger.infer_task_type("reasoning"), TaskType::Reasoning);
        assert_eq!(merger.infer_task_type("codegen"), TaskType::CodeGen);
        assert_eq!(merger.infer_task_type("textgen"), TaskType::TextGen);
        assert_eq!(merger.infer_task_type("context"), TaskType::Context);
        assert_eq!(merger.infer_task_type("unknown"), TaskType::TextGen); // default
    }

    #[test]
    fn test_calculate_quality() {
        let merger = ResultMerger::new();
        let results = mock_results();
        let quality = merger.calculate_quality(&results, 0.9);

        assert!(quality > 0.5);
        assert!(quality <= 1.0);
    }

    #[test]
    fn test_calculate_quality_with_unsafe() {
        let merger = ResultMerger::new();
        let results = vec![TaskResult {
            task_id: "safety".to_string(),
            success: true,
            data: serde_json::json!({ "safe": false }),
            execution_ms: 10,
            error: None,
            cached: false,
        }];

        let quality = merger.calculate_quality(&results, 0.9);
        assert!(quality < 0.5); // Should be penalized
    }

    #[test]
    fn test_build_sources() {
        let merger = ResultMerger::new();
        let results = mock_results();
        let sources = merger.build_sources(&results);

        assert_eq!(sources.len(), 3);
        assert!(sources.iter().all(|s| s.weight > 0.0));
    }

    #[test]
    fn test_merge_source_structure() {
        let source = MergeSource {
            task_id: "test".to_string(),
            task_type: "TextGen".to_string(),
            weight: 0.9,
            success: true,
        };

        assert_eq!(source.task_id, "test");
        assert_eq!(source.weight, 0.9);
        assert!(source.success);
    }

    #[test]
    fn test_merge_metadata_default() {
        let metadata = MergeMetadata::default();

        assert_eq!(metadata.successful_tasks, 0);
        assert_eq!(metadata.failed_tasks, 0);
        assert_eq!(metadata.total_task_time_ms, 0);
        assert!(metadata.identity.is_none());
    }

    #[test]
    fn test_merge_result_structure() {
        let result = MergeResult {
            request_id: "req-123".to_string(),
            response: "Hello".to_string(),
            confidence: 0.9,
            sources: vec![],
            strategy: MergeStrategy::SelectBest,
            latency_ms: 10,
            quality_score: 0.85,
            metadata: MergeMetadata::default(),
        };

        assert_eq!(result.request_id, "req-123");
        assert_eq!(result.confidence, 0.9);
        assert_eq!(result.strategy, MergeStrategy::SelectBest);
    }

    #[test]
    fn test_merger_stage_new() {
        let merger = Merger::new();
        assert_eq!(merger.name(), "Merger");
    }

    #[test]
    fn test_merger_stage_default() {
        let merger = Merger::default();
        assert_eq!(merger.stage(), PipelineStage::Merger);
    }

    #[test]
    fn test_merge_empty_results() {
        let merger = ResultMerger::new();
        let (text, confidence) = merger.merge_concatenate(&[]);

        assert!(text.is_empty());
        assert!((confidence - 0.5).abs() < 0.01);
    }

    #[test]
    fn test_merge_select_best_empty() {
        let merger = ResultMerger::new();
        let (text, confidence) = merger.merge_select_best(&[]);

        assert_eq!(text, "Unable to generate response");
        assert!((confidence - 0.3).abs() < 0.01);
    }

    #[test]
    fn test_merge_weighted_empty() {
        let merger = ResultMerger::new();
        let (text, confidence) = merger.merge_weighted(&[]);

        assert_eq!(text, "Unable to generate response");
        assert!((confidence - 0.3).abs() < 0.01);
    }

    #[test]
    fn test_merge_result_clone() {
        let result = MergeResult {
            request_id: "clone-test".to_string(),
            response: "Response".to_string(),
            confidence: 0.8,
            sources: vec![],
            strategy: MergeStrategy::Consensus,
            latency_ms: 5,
            quality_score: 0.9,
            metadata: MergeMetadata::default(),
        };

        let cloned = result.clone();
        assert_eq!(cloned.request_id, "clone-test");
        assert_eq!(cloned.strategy, MergeStrategy::Consensus);
    }

    #[test]
    fn test_merge_source_clone() {
        let source = MergeSource {
            task_id: "src".to_string(),
            task_type: "Test".to_string(),
            weight: 0.5,
            success: false,
        };

        let cloned = source.clone();
        assert_eq!(cloned.task_id, "src");
        assert!(!cloned.success);
    }

    #[test]
    fn test_merge_metadata_clone() {
        let mut metadata = MergeMetadata::default();
        metadata.successful_tasks = 5;

        let cloned = metadata.clone();
        assert_eq!(cloned.successful_tasks, 5);
    }

    #[test]
    fn test_all_failed_results() {
        let merger = ResultMerger::new();
        let results = vec![TaskResult {
            task_id: "test".to_string(),
            success: false,
            data: serde_json::json!({}),
            execution_ms: 10,
            error: Some("Error".to_string()),
            cached: false,
        }];

        let (_, confidence) = merger.merge_concatenate(&results);
        assert!((confidence - 0.5).abs() < 0.01);
    }
}
