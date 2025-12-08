// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1Ω — OMEGA PIPELINE - DIAGNOSTICS
//   Super Prompt #15: Pipeline diagnostics and monitoring
//   Real-time monitoring, metrics collection, and health checks
// ═══════════════════════════════════════════════════════════════

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};

use super::{
    PipelineStage, PipelineStats, StageStats,
    OmegaConfig,
};

// ═══════════════════════════════════════════════════════════════
//   DIAGNOSTICS TYPES
// ═══════════════════════════════════════════════════════════════

/// Pipeline health status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HealthStatus {
    /// All systems operational
    Healthy,
    /// Some degradation
    Degraded,
    /// Critical issues
    Unhealthy,
    /// Unknown status
    Unknown,
}

impl HealthStatus {
    pub fn from_score(score: f32) -> Self {
        if score >= 0.9 {
            HealthStatus::Healthy
        } else if score >= 0.7 {
            HealthStatus::Degraded
        } else if score >= 0.0 {
            HealthStatus::Unhealthy
        } else {
            HealthStatus::Unknown
        }
    }
}

/// Health check result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheck {
    /// Overall status
    pub status: HealthStatus,
    /// Health score (0.0 - 1.0)
    pub score: f32,
    /// Component health
    pub components: HashMap<String, ComponentHealth>,
    /// Check timestamp
    pub timestamp: i64,
    /// Issues found
    pub issues: Vec<HealthIssue>,
}

/// Component health
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentHealth {
    pub name: String,
    pub status: HealthStatus,
    pub score: f32,
    pub last_check: i64,
    pub details: Option<String>,
}

/// Health issue
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthIssue {
    pub severity: IssueSeverity,
    pub component: String,
    pub message: String,
    pub timestamp: i64,
}

/// Issue severity
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum IssueSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

// ═══════════════════════════════════════════════════════════════
//   METRICS
// ═══════════════════════════════════════════════════════════════

/// Metrics collector
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct MetricsCollector {
    /// Request metrics
    pub requests: RequestMetrics,
    /// Latency metrics
    pub latency: LatencyMetrics,
    /// Error metrics
    pub errors: ErrorMetrics,
    /// Stage-specific metrics
    pub stages: HashMap<String, StageMetrics>,
    /// Cache metrics
    pub cache: CacheMetrics,
    /// Resource metrics
    pub resources: ResourceMetrics,
}

/// Request metrics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct RequestMetrics {
    pub total: u64,
    pub successful: u64,
    pub failed: u64,
    pub blocked: u64,
    pub timeout: u64,
    pub rate_per_second: f64,
    pub peak_rate: f64,
}

/// Latency metrics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct LatencyMetrics {
    pub avg_ms: f64,
    pub min_ms: u64,
    pub max_ms: u64,
    pub p50_ms: u64,
    pub p90_ms: u64,
    pub p95_ms: u64,
    pub p99_ms: u64,
    /// Latency samples for percentile calculation
    #[serde(skip)]
    samples: Vec<u64>,
}

impl LatencyMetrics {
    /// Record a latency sample
    pub fn record(&mut self, latency_ms: u64) {
        self.samples.push(latency_ms);

        // Update min/max
        if latency_ms < self.min_ms || self.min_ms == 0 {
            self.min_ms = latency_ms;
        }
        if latency_ms > self.max_ms {
            self.max_ms = latency_ms;
        }

        // Update average
        let count = self.samples.len() as f64;
        self.avg_ms = (self.avg_ms * (count - 1.0) + latency_ms as f64) / count;

        // Recalculate percentiles periodically
        if self.samples.len() % 100 == 0 {
            self.calculate_percentiles();
        }

        // Trim samples if too many
        if self.samples.len() > 10000 {
            self.samples = self.samples.split_off(5000);
        }
    }

    /// Calculate percentiles
    fn calculate_percentiles(&mut self) {
        if self.samples.is_empty() {
            return;
        }

        let mut sorted = self.samples.clone();
        sorted.sort();

        let len = sorted.len();
        self.p50_ms = sorted[len / 2];
        self.p90_ms = sorted[(len * 90) / 100];
        self.p95_ms = sorted[(len * 95) / 100];
        self.p99_ms = sorted[(len * 99) / 100];
    }
}

/// Error metrics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ErrorMetrics {
    pub total_errors: u64,
    pub by_type: HashMap<String, u64>,
    pub error_rate: f64,
    pub last_error: Option<String>,
    pub last_error_time: Option<i64>,
}

/// Stage metrics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct StageMetrics {
    pub invocations: u64,
    pub avg_latency_ms: f64,
    pub errors: u64,
    pub success_rate: f64,
}

/// Cache metrics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CacheMetrics {
    pub hits: u64,
    pub misses: u64,
    pub hit_rate: f64,
    pub size: usize,
    pub evictions: u64,
}

/// Resource metrics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ResourceMetrics {
    pub memory_mb: f64,
    pub cpu_percent: f64,
    pub active_tasks: usize,
    pub queue_depth: usize,
}

// ═══════════════════════════════════════════════════════════════
//   DIAGNOSTICS ENGINE
// ═══════════════════════════════════════════════════════════════

/// Diagnostics engine
pub struct DiagnosticsEngine {
    /// Metrics collector
    metrics: Arc<RwLock<MetricsCollector>>,
    /// Configuration
    config: Arc<OmegaConfig>,
    /// Health history
    health_history: Arc<RwLock<Vec<HealthCheck>>>,
    /// Is enabled
    enabled: bool,
}

impl Default for DiagnosticsEngine {
    fn default() -> Self {
        Self {
            metrics: Arc::new(RwLock::new(MetricsCollector::default())),
            config: Arc::new(OmegaConfig::default()),
            health_history: Arc::new(RwLock::new(Vec::new())),
            enabled: true,
        }
    }
}

impl DiagnosticsEngine {
    /// Create new diagnostics engine
    pub fn new() -> Self {
        Self::default()
    }

    /// Create with configuration
    pub fn with_config(config: OmegaConfig) -> Self {
        Self {
            config: Arc::new(config),
            ..Self::default()
        }
    }

    /// Record request start
    pub async fn record_request_start(&self, request_id: &str) {
        if !self.enabled {
            return;
        }

        let mut metrics = self.metrics.write().await;
        metrics.requests.total += 1;
        metrics.resources.active_tasks += 1;
    }

    /// Record request completion
    pub async fn record_request_complete(&self, request_id: &str, success: bool, latency_ms: u64) {
        if !self.enabled {
            return;
        }

        let mut metrics = self.metrics.write().await;

        if success {
            metrics.requests.successful += 1;
        } else {
            metrics.requests.failed += 1;
        }

        metrics.latency.record(latency_ms);
        metrics.resources.active_tasks = metrics.resources.active_tasks.saturating_sub(1);
    }

    /// Record error
    pub async fn record_error(&self, error_type: &str, message: &str) {
        if !self.enabled {
            return;
        }

        let mut metrics = self.metrics.write().await;
        metrics.errors.total_errors += 1;
        *metrics.errors.by_type.entry(error_type.to_string()).or_insert(0) += 1;
        metrics.errors.last_error = Some(message.to_string());
        metrics.errors.last_error_time = Some(chrono::Utc::now().timestamp_millis());

        // Update error rate
        let total = metrics.requests.total as f64;
        if total > 0.0 {
            metrics.errors.error_rate = metrics.errors.total_errors as f64 / total;
        }
    }

    /// Record stage execution
    pub async fn record_stage(&self, stage: PipelineStage, latency_ms: u64, success: bool) {
        if !self.enabled {
            return;
        }

        let mut metrics = self.metrics.write().await;
        let stage_name = format!("{:?}", stage);
        let stage_metrics = metrics.stages.entry(stage_name).or_insert_with(StageMetrics::default);

        stage_metrics.invocations += 1;

        // Update average latency
        let count = stage_metrics.invocations as f64;
        stage_metrics.avg_latency_ms =
            (stage_metrics.avg_latency_ms * (count - 1.0) + latency_ms as f64) / count;

        if !success {
            stage_metrics.errors += 1;
        }

        // Update success rate
        let successful = stage_metrics.invocations - stage_metrics.errors;
        stage_metrics.success_rate = successful as f64 / stage_metrics.invocations as f64;
    }

    /// Record cache event
    pub async fn record_cache_event(&self, hit: bool) {
        if !self.enabled {
            return;
        }

        let mut metrics = self.metrics.write().await;
        if hit {
            metrics.cache.hits += 1;
        } else {
            metrics.cache.misses += 1;
        }

        let total = metrics.cache.hits + metrics.cache.misses;
        if total > 0 {
            metrics.cache.hit_rate = metrics.cache.hits as f64 / total as f64;
        }
    }

    /// Record blocked request
    pub async fn record_blocked(&self) {
        if !self.enabled {
            return;
        }

        let mut metrics = self.metrics.write().await;
        metrics.requests.blocked += 1;
    }

    /// Record timeout
    pub async fn record_timeout(&self) {
        if !self.enabled {
            return;
        }

        let mut metrics = self.metrics.write().await;
        metrics.requests.timeout += 1;
    }

    /// Get current metrics
    pub async fn get_metrics(&self) -> MetricsCollector {
        self.metrics.read().await.clone()
    }

    /// Run health check
    pub async fn health_check(&self) -> HealthCheck {
        let metrics = self.metrics.read().await;
        let mut components = HashMap::new();
        let mut issues = Vec::new();
        let now = chrono::Utc::now().timestamp_millis();

        // Check request processing
        let request_health = self.check_request_health(&metrics, &mut issues);
        components.insert("requests".to_string(), request_health);

        // Check latency
        let latency_health = self.check_latency_health(&metrics, &mut issues);
        components.insert("latency".to_string(), latency_health);

        // Check error rate
        let error_health = self.check_error_health(&metrics, &mut issues);
        components.insert("errors".to_string(), error_health);

        // Check stages
        for (stage_name, stage_metrics) in &metrics.stages {
            let stage_health = self.check_stage_health(stage_name, stage_metrics, &mut issues);
            components.insert(stage_name.clone(), stage_health);
        }

        // Calculate overall score
        let overall_score = if components.is_empty() {
            1.0
        } else {
            components.values().map(|c| c.score).sum::<f32>() / components.len() as f32
        };

        let health_check = HealthCheck {
            status: HealthStatus::from_score(overall_score),
            score: overall_score,
            components,
            timestamp: now,
            issues,
        };

        // Store in history
        let mut history = self.health_history.write().await;
        history.push(health_check.clone());
        if history.len() > 1000 {
            history.remove(0);
        }

        health_check
    }

    /// Check request health
    fn check_request_health(&self, metrics: &MetricsCollector, issues: &mut Vec<HealthIssue>) -> ComponentHealth {
        let total = metrics.requests.total;
        let failed = metrics.requests.failed;

        let score = if total == 0 {
            1.0
        } else {
            (total - failed) as f32 / total as f32
        };

        if score < 0.9 && total > 100 {
            issues.push(HealthIssue {
                severity: if score < 0.7 { IssueSeverity::Error } else { IssueSeverity::Warning },
                component: "requests".to_string(),
                message: format!("Request success rate is {:.1}%", score * 100.0),
                timestamp: chrono::Utc::now().timestamp_millis(),
            });
        }

        ComponentHealth {
            name: "Request Processing".to_string(),
            status: HealthStatus::from_score(score),
            score,
            last_check: chrono::Utc::now().timestamp_millis(),
            details: Some(format!("Total: {}, Failed: {}", total, failed)),
        }
    }

    /// Check latency health
    fn check_latency_health(&self, metrics: &MetricsCollector, issues: &mut Vec<HealthIssue>) -> ComponentHealth {
        let target = self.config.target_latency_ms as f64;
        let avg = metrics.latency.avg_ms;
        let p95 = metrics.latency.p95_ms as f64;

        let score = if avg == 0.0 {
            1.0
        } else if avg <= target {
            1.0
        } else if avg <= target * 1.5 {
            0.8
        } else if avg <= target * 2.0 {
            0.6
        } else {
            0.4
        };

        if p95 > target * 1.5 && metrics.requests.total > 100 {
            issues.push(HealthIssue {
                severity: IssueSeverity::Warning,
                component: "latency".to_string(),
                message: format!("P95 latency ({:.0}ms) exceeds target ({:.0}ms)", p95, target),
                timestamp: chrono::Utc::now().timestamp_millis(),
            });
        }

        ComponentHealth {
            name: "Latency".to_string(),
            status: HealthStatus::from_score(score),
            score,
            last_check: chrono::Utc::now().timestamp_millis(),
            details: Some(format!("Avg: {:.1}ms, P95: {}ms, Target: {}ms", avg, p95, target)),
        }
    }

    /// Check error health
    fn check_error_health(&self, metrics: &MetricsCollector, issues: &mut Vec<HealthIssue>) -> ComponentHealth {
        let error_rate = metrics.errors.error_rate;
        let score = (1.0 - error_rate * 10.0).max(0.0) as f32;

        if error_rate > 0.05 {
            issues.push(HealthIssue {
                severity: if error_rate > 0.1 { IssueSeverity::Error } else { IssueSeverity::Warning },
                component: "errors".to_string(),
                message: format!("Error rate is {:.1}%", error_rate * 100.0),
                timestamp: chrono::Utc::now().timestamp_millis(),
            });
        }

        ComponentHealth {
            name: "Error Rate".to_string(),
            status: HealthStatus::from_score(score),
            score,
            last_check: chrono::Utc::now().timestamp_millis(),
            details: Some(format!("Error rate: {:.2}%, Total errors: {}", error_rate * 100.0, metrics.errors.total_errors)),
        }
    }

    /// Check stage health
    fn check_stage_health(&self, name: &str, metrics: &StageMetrics, issues: &mut Vec<HealthIssue>) -> ComponentHealth {
        let score = metrics.success_rate as f32;

        if score < 0.95 && metrics.invocations > 100 {
            issues.push(HealthIssue {
                severity: IssueSeverity::Warning,
                component: name.to_string(),
                message: format!("Stage {} success rate: {:.1}%", name, score * 100.0),
                timestamp: chrono::Utc::now().timestamp_millis(),
            });
        }

        ComponentHealth {
            name: format!("Stage: {}", name),
            status: HealthStatus::from_score(score),
            score,
            last_check: chrono::Utc::now().timestamp_millis(),
            details: Some(format!("Invocations: {}, Avg latency: {:.1}ms", metrics.invocations, metrics.avg_latency_ms)),
        }
    }

    /// Get pipeline statistics
    pub async fn get_stats(&self) -> PipelineStats {
        let metrics = self.metrics.read().await;

        let mut stage_stats = HashMap::new();
        for (name, m) in &metrics.stages {
            stage_stats.insert(name.clone(), StageStats {
                invocations: m.invocations,
                avg_latency_ms: m.avg_latency_ms,
                error_count: m.errors,
            });
        }

        PipelineStats {
            total_requests: metrics.requests.total,
            successful_requests: metrics.requests.successful,
            failed_requests: metrics.requests.failed,
            avg_latency_ms: metrics.latency.avg_ms,
            p50_latency_ms: metrics.latency.p50_ms,
            p95_latency_ms: metrics.latency.p95_ms,
            p99_latency_ms: metrics.latency.p99_ms,
            requests_per_second: metrics.requests.rate_per_second,
            cache_hit_rate: metrics.cache.hit_rate,
            guardrail_block_rate: if metrics.requests.total > 0 {
                metrics.requests.blocked as f64 / metrics.requests.total as f64
            } else {
                0.0
            },
            stage_stats,
        }
    }

    /// Reset metrics
    pub async fn reset(&self) {
        let mut metrics = self.metrics.write().await;
        *metrics = MetricsCollector::default();

        let mut history = self.health_history.write().await;
        history.clear();
    }

    /// Enable/disable diagnostics
    pub fn set_enabled(&mut self, enabled: bool) {
        self.enabled = enabled;
    }

    /// Get health history
    pub async fn get_health_history(&self, limit: usize) -> Vec<HealthCheck> {
        let history = self.health_history.read().await;
        history.iter().rev().take(limit).cloned().collect()
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_diagnostics_engine() {
        let engine = DiagnosticsEngine::new();

        // Record some requests
        engine.record_request_start("req-1").await;
        engine.record_request_complete("req-1", true, 50).await;

        engine.record_request_start("req-2").await;
        engine.record_request_complete("req-2", true, 100).await;

        let metrics = engine.get_metrics().await;
        assert_eq!(metrics.requests.total, 2);
        assert_eq!(metrics.requests.successful, 2);
    }

    #[tokio::test]
    async fn test_health_check() {
        let engine = DiagnosticsEngine::new();

        // Record some activity
        for i in 0..10 {
            engine.record_request_start(&format!("req-{}", i)).await;
            engine.record_request_complete(&format!("req-{}", i), true, 50).await;
        }

        let health = engine.health_check().await;
        assert_eq!(health.status, HealthStatus::Healthy);
        assert!(health.score >= 0.9);
    }

    #[tokio::test]
    async fn test_error_recording() {
        let engine = DiagnosticsEngine::new();

        engine.record_request_start("req-1").await;
        engine.record_error("Timeout", "Request timed out").await;
        engine.record_request_complete("req-1", false, 200).await;

        let metrics = engine.get_metrics().await;
        assert_eq!(metrics.errors.total_errors, 1);
        assert!(metrics.errors.by_type.contains_key("Timeout"));
    }

    #[test]
    fn test_latency_percentiles() {
        let mut latency = LatencyMetrics::default();

        // Add samples
        for i in 1..=100 {
            latency.record(i as u64);
        }

        assert_eq!(latency.min_ms, 1);
        assert_eq!(latency.max_ms, 100);
        assert!(latency.avg_ms > 40.0 && latency.avg_ms < 60.0);
    }

    #[test]
    fn test_health_status_from_score() {
        assert_eq!(HealthStatus::from_score(0.95), HealthStatus::Healthy);
        assert_eq!(HealthStatus::from_score(0.8), HealthStatus::Degraded);
        assert_eq!(HealthStatus::from_score(0.5), HealthStatus::Unhealthy);
    }

    #[tokio::test]
    async fn test_cache_metrics() {
        let engine = DiagnosticsEngine::new();

        engine.record_cache_event(true).await;
        engine.record_cache_event(true).await;
        engine.record_cache_event(false).await;

        let metrics = engine.get_metrics().await;
        assert_eq!(metrics.cache.hits, 2);
        assert_eq!(metrics.cache.misses, 1);
        assert!((metrics.cache.hit_rate - 0.666).abs() < 0.01);
    }
}
