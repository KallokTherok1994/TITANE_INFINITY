// ═══════════════════════════════════════════════════════════════
//   Monitoring — IPC Performance Profiler
//   Measure and track IPC latency for all Tauri commands
//   Moved from profiling/ module (v27.0.0)
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Instant;

// Type alias for complex profiler storage type
type ProfilerStorage = Arc<Mutex<HashMap<String, Vec<ExecutionRecord>>>>;

/// IPC Command performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandMetrics {
    pub command_name: String,
    pub count: u64,
    pub total_duration_ms: u64,
    pub min_duration_ms: u64,
    pub max_duration_ms: u64,
    pub avg_duration_ms: f64,
    pub p50_duration_ms: u64,
    pub p95_duration_ms: u64,
    pub p99_duration_ms: u64,
    pub last_execution_ms: u64,
}

/// Individual command execution record
#[derive(Debug, Clone)]
struct ExecutionRecord {
    duration_ms: u64,
    timestamp: u64,
}

/// IPC Performance Profiler
pub struct IPCProfiler {
    enabled: bool,
    records: Arc<Mutex<HashMap<String, Vec<ExecutionRecord>>>>,
}

impl IPCProfiler {
    /// Create new profiler (enabled by default in dev mode)
    pub fn new(enabled: bool) -> Self {
        Self {
            enabled,
            records: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Start profiling a command
    pub fn start(&self, command_name: &str) -> ProfileGuard {
        ProfileGuard {
            command_name: command_name.to_string(),
            start_time: Instant::now(),
            profiler: if self.enabled {
                Some(Arc::clone(&self.records))
            } else {
                None
            },
        }
    }

    /// Get metrics for a specific command
    pub fn get_command_metrics(&self, command_name: &str) -> Option<CommandMetrics> {
        if !self.enabled {
            return None;
        }

        let records = self.records.lock().ok()?;
        let executions = records.get(command_name)?;

        if executions.is_empty() {
            return None;
        }

        let mut durations: Vec<u64> = executions.iter().map(|r| r.duration_ms).collect();
        durations.sort_unstable();

        let count = durations.len() as u64;
        let total: u64 = durations.iter().sum();
        let min = durations.first().copied().unwrap_or(0);
        let max = durations.last().copied().unwrap_or(0);
        let avg = total as f64 / count as f64;

        let p50_idx = (count as f64 * 0.50) as usize;
        let p95_idx = (count as f64 * 0.95) as usize;
        let p99_idx = (count as f64 * 0.99) as usize;

        let p50 = durations
            .get(p50_idx.saturating_sub(1))
            .copied()
            .unwrap_or(0);
        let p95 = durations
            .get(p95_idx.saturating_sub(1))
            .copied()
            .unwrap_or(max);
        let p99 = durations
            .get(p99_idx.saturating_sub(1))
            .copied()
            .unwrap_or(max);

        let last = executions.last().map(|r| r.duration_ms).unwrap_or(0);

        Some(CommandMetrics {
            command_name: command_name.to_string(),
            count,
            total_duration_ms: total,
            min_duration_ms: min,
            max_duration_ms: max,
            avg_duration_ms: avg,
            p50_duration_ms: p50,
            p95_duration_ms: p95,
            p99_duration_ms: p99,
            last_execution_ms: last,
        })
    }

    /// Get metrics for all commands
    pub fn get_all_metrics(&self) -> Vec<CommandMetrics> {
        if !self.enabled {
            return vec![];
        }

        // Avoid deadlock: `get_command_metrics()` also locks `self.records`.
        // We must not hold the mutex while calling it.
        let command_names: Vec<String> = {
            let records = match self.records.lock().ok() {
                Some(r) => r,
                None => return vec![],
            };
            records.keys().cloned().collect()
        };

        let mut metrics = vec![];
        for command_name in command_names {
            if let Some(m) = self.get_command_metrics(&command_name) {
                metrics.push(m);
            }
        }

        // Sort by total duration (most expensive commands first)
        metrics.sort_by(|a, b| b.total_duration_ms.cmp(&a.total_duration_ms));
        metrics
    }

    /// Get summary statistics
    pub fn get_summary(&self) -> ProfilerSummary {
        let metrics = self.get_all_metrics();

        let total_commands = metrics.len();
        let total_executions: u64 = metrics.iter().map(|m| m.count).sum();
        let total_time_ms: u64 = metrics.iter().map(|m| m.total_duration_ms).sum();

        let avg_latency = if total_executions > 0 {
            total_time_ms as f64 / total_executions as f64
        } else {
            0.0
        };

        // Find slowest commands (by p95)
        let mut sorted_by_p95 = metrics.clone();
        sorted_by_p95.sort_by(|a, b| b.p95_duration_ms.cmp(&a.p95_duration_ms));
        let slowest_commands = sorted_by_p95
            .into_iter()
            .take(10)
            .map(|m| (m.command_name, m.p95_duration_ms))
            .collect();

        ProfilerSummary {
            enabled: self.enabled,
            total_commands,
            total_executions,
            total_time_ms,
            avg_latency_ms: avg_latency,
            slowest_commands,
        }
    }

    /// Reset all metrics
    pub fn reset(&self) {
        if let Ok(mut records) = self.records.lock() {
            records.clear();
        }
    }
}

impl Default for IPCProfiler {
    fn default() -> Self {
        // Enable profiling in debug mode
        Self::new(cfg!(debug_assertions))
    }
}

/// RAII guard that automatically records execution time
pub struct ProfileGuard {
    command_name: String,
    start_time: Instant,
    profiler: Option<ProfilerStorage>,
}

impl Drop for ProfileGuard {
    fn drop(&mut self) {
        if let Some(records) = &self.profiler {
            let duration = self.start_time.elapsed();
            let duration_ms = duration.as_millis() as u64;

            let timestamp = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .ok()
                .map(|d| d.as_secs())
                .unwrap_or(0);

            if let Ok(mut records) = records.lock() {
                records
                    .entry(self.command_name.clone())
                    .or_insert_with(Vec::new)
                    .push(ExecutionRecord {
                        duration_ms,
                        timestamp,
                    });

                // Log slow commands (>200ms)
                if duration_ms > 200 {
                    log::warn!(
                        "[IPCProfiler] ⚠️ Slow command: {} took {}ms (target: <200ms)",
                        self.command_name,
                        duration_ms
                    );
                } else if duration_ms > 100 {
                    log::info!(
                        "[IPCProfiler] ⏱️ Command: {} took {}ms",
                        self.command_name,
                        duration_ms
                    );
                }
            }
        }
    }
}

/// Summary of all profiler statistics
#[derive(Debug, Serialize, Deserialize)]
pub struct ProfilerSummary {
    pub enabled: bool,
    pub total_commands: usize,
    pub total_executions: u64,
    pub total_time_ms: u64,
    pub avg_latency_ms: f64,
    pub slowest_commands: Vec<(String, u64)>,
}

/// Tauri commands for profiler access
#[tauri::command]
pub fn get_ipc_metrics(
    profiler: tauri::State<Arc<IPCProfiler>>,
    command_name: Option<String>,
) -> Result<serde_json::Value, String> {
    if let Some(name) = command_name {
        // Get metrics for specific command
        if let Some(metrics) = profiler.get_command_metrics(&name) {
            serde_json::to_value(&metrics).map_err(|e| e.to_string())
        } else {
            Err(format!("No metrics found for command: {}", name))
        }
    } else {
        // Get all metrics
        let metrics = profiler.get_all_metrics();
        serde_json::to_value(&metrics).map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub fn get_ipc_summary(
    profiler: tauri::State<Arc<IPCProfiler>>,
) -> Result<ProfilerSummary, String> {
    Ok(profiler.get_summary())
}

#[tauri::command]
pub fn reset_ipc_metrics(profiler: tauri::State<Arc<IPCProfiler>>) -> Result<String, String> {
    profiler.reset();
    Ok("IPC metrics reset successfully".to_string())
}

// ═══════════════════════════════════════════════════════════════
// MACRO FOR EASY PROFILING
// ═══════════════════════════════════════════════════════════════

/// Macro to profile a Tauri command
///
/// Usage:
/// ```rust,ignore
/// #[tauri::command]
/// async fn my_command(profiler: State<'_, Arc<IPCProfiler>>) -> Result<String, String> {
///     profile_command!(profiler, "my_command", {
///         // Your command logic here
///         Ok("Success".to_string())
///     })
/// }
/// ```
#[macro_export]
macro_rules! profile_command {
    ($profiler:expr, $name:expr, $body:block) => {{
        let _guard = $profiler.start($name);
        $body
    }};
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ipc_profiler_new() {
        let profiler = IPCProfiler::new(true);
        let summary = profiler.get_summary();
        assert!(summary.enabled);
        assert_eq!(summary.total_commands, 0);
    }

    #[test]
    fn test_ipc_profiler_disabled() {
        let profiler = IPCProfiler::new(false);
        let summary = profiler.get_summary();
        assert!(!summary.enabled);
        assert_eq!(summary.total_executions, 0);
    }

    #[test]
    fn test_profile_guard_records_execution() {
        let profiler = IPCProfiler::new(true);

        {
            let _guard = profiler.start("test_command");
            // Guard will record time when dropped
        }

        // Allow async drop to complete
        std::thread::sleep(std::time::Duration::from_millis(10));

        let metrics = profiler.get_command_metrics("test_command");
        assert!(metrics.is_some());

        if let Some(m) = metrics {
            assert_eq!(m.command_name, "test_command");
            assert_eq!(m.count, 1);
        }
    }

    #[test]
    fn test_get_all_metrics_sorted() {
        let profiler = IPCProfiler::new(true);

        // Manually insert records for testing
        {
            let mut records = profiler.records.lock().unwrap();
            records.insert("fast_command".to_string(), vec![ExecutionRecord {
                duration_ms: 10,
                timestamp: 0,
            }]);
            records.insert("slow_command".to_string(), vec![ExecutionRecord {
                duration_ms: 100,
                timestamp: 0,
            }]);
        }

        let metrics = profiler.get_all_metrics();
        assert_eq!(metrics.len(), 2);

        // Should be sorted by total duration (descending)
        assert_eq!(metrics[0].command_name, "slow_command");
        assert_eq!(metrics[1].command_name, "fast_command");
    }

    #[test]
    fn test_profiler_summary() {
        let profiler = IPCProfiler::new(true);

        {
            let mut records = profiler.records.lock().unwrap();
            records.insert("cmd1".to_string(), vec![
                ExecutionRecord { duration_ms: 50, timestamp: 0 },
                ExecutionRecord { duration_ms: 100, timestamp: 0 },
            ]);
        }

        let summary = profiler.get_summary();
        assert_eq!(summary.total_commands, 1);
        assert_eq!(summary.total_executions, 2);
        assert_eq!(summary.total_time_ms, 150);
        assert_eq!(summary.avg_latency_ms, 75.0);
    }

    #[test]
    fn test_profiler_reset() {
        let profiler = IPCProfiler::new(true);

        {
            let mut records = profiler.records.lock().unwrap();
            records.insert("test".to_string(), vec![ExecutionRecord {
                duration_ms: 50,
                timestamp: 0,
            }]);
        }

        profiler.reset();

        let summary = profiler.get_summary();
        assert_eq!(summary.total_commands, 0);
        assert_eq!(summary.total_executions, 0);
    }

    #[test]
    fn test_command_metrics_percentiles() {
        let profiler = IPCProfiler::new(true);

        {
            let mut records = profiler.records.lock().unwrap();
            let mut executions = vec![];
            for i in 1..=100 {
                executions.push(ExecutionRecord {
                    duration_ms: i,
                    timestamp: 0,
                });
            }
            records.insert("test_cmd".to_string(), executions);
        }

        let metrics = profiler.get_command_metrics("test_cmd").unwrap();
        assert_eq!(metrics.count, 100);
        assert_eq!(metrics.min_duration_ms, 1);
        assert_eq!(metrics.max_duration_ms, 100);

        // P50 should be around 50
        assert!(metrics.p50_duration_ms >= 45 && metrics.p50_duration_ms <= 55);
        // P95 should be around 95
        assert!(metrics.p95_duration_ms >= 90);
        // P99 should be around 99
        assert!(metrics.p99_duration_ms >= 95);
    }

    #[test]
    fn test_profiler_default() {
        let profiler = IPCProfiler::default();
        let summary = profiler.get_summary();

        // In debug mode, should be enabled
        #[cfg(debug_assertions)]
        assert!(summary.enabled);

        // In release mode, should be disabled
        #[cfg(not(debug_assertions))]
        assert!(!summary.enabled);
    }

    #[test]
    fn test_get_command_metrics_nonexistent() {
        let profiler = IPCProfiler::new(true);
        let metrics = profiler.get_command_metrics("nonexistent_command");
        assert!(metrics.is_none());
    }

    #[test]
    fn test_get_command_metrics_when_disabled() {
        let profiler = IPCProfiler::new(false);

        // Even if we manually add records, metrics should return None when disabled
        {
            let mut records = profiler.records.lock().unwrap();
            records.insert("test".to_string(), vec![ExecutionRecord {
                duration_ms: 50,
                timestamp: 0,
            }]);
        }

        let metrics = profiler.get_command_metrics("test");
        assert!(metrics.is_none());
    }

    #[test]
    fn test_get_all_metrics_when_disabled() {
        let profiler = IPCProfiler::new(false);
        let metrics = profiler.get_all_metrics();
        assert_eq!(metrics.len(), 0);
    }

    #[test]
    fn test_multiple_executions_same_command() {
        let profiler = IPCProfiler::new(true);

        for _ in 0..5 {
            let _guard = profiler.start("repeated_command");
            std::thread::sleep(std::time::Duration::from_millis(1));
        }

        std::thread::sleep(std::time::Duration::from_millis(20));

        let metrics = profiler.get_command_metrics("repeated_command");
        assert!(metrics.is_some());

        if let Some(m) = metrics {
            assert_eq!(m.count, 5);
            assert!(m.min_duration_ms > 0);
            assert!(m.max_duration_ms >= m.min_duration_ms);
        }
    }

    #[test]
    fn test_command_metrics_serialization() {
        let metrics = CommandMetrics {
            command_name: "test_cmd".to_string(),
            count: 100,
            total_duration_ms: 5000,
            min_duration_ms: 10,
            max_duration_ms: 200,
            avg_duration_ms: 50.0,
            p50_duration_ms: 45,
            p95_duration_ms: 150,
            p99_duration_ms: 180,
            last_execution_ms: 50,
        };

        let json = serde_json::to_string(&metrics).unwrap();
        assert!(json.contains("test_cmd"));
        assert!(json.contains("100"));

        let deserialized: CommandMetrics = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.command_name, "test_cmd");
        assert_eq!(deserialized.count, 100);
        assert_eq!(deserialized.avg_duration_ms, 50.0);
    }

    #[test]
    fn test_profiler_summary_serialization() {
        let summary = ProfilerSummary {
            enabled: true,
            total_commands: 10,
            total_executions: 1000,
            total_time_ms: 50000,
            avg_latency_ms: 50.0,
            slowest_commands: vec![
                ("slow_cmd".to_string(), 200),
                ("medium_cmd".to_string(), 100),
            ],
        };

        let json = serde_json::to_string(&summary).unwrap();
        assert!(json.contains("true"));
        assert!(json.contains("1000"));

        let deserialized: ProfilerSummary = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.total_commands, 10);
        assert_eq!(deserialized.slowest_commands.len(), 2);
    }

    #[test]
    fn test_profiler_summary_empty() {
        let profiler = IPCProfiler::new(true);
        let summary = profiler.get_summary();

        assert_eq!(summary.total_commands, 0);
        assert_eq!(summary.total_executions, 0);
        assert_eq!(summary.total_time_ms, 0);
        assert_eq!(summary.avg_latency_ms, 0.0);
        assert_eq!(summary.slowest_commands.len(), 0);
    }

    #[test]
    fn test_profiler_summary_slowest_commands() {
        let profiler = IPCProfiler::new(true);

        {
            let mut records = profiler.records.lock().unwrap();
            for i in 1..=15 {
                let duration = i * 10;
                records.insert(
                    format!("cmd_{}", i),
                    vec![ExecutionRecord {
                        duration_ms: duration,
                        timestamp: 0,
                    }],
                );
            }
        }

        let summary = profiler.get_summary();
        assert_eq!(summary.total_commands, 15);

        // Should only return top 10 slowest
        assert_eq!(summary.slowest_commands.len(), 10);

        // First should be the slowest (cmd_15 with 150ms)
        assert_eq!(summary.slowest_commands[0].0, "cmd_15");
        assert_eq!(summary.slowest_commands[0].1, 150);
    }

    #[test]
    fn test_command_metrics_single_execution() {
        let profiler = IPCProfiler::new(true);

        {
            let mut records = profiler.records.lock().unwrap();
            records.insert("single_cmd".to_string(), vec![ExecutionRecord {
                duration_ms: 42,
                timestamp: 1000,
            }]);
        }

        let metrics = profiler.get_command_metrics("single_cmd").unwrap();
        assert_eq!(metrics.count, 1);
        assert_eq!(metrics.min_duration_ms, 42);
        assert_eq!(metrics.max_duration_ms, 42);
        assert_eq!(metrics.avg_duration_ms, 42.0);
        assert_eq!(metrics.p50_duration_ms, 42);
        assert_eq!(metrics.p95_duration_ms, 42);
        assert_eq!(metrics.p99_duration_ms, 42);
        assert_eq!(metrics.last_execution_ms, 42);
    }

    #[test]
    fn test_command_metrics_empty_records() {
        let profiler = IPCProfiler::new(true);

        {
            let mut records = profiler.records.lock().unwrap();
            records.insert("empty_cmd".to_string(), vec![]);
        }

        let metrics = profiler.get_command_metrics("empty_cmd");
        assert!(metrics.is_none());
    }

    #[test]
    fn test_profile_guard_disabled_profiler() {
        let profiler = IPCProfiler::new(false);

        {
            let _guard = profiler.start("disabled_test");
            std::thread::sleep(std::time::Duration::from_millis(10));
        }

        std::thread::sleep(std::time::Duration::from_millis(20));

        // Should not record anything when disabled
        let records = profiler.records.lock().unwrap();
        assert_eq!(records.len(), 0);
    }

    #[test]
    fn test_multiple_commands_parallel() {
        let profiler = IPCProfiler::new(true);

        {
            let _guard1 = profiler.start("cmd_a");
            let _guard2 = profiler.start("cmd_b");
            let _guard3 = profiler.start("cmd_c");
            std::thread::sleep(std::time::Duration::from_millis(5));
        }

        std::thread::sleep(std::time::Duration::from_millis(20));

        let metrics = profiler.get_all_metrics();
        assert_eq!(metrics.len(), 3);

        let command_names: Vec<String> = metrics.iter().map(|m| m.command_name.clone()).collect();
        assert!(command_names.contains(&"cmd_a".to_string()));
        assert!(command_names.contains(&"cmd_b".to_string()));
        assert!(command_names.contains(&"cmd_c".to_string()));
    }

    #[test]
    fn test_reset_clears_all_data() {
        let profiler = IPCProfiler::new(true);

        {
            let mut records = profiler.records.lock().unwrap();
            records.insert("cmd1".to_string(), vec![ExecutionRecord {
                duration_ms: 50,
                timestamp: 0,
            }]);
            records.insert("cmd2".to_string(), vec![ExecutionRecord {
                duration_ms: 100,
                timestamp: 0,
            }]);
        }

        assert_eq!(profiler.get_all_metrics().len(), 2);

        profiler.reset();

        let metrics = profiler.get_all_metrics();
        assert_eq!(metrics.len(), 0);

        let summary = profiler.get_summary();
        assert_eq!(summary.total_commands, 0);
    }

    #[test]
    fn test_command_metrics_average_calculation() {
        let profiler = IPCProfiler::new(true);

        {
            let mut records = profiler.records.lock().unwrap();
            records.insert("avg_test".to_string(), vec![
                ExecutionRecord { duration_ms: 10, timestamp: 0 },
                ExecutionRecord { duration_ms: 20, timestamp: 0 },
                ExecutionRecord { duration_ms: 30, timestamp: 0 },
            ]);
        }

        let metrics = profiler.get_command_metrics("avg_test").unwrap();
        assert_eq!(metrics.count, 3);
        assert_eq!(metrics.total_duration_ms, 60);
        assert_eq!(metrics.avg_duration_ms, 20.0);
    }

    #[test]
    fn test_profiler_summary_avg_latency_zero_executions() {
        let profiler = IPCProfiler::new(true);
        let summary = profiler.get_summary();

        // With no executions, avg should be 0.0
        assert_eq!(summary.avg_latency_ms, 0.0);
    }

    #[test]
    fn test_percentile_calculation_edge_cases() {
        let profiler = IPCProfiler::new(true);

        {
            let mut records = profiler.records.lock().unwrap();
            // Test with just 2 values
            records.insert("two_values".to_string(), vec![
                ExecutionRecord { duration_ms: 10, timestamp: 0 },
                ExecutionRecord { duration_ms: 20, timestamp: 0 },
            ]);
        }

        let metrics = profiler.get_command_metrics("two_values").unwrap();
        assert_eq!(metrics.count, 2);
        assert!(metrics.p50_duration_ms >= 10);
        assert!(metrics.p95_duration_ms >= 10);
        assert!(metrics.p99_duration_ms >= 10);
    }
}
