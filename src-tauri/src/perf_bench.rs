// Track A: Profiling Framework for Phase 4 Sprint 3
// Purpose: Measure performance baseline and optimization impact
// Created: 2026-01-19 Sprint Launch

use std::time::{Duration, Instant};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct PerfMetric {
    pub name: String,
    pub duration: Duration,
    pub memory_mb: f64,
    pub timestamp: Instant,
}

pub struct PerfBench {
    metrics: HashMap<String, Vec<PerfMetric>>,
    baseline_captured: bool,
}

impl PerfBench {
    pub fn new() -> Self {
        PerfBench {
            metrics: HashMap::new(),
            baseline_captured: false,
        }
    }

    /// Record a performance metric
    pub fn record(&mut self, name: &str, duration: Duration, memory_mb: f64) {
        let metric = PerfMetric {
            name: name.to_string(),
            duration,
            memory_mb,
            timestamp: Instant::now(),
        };

        self.metrics
            .entry(name.to_string())
            .or_insert_with(Vec::new)
            .push(metric);
    }

    /// Get baseline metrics for a specific operation
    pub fn baseline(&self, name: &str) -> Option<&[PerfMetric]> {
        self.metrics.get(name).map(|v| v.as_slice())
    }

    /// Generate profiling report
    pub fn report(&self) -> String {
        let mut output = String::from("=== PERFORMANCE PROFILING REPORT ===\n\n");

        for (name, metrics) in &self.metrics {
            if metrics.is_empty() {
                continue;
            }

            let avg_duration = metrics
                .iter()
                .map(|m| m.duration.as_secs_f64())
                .sum::<f64>()
                / metrics.len() as f64;

            let avg_memory = metrics.iter().map(|m| m.memory_mb).sum::<f64>() / metrics.len() as f64;

            output.push_str(&format!(
                "{}: avg={:.3}ms, memory={:.2}MB, samples={}\n",
                name,
                avg_duration * 1000.0,
                avg_memory,
                metrics.len()
            ));
        }

        output
    }

    /// Mark baseline as captured
    pub fn mark_baseline_captured(&mut self) {
        self.baseline_captured = true;
    }

    pub fn is_baseline_captured(&self) -> bool {
        self.baseline_captured
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_perf_bench_record() {
        let mut bench = PerfBench::new();
        bench.record("test_op", Duration::from_millis(100), 50.5);

        assert_eq!(bench.metrics.len(), 1);
        assert!(bench.baseline("test_op").is_some());
    }

    #[test]
    fn test_perf_bench_report() {
        let mut bench = PerfBench::new();
        bench.record("operation", Duration::from_millis(50), 25.0);
        bench.record("operation", Duration::from_millis(60), 26.0);

        let report = bench.report();
        assert!(report.contains("operation"));
        assert!(report.contains("55.000ms"));
    }
}

// BASELINE METRICS CAPTURE (Week 1, Day 1)
// Run: cargo test -- --nocapture perf_bench
// Expected: Establish baseline for all critical operations
pub fn capture_baseline() {
    let bench = PerfBench::new();

    // Will be populated with real measurements
    println!("📊 Baseline metrics framework ready for Week 1 measurements");
    println!("{}", bench.report());
}
