// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — GOVERNANCE ENGINE
//   Internal policies and operational rules
//   Super Prompt #11 — Phase 8
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Kernel policy definitions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KernelPolicy {
    /// Maximum parallel engine executions
    MaxParallelEngines(usize),

    /// Memory capacity limit in MB
    MemoryCapMb(u32),

    /// LTM index refresh interval in seconds
    LtmIndexRefresh(u64),

    /// Rate limit: requests per minute
    RateLimit(u32),

    /// Enable safe mode on overload
    SafeModeOnOverload(bool),

    /// Require authentication for admin operations
    RequireAuth(bool),

    /// Maximum queue depth before rejection
    MaxQueueDepth(usize),

    /// Minimum priority for execution during overload
    OverloadPriorityThreshold(u8),
}

/// Governance engine — Enforces operational policies
pub struct GovernanceEngine {
    policies: HashMap<String, KernelPolicy>,
}

impl GovernanceEngine {
    /// Create with default policies
    pub fn new() -> Self {
        let mut policies = HashMap::new();

        // Default policies
        policies.insert(
            "max_parallel_engines".to_string(),
            KernelPolicy::MaxParallelEngines(16),
        );
        policies.insert("memory_cap_mb".to_string(), KernelPolicy::MemoryCapMb(2048));
        policies.insert(
            "ltm_index_refresh".to_string(),
            KernelPolicy::LtmIndexRefresh(300),
        );
        policies.insert("rate_limit".to_string(), KernelPolicy::RateLimit(60));
        policies.insert(
            "safe_mode_on_overload".to_string(),
            KernelPolicy::SafeModeOnOverload(true),
        );
        policies.insert("require_auth".to_string(), KernelPolicy::RequireAuth(false));
        policies.insert(
            "max_queue_depth".to_string(),
            KernelPolicy::MaxQueueDepth(100),
        );
        policies.insert(
            "overload_priority_threshold".to_string(),
            KernelPolicy::OverloadPriorityThreshold(2), // Normal+
        );

        Self { policies }
    }

    /// Get policy value
    pub fn get_policy(&self, name: &str) -> Option<&KernelPolicy> {
        self.policies.get(name)
    }

    /// Set policy
    pub fn set_policy(&mut self, name: String, policy: KernelPolicy) {
        self.policies.insert(name, policy);
    }

    /// Check if operation violates policy
    pub fn check_violation(&self, operation: &str, context: &PolicyContext) -> Option<String> {
        match operation {
            "spawn_task" => {
                if let Some(KernelPolicy::MaxParallelEngines(max)) =
                    self.get_policy("max_parallel_engines")
                {
                    if context.active_tasks >= *max {
                        return Some(format!(
                            "Max parallel engines exceeded: {} >= {}",
                            context.active_tasks, max
                        ));
                    }
                }

                if let Some(KernelPolicy::MaxQueueDepth(max)) = self.get_policy("max_queue_depth") {
                    if context.queue_depth >= *max {
                        return Some(format!(
                            "Max queue depth exceeded: {} >= {}",
                            context.queue_depth, max
                        ));
                    }
                }
            }
            "memory_allocation" => {
                if let Some(KernelPolicy::MemoryCapMb(max)) = self.get_policy("memory_cap_mb") {
                    if context.memory_mb > *max as f32 {
                        return Some(format!(
                            "Memory cap exceeded: {} MB > {} MB",
                            context.memory_mb, max
                        ));
                    }
                }
            }
            _ => {}
        }

        None
    }

    /// Get all policies
    pub fn all_policies(&self) -> &HashMap<String, KernelPolicy> {
        &self.policies
    }

    /// Check if safe mode should be enabled
    pub fn should_enable_safe_mode(&self, overload_level: u8) -> bool {
        if let Some(KernelPolicy::SafeModeOnOverload(enabled)) =
            self.get_policy("safe_mode_on_overload")
        {
            *enabled && overload_level >= 8
        } else {
            false
        }
    }

    /// Get overload priority threshold
    pub fn overload_priority_threshold(&self) -> u8 {
        if let Some(KernelPolicy::OverloadPriorityThreshold(threshold)) =
            self.get_policy("overload_priority_threshold")
        {
            *threshold
        } else {
            2 // Normal
        }
    }
}

impl Default for GovernanceEngine {
    fn default() -> Self {
        Self::new()
    }
}

/// Context for policy checking
#[derive(Debug, Clone)]
pub struct PolicyContext {
    pub active_tasks: usize,
    pub queue_depth: usize,
    pub memory_mb: f32,
    pub cpu_usage: f32,
    pub overload_level: u8,
}

impl Default for PolicyContext {
    fn default() -> Self {
        Self {
            active_tasks: 0,
            queue_depth: 0,
            memory_mb: 0.0,
            cpu_usage: 0.0,
            overload_level: 0,
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
    fn test_governance_creation() {
        let gov = GovernanceEngine::new();
        assert!(gov.get_policy("max_parallel_engines").is_some());
    }

    #[test]
    fn test_policy_violation_max_tasks() {
        let gov = GovernanceEngine::new();
        let context = PolicyContext {
            active_tasks: 20,
            ..Default::default()
        };

        let violation = gov.check_violation("spawn_task", &context);
        assert!(violation.is_some());
    }

    #[test]
    fn test_policy_violation_memory() {
        let gov = GovernanceEngine::new();
        let context = PolicyContext {
            memory_mb: 3000.0,
            ..Default::default()
        };

        let violation = gov.check_violation("memory_allocation", &context);
        assert!(violation.is_some());
    }

    #[test]
    fn test_safe_mode_trigger() {
        let gov = GovernanceEngine::new();
        assert!(!gov.should_enable_safe_mode(5));
        assert!(gov.should_enable_safe_mode(9));
    }

    #[test]
    fn test_policy_update() {
        let mut gov = GovernanceEngine::new();
        gov.set_policy(
            "max_parallel_engines".to_string(),
            KernelPolicy::MaxParallelEngines(32),
        );

        if let Some(KernelPolicy::MaxParallelEngines(max)) = gov.get_policy("max_parallel_engines")
        {
            assert_eq!(*max, 32);
        } else {
            panic!("Policy not found");
        }
    }
}
