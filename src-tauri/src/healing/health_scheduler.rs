//! ═══════════════════════════════════════════════════════════════
//!   SP-GAP-003: Proactive Health Check Scheduler
//!   Schedules and orchestrates health checks across all systems
//! ═══════════════════════════════════════════════════════════════

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Instant, SystemTime, UNIX_EPOCH};

/// Health check priority levels
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum HealthCheckPriority {
    Critical = 0,
    High = 1,
    Medium = 2,
    Low = 3,
}

/// Health check configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheckConfig {
    pub id: String,
    pub name: String,
    pub priority: HealthCheckPriority,
    pub interval_ms: u64,
    pub timeout_ms: u64,
    pub retry_count: u32,
    pub enabled: bool,
}

/// Health check status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum HealthStatus {
    Healthy,
    Degraded,
    Unhealthy,
    Unknown,
    Checking,
}

/// Result of a health check
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheckResult {
    pub check_id: String,
    pub status: HealthStatus,
    pub message: Option<String>,
    pub duration_ms: u64,
    pub timestamp: u64,
    pub retry_count: u32,
    pub details: HashMap<String, String>,
}

/// Scheduled health check state
#[derive(Debug)]
pub struct ScheduledCheck {
    pub config: HealthCheckConfig,
    pub last_run: Option<Instant>,
    pub last_result: Option<HealthCheckResult>,
    pub consecutive_failures: u32,
    pub is_running: AtomicBool,
}

/// Health Check Scheduler
pub struct HealthScheduler {
    checks: Arc<RwLock<HashMap<String, ScheduledCheck>>>,
    results_history: Arc<RwLock<Vec<HealthCheckResult>>>,
    max_history_size: usize,
    stats: SchedulerStats,
    running: AtomicBool,
}

#[derive(Debug, Default)]
pub struct SchedulerStats {
    pub checks_scheduled: AtomicU64,
    pub checks_completed: AtomicU64,
    pub checks_failed: AtomicU64,
    pub checks_timed_out: AtomicU64,
}

impl HealthScheduler {
    pub fn new(max_history_size: usize) -> Self {
        Self {
            checks: Arc::new(RwLock::new(HashMap::new())),
            results_history: Arc::new(RwLock::new(Vec::new())),
            max_history_size,
            stats: SchedulerStats::default(),
            running: AtomicBool::new(false),
        }
    }

    /// Register a health check
    pub fn register_check(&self, config: HealthCheckConfig) {
        let scheduled = ScheduledCheck {
            config: config.clone(),
            last_run: None,
            last_result: None,
            consecutive_failures: 0,
            is_running: AtomicBool::new(false),
        };

        self.checks.write().insert(config.id.clone(), scheduled);
        self.stats.checks_scheduled.fetch_add(1, Ordering::Relaxed);
    }

    /// Unregister a health check
    pub fn unregister_check(&self, check_id: &str) -> bool {
        self.checks.write().remove(check_id).is_some()
    }

    /// Get checks that are due to run
    pub fn get_due_checks(&self) -> Vec<String> {
        let checks = self.checks.read();
        let now = Instant::now();

        checks
            .iter()
            .filter(|(_, check)| {
                if !check.config.enabled {
                    return false;
                }
                if check.is_running.load(Ordering::Relaxed) {
                    return false;
                }
                match check.last_run {
                    None => true,
                    Some(last) => {
                        now.duration_since(last).as_millis() as u64 >= check.config.interval_ms
                    }
                }
            })
            .map(|(id, _)| id.clone())
            .collect()
    }

    /// Record a health check result
    pub fn record_result(&self, result: HealthCheckResult) {
        let mut checks = self.checks.write();

        if let Some(check) = checks.get_mut(&result.check_id) {
            check.last_run = Some(Instant::now());
            check.is_running.store(false, Ordering::Relaxed);

            if result.status == HealthStatus::Healthy {
                check.consecutive_failures = 0;
                self.stats.checks_completed.fetch_add(1, Ordering::Relaxed);
            } else {
                check.consecutive_failures += 1;
                self.stats.checks_failed.fetch_add(1, Ordering::Relaxed);
            }

            check.last_result = Some(result.clone());
        }

        // Add to history
        let mut history = self.results_history.write();
        history.push(result);
        while history.len() > self.max_history_size {
            history.remove(0);
        }
    }

    /// Mark a check as running
    pub fn mark_running(&self, check_id: &str) -> bool {
        let checks = self.checks.read();
        if let Some(check) = checks.get(check_id) {
            check
                .is_running
                .compare_exchange(false, true, Ordering::SeqCst, Ordering::Relaxed)
                .is_ok()
        } else {
            false
        }
    }

    /// Get current health status for all checks
    pub fn get_health_summary(&self) -> HealthSummary {
        let checks = self.checks.read();

        let mut healthy = 0;
        let mut degraded = 0;
        let mut unhealthy = 0;
        let mut unknown = 0;
        let mut check_statuses = HashMap::new();

        for (id, check) in checks.iter() {
            let status = check
                .last_result
                .as_ref()
                .map(|r| r.status.clone())
                .unwrap_or(HealthStatus::Unknown);

            match &status {
                HealthStatus::Healthy => healthy += 1,
                HealthStatus::Degraded => degraded += 1,
                HealthStatus::Unhealthy => unhealthy += 1,
                _ => unknown += 1,
            }

            check_statuses.insert(id.clone(), status);
        }

        let overall = if unhealthy > 0 {
            HealthStatus::Unhealthy
        } else if degraded > 0 {
            HealthStatus::Degraded
        } else if unknown > 0 && healthy == 0 {
            HealthStatus::Unknown
        } else {
            HealthStatus::Healthy
        };

        HealthSummary {
            overall_status: overall,
            healthy_count: healthy,
            degraded_count: degraded,
            unhealthy_count: unhealthy,
            unknown_count: unknown,
            check_statuses,
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        }
    }

    /// Get recent check results
    pub fn get_recent_results(&self, limit: usize) -> Vec<HealthCheckResult> {
        let history = self.results_history.read();
        history.iter().rev().take(limit).cloned().collect()
    }

    /// Get statistics
    pub fn stats(&self) -> SchedulerStatsSnapshot {
        SchedulerStatsSnapshot {
            checks_scheduled: self.stats.checks_scheduled.load(Ordering::Relaxed),
            checks_completed: self.stats.checks_completed.load(Ordering::Relaxed),
            checks_failed: self.stats.checks_failed.load(Ordering::Relaxed),
            checks_timed_out: self.stats.checks_timed_out.load(Ordering::Relaxed),
            registered_checks: self.checks.read().len(),
            history_size: self.results_history.read().len(),
        }
    }

    /// Start the scheduler
    pub fn start(&self) {
        self.running.store(true, Ordering::SeqCst);
    }

    /// Stop the scheduler
    pub fn stop(&self) {
        self.running.store(false, Ordering::SeqCst);
    }

    /// Check if scheduler is running
    pub fn is_running(&self) -> bool {
        self.running.load(Ordering::Relaxed)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthSummary {
    pub overall_status: HealthStatus,
    pub healthy_count: usize,
    pub degraded_count: usize,
    pub unhealthy_count: usize,
    pub unknown_count: usize,
    pub check_statuses: HashMap<String, HealthStatus>,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchedulerStatsSnapshot {
    pub checks_scheduled: u64,
    pub checks_completed: u64,
    pub checks_failed: u64,
    pub checks_timed_out: u64,
    pub registered_checks: usize,
    pub history_size: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_register_check() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "test".to_string(),
            name: "Test Check".to_string(),
            priority: HealthCheckPriority::High,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 3,
            enabled: true,
        });

        let stats = scheduler.stats();
        assert_eq!(stats.registered_checks, 1);
    }

    #[test]
    fn test_due_checks() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "test".to_string(),
            name: "Test Check".to_string(),
            priority: HealthCheckPriority::High,
            interval_ms: 0, // Due immediately
            timeout_ms: 500,
            retry_count: 3,
            enabled: true,
        });

        let due = scheduler.get_due_checks();
        assert_eq!(due.len(), 1);
        assert_eq!(due[0], "test");
    }

    #[test]
    fn test_unregister_check() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "to_remove".to_string(),
            name: "Check to Remove".to_string(),
            priority: HealthCheckPriority::Low,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 1,
            enabled: true,
        });

        assert_eq!(scheduler.stats().registered_checks, 1);
        assert!(scheduler.unregister_check("to_remove"));
        assert_eq!(scheduler.stats().registered_checks, 0);
        assert!(!scheduler.unregister_check("nonexistent"));
    }

    #[test]
    fn test_disabled_check_not_due() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "disabled".to_string(),
            name: "Disabled Check".to_string(),
            priority: HealthCheckPriority::Medium,
            interval_ms: 0,
            timeout_ms: 500,
            retry_count: 3,
            enabled: false, // Disabled
        });

        let due = scheduler.get_due_checks();
        assert!(due.is_empty());
    }

    #[test]
    fn test_record_healthy_result() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "health_check".to_string(),
            name: "Health Check".to_string(),
            priority: HealthCheckPriority::High,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 3,
            enabled: true,
        });

        let result = HealthCheckResult {
            check_id: "health_check".to_string(),
            status: HealthStatus::Healthy,
            message: Some("All good".to_string()),
            duration_ms: 50,
            timestamp: 12345,
            retry_count: 0,
            details: HashMap::new(),
        };

        scheduler.record_result(result);

        let stats = scheduler.stats();
        assert_eq!(stats.checks_completed, 1);
        assert_eq!(stats.checks_failed, 0);
    }

    #[test]
    fn test_record_unhealthy_result() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "failing_check".to_string(),
            name: "Failing Check".to_string(),
            priority: HealthCheckPriority::Critical,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 3,
            enabled: true,
        });

        let result = HealthCheckResult {
            check_id: "failing_check".to_string(),
            status: HealthStatus::Unhealthy,
            message: Some("Connection failed".to_string()),
            duration_ms: 100,
            timestamp: 12345,
            retry_count: 1,
            details: HashMap::new(),
        };

        scheduler.record_result(result);

        let stats = scheduler.stats();
        assert_eq!(stats.checks_failed, 1);
    }

    #[test]
    fn test_health_summary_all_healthy() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "check1".to_string(),
            name: "Check 1".to_string(),
            priority: HealthCheckPriority::High,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 3,
            enabled: true,
        });

        scheduler.record_result(HealthCheckResult {
            check_id: "check1".to_string(),
            status: HealthStatus::Healthy,
            message: None,
            duration_ms: 10,
            timestamp: 12345,
            retry_count: 0,
            details: HashMap::new(),
        });

        let summary = scheduler.get_health_summary();
        assert_eq!(summary.overall_status, HealthStatus::Healthy);
        assert_eq!(summary.healthy_count, 1);
    }

    #[test]
    fn test_health_summary_with_unhealthy() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "check1".to_string(),
            name: "Check 1".to_string(),
            priority: HealthCheckPriority::High,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 3,
            enabled: true,
        });

        scheduler.record_result(HealthCheckResult {
            check_id: "check1".to_string(),
            status: HealthStatus::Unhealthy,
            message: None,
            duration_ms: 10,
            timestamp: 12345,
            retry_count: 0,
            details: HashMap::new(),
        });

        let summary = scheduler.get_health_summary();
        assert_eq!(summary.overall_status, HealthStatus::Unhealthy);
        assert_eq!(summary.unhealthy_count, 1);
    }

    #[test]
    fn test_start_stop_scheduler() {
        let scheduler = HealthScheduler::new(100);

        assert!(!scheduler.is_running());
        scheduler.start();
        assert!(scheduler.is_running());
        scheduler.stop();
        assert!(!scheduler.is_running());
    }

    #[test]
    fn test_mark_running() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "concurrent".to_string(),
            name: "Concurrent Check".to_string(),
            priority: HealthCheckPriority::High,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 3,
            enabled: true,
        });

        // First mark should succeed
        assert!(scheduler.mark_running("concurrent"));
        // Second mark should fail (already running)
        assert!(!scheduler.mark_running("concurrent"));
        // Nonexistent check should fail
        assert!(!scheduler.mark_running("nonexistent"));
    }

    #[test]
    fn test_priority_ordering() {
        assert!(HealthCheckPriority::Critical < HealthCheckPriority::High);
        assert!(HealthCheckPriority::High < HealthCheckPriority::Medium);
        assert!(HealthCheckPriority::Medium < HealthCheckPriority::Low);
    }

    #[test]
    fn test_recent_results() {
        let scheduler = HealthScheduler::new(5); // Small history

        scheduler.register_check(HealthCheckConfig {
            id: "history_test".to_string(),
            name: "History Test".to_string(),
            priority: HealthCheckPriority::Low,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 1,
            enabled: true,
        });

        // Add multiple results
        for i in 0..7 {
            scheduler.record_result(HealthCheckResult {
                check_id: "history_test".to_string(),
                status: HealthStatus::Healthy,
                message: Some(format!("Result {}", i)),
                duration_ms: 10,
                timestamp: i as u64,
                retry_count: 0,
                details: HashMap::new(),
            });
        }

        let recent = scheduler.get_recent_results(3);
        assert_eq!(recent.len(), 3);
        // Should be most recent first
        assert_eq!(recent[0].timestamp, 6);
    }

    #[test]
    fn test_health_check_priority_equality() {
        assert_eq!(HealthCheckPriority::Critical, HealthCheckPriority::Critical);
        assert_eq!(HealthCheckPriority::High, HealthCheckPriority::High);
        assert_eq!(HealthCheckPriority::Medium, HealthCheckPriority::Medium);
        assert_eq!(HealthCheckPriority::Low, HealthCheckPriority::Low);
    }

    #[test]
    fn test_health_check_priority_hash() {
        use std::collections::HashSet;
        let mut set = HashSet::new();
        set.insert(HealthCheckPriority::Critical);
        set.insert(HealthCheckPriority::High);
        set.insert(HealthCheckPriority::Medium);
        set.insert(HealthCheckPriority::Low);
        assert_eq!(set.len(), 4);
    }

    #[test]
    fn test_health_check_priority_clone() {
        let priority = HealthCheckPriority::Critical;
        let cloned = priority.clone();
        assert_eq!(priority, cloned);
    }

    #[test]
    fn test_health_check_config_clone() {
        let config = HealthCheckConfig {
            id: "clone_test".to_string(),
            name: "Clone Test".to_string(),
            priority: HealthCheckPriority::High,
            interval_ms: 5000,
            timeout_ms: 1000,
            retry_count: 5,
            enabled: true,
        };

        let cloned = config.clone();
        assert_eq!(cloned.id, "clone_test");
        assert_eq!(cloned.retry_count, 5);
    }

    #[test]
    fn test_health_status_equality() {
        assert_eq!(HealthStatus::Healthy, HealthStatus::Healthy);
        assert_eq!(HealthStatus::Degraded, HealthStatus::Degraded);
        assert_eq!(HealthStatus::Unhealthy, HealthStatus::Unhealthy);
        assert_eq!(HealthStatus::Unknown, HealthStatus::Unknown);
        assert_eq!(HealthStatus::Checking, HealthStatus::Checking);
    }

    #[test]
    fn test_health_status_clone() {
        let status = HealthStatus::Degraded;
        let cloned = status.clone();
        assert_eq!(status, cloned);
    }

    #[test]
    fn test_health_check_result_clone() {
        let mut details = HashMap::new();
        details.insert("key".to_string(), "value".to_string());

        let result = HealthCheckResult {
            check_id: "result_test".to_string(),
            status: HealthStatus::Healthy,
            message: Some("Test message".to_string()),
            duration_ms: 50,
            timestamp: 12345,
            retry_count: 2,
            details,
        };

        let cloned = result.clone();
        assert_eq!(cloned.check_id, "result_test");
        assert_eq!(cloned.duration_ms, 50);
        assert_eq!(cloned.details.get("key").unwrap(), "value");
    }

    #[test]
    fn test_health_check_result_no_message() {
        let result = HealthCheckResult {
            check_id: "no_msg".to_string(),
            status: HealthStatus::Unknown,
            message: None,
            duration_ms: 0,
            timestamp: 0,
            retry_count: 0,
            details: HashMap::new(),
        };

        assert!(result.message.is_none());
        assert!(result.details.is_empty());
    }

    #[test]
    fn test_health_summary_clone() {
        let mut check_statuses = HashMap::new();
        check_statuses.insert("check1".to_string(), HealthStatus::Healthy);

        let summary = HealthSummary {
            overall_status: HealthStatus::Healthy,
            healthy_count: 1,
            degraded_count: 0,
            unhealthy_count: 0,
            unknown_count: 0,
            check_statuses,
            timestamp: 9999,
        };

        let cloned = summary.clone();
        assert_eq!(cloned.healthy_count, 1);
        assert_eq!(cloned.timestamp, 9999);
    }

    #[test]
    fn test_scheduler_stats_snapshot_clone() {
        let snapshot = SchedulerStatsSnapshot {
            checks_scheduled: 10,
            checks_completed: 8,
            checks_failed: 2,
            checks_timed_out: 0,
            registered_checks: 5,
            history_size: 100,
        };

        let cloned = snapshot.clone();
        assert_eq!(cloned.checks_scheduled, 10);
        assert_eq!(cloned.checks_completed, 8);
    }

    #[test]
    fn test_scheduler_stats_default() {
        let stats = SchedulerStats::default();
        assert_eq!(stats.checks_scheduled.load(Ordering::Relaxed), 0);
        assert_eq!(stats.checks_completed.load(Ordering::Relaxed), 0);
    }

    #[test]
    fn test_health_summary_mixed_status() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "healthy".to_string(),
            name: "Healthy".to_string(),
            priority: HealthCheckPriority::High,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 1,
            enabled: true,
        });

        scheduler.register_check(HealthCheckConfig {
            id: "degraded".to_string(),
            name: "Degraded".to_string(),
            priority: HealthCheckPriority::High,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 1,
            enabled: true,
        });

        scheduler.record_result(HealthCheckResult {
            check_id: "healthy".to_string(),
            status: HealthStatus::Healthy,
            message: None,
            duration_ms: 10,
            timestamp: 0,
            retry_count: 0,
            details: HashMap::new(),
        });

        scheduler.record_result(HealthCheckResult {
            check_id: "degraded".to_string(),
            status: HealthStatus::Degraded,
            message: None,
            duration_ms: 10,
            timestamp: 0,
            retry_count: 0,
            details: HashMap::new(),
        });

        let summary = scheduler.get_health_summary();
        assert_eq!(summary.overall_status, HealthStatus::Degraded);
        assert_eq!(summary.healthy_count, 1);
        assert_eq!(summary.degraded_count, 1);
    }

    #[test]
    fn test_health_summary_unknown_only() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "unknown".to_string(),
            name: "Unknown".to_string(),
            priority: HealthCheckPriority::Low,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 1,
            enabled: true,
        });

        // No results recorded, so status is unknown
        let summary = scheduler.get_health_summary();
        assert_eq!(summary.overall_status, HealthStatus::Unknown);
        assert_eq!(summary.unknown_count, 1);
    }

    #[test]
    fn test_consecutive_failures() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "failing".to_string(),
            name: "Failing".to_string(),
            priority: HealthCheckPriority::Critical,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 3,
            enabled: true,
        });

        // Record multiple failures
        for _ in 0..3 {
            scheduler.record_result(HealthCheckResult {
                check_id: "failing".to_string(),
                status: HealthStatus::Unhealthy,
                message: None,
                duration_ms: 100,
                timestamp: 0,
                retry_count: 0,
                details: HashMap::new(),
            });
        }

        let stats = scheduler.stats();
        assert_eq!(stats.checks_failed, 3);
    }

    #[test]
    fn test_failure_reset_on_healthy() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "recovery".to_string(),
            name: "Recovery".to_string(),
            priority: HealthCheckPriority::High,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 3,
            enabled: true,
        });

        // First fail
        scheduler.record_result(HealthCheckResult {
            check_id: "recovery".to_string(),
            status: HealthStatus::Unhealthy,
            message: None,
            duration_ms: 100,
            timestamp: 0,
            retry_count: 0,
            details: HashMap::new(),
        });

        // Then succeed
        scheduler.record_result(HealthCheckResult {
            check_id: "recovery".to_string(),
            status: HealthStatus::Healthy,
            message: None,
            duration_ms: 10,
            timestamp: 1,
            retry_count: 0,
            details: HashMap::new(),
        });

        let summary = scheduler.get_health_summary();
        assert_eq!(summary.overall_status, HealthStatus::Healthy);
    }

    #[test]
    fn test_history_size_limit() {
        let scheduler = HealthScheduler::new(3); // Very small history

        scheduler.register_check(HealthCheckConfig {
            id: "history".to_string(),
            name: "History".to_string(),
            priority: HealthCheckPriority::Low,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 1,
            enabled: true,
        });

        // Add 5 results
        for i in 0..5 {
            scheduler.record_result(HealthCheckResult {
                check_id: "history".to_string(),
                status: HealthStatus::Healthy,
                message: None,
                duration_ms: 10,
                timestamp: i as u64,
                retry_count: 0,
                details: HashMap::new(),
            });
        }

        let stats = scheduler.stats();
        assert_eq!(stats.history_size, 3); // Capped at max_history_size
    }

    #[test]
    fn test_get_recent_results_more_than_available() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "few".to_string(),
            name: "Few".to_string(),
            priority: HealthCheckPriority::Low,
            interval_ms: 1000,
            timeout_ms: 500,
            retry_count: 1,
            enabled: true,
        });

        scheduler.record_result(HealthCheckResult {
            check_id: "few".to_string(),
            status: HealthStatus::Healthy,
            message: None,
            duration_ms: 10,
            timestamp: 0,
            retry_count: 0,
            details: HashMap::new(),
        });

        let recent = scheduler.get_recent_results(10);
        assert_eq!(recent.len(), 1); // Only 1 available
    }

    #[test]
    fn test_register_multiple_checks() {
        let scheduler = HealthScheduler::new(100);

        for i in 0..5 {
            scheduler.register_check(HealthCheckConfig {
                id: format!("check_{}", i),
                name: format!("Check {}", i),
                priority: HealthCheckPriority::Medium,
                interval_ms: 1000,
                timeout_ms: 500,
                retry_count: 1,
                enabled: true,
            });
        }

        let stats = scheduler.stats();
        assert_eq!(stats.registered_checks, 5);
        assert_eq!(stats.checks_scheduled, 5);
    }

    #[test]
    fn test_check_config_all_fields() {
        let config = HealthCheckConfig {
            id: "full".to_string(),
            name: "Full Config".to_string(),
            priority: HealthCheckPriority::Critical,
            interval_ms: 60000,
            timeout_ms: 5000,
            retry_count: 10,
            enabled: false,
        };

        assert_eq!(config.id, "full");
        assert_eq!(config.name, "Full Config");
        assert_eq!(config.priority, HealthCheckPriority::Critical);
        assert_eq!(config.interval_ms, 60000);
        assert_eq!(config.timeout_ms, 5000);
        assert_eq!(config.retry_count, 10);
        assert!(!config.enabled);
    }

    #[test]
    fn test_health_result_with_details() {
        let mut details = HashMap::new();
        details.insert("response_time".to_string(), "45ms".to_string());
        details.insert("endpoint".to_string(), "/health".to_string());
        details.insert("code".to_string(), "200".to_string());

        let result = HealthCheckResult {
            check_id: "detailed".to_string(),
            status: HealthStatus::Healthy,
            message: Some("All endpoints responding".to_string()),
            duration_ms: 45,
            timestamp: 12345,
            retry_count: 0,
            details,
        };

        assert_eq!(result.details.len(), 3);
        assert_eq!(result.details.get("code").unwrap(), "200");
    }

    #[test]
    fn test_scheduler_empty_state() {
        let scheduler = HealthScheduler::new(100);

        let summary = scheduler.get_health_summary();
        assert_eq!(summary.overall_status, HealthStatus::Healthy);
        assert_eq!(summary.healthy_count, 0);

        let recent = scheduler.get_recent_results(10);
        assert!(recent.is_empty());

        let due = scheduler.get_due_checks();
        assert!(due.is_empty());
    }

    #[test]
    fn test_running_check_not_due() {
        let scheduler = HealthScheduler::new(100);

        scheduler.register_check(HealthCheckConfig {
            id: "running".to_string(),
            name: "Running".to_string(),
            priority: HealthCheckPriority::High,
            interval_ms: 0, // Due immediately
            timeout_ms: 500,
            retry_count: 1,
            enabled: true,
        });

        // Check is due initially
        assert_eq!(scheduler.get_due_checks().len(), 1);

        // Mark as running
        scheduler.mark_running("running");

        // Now not due because it's running
        assert!(scheduler.get_due_checks().is_empty());
    }

    #[test]
    fn test_health_status_debug() {
        let status = HealthStatus::Checking;
        let debug_str = format!("{:?}", status);
        assert!(debug_str.contains("Checking"));
    }

    #[test]
    fn test_scheduler_stats_snapshot_debug() {
        let snapshot = SchedulerStatsSnapshot {
            checks_scheduled: 100,
            checks_completed: 95,
            checks_failed: 5,
            checks_timed_out: 1,
            registered_checks: 10,
            history_size: 500,
        };

        let debug_str = format!("{:?}", snapshot);
        assert!(debug_str.contains("100"));
        assert!(debug_str.contains("95"));
    }
}
