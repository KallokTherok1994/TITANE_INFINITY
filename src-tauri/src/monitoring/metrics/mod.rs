// ═══════════════════════════════════════════════════════════════
//   Monitoring — Metrics Collection
//   IPC profiling, time-series metrics, aggregation
// ═══════════════════════════════════════════════════════════════

pub mod ipc_profiler;

pub use ipc_profiler::{
    get_ipc_metrics, get_ipc_summary, reset_ipc_metrics, CommandMetrics, IPCProfiler,
    ProfileGuard, ProfilerSummary,
};

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// IPC command metrics (from profiling/ipc_profiler.rs)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IpcMetrics {
    pub total_calls: u64,
    pub total_latency_ms: f64,
    pub average_latency_ms: f64,
    pub command_stats: HashMap<String, CommandStats>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandStats {
    pub call_count: u64,
    pub total_latency_ms: f64,
    pub min_latency_ms: f64,
    pub max_latency_ms: f64,
    pub avg_latency_ms: f64,
}

/// Metrics collector coordinating all metric sources
pub struct MetricsCollector {
    ipc_metrics: IpcMetrics,
    // FUTUR: Add time-series storage
    // FUTUR: Add metric registry
}

impl MetricsCollector {
    pub fn new() -> Self {
        Self {
            ipc_metrics: IpcMetrics {
                total_calls: 0,
                total_latency_ms: 0.0,
                average_latency_ms: 0.0,
                command_stats: HashMap::new(),
            },
        }
    }

    pub fn get_ipc_metrics(&self) -> IpcMetrics {
        self.ipc_metrics.clone()
    }

    /// Record IPC command execution
    pub fn record_ipc_command(&mut self, command: &str, latency_ms: f64) {
        self.ipc_metrics.total_calls += 1;
        self.ipc_metrics.total_latency_ms += latency_ms;
        self.ipc_metrics.average_latency_ms =
            self.ipc_metrics.total_latency_ms / self.ipc_metrics.total_calls as f64;

        let stats = self
            .ipc_metrics
            .command_stats
            .entry(command.to_string())
            .or_insert(CommandStats {
                call_count: 0,
                total_latency_ms: 0.0,
                min_latency_ms: f64::MAX,
                max_latency_ms: 0.0,
                avg_latency_ms: 0.0,
            });

        stats.call_count += 1;
        stats.total_latency_ms += latency_ms;
        stats.min_latency_ms = stats.min_latency_ms.min(latency_ms);
        stats.max_latency_ms = stats.max_latency_ms.max(latency_ms);
        stats.avg_latency_ms = stats.total_latency_ms / stats.call_count as f64;
    }
}

impl Default for MetricsCollector {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_metrics_collector_new() {
        let collector = MetricsCollector::new();
        let metrics = collector.get_ipc_metrics();
        assert_eq!(metrics.total_calls, 0);
        assert_eq!(metrics.average_latency_ms, 0.0);
    }

    #[test]
    fn test_record_ipc_command() {
        let mut collector = MetricsCollector::new();

        collector.record_ipc_command("test_command", 10.0);
        collector.record_ipc_command("test_command", 20.0);

        let metrics = collector.get_ipc_metrics();
        assert_eq!(metrics.total_calls, 2);
        assert_eq!(metrics.total_latency_ms, 30.0);
        assert_eq!(metrics.average_latency_ms, 15.0);

        let cmd_stats = metrics.command_stats.get("test_command").unwrap();
        assert_eq!(cmd_stats.call_count, 2);
        assert_eq!(cmd_stats.avg_latency_ms, 15.0);
        assert_eq!(cmd_stats.min_latency_ms, 10.0);
        assert_eq!(cmd_stats.max_latency_ms, 20.0);
    }

    #[test]
    fn test_multiple_commands() {
        let mut collector = MetricsCollector::new();

        collector.record_ipc_command("command_a", 5.0);
        collector.record_ipc_command("command_b", 10.0);
        collector.record_ipc_command("command_a", 15.0);

        let metrics = collector.get_ipc_metrics();
        assert_eq!(metrics.total_calls, 3);
        assert_eq!(metrics.command_stats.len(), 2);

        let cmd_a = metrics.command_stats.get("command_a").unwrap();
        assert_eq!(cmd_a.call_count, 2);
        assert_eq!(cmd_a.avg_latency_ms, 10.0);
    }
}
