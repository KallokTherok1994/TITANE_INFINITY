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
}

impl Default for HealingMetrics {
    fn default() -> Self {
        Self::new()
    }
}
