//! ═══════════════════════════════════════════════════════════════
//!   SP-GAP-003: Proactive Health Check Scheduler
//!   Schedules and orchestrates health checks across all systems
//! ═══════════════════════════════════════════════════════════════

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

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
                    Some(last) => now.duration_since(last).as_millis() as u64 >= check.config.interval_ms,
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
}
