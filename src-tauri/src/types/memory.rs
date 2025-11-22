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
        }
    }
}
