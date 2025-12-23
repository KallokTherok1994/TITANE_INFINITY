//! Healing Metrics Module
//! Tracks healing system metrics

use log::info;
use std::sync::atomic::{AtomicU64, Ordering};

/// Metrics for healing system
pub struct HealingMetrics {
    recoveries: AtomicU64,
    failures: AtomicU64,
}

impl HealingMetrics {
    pub fn new() -> Self {
        Self {
            recoveries: AtomicU64::new(0),
            failures: AtomicU64::new(0),
        }
    }

    pub fn record_recovery(&self) {
        self.recoveries.fetch_add(1, Ordering::Relaxed);
        info!("Recovery recorded");
    }

    pub fn record_failure(&self) {
        self.failures.fetch_add(1, Ordering::Relaxed);
    }

    pub fn get_stats(&self) -> (u64, u64) {
        (
            self.recoveries.load(Ordering::Relaxed),
            self.failures.load(Ordering::Relaxed),
        )
    }

    pub fn recovery_count(&self) -> u64 {
        self.recoveries.load(Ordering::Relaxed)
    }

    pub fn failure_count(&self) -> u64 {
        self.failures.load(Ordering::Relaxed)
    }

    pub fn success_rate(&self) -> f64 {
        let rec = self.recoveries.load(Ordering::Relaxed);
        let fail = self.failures.load(Ordering::Relaxed);
        let total = rec + fail;
        if total == 0 {
            1.0
        } else {
            rec as f64 / total as f64
        }
    }

    pub fn reset(&self) {
        self.recoveries.store(0, Ordering::Relaxed);
        self.failures.store(0, Ordering::Relaxed);
    }
}

impl Default for HealingMetrics {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_healing_metrics_new() {
        let metrics = HealingMetrics::new();
        let (rec, fail) = metrics.get_stats();
        assert_eq!(rec, 0);
        assert_eq!(fail, 0);
    }

    #[test]
    fn test_healing_metrics_default() {
        let metrics = HealingMetrics::default();
        let (rec, fail) = metrics.get_stats();
        assert_eq!(rec, 0);
        assert_eq!(fail, 0);
    }

    #[test]
    fn test_record_recovery() {
        let metrics = HealingMetrics::new();
        metrics.record_recovery();
        assert_eq!(metrics.recovery_count(), 1);
    }

    #[test]
    fn test_record_failure() {
        let metrics = HealingMetrics::new();
        metrics.record_failure();
        assert_eq!(metrics.failure_count(), 1);
    }

    #[test]
    fn test_record_multiple() {
        let metrics = HealingMetrics::new();

        for _ in 0..10 {
            metrics.record_recovery();
        }

        for _ in 0..5 {
            metrics.record_failure();
        }

        let (rec, fail) = metrics.get_stats();
        assert_eq!(rec, 10);
        assert_eq!(fail, 5);
    }

    #[test]
    fn test_recovery_count() {
        let metrics = HealingMetrics::new();
        metrics.record_recovery();
        metrics.record_recovery();
        metrics.record_recovery();
        assert_eq!(metrics.recovery_count(), 3);
    }

    #[test]
    fn test_failure_count() {
        let metrics = HealingMetrics::new();
        metrics.record_failure();
        metrics.record_failure();
        assert_eq!(metrics.failure_count(), 2);
    }

    #[test]
    fn test_success_rate_all_success() {
        let metrics = HealingMetrics::new();
        for _ in 0..10 {
            metrics.record_recovery();
        }
        assert_eq!(metrics.success_rate(), 1.0);
    }

    #[test]
    fn test_success_rate_all_failures() {
        let metrics = HealingMetrics::new();
        for _ in 0..10 {
            metrics.record_failure();
        }
        assert_eq!(metrics.success_rate(), 0.0);
    }

    #[test]
    fn test_success_rate_mixed() {
        let metrics = HealingMetrics::new();
        for _ in 0..3 {
            metrics.record_recovery();
        }
        for _ in 0..1 {
            metrics.record_failure();
        }
        // 3 / 4 = 0.75
        assert!((metrics.success_rate() - 0.75).abs() < 0.01);
    }

    #[test]
    fn test_success_rate_no_data() {
        let metrics = HealingMetrics::new();
        assert_eq!(metrics.success_rate(), 1.0); // Default to 100% if no data
    }

    #[test]
    fn test_reset() {
        let metrics = HealingMetrics::new();
        metrics.record_recovery();
        metrics.record_recovery();
        metrics.record_failure();

        let (rec, fail) = metrics.get_stats();
        assert_eq!(rec, 2);
        assert_eq!(fail, 1);

        metrics.reset();

        let (rec, fail) = metrics.get_stats();
        assert_eq!(rec, 0);
        assert_eq!(fail, 0);
    }

    #[test]
    fn test_thread_safety() {
        use std::sync::Arc;
        use std::thread;

        let metrics = Arc::new(HealingMetrics::new());

        let mut handles = vec![];

        for _ in 0..10 {
            let m = Arc::clone(&metrics);
            handles.push(thread::spawn(move || {
                for _ in 0..100 {
                    m.record_recovery();
                }
            }));
        }

        for _ in 0..5 {
            let m = Arc::clone(&metrics);
            handles.push(thread::spawn(move || {
                for _ in 0..100 {
                    m.record_failure();
                }
            }));
        }

        for handle in handles {
            handle
                .join()
                .expect("thread should join successfully during metrics test");
        }

        assert_eq!(metrics.recovery_count(), 1000);
        assert_eq!(metrics.failure_count(), 500);
    }

    #[test]
    fn test_get_stats() {
        let metrics = HealingMetrics::new();
        metrics.record_recovery();
        metrics.record_failure();
        metrics.record_recovery();

        let (rec, fail) = metrics.get_stats();
        assert_eq!(rec, 2);
        assert_eq!(fail, 1);
    }
}
