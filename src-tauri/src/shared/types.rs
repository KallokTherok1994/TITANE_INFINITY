// TITANE∞ v8.0 - Shared Types (Optimized)
// Common types used across all modules - Zero unwrap, strict error handling

use serde::{Deserialize, Serialize};
/// Result type for all TITANE operations - explicit error handling
pub type TitaneResult<T> = Result<T, String>;
/// Module health status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum HealthStatus {
    Healthy,
    Degraded,
    Critical,
    Offline,
}
/// Module health information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleHealth {
    pub name: String,
    pub status: HealthStatus,
    pub uptime: u64,
    pub last_tick: u64,
    pub message: String,
}

/// Overall system status (used by frontend but not instantiated in backend)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct SystemStatus {
    pub modules: Vec<ModuleHealth>,
}

/// System metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub cpu_usage: f32,
    pub memory_usage: f32,
    pub disk_usage: f32,
    pub uptime: u64,
}

/// Cognitive node representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveNode {
    pub id: String,
    pub node_type: String,
    pub connections: Vec<String>,
    pub weight: f32,
}

/// Log level
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogLevel {
    Info,
    Warning,
    Error,
}

/// Log entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub timestamp: u64,
    pub level: LogLevel,
    pub module: String,
    pub message: String,
}
