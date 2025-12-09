#![allow(unused_imports)]
#![allow(dead_code)]
// Agent Sandbox - Isolation & Limits
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SandboxConfig {
    pub max_execution_time_seconds: u64,
    pub max_memory_mb: usize,
    pub enabled: bool,
}

impl Default for SandboxConfig {
    fn default() -> Self {
        Self {
            max_execution_time_seconds: 300,
            max_memory_mb: 50,
            enabled: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SandboxViolation {
    TimeoutExceeded { limit: u64, actual: u64 },
    MemoryExceeded { limit: usize, actual: usize },
    ForbiddenOperation(String),
}

pub struct AgentSandbox {
    config: SandboxConfig,
}

impl AgentSandbox {
    pub fn new(config: SandboxConfig) -> Self {
        Self { config }
    }

    pub fn check_time_limit(&self, elapsed_seconds: u64) -> Result<(), SandboxViolation> {
        if elapsed_seconds > self.config.max_execution_time_seconds {
            Err(SandboxViolation::TimeoutExceeded {
                limit: self.config.max_execution_time_seconds,
                actual: elapsed_seconds,
            })
        } else {
            Ok(())
        }
    }

    pub fn check_memory_limit(&self, used_mb: usize) -> Result<(), SandboxViolation> {
        if used_mb > self.config.max_memory_mb {
            Err(SandboxViolation::MemoryExceeded {
                limit: self.config.max_memory_mb,
                actual: used_mb,
            })
        } else {
            Ok(())
        }
    }
}
