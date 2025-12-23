// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — COGNITIVE SCHEDULER
//   Priority-based task scheduling with load management
//   Super Prompt #11 — Phase 3
// ═══════════════════════════════════════════════════════════════

use crate::error::TitaneResult;
use std::collections::{BinaryHeap, HashMap};
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::broadcast;
use uuid::Uuid;

use super::events::KernelEvent;
use super::kernel_state::KernelState;
pub use super::priorities::CognitivePriority;
use super::runtime::KernelRuntime;

/// Type alias for boxed futures
pub type BoxFuture<T> = Pin<Box<dyn Future<Output = T> + Send + 'static>>;

/// Engine output structure
#[derive(Debug, Clone)]
pub struct EngineOutput {
    pub engine: String,
    pub output: String,
    pub duration_ms: u64,
}

/// Scheduler job with priority
pub struct SchedulerJob {
    /// Unique job ID
    pub id: Uuid,
    /// Engine name
    pub engine: String,
    /// Job priority
    pub priority: CognitivePriority,
    /// Task to execute
    pub task: BoxFuture<TitaneResult<EngineOutput>>,
    /// Submission timestamp
    pub submitted_at: i64,
}

// Explicitly implement Send + Sync for SchedulerJob
unsafe impl Send for SchedulerJob {}
unsafe impl Sync for SchedulerJob {}

impl SchedulerJob {
    /// Create new job
    pub fn new(
        engine: String,
        priority: CognitivePriority,
        task: BoxFuture<TitaneResult<EngineOutput>>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            engine,
            priority,
            task,
            submitted_at: chrono::Utc::now().timestamp_millis(),
        }
    }
}

// Implement ordering for priority queue (higher priority first)
impl Ord for SchedulerJob {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.priority.cmp(&other.priority)
    }
}

impl PartialOrd for SchedulerJob {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl PartialEq for SchedulerJob {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id
    }
}

impl Eq for SchedulerJob {}

/// Cognitive scheduler with priority-based execution
pub struct CognitiveScheduler {
    /// Priority queue of pending jobs
    queue: Arc<tokio::sync::RwLock<BinaryHeap<SchedulerJob>>>,
    /// Active jobs map
    active: Arc<tokio::sync::RwLock<HashMap<Uuid, String>>>,
    /// Runtime executor
    runtime: Arc<KernelRuntime>,
    /// Kernel state
    state: Arc<tokio::sync::RwLock<KernelState>>,
    /// Event broadcaster
    event_tx: broadcast::Sender<KernelEvent>,
    /// Maximum concurrent jobs
    max_concurrent: usize,
}

impl CognitiveScheduler {
    /// Create new scheduler
    #[allow(clippy::arc_with_non_send_sync)]
    pub fn new(
        runtime: Arc<KernelRuntime>,
        state: Arc<tokio::sync::RwLock<KernelState>>,
        event_tx: broadcast::Sender<KernelEvent>,
        max_concurrent: usize,
    ) -> Self {
        Self {
            queue: Arc::new(tokio::sync::RwLock::new(BinaryHeap::new())),
            active: Arc::new(tokio::sync::RwLock::new(HashMap::new())),
            runtime,
            state,
            event_tx,
            max_concurrent,
        }
    }

    /// Submit job to scheduler
    pub async fn submit(&self, job: SchedulerJob) -> TitaneResult<Uuid> {
        let job_id = job.id;
        let engine = job.engine.clone();
        let priority = job.priority;

        // Add to queue
        {
            let mut queue = self.queue.write().await;
            queue.push(job);
        }

        // Update state
        {
            let mut state = self.state.write().await;
            state.load.queued_tasks = self.queue_size().await;
        }

        // Broadcast event
        let _ = self.event_tx.send(KernelEvent::TaskSubmitted {
            task_id: job_id.to_string(),
            priority: priority.name().to_string(),
            engine,
        });

        Ok(job_id)
    }

    /// Get next job from queue (highest priority)
    async fn pop_next(&self) -> Option<SchedulerJob> {
        let mut queue = self.queue.write().await;
        queue.pop()
    }

    /// Check if can execute more jobs
    async fn can_execute(&self) -> bool {
        let active = self.active.read().await;
        active.len() < self.max_concurrent
    }

    /// Execute next job from queue
    pub async fn execute_next(&self) -> bool {
        if !self.can_execute().await {
            return false;
        }

        let job = match self.pop_next().await {
            Some(j) => j,
            None => return false,
        };

        let job_id = job.id;
        let engine = job.engine.clone();
        let priority = job.priority;

        // Mark as active
        {
            let mut active = self.active.write().await;
            active.insert(job_id, engine.clone());
        }

        // Update state
        {
            let mut state = self.state.write().await;
            state.load.active_tasks += 1;
            state.load.queued_tasks = self.queue_size().await;
        }

        // Broadcast start event
        let _ = self.event_tx.send(KernelEvent::TaskStarted {
            task_id: job_id.to_string(),
            timestamp: chrono::Utc::now().timestamp_millis(),
        });

        // Spawn execution
        let runtime = Arc::clone(&self.runtime);
        let state = Arc::clone(&self.state);
        let active = Arc::clone(&self.active);
        let event_tx = self.event_tx.clone();

        tokio::spawn(async move {
            let start = std::time::Instant::now();

            // Execute with timeout
            let result = runtime
                .submit_with_timeout(job.task, priority.timeout_secs())
                .await;

            let duration_ms = start.elapsed().as_millis() as u64;

            // Remove from active
            {
                let mut active_map = active.write().await;
                active_map.remove(&job_id);
            }

            // Update state
            {
                let mut state_lock = state.write().await;
                state_lock.load.active_tasks = state_lock.load.active_tasks.saturating_sub(1);
                state_lock.update_engine_status(&engine, duration_ms, result.is_ok());
            }

            // Broadcast result
            match result {
                Ok(_output) => {
                    let _ = event_tx.send(KernelEvent::TaskCompleted {
                        task_id: job_id.to_string(),
                        duration_ms,
                    });

                    let _ = event_tx.send(KernelEvent::EngineOutput {
                        engine: engine.clone(),
                        duration_ms,
                        success: true,
                    });
                }
                Err(err) => {
                    let _ = event_tx.send(KernelEvent::TaskFailed {
                        task_id: job_id.to_string(),
                        error: err.to_string(),
                    });

                    let _ = event_tx.send(KernelEvent::EngineOutput {
                        engine: engine.clone(),
                        duration_ms,
                        success: false,
                    });
                }
            }
        });

        true
    }

    /// Run scheduler loop (processes queue continuously)
    pub async fn run(&self) {
        loop {
            if !self.execute_next().await {
                // No jobs or max concurrent reached
                tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
            }
        }
    }

    /// Get queue size
    pub async fn queue_size(&self) -> usize {
        let queue = self.queue.read().await;
        queue.len()
    }

    /// Get active jobs count
    pub async fn active_count(&self) -> usize {
        let active = self.active.read().await;
        active.len()
    }

    /// Clear queue (emergency)
    pub async fn clear_queue(&self) {
        let mut queue = self.queue.write().await;
        queue.clear();
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    async fn create_test_scheduler() -> CognitiveScheduler {
        let (event_tx, _) = broadcast::channel(100);
        let state = Arc::new(tokio::sync::RwLock::new(KernelState::new()));
        let runtime = Arc::new(KernelRuntime::new(event_tx.clone(), Arc::clone(&state)));

        CognitiveScheduler::new(runtime, state, event_tx, 4)
    }

    #[tokio::test]
    async fn test_scheduler_creation() {
        let scheduler = create_test_scheduler().await;
        assert_eq!(scheduler.queue_size().await, 0);
        assert_eq!(scheduler.active_count().await, 0);
    }

    #[tokio::test]
    async fn test_submit_job() {
        let scheduler = create_test_scheduler().await;

        let job = SchedulerJob::new(
            "TestEngine".to_string(),
            CognitivePriority::Normal,
            Box::pin(async {
                Ok(EngineOutput {
                    engine: "TestEngine".to_string(),
                    output: "test".to_string(),
                    duration_ms: 10,
                })
            }),
        );

        let result = scheduler.submit(job).await;
        assert!(result.is_ok());
        assert_eq!(scheduler.queue_size().await, 1);
    }

    #[tokio::test]
    async fn test_execute_job() {
        let scheduler = create_test_scheduler().await;

        let job = SchedulerJob::new(
            "TestEngine".to_string(),
            CognitivePriority::High,
            Box::pin(async {
                tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
                Ok(EngineOutput {
                    engine: "TestEngine".to_string(),
                    output: "done".to_string(),
                    duration_ms: 10,
                })
            }),
        );

        scheduler
            .submit(job)
            .await
            .expect("scheduler should accept job submission");

        let executed = scheduler.execute_next().await;
        assert!(executed);

        // Wait for execution
        tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

        assert_eq!(scheduler.queue_size().await, 0);
    }

    #[tokio::test]
    async fn test_priority_ordering() {
        let scheduler = create_test_scheduler().await;

        // Submit in reverse priority order
        let job_low = SchedulerJob::new(
            "Low".to_string(),
            CognitivePriority::Background,
            Box::pin(async {
                Ok(EngineOutput {
                    engine: "Low".to_string(),
                    output: "low".to_string(),
                    duration_ms: 10,
                })
            }),
        );

        let job_high = SchedulerJob::new(
            "High".to_string(),
            CognitivePriority::Critical,
            Box::pin(async {
                Ok(EngineOutput {
                    engine: "High".to_string(),
                    output: "high".to_string(),
                    duration_ms: 10,
                })
            }),
        );

        scheduler
            .submit(job_low)
            .await
            .expect("scheduler should accept low priority job");
        scheduler
            .submit(job_high)
            .await
            .expect("scheduler should accept high priority job");

        // Pop next should return high priority first
        let next = scheduler
            .pop_next()
            .await
            .expect("pop_next should return the highest priority job");
        assert_eq!(next.priority, CognitivePriority::Critical);
    }
}
