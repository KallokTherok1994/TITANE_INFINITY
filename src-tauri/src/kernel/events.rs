// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — KERNEL EVENTS
//   Event system for kernel operations and monitoring
//   Super Prompt #11 — Phase 5
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Kernel event types for monitoring and DevTools integration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum KernelEvent {
    /// Kernel started
    KernelStarted { version: String, timestamp: i64 },

    /// Kernel stopped
    KernelStopped { reason: String, timestamp: i64 },

    /// Task submitted to scheduler
    TaskSubmitted {
        task_id: String,
        priority: String,
        engine: String,
    },

    /// Task started execution
    TaskStarted { task_id: String, timestamp: i64 },

    /// Task completed successfully
    TaskCompleted { task_id: String, duration_ms: u64 },

    /// Task failed with error
    TaskFailed { task_id: String, error: String },

    /// Task timed out
    TaskTimeout { task_id: String, timeout_ms: u64 },

    /// Background task completed
    BackgroundTaskCompleted,

    /// Engine output received
    EngineOutput {
        engine: String,
        duration_ms: u64,
        success: bool,
    },

    /// Memory updated
    MemoryUpdated { layer: String, operation: String },

    /// Overload detected
    OverloadDetected { level: u8, cpu_usage: f32 },

    /// Load shedding applied
    LoadShedding {
        tasks_dropped: usize,
        reason: String,
    },

    /// Watchdog heartbeat
    WatchdogHeartbeat { timestamp: i64 },

    /// Watchdog alert
    WatchdogAlert { alert_type: String, message: String },

    /// Policy violation
    PolicyViolation { policy: String, details: String },

    /// Resource limit hit
    ResourceLimitHit {
        resource: String,
        current: f32,
        limit: f32,
    },

    /// State snapshot taken
    StateSnapshot { snapshot_id: String, timestamp: i64 },
}

/// Event priority for filtering
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum EventPriority {
    Debug,
    Info,
    Warning,
    Critical,
}

impl KernelEvent {
    /// Get event priority
    pub fn priority(&self) -> EventPriority {
        match self {
            KernelEvent::KernelStarted { .. } => EventPriority::Info,
            KernelEvent::KernelStopped { .. } => EventPriority::Warning,
            KernelEvent::TaskSubmitted { .. } => EventPriority::Debug,
            KernelEvent::TaskStarted { .. } => EventPriority::Debug,
            KernelEvent::TaskCompleted { .. } => EventPriority::Debug,
            KernelEvent::TaskFailed { .. } => EventPriority::Warning,
            KernelEvent::TaskTimeout { .. } => EventPriority::Warning,
            KernelEvent::BackgroundTaskCompleted => EventPriority::Debug,
            KernelEvent::EngineOutput { success, .. } => {
                if *success {
                    EventPriority::Debug
                } else {
                    EventPriority::Warning
                }
            }
            KernelEvent::MemoryUpdated { .. } => EventPriority::Debug,
            KernelEvent::OverloadDetected { .. } => EventPriority::Warning,
            KernelEvent::LoadShedding { .. } => EventPriority::Warning,
            KernelEvent::WatchdogHeartbeat { .. } => EventPriority::Debug,
            KernelEvent::WatchdogAlert { .. } => EventPriority::Critical,
            KernelEvent::PolicyViolation { .. } => EventPriority::Critical,
            KernelEvent::ResourceLimitHit { .. } => EventPriority::Warning,
            KernelEvent::StateSnapshot { .. } => EventPriority::Info,
        }
    }

    /// Get event name
    pub fn name(&self) -> &'static str {
        match self {
            KernelEvent::KernelStarted { .. } => "kernel_started",
            KernelEvent::KernelStopped { .. } => "kernel_stopped",
            KernelEvent::TaskSubmitted { .. } => "task_submitted",
            KernelEvent::TaskStarted { .. } => "task_started",
            KernelEvent::TaskCompleted { .. } => "task_completed",
            KernelEvent::TaskFailed { .. } => "task_failed",
            KernelEvent::TaskTimeout { .. } => "task_timeout",
            KernelEvent::BackgroundTaskCompleted => "background_task_completed",
            KernelEvent::EngineOutput { .. } => "engine_output",
            KernelEvent::MemoryUpdated { .. } => "memory_updated",
            KernelEvent::OverloadDetected { .. } => "overload_detected",
            KernelEvent::LoadShedding { .. } => "load_shedding",
            KernelEvent::WatchdogHeartbeat { .. } => "watchdog_heartbeat",
            KernelEvent::WatchdogAlert { .. } => "watchdog_alert",
            KernelEvent::PolicyViolation { .. } => "policy_violation",
            KernelEvent::ResourceLimitHit { .. } => "resource_limit_hit",
            KernelEvent::StateSnapshot { .. } => "state_snapshot",
        }
    }

    /// Check if event should be logged
    pub fn should_log(&self) -> bool {
        self.priority() >= EventPriority::Info
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_event_priority() {
        let event = KernelEvent::WatchdogAlert {
            alert_type: "slowdown".to_string(),
            message: "System slow".to_string(),
        };

        assert_eq!(event.priority(), EventPriority::Critical);
        assert!(event.should_log());
    }

    #[test]
    fn test_event_name() {
        let event = KernelEvent::TaskCompleted {
            task_id: "test".to_string(),
            duration_ms: 100,
        };

        assert_eq!(event.name(), "task_completed");
    }

    #[test]
    fn test_priority_ordering() {
        assert!(EventPriority::Critical > EventPriority::Warning);
        assert!(EventPriority::Warning > EventPriority::Info);
        assert!(EventPriority::Info > EventPriority::Debug);
    }
}
