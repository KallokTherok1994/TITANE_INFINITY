// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — OMEGA PIPELINE - EXECUTOR
//   Super Prompt #15: Parallel task execution with timeouts
//   Executes multiple cognitive tasks concurrently
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;
use tokio::time::timeout;

use super::{
    router::{ExecutionMode, Intent, RoutingResult},
    OmegaError, OmegaResult, PipelineStage, StageInput, StageOutput, StageProcessor,
};

// ═══════════════════════════════════════════════════════════════
//   TASK DEFINITIONS
// ═══════════════════════════════════════════════════════════════

/// Executable task
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutableTask {
    /// Task ID
    pub id: String,
    /// Task type
    pub task_type: TaskType,
    /// Input data
    pub input: serde_json::Value,
    /// Priority (0-10)
    pub priority: u8,
    /// Timeout in ms
    pub timeout_ms: u64,
    /// Dependencies (task IDs that must complete first)
    pub dependencies: Vec<String>,
}

/// Task type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TaskType {
    /// Knowledge retrieval
    Knowledge,
    /// Memory recall
    Memory,
    /// Reasoning/analysis
    Reasoning,
    /// Code generation
    CodeGen,
    /// Text generation
    TextGen,
    /// Identity/personality
    Identity,
    /// Safety check
    Safety,
    /// Context enrichment
    Context,
}

impl TaskType {
    /// Get default timeout for this task type
    pub fn default_timeout_ms(&self) -> u64 {
        match self {
            TaskType::Knowledge => 50,
            TaskType::Memory => 30,
            TaskType::Reasoning => 80,
            TaskType::CodeGen => 100,
            TaskType::TextGen => 80,
            TaskType::Identity => 20,
            TaskType::Safety => 30,
            TaskType::Context => 40,
        }
    }

    /// Check if task can run in parallel
    pub fn parallel_safe(&self) -> bool {
        match self {
            TaskType::Safety => true, // Always run
            TaskType::Identity => true,
            TaskType::Memory => true,
            TaskType::Knowledge => true,
            TaskType::Context => true,
            TaskType::Reasoning => true,
            TaskType::CodeGen => true,
            TaskType::TextGen => false, // Usually depends on others
        }
    }
}

/// Task result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskResult {
    /// Task ID
    pub task_id: String,
    /// Success status
    pub success: bool,
    /// Result data
    pub data: serde_json::Value,
    /// Execution time in ms
    pub execution_ms: u64,
    /// Error message if failed
    pub error: Option<String>,
    /// Was cached
    pub cached: bool,
}

// ═══════════════════════════════════════════════════════════════
//   EXECUTION PLAN
// ═══════════════════════════════════════════════════════════════

/// Execution plan for a request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionPlan {
    /// Request ID
    pub request_id: String,
    /// Execution mode
    pub mode: ExecutionMode,
    /// Tasks to execute
    pub tasks: Vec<ExecutableTask>,
    /// Execution order (task IDs in order, with parallel groups)
    pub execution_order: Vec<Vec<String>>,
    /// Total estimated time in ms
    pub estimated_time_ms: u64,
}

impl ExecutionPlan {
    /// Create plan from routing result
    pub fn from_routing(request_id: String, routing: &RoutingResult, input: &str) -> Self {
        let mode = routing.execution_mode;
        let intent = routing.intent;

        // Generate tasks based on intent
        let tasks = Self::generate_tasks(&intent, input, &mode);
        let execution_order = Self::compute_execution_order(&tasks);
        let estimated_time_ms = tasks.iter().map(|t| t.timeout_ms).sum();

        Self {
            request_id,
            mode,
            tasks,
            execution_order,
            estimated_time_ms,
        }
    }

    /// Generate tasks for an intent
    fn generate_tasks(intent: &Intent, input: &str, mode: &ExecutionMode) -> Vec<ExecutableTask> {
        let mut tasks = Vec::new();
        let input_json = serde_json::json!({ "text": input });

        // Always add safety check
        tasks.push(ExecutableTask {
            id: "safety".to_string(),
            task_type: TaskType::Safety,
            input: input_json.clone(),
            priority: 10,
            timeout_ms: TaskType::Safety.default_timeout_ms(),
            dependencies: vec![],
        });

        // Always add identity
        tasks.push(ExecutableTask {
            id: "identity".to_string(),
            task_type: TaskType::Identity,
            input: input_json.clone(),
            priority: 8,
            timeout_ms: TaskType::Identity.default_timeout_ms(),
            dependencies: vec![],
        });

        // Add memory recall
        tasks.push(ExecutableTask {
            id: "memory".to_string(),
            task_type: TaskType::Memory,
            input: input_json.clone(),
            priority: 7,
            timeout_ms: TaskType::Memory.default_timeout_ms(),
            dependencies: vec![],
        });

        // Intent-specific tasks
        match intent {
            Intent::Query | Intent::Explanation => {
                tasks.push(ExecutableTask {
                    id: "knowledge".to_string(),
                    task_type: TaskType::Knowledge,
                    input: input_json.clone(),
                    priority: 9,
                    timeout_ms: TaskType::Knowledge.default_timeout_ms(),
                    dependencies: vec![],
                });
            }
            Intent::Task | Intent::Debug => {
                tasks.push(ExecutableTask {
                    id: "reasoning".to_string(),
                    task_type: TaskType::Reasoning,
                    input: input_json.clone(),
                    priority: 9,
                    timeout_ms: TaskType::Reasoning.default_timeout_ms(),
                    dependencies: vec!["memory".to_string()],
                });
                tasks.push(ExecutableTask {
                    id: "codegen".to_string(),
                    task_type: TaskType::CodeGen,
                    input: input_json.clone(),
                    priority: 8,
                    timeout_ms: TaskType::CodeGen.default_timeout_ms(),
                    dependencies: vec!["reasoning".to_string()],
                });
            }
            Intent::Creative => {
                tasks.push(ExecutableTask {
                    id: "reasoning".to_string(),
                    task_type: TaskType::Reasoning,
                    input: input_json.clone(),
                    priority: 7,
                    timeout_ms: TaskType::Reasoning.default_timeout_ms(),
                    dependencies: vec![],
                });
                tasks.push(ExecutableTask {
                    id: "textgen".to_string(),
                    task_type: TaskType::TextGen,
                    input: input_json.clone(),
                    priority: 8,
                    timeout_ms: TaskType::TextGen.default_timeout_ms() * 2, // More time for creative
                    dependencies: vec!["reasoning".to_string()],
                });
            }
            _ => {
                // Default: add context and reasoning
                tasks.push(ExecutableTask {
                    id: "context".to_string(),
                    task_type: TaskType::Context,
                    input: input_json.clone(),
                    priority: 6,
                    timeout_ms: TaskType::Context.default_timeout_ms(),
                    dependencies: vec!["memory".to_string()],
                });
                tasks.push(ExecutableTask {
                    id: "textgen".to_string(),
                    task_type: TaskType::TextGen,
                    input: input_json.clone(),
                    priority: 5,
                    timeout_ms: TaskType::TextGen.default_timeout_ms(),
                    dependencies: vec!["context".to_string()],
                });
            }
        }

        // Adjust timeouts based on mode
        let multiplier = match mode {
            ExecutionMode::Fast => 0.7,
            ExecutionMode::Balanced => 1.0,
            ExecutionMode::Thorough => 1.5,
            ExecutionMode::Explorative => 1.3,
            ExecutionMode::Empathetic => 1.1,
        };

        for task in &mut tasks {
            task.timeout_ms = (task.timeout_ms as f64 * multiplier) as u64;
        }

        tasks
    }

    /// Compute execution order respecting dependencies
    fn compute_execution_order(tasks: &[ExecutableTask]) -> Vec<Vec<String>> {
        let mut order: Vec<Vec<String>> = Vec::new();
        let mut completed: Vec<String> = Vec::new();
        let task_map: HashMap<_, _> = tasks.iter().map(|t| (t.id.clone(), t)).collect();

        while completed.len() < tasks.len() {
            let mut batch: Vec<String> = Vec::new();

            for task in tasks {
                if completed.contains(&task.id) {
                    continue;
                }

                let deps_met = task.dependencies.iter().all(|dep| completed.contains(dep));

                if deps_met {
                    batch.push(task.id.clone());
                }
            }

            if batch.is_empty() {
                // Circular dependency or error - break
                break;
            }

            // Sort batch by priority
            batch.sort_by(|a, b| {
                let pa = task_map.get(a).map(|t| t.priority).unwrap_or(0);
                let pb = task_map.get(b).map(|t| t.priority).unwrap_or(0);
                pb.cmp(&pa)
            });

            completed.extend(batch.iter().cloned());
            order.push(batch);
        }

        order
    }
}

// ═══════════════════════════════════════════════════════════════
//   TASK EXECUTOR
// ═══════════════════════════════════════════════════════════════

/// Task executor handler trait
#[async_trait::async_trait]
pub trait TaskHandler: Send + Sync {
    async fn execute(&self, task: &ExecutableTask, context: &ExecutionContext) -> TaskResult;
    fn task_type(&self) -> TaskType;
}

/// Execution context
#[derive(Debug, Clone, Default)]
pub struct ExecutionContext {
    pub results: HashMap<String, TaskResult>,
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Default task handler (mock implementation)
pub struct DefaultTaskHandler {
    task_type: TaskType,
}

impl DefaultTaskHandler {
    pub fn new(task_type: TaskType) -> Self {
        Self { task_type }
    }
}

#[async_trait::async_trait]
impl TaskHandler for DefaultTaskHandler {
    async fn execute(&self, task: &ExecutableTask, _context: &ExecutionContext) -> TaskResult {
        let start = std::time::Instant::now();

        // Simulate task execution (in real implementation, call actual handlers)
        let result_data = match self.task_type {
            TaskType::Safety => serde_json::json!({
                "safe": true,
                "score": 0.95,
                "flags": []
            }),
            TaskType::Identity => serde_json::json!({
                "archetype": "mentor",
                "tone": "friendly",
                "engagement": 0.8
            }),
            TaskType::Memory => serde_json::json!({
                "relevant_items": [],
                "relevance_score": 0.7
            }),
            TaskType::Knowledge => serde_json::json!({
                "sources": [],
                "confidence": 0.8
            }),
            TaskType::Reasoning => serde_json::json!({
                "analysis": "Processed",
                "steps": []
            }),
            TaskType::CodeGen => serde_json::json!({
                "code": "",
                "language": "rust"
            }),
            TaskType::TextGen => serde_json::json!({
                "text": "Generated response",
                "tokens": 0
            }),
            TaskType::Context => serde_json::json!({
                "enriched": true,
                "context_items": []
            }),
        };

        TaskResult {
            task_id: task.id.clone(),
            success: true,
            data: result_data,
            execution_ms: start.elapsed().as_millis() as u64,
            error: None,
            cached: false,
        }
    }

    fn task_type(&self) -> TaskType {
        self.task_type
    }
}

// ═══════════════════════════════════════════════════════════════
//   PARALLEL EXECUTOR
// ═══════════════════════════════════════════════════════════════

/// Parallel executor for tasks
pub struct ParallelExecutor {
    /// Task handlers by type
    handlers: HashMap<TaskType, Arc<dyn TaskHandler>>,
    /// Maximum parallel tasks
    max_parallel: usize,
    /// Global timeout in ms
    global_timeout_ms: u64,
    /// Execution statistics
    stats: Arc<RwLock<ExecutorStats>>,
}

/// Executor statistics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ExecutorStats {
    pub total_executions: u64,
    pub successful_executions: u64,
    pub failed_executions: u64,
    pub timeout_count: u64,
    pub avg_execution_ms: f64,
    pub tasks_by_type: HashMap<String, u64>,
}

impl Default for ParallelExecutor {
    fn default() -> Self {
        let mut handlers: HashMap<TaskType, Arc<dyn TaskHandler>> = HashMap::new();

        // Register default handlers
        for task_type in [
            TaskType::Safety,
            TaskType::Identity,
            TaskType::Memory,
            TaskType::Knowledge,
            TaskType::Reasoning,
            TaskType::CodeGen,
            TaskType::TextGen,
            TaskType::Context,
        ] {
            handlers.insert(task_type, Arc::new(DefaultTaskHandler::new(task_type)));
        }

        Self {
            handlers,
            max_parallel: 4,
            global_timeout_ms: 200,
            stats: Arc::new(RwLock::new(ExecutorStats::default())),
        }
    }
}

impl ParallelExecutor {
    /// Create new executor
    pub fn new() -> Self {
        Self::default()
    }

    /// Create with custom configuration
    pub fn with_config(max_parallel: usize, timeout_ms: u64) -> Self {
        let mut executor = Self::default();
        executor.max_parallel = max_parallel;
        executor.global_timeout_ms = timeout_ms;
        executor
    }

    /// Register a task handler
    pub fn register_handler(&mut self, handler: Arc<dyn TaskHandler>) {
        self.handlers.insert(handler.task_type(), handler);
    }

    /// Execute an execution plan
    pub async fn execute(&self, plan: &ExecutionPlan) -> OmegaResult<ExecutionResult> {
        let start = std::time::Instant::now();
        let mut context = ExecutionContext::default();
        let mut all_results: Vec<TaskResult> = Vec::new();

        // Execute batches in order
        for batch in &plan.execution_order {
            let batch_results = self.execute_batch(batch, &plan.tasks, &context).await?;

            for result in &batch_results {
                context
                    .results
                    .insert(result.task_id.clone(), result.clone());
            }

            all_results.extend(batch_results);
        }

        // Update stats
        self.update_stats(&all_results).await;

        let total_time = start.elapsed().as_millis() as u64;
        let success = all_results.iter().all(|r| r.success);

        Ok(ExecutionResult {
            request_id: plan.request_id.clone(),
            results: all_results,
            total_time_ms: total_time,
            success,
            mode: plan.mode,
        })
    }

    /// Execute a batch of tasks in parallel
    async fn execute_batch(
        &self,
        batch: &[String],
        all_tasks: &[ExecutableTask],
        context: &ExecutionContext,
    ) -> OmegaResult<Vec<TaskResult>> {
        let task_map: HashMap<_, _> = all_tasks.iter().map(|t| (t.id.as_str(), t)).collect();

        let mut futures = Vec::new();

        for task_id in batch {
            if let Some(task) = task_map.get(task_id.as_str()) {
                if let Some(handler) = self.handlers.get(&task.task_type) {
                    let handler = handler.clone();
                    let task = (*task).clone();
                    let ctx = context.clone();
                    let task_timeout = Duration::from_millis(task.timeout_ms);

                    futures.push(async move {
                        match timeout(task_timeout, handler.execute(&task, &ctx)).await {
                            Ok(result) => result,
                            Err(_) => TaskResult {
                                task_id: task.id.clone(),
                                success: false,
                                data: serde_json::Value::Null,
                                execution_ms: task.timeout_ms,
                                error: Some("Task timeout".to_string()),
                                cached: false,
                            },
                        }
                    });
                }
            }
        }

        // Execute with global timeout
        let global_timeout = Duration::from_millis(self.global_timeout_ms);
        let all_futures = async {
            let mut results = Vec::with_capacity(futures.len());
            for future in futures {
                results.push(future.await);
            }
            results
        };
        match timeout(global_timeout, all_futures).await {
            Ok(results) => Ok(results),
            Err(_) => Err(OmegaError::Timeout(self.global_timeout_ms)),
        }
    }

    /// Update executor statistics
    async fn update_stats(&self, results: &[TaskResult]) {
        let mut stats = self.stats.write().await;

        for result in results {
            stats.total_executions += 1;
            if result.success {
                stats.successful_executions += 1;
            } else {
                stats.failed_executions += 1;
                if result
                    .error
                    .as_ref()
                    .map(|e| e.contains("timeout"))
                    .unwrap_or(false)
                {
                    stats.timeout_count += 1;
                }
            }

            // Update average
            let total = stats.total_executions as f64;
            stats.avg_execution_ms =
                (stats.avg_execution_ms * (total - 1.0) + result.execution_ms as f64) / total;
        }
    }

    /// Get executor statistics
    pub async fn get_stats(&self) -> ExecutorStats {
        self.stats.read().await.clone()
    }
}

/// Execution result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionResult {
    pub request_id: String,
    pub results: Vec<TaskResult>,
    pub total_time_ms: u64,
    pub success: bool,
    pub mode: ExecutionMode,
}

// ═══════════════════════════════════════════════════════════════
//   EXECUTOR STAGE PROCESSOR
// ═══════════════════════════════════════════════════════════════

/// Executor stage processor
pub struct Executor {
    parallel_executor: ParallelExecutor,
}

impl Default for Executor {
    fn default() -> Self {
        Self {
            parallel_executor: ParallelExecutor::new(),
        }
    }
}

impl Executor {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_executor(executor: ParallelExecutor) -> Self {
        Self {
            parallel_executor: executor,
        }
    }
}

#[async_trait::async_trait]
impl StageProcessor for Executor {
    async fn process(&self, input: StageInput) -> OmegaResult<StageOutput> {
        let start = std::time::Instant::now();

        // Get routing result from previous stage
        let routing: RoutingResult = serde_json::from_value(
            input
                .context
                .previous_outputs
                .get(&PipelineStage::Router)
                .cloned()
                .unwrap_or_default(),
        )
        .map_err(|e| OmegaError::ExecutorError(e.to_string()))?;

        let text = input
            .data
            .get("text")
            .and_then(|v| v.as_str())
            .unwrap_or("");

        // Create execution plan
        let plan = ExecutionPlan::from_routing(input.request_id.clone(), &routing, text);

        // Execute plan
        let result = self.parallel_executor.execute(&plan).await?;

        Ok(StageOutput {
            request_id: input.request_id,
            data: serde_json::to_value(&result).unwrap_or_default(),
            latency_ms: start.elapsed().as_millis() as u64,
            success: result.success,
            error: None,
        })
    }

    fn name(&self) -> &str {
        "Executor"
    }

    fn stage(&self) -> PipelineStage {
        PipelineStage::Executor
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_task_type_defaults() {
        assert!(TaskType::Safety.default_timeout_ms() < 50);
        assert!(TaskType::CodeGen.default_timeout_ms() >= 100);
    }

    #[test]
    fn test_execution_plan_creation() {
        let routing = RoutingResult {
            intent: Intent::Query,
            confidence: 0.9,
            secondary_intents: vec![],
            execution_mode: ExecutionMode::Fast,
            handlers: vec!["knowledge".to_string()],
            latency_us: 100,
            cache_hit: false,
        };

        let plan = ExecutionPlan::from_routing("test-123".to_string(), &routing, "What is Rust?");

        assert!(!plan.tasks.is_empty());
        assert!(plan.tasks.iter().any(|t| t.task_type == TaskType::Safety));
    }

    #[test]
    fn test_execution_order() {
        let tasks = vec![
            ExecutableTask {
                id: "a".to_string(),
                task_type: TaskType::Safety,
                input: serde_json::Value::Null,
                priority: 10,
                timeout_ms: 30,
                dependencies: vec![],
            },
            ExecutableTask {
                id: "b".to_string(),
                task_type: TaskType::Memory,
                input: serde_json::Value::Null,
                priority: 7,
                timeout_ms: 30,
                dependencies: vec!["a".to_string()],
            },
            ExecutableTask {
                id: "c".to_string(),
                task_type: TaskType::TextGen,
                input: serde_json::Value::Null,
                priority: 5,
                timeout_ms: 80,
                dependencies: vec!["b".to_string()],
            },
        ];

        let order = ExecutionPlan::compute_execution_order(&tasks);

        assert_eq!(order.len(), 3);
        assert_eq!(order[0], vec!["a"]);
        assert_eq!(order[1], vec!["b"]);
        assert_eq!(order[2], vec!["c"]);
    }

    #[tokio::test]
    async fn test_parallel_executor() {
        let executor = ParallelExecutor::new();

        let routing = RoutingResult {
            intent: Intent::Conversation,
            confidence: 0.8,
            secondary_intents: vec![],
            execution_mode: ExecutionMode::Balanced,
            handlers: vec![],
            latency_us: 100,
            cache_hit: false,
        };

        let plan = ExecutionPlan::from_routing("test-456".to_string(), &routing, "Hello!");

        let result = executor.execute(&plan).await.unwrap();
        assert!(result.success);
    }

    #[test]
    fn test_task_type_all_default_timeouts() {
        assert!(TaskType::Knowledge.default_timeout_ms() > 0);
        assert!(TaskType::Memory.default_timeout_ms() > 0);
        assert!(TaskType::Reasoning.default_timeout_ms() > 0);
        assert!(TaskType::CodeGen.default_timeout_ms() > 0);
        assert!(TaskType::TextGen.default_timeout_ms() > 0);
        assert!(TaskType::Identity.default_timeout_ms() > 0);
        assert!(TaskType::Safety.default_timeout_ms() > 0);
        assert!(TaskType::Context.default_timeout_ms() > 0);
    }

    #[test]
    fn test_task_type_parallel_safe() {
        assert!(TaskType::Safety.parallel_safe());
        assert!(TaskType::Identity.parallel_safe());
        assert!(TaskType::Memory.parallel_safe());
        assert!(TaskType::Knowledge.parallel_safe());
        assert!(TaskType::Context.parallel_safe());
        assert!(TaskType::Reasoning.parallel_safe());
        assert!(TaskType::CodeGen.parallel_safe());
        assert!(!TaskType::TextGen.parallel_safe());
    }

    #[test]
    fn test_task_type_equality() {
        assert_eq!(TaskType::Safety, TaskType::Safety);
        assert_ne!(TaskType::Safety, TaskType::Memory);
    }

    #[test]
    fn test_executable_task_structure() {
        let task = ExecutableTask {
            id: "test-task".to_string(),
            task_type: TaskType::Reasoning,
            input: serde_json::json!({"text": "test"}),
            priority: 8,
            timeout_ms: 100,
            dependencies: vec!["dep1".to_string()],
        };

        assert_eq!(task.id, "test-task");
        assert_eq!(task.task_type, TaskType::Reasoning);
        assert_eq!(task.priority, 8);
        assert_eq!(task.dependencies.len(), 1);
    }

    #[test]
    fn test_task_result_structure() {
        let result = TaskResult {
            task_id: "task-123".to_string(),
            success: true,
            data: serde_json::json!({"output": "result"}),
            execution_ms: 50,
            error: None,
            cached: false,
        };

        assert_eq!(result.task_id, "task-123");
        assert!(result.success);
        assert!(result.error.is_none());
        assert!(!result.cached);
    }

    #[test]
    fn test_task_result_failed() {
        let result = TaskResult {
            task_id: "failed-task".to_string(),
            success: false,
            data: serde_json::Value::Null,
            execution_ms: 100,
            error: Some("Timeout".to_string()),
            cached: false,
        };

        assert!(!result.success);
        assert!(result.error.is_some());
        assert!(result.error.unwrap().contains("Timeout"));
    }

    #[test]
    fn test_execution_context_default() {
        let context = ExecutionContext::default();

        assert!(context.results.is_empty());
        assert!(context.metadata.is_empty());
    }

    #[test]
    fn test_executor_stats_default() {
        let stats = ExecutorStats::default();

        assert_eq!(stats.total_executions, 0);
        assert_eq!(stats.successful_executions, 0);
        assert_eq!(stats.failed_executions, 0);
        assert_eq!(stats.timeout_count, 0);
    }

    #[test]
    fn test_executor_stats_clone() {
        let mut stats = ExecutorStats::default();
        stats.total_executions = 100;
        stats.successful_executions = 95;

        let cloned = stats.clone();
        assert_eq!(cloned.total_executions, 100);
        assert_eq!(cloned.successful_executions, 95);
    }

    #[test]
    fn test_default_task_handler_new() {
        let handler = DefaultTaskHandler::new(TaskType::Safety);
        assert_eq!(handler.task_type(), TaskType::Safety);
    }

    #[tokio::test]
    async fn test_default_task_handler_execute() {
        let handler = DefaultTaskHandler::new(TaskType::Safety);
        let task = ExecutableTask {
            id: "safety-check".to_string(),
            task_type: TaskType::Safety,
            input: serde_json::json!({"text": "test"}),
            priority: 10,
            timeout_ms: 50,
            dependencies: vec![],
        };

        let context = ExecutionContext::default();
        let result = handler.execute(&task, &context).await;

        assert!(result.success);
        assert!(result.data.get("safe").is_some());
    }

    #[tokio::test]
    async fn test_default_task_handler_identity() {
        let handler = DefaultTaskHandler::new(TaskType::Identity);
        let task = ExecutableTask {
            id: "identity".to_string(),
            task_type: TaskType::Identity,
            input: serde_json::json!({}),
            priority: 8,
            timeout_ms: 20,
            dependencies: vec![],
        };

        let context = ExecutionContext::default();
        let result = handler.execute(&task, &context).await;

        assert!(result.success);
        assert!(result.data.get("archetype").is_some());
    }

    #[test]
    fn test_parallel_executor_new() {
        let executor = ParallelExecutor::new();
        assert_eq!(executor.max_parallel, 4);
    }

    #[test]
    fn test_parallel_executor_with_config() {
        let executor = ParallelExecutor::with_config(8, 500);
        assert_eq!(executor.max_parallel, 8);
        assert_eq!(executor.global_timeout_ms, 500);
    }

    #[test]
    fn test_parallel_executor_default() {
        let executor = ParallelExecutor::default();
        assert!(!executor.handlers.is_empty());
        assert!(executor.handlers.contains_key(&TaskType::Safety));
    }

    #[tokio::test]
    async fn test_parallel_executor_get_stats() {
        let executor = ParallelExecutor::new();
        let stats = executor.get_stats().await;

        assert_eq!(stats.total_executions, 0);
    }

    #[test]
    fn test_execution_plan_tasks_include_safety() {
        let routing = RoutingResult {
            intent: Intent::Query,
            confidence: 0.9,
            secondary_intents: vec![],
            execution_mode: ExecutionMode::Fast,
            handlers: vec![],
            latency_us: 50,
            cache_hit: false,
        };

        let plan = ExecutionPlan::from_routing("test".to_string(), &routing, "test query");

        // Safety should always be included
        assert!(plan.tasks.iter().any(|t| t.task_type == TaskType::Safety));
        // Identity should always be included
        assert!(plan.tasks.iter().any(|t| t.task_type == TaskType::Identity));
    }

    #[test]
    fn test_execution_plan_for_task_intent() {
        let routing = RoutingResult {
            intent: Intent::Task,
            confidence: 0.85,
            secondary_intents: vec![],
            execution_mode: ExecutionMode::Balanced,
            handlers: vec![],
            latency_us: 100,
            cache_hit: false,
        };

        let plan = ExecutionPlan::from_routing("task-test".to_string(), &routing, "Do something");

        // Should include Reasoning and CodeGen for Task intent
        assert!(plan
            .tasks
            .iter()
            .any(|t| t.task_type == TaskType::Reasoning));
        assert!(plan.tasks.iter().any(|t| t.task_type == TaskType::CodeGen));
    }

    #[test]
    fn test_execution_plan_for_creative_intent() {
        let routing = RoutingResult {
            intent: Intent::Creative,
            confidence: 0.9,
            secondary_intents: vec![],
            execution_mode: ExecutionMode::Explorative,
            handlers: vec![],
            latency_us: 80,
            cache_hit: false,
        };

        let plan = ExecutionPlan::from_routing("creative".to_string(), &routing, "Write a poem");

        // Should include TextGen for Creative intent
        assert!(plan.tasks.iter().any(|t| t.task_type == TaskType::TextGen));
    }

    #[test]
    fn test_execution_result_structure() {
        let result = ExecutionResult {
            request_id: "result-123".to_string(),
            results: vec![],
            total_time_ms: 100,
            success: true,
            mode: ExecutionMode::Fast,
        };

        assert_eq!(result.request_id, "result-123");
        assert!(result.success);
        assert_eq!(result.mode, ExecutionMode::Fast);
    }

    #[test]
    fn test_execution_result_clone() {
        let result = ExecutionResult {
            request_id: "clone-test".to_string(),
            results: vec![],
            total_time_ms: 50,
            success: false,
            mode: ExecutionMode::Thorough,
        };

        let cloned = result.clone();
        assert_eq!(cloned.request_id, "clone-test");
        assert!(!cloned.success);
    }

    #[test]
    fn test_executor_stage_new() {
        let executor = Executor::new();
        assert_eq!(executor.name(), "Executor");
    }

    #[test]
    fn test_executor_stage_default() {
        let executor = Executor::default();
        assert_eq!(executor.stage(), PipelineStage::Executor);
    }

    #[test]
    fn test_executor_with_executor() {
        let parallel = ParallelExecutor::with_config(6, 300);
        let executor = Executor::with_executor(parallel);
        assert_eq!(executor.stage(), PipelineStage::Executor);
    }

    #[test]
    fn test_task_result_clone() {
        let result = TaskResult {
            task_id: "clone".to_string(),
            success: true,
            data: serde_json::json!({"test": true}),
            execution_ms: 25,
            error: None,
            cached: true,
        };

        let cloned = result.clone();
        assert_eq!(cloned.task_id, "clone");
        assert!(cloned.cached);
    }

    #[test]
    fn test_executable_task_clone() {
        let task = ExecutableTask {
            id: "clone-task".to_string(),
            task_type: TaskType::Memory,
            input: serde_json::json!({}),
            priority: 5,
            timeout_ms: 30,
            dependencies: vec!["other".to_string()],
        };

        let cloned = task.clone();
        assert_eq!(cloned.id, "clone-task");
        assert_eq!(cloned.task_type, TaskType::Memory);
    }

    #[test]
    fn test_execution_plan_timeout_adjustment() {
        let routing_fast = RoutingResult {
            intent: Intent::Query,
            confidence: 0.9,
            secondary_intents: vec![],
            execution_mode: ExecutionMode::Fast,
            handlers: vec![],
            latency_us: 50,
            cache_hit: false,
        };

        let routing_thorough = RoutingResult {
            intent: Intent::Query,
            confidence: 0.9,
            secondary_intents: vec![],
            execution_mode: ExecutionMode::Thorough,
            handlers: vec![],
            latency_us: 50,
            cache_hit: false,
        };

        let plan_fast = ExecutionPlan::from_routing("fast".to_string(), &routing_fast, "test");
        let plan_thorough =
            ExecutionPlan::from_routing("thorough".to_string(), &routing_thorough, "test");

        // Thorough mode should have longer timeouts
        assert!(plan_thorough.estimated_time_ms >= plan_fast.estimated_time_ms);
    }

    #[test]
    fn test_execution_plan_parallel_batch() {
        let tasks = vec![
            ExecutableTask {
                id: "a".to_string(),
                task_type: TaskType::Safety,
                input: serde_json::Value::Null,
                priority: 10,
                timeout_ms: 30,
                dependencies: vec![],
            },
            ExecutableTask {
                id: "b".to_string(),
                task_type: TaskType::Identity,
                input: serde_json::Value::Null,
                priority: 8,
                timeout_ms: 20,
                dependencies: vec![],
            },
        ];

        let order = ExecutionPlan::compute_execution_order(&tasks);

        // Both tasks have no deps, should be in first batch
        assert_eq!(order.len(), 1);
        assert_eq!(order[0].len(), 2);
    }
}
