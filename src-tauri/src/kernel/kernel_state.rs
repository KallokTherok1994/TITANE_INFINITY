// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — KERNEL STATE
//   Source of truth for kernel internal state
//   Super Prompt #11 — Phase 6
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Kernel load metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KernelLoad {
    /// CPU usage (0.0 - 1.0)
    pub cpu_usage: f32,
    /// RAM usage in MB
    pub ram_mb: f32,
    /// Active tasks count
    pub active_tasks: usize,
    /// Queued tasks count
    pub queued_tasks: usize,
    /// Tasks completed since start
    pub completed_tasks: u64,
    /// Tasks failed since start
    pub failed_tasks: u64,
}

impl Default for KernelLoad {
    fn default() -> Self {
        Self {
            cpu_usage: 0.0,
            ram_mb: 0.0,
            active_tasks: 0,
            queued_tasks: 0,
            completed_tasks: 0,
            failed_tasks: 0,
        }
    }
}

/// Engine execution status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineStatus {
    /// Engine name
    pub name: String,
    /// Is engine running
    pub running: bool,
    /// Last execution duration in ms
    pub last_duration_ms: Option<u64>,
    /// Total executions
    pub total_executions: u64,
    /// Failed executions
    pub failed_executions: u64,
    /// Average duration in ms
    pub avg_duration_ms: f64,
}

impl EngineStatus {
    pub fn new(name: String) -> Self {
        Self {
            name,
            running: false,
            last_duration_ms: None,
            total_executions: 0,
            failed_executions: 0,
            avg_duration_ms: 0.0,
        }
    }

    /// Record execution
    pub fn record_execution(&mut self, duration_ms: u64, success: bool) {
        self.total_executions += 1;
        if !success {
            self.failed_executions += 1;
        }

        self.last_duration_ms = Some(duration_ms);

        // Update rolling average
        let total = self.total_executions as f64;
        let current_avg = self.avg_duration_ms;
        self.avg_duration_ms = (current_avg * (total - 1.0) + duration_ms as f64) / total;
    }
}

/// Memory health snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryHealth {
    /// STM utilization (0.0 - 1.0)
    pub stm_utilization: f32,
    /// MTM utilization (0.0 - 1.0)
    pub mtm_utilization: f32,
    /// LTM size in MB
    pub ltm_size_mb: f32,
    /// Total entries
    pub total_entries: usize,
}

impl Default for MemoryHealth {
    fn default() -> Self {
        Self {
            stm_utilization: 0.0,
            mtm_utilization: 0.0,
            ltm_size_mb: 0.0,
            total_entries: 0,
        }
    }
}

/// Conversation context snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversationContext {
    /// Current conversation ID
    pub conversation_id: Option<String>,
    /// Message count in current conversation
    pub message_count: usize,
    /// Last message timestamp
    pub last_message_timestamp: Option<i64>,
}

impl Default for ConversationContext {
    fn default() -> Self {
        Self {
            conversation_id: None,
            message_count: 0,
            last_message_timestamp: None,
        }
    }
}

/// Intent snapshot (from user input)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Intent {
    /// Intent type
    pub intent_type: String,
    /// Confidence (0.0 - 1.0)
    pub confidence: f32,
    /// Detected entities
    pub entities: Vec<String>,
}

/// Kernel state — Source of truth for kernel internals
///
/// This struct holds all runtime state and metrics.
/// Updated by runtime, scheduler, and core loop.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KernelState {
    /// Session start timestamp
    pub session_start: i64,
    /// Kernel load metrics
    pub load: KernelLoad,
    /// Active engines status
    pub active_engines: HashMap<String, EngineStatus>,
    /// Memory health
    pub memory_health: MemoryHealth,
    /// Last detected intent
    pub last_intent: Option<Intent>,
    /// Conversation context
    pub conversation_context: ConversationContext,
    /// Overload level (0-10)
    pub overload_level: u8,
    /// Is kernel in safe mode
    pub safe_mode: bool,
}

impl KernelState {
    /// Create new kernel state
    pub fn new() -> Self {
        Self {
            session_start: chrono::Utc::now().timestamp_millis(),
            load: KernelLoad::default(),
            active_engines: HashMap::new(),
            memory_health: MemoryHealth::default(),
            last_intent: None,
            conversation_context: ConversationContext::default(),
            overload_level: 0,
            safe_mode: false,
        }
    }

    /// Update load metrics
    pub fn update_load(&mut self, cpu: f32, ram: f32) {
        self.load.cpu_usage = cpu.clamp(0.0, 1.0);
        self.load.ram_mb = ram;
    }

    /// Register engine
    pub fn register_engine(&mut self, name: String) {
        self.active_engines.insert(name.clone(), EngineStatus::new(name));
    }

    /// Update engine status
    pub fn update_engine_status(&mut self, name: &str, duration_ms: u64, success: bool) {
        if let Some(status) = self.active_engines.get_mut(name) {
            status.record_execution(duration_ms, success);

            if success {
                self.load.completed_tasks += 1;
            } else {
                self.load.failed_tasks += 1;
            }
        }
    }

    /// Get uptime in seconds
    pub fn uptime_secs(&self) -> u64 {
        let now = chrono::Utc::now().timestamp_millis();
        ((now - self.session_start) / 1000) as u64
    }

    /// Get error rate
    pub fn error_rate(&self) -> f32 {
        let total = self.load.completed_tasks + self.load.failed_tasks;
        if total == 0 {
            0.0
        } else {
            self.load.failed_tasks as f32 / total as f32
        }
    }

    /// Check if overloaded
    pub fn is_overloaded(&self) -> bool {
        self.overload_level >= 7
    }

    /// Calculate overload level (0-10)
    pub fn calculate_overload(&mut self) {
        let mut score = 0u8;

        // CPU
        if self.load.cpu_usage > 0.9 {
            score += 4;
        } else if self.load.cpu_usage > 0.7 {
            score += 2;
        }

        // Queue depth
        if self.load.queued_tasks > 50 {
            score += 3;
        } else if self.load.queued_tasks > 20 {
            score += 1;
        }

        // Memory
        if self.memory_health.stm_utilization > 0.9 {
            score += 2;
        }

        // Error rate
        if self.error_rate() > 0.1 {
            score += 1;
        }

        self.overload_level = score.min(10);
    }
}

impl Default for KernelState {
    fn default() -> Self {
        Self::new()
    }
}

/// Kernel snapshot for DevTools
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KernelSnapshot {
    pub timestamp: i64,
    pub uptime_secs: u64,
    pub load: KernelLoad,
    pub engine_count: usize,
    pub overload_level: u8,
    pub error_rate: f32,
    pub memory_health: MemoryHealth,
}

impl From<&KernelState> for KernelSnapshot {
    fn from(state: &KernelState) -> Self {
        Self {
            timestamp: chrono::Utc::now().timestamp_millis(),
            uptime_secs: state.uptime_secs(),
            load: state.load.clone(),
            engine_count: state.active_engines.len(),
            overload_level: state.overload_level,
            error_rate: state.error_rate(),
            memory_health: state.memory_health.clone(),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_kernel_state_creation() {
        let state = KernelState::new();
        assert_eq!(state.load.active_tasks, 0);
        assert_eq!(state.overload_level, 0);
        assert!(!state.safe_mode);
    }

    #[test]
    fn test_engine_registration() {
        let mut state = KernelState::new();
        state.register_engine("TestEngine".to_string());

        assert!(state.active_engines.contains_key("TestEngine"));
    }

    #[test]
    fn test_engine_execution_tracking() {
        let mut state = KernelState::new();
        state.register_engine("TestEngine".to_string());

        state.update_engine_status("TestEngine", 100, true);
        state.update_engine_status("TestEngine", 200, true);

        let status = state.active_engines.get("TestEngine").unwrap();
        assert_eq!(status.total_executions, 2);
        assert_eq!(status.last_duration_ms, Some(200));
        assert_eq!(status.avg_duration_ms, 150.0);
    }

    #[test]
    fn test_error_rate() {
        let mut state = KernelState::new();
        state.register_engine("Test".to_string());

        state.update_engine_status("Test", 100, true);
        state.update_engine_status("Test", 100, false);
        state.update_engine_status("Test", 100, true);

        // 1 failed out of 3 = 0.333...
        assert!((state.error_rate() - 0.333).abs() < 0.01);
    }

    #[test]
    fn test_overload_calculation() {
        let mut state = KernelState::new();
        state.load.cpu_usage = 0.95; // +4
        state.load.queued_tasks = 60; // +3
        state.memory_health.stm_utilization = 0.95; // +2

        state.calculate_overload();

        assert_eq!(state.overload_level, 9);
        assert!(state.is_overloaded());
    }

    #[test]
    fn test_snapshot_creation() {
        let state = KernelState::new();
        let snapshot = KernelSnapshot::from(&state);

        assert_eq!(snapshot.engine_count, 0);
        assert_eq!(snapshot.overload_level, 0);
    }
}
