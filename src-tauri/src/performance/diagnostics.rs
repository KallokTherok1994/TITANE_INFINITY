// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Diagnostics et métriques performance

#![allow(unused_imports)]
#![allow(dead_code)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub tasks_submitted: u64,
    pub tasks_completed: u64,
    pub tasks_failed: u64,
    pub avg_latency_ms: f32,
    pub min_latency_ms: f32,
    pub max_latency_ms: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceDiagnostics {
    pub metrics: PerformanceMetrics,
    pub queue_sizes: (usize, usize, usize, usize), // (realtime, high, normal, background)
    pub active_threads: usize,
    pub cpu_usage_percent: f32,
    pub memory_usage_mb: f32,
}

impl PerformanceDiagnostics {
    pub fn new() -> Self {
        Self {
            metrics: PerformanceMetrics {
                tasks_submitted: 0,
                tasks_completed: 0,
                tasks_failed: 0,
                avg_latency_ms: 0.0,
                min_latency_ms: f32::MAX,
                max_latency_ms: 0.0,
            },
            queue_sizes: (0, 0, 0, 0),
            active_threads: 0,
            cpu_usage_percent: 0.0,
            memory_usage_mb: 0.0,
        }
    }

    pub fn increment_submitted(&mut self) {
        self.metrics.tasks_submitted += 1;
    }

    pub fn increment_completed(&mut self, latency_ms: f32) {
        self.metrics.tasks_completed += 1;

        // Update latencies
        if latency_ms < self.metrics.min_latency_ms {
            self.metrics.min_latency_ms = latency_ms;
        }
        if latency_ms > self.metrics.max_latency_ms {
            self.metrics.max_latency_ms = latency_ms;
        }

        // Running average
        let total_tasks = self.metrics.tasks_completed as f32;
        self.metrics.avg_latency_ms =
            (self.metrics.avg_latency_ms * (total_tasks - 1.0) + latency_ms) / total_tasks;
    }

    pub fn increment_failed(&mut self) {
        self.metrics.tasks_failed += 1;
    }

    pub fn update_queue_sizes(&mut self, sizes: (usize, usize, usize, usize)) {
        self.queue_sizes = sizes;
    }

    pub fn update_system_metrics(&mut self, cpu: f32, memory: f32, threads: usize) {
        self.cpu_usage_percent = cpu;
        self.memory_usage_mb = memory;
        self.active_threads = threads;
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
    fn test_diagnostics_creation() {
        let diag = PerformanceDiagnostics::new();
        assert_eq!(diag.metrics.tasks_submitted, 0);
        assert_eq!(diag.metrics.tasks_completed, 0);
    }

    #[test]
    fn test_increment_submitted() {
        let mut diag = PerformanceDiagnostics::new();
        diag.increment_submitted();
        diag.increment_submitted();
        assert_eq!(diag.metrics.tasks_submitted, 2);
    }

    #[test]
    fn test_latency_tracking() {
        let mut diag = PerformanceDiagnostics::new();

        diag.increment_completed(100.0);
        assert_eq!(diag.metrics.avg_latency_ms, 100.0);
        assert_eq!(diag.metrics.min_latency_ms, 100.0);
        assert_eq!(diag.metrics.max_latency_ms, 100.0);

        diag.increment_completed(200.0);
        assert_eq!(diag.metrics.avg_latency_ms, 150.0); // (100 + 200) / 2
        assert_eq!(diag.metrics.min_latency_ms, 100.0);
        assert_eq!(diag.metrics.max_latency_ms, 200.0);

        diag.increment_completed(50.0);
        assert_eq!(diag.metrics.min_latency_ms, 50.0);
    }

    #[test]
    fn test_update_queue_sizes() {
        let mut diag = PerformanceDiagnostics::new();
        diag.update_queue_sizes((1, 2, 3, 4));
        assert_eq!(diag.queue_sizes, (1, 2, 3, 4));
    }
}
