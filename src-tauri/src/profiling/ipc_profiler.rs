// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.5.0 — IPC Performance Profiler
//   Measure and track IPC latency for all Tauri commands
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use std::collections::HashMap;

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
        let min = *durations.first().unwrap();
        let max = *durations.last().unwrap();
        let avg = total as f64 / count as f64;

        let p50_idx = (count as f64 * 0.50) as usize;
        let p95_idx = (count as f64 * 0.95) as usize;
        let p99_idx = (count as f64 * 0.99) as usize;

        let p50 = durations.get(p50_idx.saturating_sub(1)).copied().unwrap_or(0);
        let p95 = durations.get(p95_idx.saturating_sub(1)).copied().unwrap_or(max);
        let p99 = durations.get(p99_idx.saturating_sub(1)).copied().unwrap_or(max);

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

        let records = self.records.lock().ok();
        if records.is_none() {
            return vec![];
        }

        let records = records.unwrap();
        let mut metrics = vec![];

        for command_name in records.keys() {
            if let Some(m) = self.get_command_metrics(command_name) {
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
    profiler: Option<Arc<Mutex<HashMap<String, Vec<ExecutionRecord>>>>>,
}

impl Drop for ProfileGuard {
    fn drop(&mut self) {
        if let Some(records) = &self.profiler {
            let duration = self.start_time.elapsed();
            let duration_ms = duration.as_millis() as u64;

            let timestamp = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs();

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
/// ```rust
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
