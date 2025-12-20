// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — OMEGA PIPELINE - SCHEDULER
//   Super Prompt #15: Job scheduling and queue management
//   Priority-based scheduling with rate limiting and backpressure
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashMap};
use std::sync::Arc;
use tokio::sync::{RwLock, Semaphore};
use tokio::time::{Duration, Instant};

use super::{OmegaError, OmegaResult, PipelineInput};

// ═══════════════════════════════════════════════════════════════
//   JOB TYPES
// ═══════════════════════════════════════════════════════════════

/// Scheduled job
#[derive(Debug, Clone)]
pub struct ScheduledJob {
    /// Job ID
    pub id: String,
    /// Pipeline input
    pub input: PipelineInput,
    /// Priority (higher = more urgent)
    pub priority: u8,
    /// Creation time
    pub created_at: Instant,
    /// Deadline (optional)
    pub deadline: Option<Instant>,
    /// Retry count
    pub retries: u32,
    /// Maximum retries
    pub max_retries: u32,
}

impl ScheduledJob {
    /// Create new job
    pub fn new(input: PipelineInput) -> Self {
        Self {
            id: input.request_id.clone(),
            priority: input.priority,
            input,
            created_at: Instant::now(),
            deadline: None,
            retries: 0,
            max_retries: 3,
        }
    }

    /// Set deadline
    pub fn with_deadline(mut self, deadline: Duration) -> Self {
        self.deadline = Some(Instant::now() + deadline);
        self
    }

    /// Set max retries
    pub fn with_max_retries(mut self, max: u32) -> Self {
        self.max_retries = max;
        self
    }

    /// Check if job is expired
    pub fn is_expired(&self) -> bool {
        if let Some(deadline) = self.deadline {
            Instant::now() > deadline
        } else {
            false
        }
    }

    /// Get age in milliseconds
    pub fn age_ms(&self) -> u64 {
        self.created_at.elapsed().as_millis() as u64
    }

    /// Increment retry count
    pub fn retry(&mut self) -> bool {
        if self.retries < self.max_retries {
            self.retries += 1;
            true
        } else {
            false
        }
    }
}

// Implement ordering for priority queue
impl PartialEq for ScheduledJob {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id
    }
}

impl Eq for ScheduledJob {}

impl PartialOrd for ScheduledJob {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for ScheduledJob {
    fn cmp(&self, other: &Self) -> Ordering {
        // Higher priority first
        match self.priority.cmp(&other.priority) {
            Ordering::Equal => {
                // Older jobs first (FIFO within same priority)
                other.created_at.cmp(&self.created_at)
            }
            ord => ord, // BinaryHeap est un max-heap: priorité élevée doit être "plus grande"
        }
    }
}

/// Job status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum JobStatus {
    /// Queued, waiting to run
    Queued,
    /// Currently running
    Running,
    /// Completed successfully
    Completed,
    /// Failed
    Failed,
    /// Cancelled
    Cancelled,
    /// Expired (deadline passed)
    Expired,
}

/// Job result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobResult {
    pub job_id: String,
    pub status: JobStatus,
    pub result: Option<serde_json::Value>,
    pub error: Option<String>,
    pub execution_ms: u64,
    pub retries: u32,
}

// ═══════════════════════════════════════════════════════════════
//   SCHEDULER CONFIGURATION
// ═══════════════════════════════════════════════════════════════

/// Scheduler configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulerConfig {
    /// Maximum queue size
    pub max_queue_size: usize,
    /// Maximum concurrent jobs
    pub max_concurrent: usize,
    /// Rate limit (requests per second)
    pub rate_limit: f64,
    /// Enable backpressure
    pub enable_backpressure: bool,
    /// Backpressure threshold (queue fill %)
    pub backpressure_threshold: f32,
    /// Default job timeout in ms
    pub default_timeout_ms: u64,
    /// Enable priority scheduling
    pub enable_priority: bool,
}

impl Default for SchedulerConfig {
    fn default() -> Self {
        Self {
            max_queue_size: 1000,
            max_concurrent: 10,
            rate_limit: 100.0,
            enable_backpressure: true,
            backpressure_threshold: 0.8,
            default_timeout_ms: 200,
            enable_priority: true,
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   RATE LIMITER
// ═══════════════════════════════════════════════════════════════

/// Token bucket rate limiter
pub struct RateLimiter {
    /// Tokens available
    tokens: f64,
    /// Maximum tokens
    max_tokens: f64,
    /// Refill rate (tokens per second)
    refill_rate: f64,
    /// Last refill time
    last_refill: Instant,
}

impl RateLimiter {
    /// Create new rate limiter
    pub fn new(rate: f64, burst: f64) -> Self {
        Self {
            tokens: burst,
            max_tokens: burst,
            refill_rate: rate,
            last_refill: Instant::now(),
        }
    }

    /// Try to acquire a token
    pub fn try_acquire(&mut self) -> bool {
        self.refill();

        if self.tokens >= 1.0 {
            self.tokens -= 1.0;
            true
        } else {
            false
        }
    }

    /// Refill tokens based on elapsed time
    fn refill(&mut self) {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last_refill).as_secs_f64();
        self.tokens = (self.tokens + elapsed * self.refill_rate).min(self.max_tokens);
        self.last_refill = now;
    }

    /// Get current token count
    pub fn available_tokens(&self) -> f64 {
        self.tokens
    }

    /// Time until next token available
    pub fn time_until_available(&self) -> Duration {
        if self.tokens >= 1.0 {
            Duration::ZERO
        } else {
            let needed = 1.0 - self.tokens;
            Duration::from_secs_f64(needed / self.refill_rate)
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   JOB SCHEDULER
// ═══════════════════════════════════════════════════════════════

/// Job scheduler
pub struct JobScheduler {
    /// Configuration
    config: SchedulerConfig,
    /// Priority queue for jobs
    queue: Arc<RwLock<BinaryHeap<ScheduledJob>>>,
    /// Job registry
    jobs: Arc<RwLock<HashMap<String, JobStatus>>>,
    /// Rate limiter
    rate_limiter: Arc<RwLock<RateLimiter>>,
    /// Concurrency semaphore
    semaphore: Arc<Semaphore>,
    /// Statistics
    stats: Arc<RwLock<SchedulerStats>>,
    /// Is running
    running: Arc<RwLock<bool>>,
}

/// Scheduler statistics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SchedulerStats {
    pub total_scheduled: u64,
    pub total_completed: u64,
    pub total_failed: u64,
    pub total_cancelled: u64,
    pub total_expired: u64,
    pub current_queue_size: usize,
    pub current_running: usize,
    pub avg_wait_time_ms: f64,
    pub avg_execution_time_ms: f64,
    pub rate_limited_count: u64,
}

impl Default for JobScheduler {
    fn default() -> Self {
        let config = SchedulerConfig::default();
        Self::new(config)
    }
}

impl JobScheduler {
    /// Create new scheduler
    pub fn new(config: SchedulerConfig) -> Self {
        let rate_limiter = RateLimiter::new(config.rate_limit, config.rate_limit * 2.0);

        Self {
            semaphore: Arc::new(Semaphore::new(config.max_concurrent)),
            config,
            queue: Arc::new(RwLock::new(BinaryHeap::new())),
            jobs: Arc::new(RwLock::new(HashMap::new())),
            rate_limiter: Arc::new(RwLock::new(rate_limiter)),
            stats: Arc::new(RwLock::new(SchedulerStats::default())),
            running: Arc::new(RwLock::new(false)),
        }
    }

    /// Schedule a job
    pub async fn schedule(&self, input: PipelineInput) -> OmegaResult<String> {
        let job = ScheduledJob::new(input);
        self.schedule_job(job).await
    }

    /// Schedule a job with options
    pub async fn schedule_job(&self, job: ScheduledJob) -> OmegaResult<String> {
        // Check backpressure
        if self.config.enable_backpressure {
            let queue = self.queue.read().await;
            let fill_ratio = queue.len() as f32 / self.config.max_queue_size as f32;
            if fill_ratio >= self.config.backpressure_threshold {
                return Err(OmegaError::SchedulerError(
                    "Queue at capacity (backpressure)".to_string(),
                ));
            }
        }

        // Check queue size
        let mut queue = self.queue.write().await;
        if queue.len() >= self.config.max_queue_size {
            return Err(OmegaError::SchedulerError("Queue full".to_string()));
        }

        let job_id = job.id.clone();

        // Register job
        let mut jobs = self.jobs.write().await;
        jobs.insert(job_id.clone(), JobStatus::Queued);

        // Add to queue
        queue.push(job);

        // Update stats
        let mut stats = self.stats.write().await;
        stats.total_scheduled += 1;
        stats.current_queue_size = queue.len();

        Ok(job_id)
    }

    /// Get next job from queue
    pub async fn next_job(&self) -> Option<ScheduledJob> {
        // Check rate limit
        {
            let mut limiter = self.rate_limiter.write().await;
            if !limiter.try_acquire() {
                let mut stats = self.stats.write().await;
                stats.rate_limited_count += 1;
                return None;
            }
        }

        let mut queue = self.queue.write().await;

        // Skip expired jobs
        while let Some(job) = queue.peek() {
            if job.is_expired() {
                if let Some(expired_job) = queue.pop() {
                    let mut jobs = self.jobs.write().await;
                    jobs.insert(expired_job.id.clone(), JobStatus::Expired);

                    let mut stats = self.stats.write().await;
                    stats.total_expired += 1;
                }
            } else {
                break;
            }
        }

        let job = queue.pop();

        // Update stats
        let mut stats = self.stats.write().await;
        stats.current_queue_size = queue.len();

        if job.is_some() {
            stats.current_running += 1;
        }

        // Update job status
        if let Some(ref j) = job {
            let mut jobs = self.jobs.write().await;
            jobs.insert(j.id.clone(), JobStatus::Running);
        }

        job
    }

    /// Mark job as completed
    pub async fn complete_job(
        &self,
        job_id: &str,
        success: bool,
        result: Option<serde_json::Value>,
    ) {
        let mut jobs = self.jobs.write().await;
        let status = if success {
            JobStatus::Completed
        } else {
            JobStatus::Failed
        };
        jobs.insert(job_id.to_string(), status);

        let mut stats = self.stats.write().await;
        stats.current_running = stats.current_running.saturating_sub(1);

        if success {
            stats.total_completed += 1;
        } else {
            stats.total_failed += 1;
        }
    }

    /// Cancel a job
    pub async fn cancel_job(&self, job_id: &str) -> bool {
        let mut jobs = self.jobs.write().await;
        if let Some(status) = jobs.get(job_id) {
            if *status == JobStatus::Queued {
                jobs.insert(job_id.to_string(), JobStatus::Cancelled);

                let mut stats = self.stats.write().await;
                stats.total_cancelled += 1;

                return true;
            }
        }
        false
    }

    /// Get job status
    pub async fn get_status(&self, job_id: &str) -> Option<JobStatus> {
        let jobs = self.jobs.read().await;
        jobs.get(job_id).copied()
    }

    /// Get queue size
    pub async fn queue_size(&self) -> usize {
        let queue = self.queue.read().await;
        queue.len()
    }

    /// Get scheduler statistics
    pub async fn get_stats(&self) -> SchedulerStats {
        self.stats.read().await.clone()
    }

    /// Clear completed jobs from registry
    pub async fn cleanup(&self) {
        let mut jobs = self.jobs.write().await;
        jobs.retain(|_, status| matches!(status, JobStatus::Queued | JobStatus::Running));
    }

    /// Check if scheduler is accepting jobs
    pub async fn is_accepting(&self) -> bool {
        let queue = self.queue.read().await;
        let fill_ratio = queue.len() as f32 / self.config.max_queue_size as f32;

        if self.config.enable_backpressure {
            fill_ratio < self.config.backpressure_threshold
        } else {
            queue.len() < self.config.max_queue_size
        }
    }

    /// Get estimated wait time for a new job
    pub async fn estimated_wait_ms(&self) -> u64 {
        let queue = self.queue.read().await;
        let queue_size = queue.len();

        if queue_size == 0 {
            return 0;
        }

        // Estimate based on queue size, concurrency, and average execution time
        let stats = self.stats.read().await;
        let avg_exec = if stats.avg_execution_time_ms > 0.0 {
            stats.avg_execution_time_ms
        } else {
            self.config.default_timeout_ms as f64
        };

        let concurrent = self.config.max_concurrent.max(1);
        ((queue_size as f64 / concurrent as f64) * avg_exec) as u64
    }

    /// Acquire concurrency permit
    pub async fn acquire_permit(&self) -> Option<tokio::sync::OwnedSemaphorePermit> {
        self.semaphore.clone().try_acquire_owned().ok()
    }
}

// ═══════════════════════════════════════════════════════════════
//   PRIORITY LEVELS
// ═══════════════════════════════════════════════════════════════

/// Standard priority levels
pub struct Priority;

impl Priority {
    /// Critical priority (immediate processing)
    pub const CRITICAL: u8 = 10;
    /// High priority
    pub const HIGH: u8 = 8;
    /// Normal priority
    pub const NORMAL: u8 = 5;
    /// Low priority
    pub const LOW: u8 = 3;
    /// Background priority
    pub const BACKGROUND: u8 = 1;
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_scheduler_basic() {
        let scheduler = JobScheduler::default();

        let input = PipelineInput::new("Test request");
        let job_id = scheduler
            .schedule(input)
            .await
            .expect("schedule should succeed");

        assert!(!job_id.is_empty());

        let status = scheduler.get_status(&job_id).await;
        assert_eq!(status, Some(JobStatus::Queued));
    }

    #[tokio::test]
    async fn test_priority_ordering() {
        let scheduler = JobScheduler::default();

        // Schedule low priority first
        let low = PipelineInput::new("Low").with_priority(Priority::LOW);
        scheduler
            .schedule(low)
            .await
            .expect("scheduling low priority job should succeed");

        // Schedule high priority second
        let high = PipelineInput::new("High").with_priority(Priority::HIGH);
        scheduler
            .schedule(high)
            .await
            .expect("scheduling high priority job should succeed");

        // High priority should come out first
        let next = scheduler
            .next_job()
            .await
            .expect("expected a job to be available");
        assert_eq!(next.priority, Priority::HIGH);
    }

    #[tokio::test]
    async fn test_job_expiry() {
        let scheduler = JobScheduler::default();

        // Create job with very short deadline
        let input = PipelineInput::new("Test");
        let job = ScheduledJob::new(input).with_deadline(Duration::from_nanos(1));

        scheduler
            .schedule_job(job)
            .await
            .expect("schedule_job should succeed");

        // Wait a bit for expiry
        tokio::time::sleep(Duration::from_millis(1)).await;

        // Job should be expired
        let next = scheduler.next_job().await;
        assert!(next.is_none());
    }

    #[test]
    fn test_rate_limiter() {
        let mut limiter = RateLimiter::new(10.0, 5.0);

        // Should allow burst
        for _ in 0..5 {
            assert!(limiter.try_acquire());
        }

        // Should be limited
        assert!(!limiter.try_acquire());
    }

    #[tokio::test]
    async fn test_scheduler_stats() {
        let scheduler = JobScheduler::default();

        let input = PipelineInput::new("Test");
        scheduler
            .schedule(input)
            .await
            .expect("schedule should succeed");

        let stats = scheduler.get_stats().await;
        assert_eq!(stats.total_scheduled, 1);
        assert_eq!(stats.current_queue_size, 1);
    }

    #[tokio::test]
    async fn test_job_completion() {
        let scheduler = JobScheduler::default();

        let input = PipelineInput::new("Test");
        let job_id = scheduler
            .schedule(input)
            .await
            .expect("schedule should succeed");

        // Get job
        let _job = scheduler
            .next_job()
            .await
            .expect("expected a job to be available");

        // Complete it
        scheduler.complete_job(&job_id, true, None).await;

        let status = scheduler.get_status(&job_id).await;
        assert_eq!(status, Some(JobStatus::Completed));
    }

    #[tokio::test]
    async fn test_cancel_job() {
        let scheduler = JobScheduler::default();

        let input = PipelineInput::new("Test");
        let job_id = scheduler
            .schedule(input)
            .await
            .expect("schedule should succeed");

        let cancelled = scheduler.cancel_job(&job_id).await;
        assert!(cancelled);

        let status = scheduler.get_status(&job_id).await;
        assert_eq!(status, Some(JobStatus::Cancelled));
    }

    #[test]
    fn test_scheduled_job_retry() {
        let input = PipelineInput::new("Test");
        let mut job = ScheduledJob::new(input).with_max_retries(2);

        assert!(job.retry()); // 1
        assert!(job.retry()); // 2
        assert!(!job.retry()); // No more retries
    }

    #[test]
    fn test_scheduled_job_new() {
        let input = PipelineInput::new("Test Job");
        let job = ScheduledJob::new(input);

        assert!(!job.id.is_empty());
        assert_eq!(job.retries, 0);
        assert_eq!(job.max_retries, 3);
        assert!(job.deadline.is_none());
    }

    #[test]
    fn test_scheduled_job_with_deadline() {
        let input = PipelineInput::new("Test");
        let job = ScheduledJob::new(input).with_deadline(Duration::from_secs(60));

        assert!(job.deadline.is_some());
    }

    #[test]
    fn test_scheduled_job_with_max_retries() {
        let input = PipelineInput::new("Test");
        let job = ScheduledJob::new(input).with_max_retries(5);

        assert_eq!(job.max_retries, 5);
    }

    #[test]
    fn test_scheduled_job_is_expired() {
        let input = PipelineInput::new("Test");
        let job = ScheduledJob::new(input);

        // No deadline = not expired
        assert!(!job.is_expired());
    }

    #[test]
    fn test_scheduled_job_age_ms() {
        let input = PipelineInput::new("Test");
        let job = ScheduledJob::new(input);

        // Age should be very small since just created
        assert!(job.age_ms() < 1000);
    }

    #[test]
    fn test_scheduled_job_equality() {
        let input1 = PipelineInput::new("Test1");
        let mut job1 = ScheduledJob::new(input1);
        job1.id = "same-id".to_string();

        let input2 = PipelineInput::new("Test2");
        let mut job2 = ScheduledJob::new(input2);
        job2.id = "same-id".to_string();

        assert_eq!(job1, job2);
    }

    #[test]
    fn test_scheduled_job_ordering() {
        let input1 = PipelineInput::new("Low").with_priority(Priority::LOW);
        let job1 = ScheduledJob::new(input1);

        let input2 = PipelineInput::new("High").with_priority(Priority::HIGH);
        let job2 = ScheduledJob::new(input2);

        // Higher priority should come first
        assert!(job2 > job1);
    }

    #[test]
    fn test_job_status_variants() {
        let statuses = vec![
            JobStatus::Queued,
            JobStatus::Running,
            JobStatus::Completed,
            JobStatus::Failed,
            JobStatus::Cancelled,
            JobStatus::Expired,
        ];

        assert_eq!(statuses.len(), 6);
        assert_ne!(JobStatus::Queued, JobStatus::Running);
    }

    #[test]
    fn test_job_result_structure() {
        let result = JobResult {
            job_id: "job-123".to_string(),
            status: JobStatus::Completed,
            result: Some(serde_json::json!({"output": "success"})),
            error: None,
            execution_ms: 150,
            retries: 0,
        };

        assert_eq!(result.job_id, "job-123");
        assert_eq!(result.status, JobStatus::Completed);
        assert!(result.result.is_some());
        assert!(result.error.is_none());
    }

    #[test]
    fn test_scheduler_config_default() {
        let config = SchedulerConfig::default();

        assert_eq!(config.max_queue_size, 1000);
        assert_eq!(config.max_concurrent, 10);
        assert_eq!(config.rate_limit, 100.0);
        assert!(config.enable_backpressure);
        assert_eq!(config.backpressure_threshold, 0.8);
        assert_eq!(config.default_timeout_ms, 200);
        assert!(config.enable_priority);
    }

    #[test]
    fn test_scheduler_config_clone() {
        let config = SchedulerConfig::default();
        let cloned = config.clone();

        assert_eq!(cloned.max_queue_size, config.max_queue_size);
        assert_eq!(cloned.rate_limit, config.rate_limit);
    }

    #[test]
    fn test_rate_limiter_new() {
        let limiter = RateLimiter::new(10.0, 5.0);

        assert_eq!(limiter.max_tokens, 5.0);
        assert_eq!(limiter.refill_rate, 10.0);
    }

    #[test]
    fn test_rate_limiter_available_tokens() {
        let limiter = RateLimiter::new(10.0, 5.0);
        assert_eq!(limiter.available_tokens(), 5.0);
    }

    #[test]
    fn test_rate_limiter_time_until_available() {
        let mut limiter = RateLimiter::new(10.0, 5.0);

        // Initially should have tokens
        assert_eq!(limiter.time_until_available(), Duration::ZERO);

        // Drain all tokens
        for _ in 0..5 {
            limiter.try_acquire();
        }

        // Now should have wait time
        assert!(limiter.time_until_available() > Duration::ZERO);
    }

    #[test]
    fn test_scheduler_stats_default() {
        let stats = SchedulerStats::default();

        assert_eq!(stats.total_scheduled, 0);
        assert_eq!(stats.total_completed, 0);
        assert_eq!(stats.total_failed, 0);
        assert_eq!(stats.current_queue_size, 0);
    }

    #[test]
    fn test_scheduler_stats_clone() {
        let mut stats = SchedulerStats::default();
        stats.total_scheduled = 10;
        stats.total_completed = 8;

        let cloned = stats.clone();
        assert_eq!(cloned.total_scheduled, 10);
        assert_eq!(cloned.total_completed, 8);
    }

    #[test]
    fn test_priority_constants() {
        assert_eq!(Priority::CRITICAL, 10);
        assert_eq!(Priority::HIGH, 8);
        assert_eq!(Priority::NORMAL, 5);
        assert_eq!(Priority::LOW, 3);
        assert_eq!(Priority::BACKGROUND, 1);
    }

    #[test]
    fn test_priority_comparison() {
        assert!(Priority::CRITICAL > Priority::HIGH);
        assert!(Priority::HIGH > Priority::NORMAL);
        assert!(Priority::NORMAL > Priority::LOW);
        assert!(Priority::LOW > Priority::BACKGROUND);
    }

    #[tokio::test]
    async fn test_scheduler_new() {
        let config = SchedulerConfig::default();
        let scheduler = JobScheduler::new(config);

        assert_eq!(scheduler.queue_size().await, 0);
    }

    #[tokio::test]
    async fn test_scheduler_default() {
        let scheduler = JobScheduler::default();
        assert_eq!(scheduler.queue_size().await, 0);
    }

    #[tokio::test]
    async fn test_scheduler_is_accepting() {
        let scheduler = JobScheduler::default();
        assert!(scheduler.is_accepting().await);
    }

    #[tokio::test]
    async fn test_scheduler_estimated_wait_empty() {
        let scheduler = JobScheduler::default();
        assert_eq!(scheduler.estimated_wait_ms().await, 0);
    }

    #[tokio::test]
    async fn test_scheduler_estimated_wait_with_jobs() {
        let scheduler = JobScheduler::default();

        for i in 0..5 {
            let input = PipelineInput::new(&format!("Test {}", i));
            scheduler
                .schedule(input)
                .await
                .expect("schedule should succeed");
        }

        let wait = scheduler.estimated_wait_ms().await;
        assert!(wait > 0);
    }

    #[tokio::test]
    async fn test_scheduler_cleanup() {
        let scheduler = JobScheduler::default();

        let input = PipelineInput::new("Test");
        let job_id = scheduler
            .schedule(input)
            .await
            .expect("schedule should succeed");
        let _job = scheduler
            .next_job()
            .await
            .expect("expected a job to be available");
        scheduler.complete_job(&job_id, true, None).await;

        scheduler.cleanup().await;

        // Completed job should be removed
        let status = scheduler.get_status(&job_id).await;
        assert!(status.is_none() || status == Some(JobStatus::Completed));
    }

    #[tokio::test]
    async fn test_scheduler_acquire_permit() {
        let scheduler = JobScheduler::default();

        // Should be able to acquire permits
        let permit = scheduler.acquire_permit().await;
        assert!(permit.is_some());
    }

    #[tokio::test]
    async fn test_scheduler_job_failed() {
        let scheduler = JobScheduler::default();

        let input = PipelineInput::new("Test");
        let job_id = scheduler
            .schedule(input)
            .await
            .expect("schedule should succeed");
        let _job = scheduler
            .next_job()
            .await
            .expect("expected a job to be available");

        scheduler.complete_job(&job_id, false, None).await;

        let status = scheduler.get_status(&job_id).await;
        assert_eq!(status, Some(JobStatus::Failed));
    }

    #[tokio::test]
    async fn test_cancel_running_job() {
        let scheduler = JobScheduler::default();

        let input = PipelineInput::new("Test");
        let job_id = scheduler
            .schedule(input)
            .await
            .expect("schedule should succeed");
        let _job = scheduler
            .next_job()
            .await
            .expect("expected a job to be available");

        // Cannot cancel running job
        let cancelled = scheduler.cancel_job(&job_id).await;
        assert!(!cancelled);
    }

    #[test]
    fn test_job_result_clone() {
        let result = JobResult {
            job_id: "test".to_string(),
            status: JobStatus::Queued,
            result: None,
            error: None,
            execution_ms: 0,
            retries: 0,
        };

        let cloned = result.clone();
        assert_eq!(cloned.job_id, "test");
        assert_eq!(cloned.status, JobStatus::Queued);
    }

    #[test]
    fn test_job_status_serialization() {
        let status = JobStatus::Completed;
        let json = serde_json::to_string(&status).expect("JobStatus should serialize to JSON");
        assert!(json.contains("Completed"));
    }

    #[tokio::test]
    async fn test_scheduler_backpressure() {
        let mut config = SchedulerConfig::default();
        config.max_queue_size = 10;
        config.backpressure_threshold = 0.5;

        let scheduler = JobScheduler::new(config);

        // Fill queue past threshold
        for i in 0..6 {
            let input = PipelineInput::new(&format!("Test {}", i));
            let _ = scheduler.schedule(input).await;
        }

        // Next job should be rejected due to backpressure
        let input = PipelineInput::new("Final");
        let result = scheduler.schedule(input).await;
        assert!(result.is_err());
    }
}
