// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — RESOURCE MANAGER
//   System resource monitoring and limits
//   Super Prompt #11 — Phase 2
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// Resource limits configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceLimits {
    /// Maximum concurrent engine tasks
    pub max_concurrent_engines: usize,
    /// Maximum memory usage in MB
    pub max_memory_mb: u32,
    /// Maximum CPU usage (0.0 - 1.0)
    pub max_cpu_usage: f32,
    /// Maximum queue depth
    pub max_queue_depth: usize,
    /// LTM index refresh interval in seconds
    pub ltm_index_refresh_secs: u64,
}

impl Default for ResourceLimits {
    fn default() -> Self {
        Self {
            max_concurrent_engines: 16,
            max_memory_mb: 2048,
            max_cpu_usage: 0.85,
            max_queue_depth: 100,
            ltm_index_refresh_secs: 300, // 5 minutes
        }
    }
}

/// Current resource usage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUsage {
    /// Current CPU usage (0.0 - 1.0)
    pub cpu_usage: f32,
    /// Current memory usage in MB
    pub memory_mb: f32,
    /// Active task count
    pub active_tasks: usize,
    /// Queue depth
    pub queue_depth: usize,
}

impl Default for ResourceUsage {
    fn default() -> Self {
        Self {
            cpu_usage: 0.0,
            memory_mb: 0.0,
            active_tasks: 0,
            queue_depth: 0,
        }
    }
}

/// Resource manager for kernel
pub struct ResourceManager {
    limits: ResourceLimits,
    usage: ResourceUsage,
}

impl ResourceManager {
    /// Create new resource manager with default limits
    pub fn new() -> Self {
        Self::with_limits(ResourceLimits::default())
    }

    /// Create with custom limits
    pub fn with_limits(limits: ResourceLimits) -> Self {
        Self {
            limits,
            usage: ResourceUsage::default(),
        }
    }

    /// Update current usage
    pub fn update_usage(&mut self, usage: ResourceUsage) {
        self.usage = usage;
    }

    /// Check if CPU limit exceeded
    pub fn is_cpu_exceeded(&self) -> bool {
        self.usage.cpu_usage > self.limits.max_cpu_usage
    }

    /// Check if memory limit exceeded
    pub fn is_memory_exceeded(&self) -> bool {
        self.usage.memory_mb > self.limits.max_memory_mb as f32
    }

    /// Check if queue limit exceeded
    pub fn is_queue_exceeded(&self) -> bool {
        self.usage.queue_depth > self.limits.max_queue_depth
    }

    /// Check if can accept new task
    pub fn can_accept_task(&self) -> bool {
        self.usage.active_tasks < self.limits.max_concurrent_engines
            && !self.is_cpu_exceeded()
            && !self.is_queue_exceeded()
    }

    /// Get resource pressure (0.0 - 1.0)
    pub fn resource_pressure(&self) -> f32 {
        let cpu_pressure = self.usage.cpu_usage / self.limits.max_cpu_usage;
        let memory_pressure = self.usage.memory_mb / self.limits.max_memory_mb as f32;
        let task_pressure =
            self.usage.active_tasks as f32 / self.limits.max_concurrent_engines as f32;
        let queue_pressure = self.usage.queue_depth as f32 / self.limits.max_queue_depth as f32;

        (cpu_pressure + memory_pressure + task_pressure + queue_pressure) / 4.0
    }

    /// Get current limits
    pub fn limits(&self) -> &ResourceLimits {
        &self.limits
    }

    /// Get current usage
    pub fn usage(&self) -> &ResourceUsage {
        &self.usage
    }
}

impl Default for ResourceManager {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_resource_manager_creation() {
        let manager = ResourceManager::new();
        assert_eq!(manager.limits().max_concurrent_engines, 16);
        assert_eq!(manager.usage().active_tasks, 0);
    }

    #[test]
    fn test_cpu_limit_check() {
        let mut manager = ResourceManager::new();

        manager.update_usage(ResourceUsage {
            cpu_usage: 0.9,
            ..Default::default()
        });

        assert!(manager.is_cpu_exceeded());
    }

    #[test]
    fn test_can_accept_task() {
        let mut manager = ResourceManager::new();

        // Low usage - should accept
        manager.update_usage(ResourceUsage {
            cpu_usage: 0.3,
            active_tasks: 5,
            queue_depth: 10,
            ..Default::default()
        });

        assert!(manager.can_accept_task());

        // High CPU - should reject
        manager.update_usage(ResourceUsage {
            cpu_usage: 0.95,
            active_tasks: 5,
            queue_depth: 10,
            ..Default::default()
        });

        assert!(!manager.can_accept_task());
    }

    #[test]
    fn test_resource_pressure() {
        let mut manager = ResourceManager::new();

        manager.update_usage(ResourceUsage {
            cpu_usage: 0.425,  // 50% of limit (0.85)
            memory_mb: 1024.0, // 50% of limit (2048)
            active_tasks: 8,   // 50% of limit (16)
            queue_depth: 50,   // 50% of limit (100)
        });

        let pressure = manager.resource_pressure();
        assert!((pressure - 0.5).abs() < 0.1); // Should be ~50%
    }
}
