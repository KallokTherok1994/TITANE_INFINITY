// ═══════════════════════════════════════════════════════════════
// TITANE∞ v8.0 → v17.3.0 - Shared Types (DEPRECATED)
// ⚠️  CE FICHIER EST DEPRECATED
// ⚠️  Utiliser `crate::types::shared` à la place
// ⚠️  Migration guide: src-tauri/src/types/TYPES_MIGRATION_GUIDE.md
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

/// ⚠️  DEPRECATED: Use `crate::types::AppResult` or `crate::utils::AppResult`
#[deprecated(since = "17.3.0", note = "Use utils::AppResult or types::shared types instead")]
pub type TitaneResult<T> = Result<T, String>;

/// ⚠️  DEPRECATED: Use `crate::types::shared::HealthStatus`
#[deprecated(since = "17.3.0", note = "Use types::shared::HealthStatus instead")]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum HealthStatus {
    Healthy,
    Degraded,
    Critical,
    Offline,
}

/// ⚠️  DEPRECATED: Use `crate::types::shared::ModuleHealthInfo`
#[deprecated(since = "17.3.0", note = "Use types::shared::ModuleHealthInfo instead")]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleHealth {
    pub name: String,
    pub status: crate::types::shared::HealthStatus,
    pub uptime: u64,
    pub last_tick: u64,
    pub message: String,
}

/// Overall system status (used by frontend but not instantiated in backend)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct SystemStatus {
    pub modules: Vec<crate::types::shared::ModuleHealthInfo>,
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
