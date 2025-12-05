// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — TYPES: MEMORY
//   Unified Storage, Snapshots, Timeline
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Memory module state - Storage & history
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryState {
    pub snapshots_count: usize,
    pub log_entries_count: usize,
    pub timeline_events: usize,
    pub storage_size_mb: f64,
    pub timestamp: i64,
    pub disk_mode: DiskMode,
    pub synthetic_mode: bool,
    pub last_validation_ts: Option<i64>,
    pub last_compaction_ts: Option<i64>,
    pub issues: Vec<String>,
}

/// Disk operating mode advertised to the UI
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum DiskMode {
    Disabled,
    ReadOnly,
    WriteOnly,
    ReadWrite,
}

/// File-level telemetry for the memory directory audit
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryFileReport {
    pub name: String,
    pub size_bytes: u64,
    pub modified_ts: i64,
    pub version: Option<String>,
}

/// Directory scan snapshot surfaced to the frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryDirectoryReport {
    pub base_path: String,
    pub missing: bool,
    pub total_size_bytes: u64,
    pub files: Vec<MemoryFileReport>,
}

/// System snapshot at a point in time
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snapshot {
    pub id: String,
    pub timestamp: i64,
    pub helios: Option<crate::types::helios::HeliosState>,
    pub nexus: Option<crate::types::nexus::NexusState>,
    pub harmonia: Option<crate::types::harmonia::HarmoniaState>,
    pub sentinel: Option<crate::types::sentinel::SentinelState>,
    pub metadata: HashMap<String, String>,
}

/// Log entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub id: String,
    pub timestamp: i64,
    pub level: LogLevel,
    pub module: String,
    pub message: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum LogLevel {
    Info,
    Warning,
    Error,
}

/// Timeline event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub id: String,
    pub timestamp: i64,
    pub event_type: EventType,
    pub description: String,
    pub data: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventType {
    SystemStart,
    ModuleInit,
    HealthChange,
    Repair,
    Snapshot,
    Alert,
}

impl Default for MemoryState {
    fn default() -> Self {
        Self {
            snapshots_count: 0,
            log_entries_count: 0,
            timeline_events: 0,
            storage_size_mb: 0.0,
            timestamp: 0,
            disk_mode: DiskMode::Disabled,
            synthetic_mode: true,
            last_validation_ts: None,
            last_compaction_ts: None,
            issues: Vec::new(),
        }
    }
}
