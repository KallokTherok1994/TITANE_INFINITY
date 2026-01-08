// ═══════════════════════════════════════════════════════════════
//   Monitoring — Performance Diagnostics
//   CPU monitoring, task queue metrics, scheduler diagnostics
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

/// CPU usage metrics (from harmonia_engine.rs)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuMetrics {
    pub current_usage_percent: f64,
    pub average_usage_percent: f64,
    pub peak_usage_percent: f64,
    pub core_count: usize,
}

/// CPU usage history for time-series display
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuHistory {
    pub samples: VecDeque<CpuSample>,
    pub max_samples: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuSample {
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub usage_percent: f64,
}

/// Task queue metrics (from performance/diagnostics.rs)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskMetrics {
    pub tasks_submitted: u64,
    pub tasks_completed: u64,
    pub tasks_failed: u64,
    pub tasks_pending: u64,
}

/// Performance diagnostics coordinator
pub struct PerformanceDiagnostics {
    cpu_metrics: CpuMetrics,
    cpu_history: CpuHistory,
    task_metrics: TaskMetrics,
}

impl PerformanceDiagnostics {
    pub fn new() -> Self {
        Self {
            cpu_metrics: CpuMetrics {
                current_usage_percent: 0.0,
                average_usage_percent: 0.0,
                peak_usage_percent: 0.0,
                core_count: std::thread::available_parallelism()
                    .map(|n| n.get())
                    .unwrap_or(1),
            },
            cpu_history: CpuHistory {
                samples: VecDeque::new(),
                max_samples: 60, // 1 minute of 1s samples
            },
            task_metrics: TaskMetrics {
                tasks_submitted: 0,
                tasks_completed: 0,
                tasks_failed: 0,
                tasks_pending: 0,
            },
        }
    }

    pub fn get_cpu_metrics(&self) -> CpuMetrics {
        self.cpu_metrics.clone()
    }

    pub fn get_cpu_history(&self) -> CpuHistory {
        self.cpu_history.clone()
    }

    pub fn get_task_metrics(&self) -> TaskMetrics {
        self.task_metrics.clone()
    }

    /// Update CPU usage (called periodically)
    pub fn update_cpu_usage(&mut self, usage_percent: f64) {
        self.cpu_metrics.current_usage_percent = usage_percent;
        self.cpu_metrics.peak_usage_percent =
            self.cpu_metrics.peak_usage_percent.max(usage_percent);

        // Add to history
        let sample = CpuSample {
            timestamp: chrono::Utc::now(),
            usage_percent,
        };
        self.cpu_history.samples.push_back(sample);

        // Trim history to max_samples
        if self.cpu_history.samples.len() > self.cpu_history.max_samples {
            self.cpu_history.samples.pop_front();
        }

        // Recalculate average
        if !self.cpu_history.samples.is_empty() {
            let sum: f64 = self.cpu_history.samples.iter().map(|s| s.usage_percent).sum();
            self.cpu_metrics.average_usage_percent = sum / self.cpu_history.samples.len() as f64;
        }
    }

    /// Record task submission
    pub fn record_task_submitted(&mut self) {
        self.task_metrics.tasks_submitted += 1;
        self.task_metrics.tasks_pending += 1;
    }

    /// Record task completion
    pub fn record_task_completed(&mut self, success: bool) {
        if success {
            self.task_metrics.tasks_completed += 1;
        } else {
            self.task_metrics.tasks_failed += 1;
        }
        self.task_metrics.tasks_pending = self.task_metrics.tasks_pending.saturating_sub(1);
    }
}

impl Default for PerformanceDiagnostics {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_performance_diagnostics_new() {
        let diag = PerformanceDiagnostics::new();
        let metrics = diag.get_cpu_metrics();
        assert_eq!(metrics.current_usage_percent, 0.0);
        assert_eq!(metrics.average_usage_percent, 0.0);
        assert!(metrics.core_count > 0);
    }

    #[test]
    fn test_update_cpu_usage() {
        let mut diag = PerformanceDiagnostics::new();

        diag.update_cpu_usage(25.0);
        diag.update_cpu_usage(50.0);
        diag.update_cpu_usage(75.0);

        let metrics = diag.get_cpu_metrics();
        assert_eq!(metrics.current_usage_percent, 75.0);
        assert_eq!(metrics.peak_usage_percent, 75.0);
        assert_eq!(metrics.average_usage_percent, 50.0); // (25+50+75)/3

        let history = diag.get_cpu_history();
        assert_eq!(history.samples.len(), 3);
    }

    #[test]
    fn test_cpu_history_limit() {
        let mut diag = PerformanceDiagnostics::new();
        diag.cpu_history.max_samples = 5;

        // Add more samples than limit
        for i in 0..10 {
            diag.update_cpu_usage(i as f64);
        }

        let history = diag.get_cpu_history();
        assert_eq!(history.samples.len(), 5);
        // Should keep only the most recent 5
        assert_eq!(history.samples[4].usage_percent, 9.0);
    }

    #[test]
    fn test_task_metrics() {
        let mut diag = PerformanceDiagnostics::new();

        diag.record_task_submitted();
        diag.record_task_submitted();
        diag.record_task_submitted();

        let metrics = diag.get_task_metrics();
        assert_eq!(metrics.tasks_submitted, 3);
        assert_eq!(metrics.tasks_pending, 3);

        diag.record_task_completed(true);
        diag.record_task_completed(false);

        let metrics = diag.get_task_metrics();
        assert_eq!(metrics.tasks_completed, 1);
        assert_eq!(metrics.tasks_failed, 1);
        assert_eq!(metrics.tasks_pending, 1);
    }

    #[test]
    fn test_task_pending_saturating_sub() {
        let mut diag = PerformanceDiagnostics::new();

        // Complete task without submitting (shouldn't panic or go negative)
        diag.record_task_completed(true);

        let metrics = diag.get_task_metrics();
        assert_eq!(metrics.tasks_pending, 0);
    }

    #[test]
    fn test_performance_diagnostics_default() {
        let diag = PerformanceDiagnostics::default();
        let metrics = diag.get_cpu_metrics();
        assert_eq!(metrics.current_usage_percent, 0.0);
    }

    #[test]
    fn test_cpu_metrics_peak_usage() {
        let mut diag = PerformanceDiagnostics::new();

        diag.update_cpu_usage(10.0);
        diag.update_cpu_usage(50.0);
        diag.update_cpu_usage(30.0);
        diag.update_cpu_usage(20.0);

        let metrics = diag.get_cpu_metrics();
        assert_eq!(metrics.peak_usage_percent, 50.0);
        assert_eq!(metrics.current_usage_percent, 20.0);
    }

    #[test]
    fn test_cpu_metrics_zero_usage() {
        let mut diag = PerformanceDiagnostics::new();
        diag.update_cpu_usage(0.0);

        let metrics = diag.get_cpu_metrics();
        assert_eq!(metrics.current_usage_percent, 0.0);
        assert_eq!(metrics.average_usage_percent, 0.0);
        assert_eq!(metrics.peak_usage_percent, 0.0);
    }

    #[test]
    fn test_cpu_metrics_high_usage() {
        let mut diag = PerformanceDiagnostics::new();
        diag.update_cpu_usage(99.9);

        let metrics = diag.get_cpu_metrics();
        assert_eq!(metrics.current_usage_percent, 99.9);
        assert_eq!(metrics.peak_usage_percent, 99.9);
    }

    #[test]
    fn test_cpu_history_empty_on_init() {
        let diag = PerformanceDiagnostics::new();
        let history = diag.get_cpu_history();
        assert_eq!(history.samples.len(), 0);
        assert_eq!(history.max_samples, 60);
    }

    #[test]
    fn test_cpu_history_single_sample() {
        let mut diag = PerformanceDiagnostics::new();
        diag.update_cpu_usage(42.0);

        let history = diag.get_cpu_history();
        assert_eq!(history.samples.len(), 1);
        assert_eq!(history.samples[0].usage_percent, 42.0);
    }

    #[test]
    fn test_cpu_history_ordering() {
        let mut diag = PerformanceDiagnostics::new();

        for i in 0..5 {
            diag.update_cpu_usage(i as f64 * 10.0);
        }

        let history = diag.get_cpu_history();
        assert_eq!(history.samples.len(), 5);

        // Verify chronological ordering
        for i in 0..history.samples.len() {
            assert_eq!(history.samples[i].usage_percent, i as f64 * 10.0);
        }
    }

    #[test]
    fn test_cpu_average_calculation() {
        let mut diag = PerformanceDiagnostics::new();

        diag.update_cpu_usage(10.0);
        diag.update_cpu_usage(20.0);
        diag.update_cpu_usage(30.0);
        diag.update_cpu_usage(40.0);

        let metrics = diag.get_cpu_metrics();
        assert_eq!(metrics.average_usage_percent, 25.0); // (10+20+30+40)/4
    }

    #[test]
    fn test_task_metrics_initial_state() {
        let diag = PerformanceDiagnostics::new();
        let metrics = diag.get_task_metrics();

        assert_eq!(metrics.tasks_submitted, 0);
        assert_eq!(metrics.tasks_completed, 0);
        assert_eq!(metrics.tasks_failed, 0);
        assert_eq!(metrics.tasks_pending, 0);
    }

    #[test]
    fn test_task_metrics_multiple_submissions() {
        let mut diag = PerformanceDiagnostics::new();

        for _ in 0..10 {
            diag.record_task_submitted();
        }

        let metrics = diag.get_task_metrics();
        assert_eq!(metrics.tasks_submitted, 10);
        assert_eq!(metrics.tasks_pending, 10);
    }

    #[test]
    fn test_task_metrics_all_successful() {
        let mut diag = PerformanceDiagnostics::new();

        for _ in 0..5 {
            diag.record_task_submitted();
        }

        for _ in 0..5 {
            diag.record_task_completed(true);
        }

        let metrics = diag.get_task_metrics();
        assert_eq!(metrics.tasks_submitted, 5);
        assert_eq!(metrics.tasks_completed, 5);
        assert_eq!(metrics.tasks_failed, 0);
        assert_eq!(metrics.tasks_pending, 0);
    }

    #[test]
    fn test_task_metrics_all_failed() {
        let mut diag = PerformanceDiagnostics::new();

        for _ in 0..5 {
            diag.record_task_submitted();
        }

        for _ in 0..5 {
            diag.record_task_completed(false);
        }

        let metrics = diag.get_task_metrics();
        assert_eq!(metrics.tasks_submitted, 5);
        assert_eq!(metrics.tasks_completed, 0);
        assert_eq!(metrics.tasks_failed, 5);
        assert_eq!(metrics.tasks_pending, 0);
    }

    #[test]
    fn test_task_metrics_mixed_outcomes() {
        let mut diag = PerformanceDiagnostics::new();

        for _ in 0..10 {
            diag.record_task_submitted();
        }

        for _ in 0..6 {
            diag.record_task_completed(true);
        }

        for _ in 0..3 {
            diag.record_task_completed(false);
        }

        let metrics = diag.get_task_metrics();
        assert_eq!(metrics.tasks_submitted, 10);
        assert_eq!(metrics.tasks_completed, 6);
        assert_eq!(metrics.tasks_failed, 3);
        assert_eq!(metrics.tasks_pending, 1); // 10 submitted - 9 completed
    }

    #[test]
    fn test_cpu_metrics_serialization() {
        let metrics = CpuMetrics {
            current_usage_percent: 42.5,
            average_usage_percent: 35.0,
            peak_usage_percent: 87.3,
            core_count: 8,
        };

        let json = serde_json::to_string(&metrics).unwrap();
        assert!(json.contains("42.5"));
        assert!(json.contains("35.0"));
        assert!(json.contains("87.3"));

        let deserialized: CpuMetrics = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.current_usage_percent, 42.5);
        assert_eq!(deserialized.core_count, 8);
    }

    #[test]
    fn test_task_metrics_serialization() {
        let metrics = TaskMetrics {
            tasks_submitted: 100,
            tasks_completed: 80,
            tasks_failed: 10,
            tasks_pending: 10,
        };

        let json = serde_json::to_string(&metrics).unwrap();
        assert!(json.contains("100"));
        assert!(json.contains("80"));

        let deserialized: TaskMetrics = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.tasks_submitted, 100);
        assert_eq!(deserialized.tasks_completed, 80);
        assert_eq!(deserialized.tasks_failed, 10);
        assert_eq!(deserialized.tasks_pending, 10);
    }

    #[test]
    fn test_cpu_history_serialization() {
        let mut history = CpuHistory {
            samples: VecDeque::new(),
            max_samples: 60,
        };

        history.samples.push_back(CpuSample {
            timestamp: chrono::Utc::now(),
            usage_percent: 25.0,
        });

        let json = serde_json::to_string(&history).unwrap();
        assert!(json.contains("25.0"));
        assert!(json.contains("60"));

        let deserialized: CpuHistory = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.max_samples, 60);
        assert_eq!(deserialized.samples.len(), 1);
    }

    #[test]
    fn test_cpu_sample_serialization() {
        let sample = CpuSample {
            timestamp: chrono::Utc::now(),
            usage_percent: 67.8,
        };

        let json = serde_json::to_string(&sample).unwrap();
        assert!(json.contains("67.8"));

        let deserialized: CpuSample = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.usage_percent, 67.8);
    }

    #[test]
    fn test_cpu_core_count_detection() {
        let diag = PerformanceDiagnostics::new();
        let metrics = diag.get_cpu_metrics();

        // Core count should be at least 1
        assert!(metrics.core_count >= 1);
    }

    #[test]
    fn test_cpu_history_max_samples_boundary() {
        let mut diag = PerformanceDiagnostics::new();
        diag.cpu_history.max_samples = 3;

        // Add exactly max_samples
        for i in 0..3 {
            diag.update_cpu_usage(i as f64);
        }

        let history = diag.get_cpu_history();
        assert_eq!(history.samples.len(), 3);

        // Add one more to trigger trimming
        diag.update_cpu_usage(99.0);

        let history = diag.get_cpu_history();
        assert_eq!(history.samples.len(), 3);
        assert_eq!(history.samples[2].usage_percent, 99.0);
        // First sample (0.0) should be removed
        assert_eq!(history.samples[0].usage_percent, 1.0);
    }
}
