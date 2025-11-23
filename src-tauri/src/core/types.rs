// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — CORE TYPES
//   Unified type system for SingularityEngine
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::fmt;

/// Engine error types - simple, static, comprehensive
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EngineError {
    /// Initialization error with context
    Init(String),
    /// Runtime error with context
    Runtime(String),
    /// Health check error with context
    Health(String),
    /// Configuration error
    Config(String),
    /// Module-specific error
    Module { module: String, error: String },
    /// State sync error
    Sync(String),
}

impl fmt::Display for EngineError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            EngineError::Init(msg) => write!(f, "Init error: {}", msg),
            EngineError::Runtime(msg) => write!(f, "Runtime error: {}", msg),
            EngineError::Health(msg) => write!(f, "Health error: {}", msg),
            EngineError::Config(msg) => write!(f, "Config error: {}", msg),
            EngineError::Module { module, error } => {
                write!(f, "Module '{}' error: {}", module, error)
            }
            EngineError::Sync(msg) => write!(f, "Sync error: {}", msg),
        }
    }
}

impl std::error::Error for EngineError {}

/// Result type for all engine operations
pub type EngineResult<T> = Result<T, EngineError>;

/// Engine health status - deterministic, simple
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EngineHealth {
    /// Engine is fully operational
    Healthy,
    /// Engine is operational but with warnings
    Degraded,
    /// Engine is experiencing failures
    Failing,
    /// Engine is not responding
    Offline,
}

impl EngineHealth {
    /// Check if health is acceptable for operation
    pub fn is_operational(&self) -> bool {
        matches!(self, EngineHealth::Healthy | EngineHealth::Degraded)
    }

    /// Get severity level (0=healthy, 3=offline)
    pub fn severity(&self) -> u8 {
        match self {
            EngineHealth::Healthy => 0,
            EngineHealth::Degraded => 1,
            EngineHealth::Failing => 2,
            EngineHealth::Offline => 3,
        }
    }
}

impl fmt::Display for EngineHealth {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            EngineHealth::Healthy => write!(f, "Healthy"),
            EngineHealth::Degraded => write!(f, "Degraded"),
            EngineHealth::Failing => write!(f, "Failing"),
            EngineHealth::Offline => write!(f, "Offline"),
        }
    }
}

/// Engine metrics - static, serializable, deterministic
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineMetrics {
    /// Total engine ticks since initialization
    pub ticks: u64,
    /// Stability index (0.0 to 1.0)
    pub stability: f32,
    /// Average latency in milliseconds
    pub latency_ms: u64,
    /// Last update timestamp (milliseconds since epoch)
    pub last_update_ms: u64,
    /// Error count
    pub error_count: u32,
    /// Success rate (0.0 to 1.0)
    pub success_rate: f32,
}

impl Default for EngineMetrics {
    fn default() -> Self {
        Self {
            ticks: 0,
            stability: 1.0,
            latency_ms: 0,
            last_update_ms: chrono::Utc::now().timestamp_millis() as u64,
            error_count: 0,
            success_rate: 1.0,
        }
    }
}

impl EngineMetrics {
    /// Create new metrics with current timestamp
    pub fn new() -> Self {
        Self::default()
    }

    /// Update timestamp to current time
    pub fn update_timestamp(&mut self) {
        self.last_update_ms = chrono::Utc::now().timestamp_millis() as u64;
    }

    /// Record a successful tick
    pub fn record_tick(&mut self, latency_ms: u64) {
        self.ticks += 1;
        self.latency_ms = latency_ms;
        self.update_timestamp();

        // Update success rate
        let total = self.ticks as f32;
        let successes = total - self.error_count as f32;
        self.success_rate = successes / total;
    }

    /// Record an error
    pub fn record_error(&mut self) {
        self.error_count += 1;

        // Update success rate
        let total = self.ticks as f32;
        let successes = total - self.error_count as f32;
        self.success_rate = successes / total;

        // Degrade stability
        self.stability = (self.stability * 0.95).max(0.0);
    }

    /// Restore stability on successful operations
    pub fn restore_stability(&mut self, amount: f32) {
        self.stability = (self.stability + amount).min(1.0);
    }
}

/// Module initialization info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleInfo {
    pub name: String,
    pub version: String,
    pub initialized: bool,
    pub health: EngineHealth,
}
