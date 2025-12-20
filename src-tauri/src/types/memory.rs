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

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // DiskMode Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_disk_mode_variants() {
        let modes = vec![
            DiskMode::Disabled,
            DiskMode::ReadOnly,
            DiskMode::WriteOnly,
            DiskMode::ReadWrite,
        ];
        assert_eq!(modes.len(), 4);
    }

    #[test]
    fn test_disk_mode_equality() {
        assert_eq!(DiskMode::ReadWrite, DiskMode::ReadWrite);
        assert_ne!(DiskMode::ReadOnly, DiskMode::WriteOnly);
    }

    #[test]
    fn test_disk_mode_clone() {
        let mode = DiskMode::ReadOnly;
        let cloned = mode;
        assert_eq!(mode, cloned);
    }

    #[test]
    fn test_disk_mode_copy() {
        let mode = DiskMode::WriteOnly;
        let copied: DiskMode = mode;
        assert_eq!(mode, copied);
    }

    #[test]
    fn test_disk_mode_debug() {
        let mode = DiskMode::Disabled;
        let debug_str = format!("{:?}", mode);
        assert!(debug_str.contains("Disabled"));
    }

    #[test]
    fn test_disk_mode_serialization() {
        let mode = DiskMode::ReadWrite;
        let json = serde_json::to_string(&mode).expect("DiskMode should serialize to JSON");
        assert_eq!(json, "\"read_write\"");

        let restored: DiskMode = serde_json::from_str(&json).expect("DiskMode should deserialize from JSON");
        assert_eq!(restored, DiskMode::ReadWrite);
    }

    #[test]
    fn test_disk_mode_rename_all() {
        // Test snake_case serialization for all variants
        assert_eq!(
            serde_json::to_string(&DiskMode::Disabled).expect("DiskMode::Disabled should serialize"),
            "\"disabled\""
        );
        assert_eq!(
            serde_json::to_string(&DiskMode::ReadOnly).expect("DiskMode::ReadOnly should serialize"),
            "\"read_only\""
        );
        assert_eq!(
            serde_json::to_string(&DiskMode::WriteOnly).expect("DiskMode::WriteOnly should serialize"),
            "\"write_only\""
        );
        assert_eq!(
            serde_json::to_string(&DiskMode::ReadWrite).expect("DiskMode::ReadWrite should serialize"),
            "\"read_write\""
        );
    }

    // ─────────────────────────────────────────────────────────────
    // LogLevel Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_log_level_variants() {
        let levels = vec![LogLevel::Info, LogLevel::Warning, LogLevel::Error];
        assert_eq!(levels.len(), 3);
    }

    #[test]
    fn test_log_level_clone() {
        let level = LogLevel::Warning;
        let cloned = level;
        assert!(matches!(cloned, LogLevel::Warning));
    }

    #[test]
    fn test_log_level_debug() {
        let level = LogLevel::Error;
        let debug_str = format!("{:?}", level);
        assert!(debug_str.contains("Error"));
    }

    #[test]
    fn test_log_level_serialization() {
        let level = LogLevel::Info;
        let json = serde_json::to_string(&level).expect("LogLevel should serialize to JSON");
        let restored: LogLevel = serde_json::from_str(&json).expect("LogLevel should deserialize from JSON");
        assert!(matches!(restored, LogLevel::Info));
    }

    // ─────────────────────────────────────────────────────────────
    // EventType Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_event_type_variants() {
        let types = vec![
            EventType::SystemStart,
            EventType::ModuleInit,
            EventType::HealthChange,
            EventType::Repair,
            EventType::Snapshot,
            EventType::Alert,
        ];
        assert_eq!(types.len(), 6);
    }

    #[test]
    fn test_event_type_clone() {
        let event_type = EventType::Repair;
        let cloned = event_type.clone();
        assert!(matches!(cloned, EventType::Repair));
    }

    #[test]
    fn test_event_type_debug() {
        let event_type = EventType::SystemStart;
        let debug_str = format!("{:?}", event_type);
        assert!(debug_str.contains("SystemStart"));
    }

    #[test]
    fn test_event_type_serialization() {
        let event_type = EventType::Alert;
        let json = serde_json::to_string(&event_type).expect("EventType should serialize to JSON");
        let restored: EventType = serde_json::from_str(&json).expect("EventType should deserialize from JSON");
        assert!(matches!(restored, EventType::Alert));
    }

    // ─────────────────────────────────────────────────────────────
    // MemoryState Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_memory_state_default() {
        let state = MemoryState::default();

        assert_eq!(state.snapshots_count, 0);
        assert_eq!(state.log_entries_count, 0);
        assert_eq!(state.timeline_events, 0);
        assert_eq!(state.storage_size_mb, 0.0);
        assert_eq!(state.timestamp, 0);
        assert_eq!(state.disk_mode, DiskMode::Disabled);
        assert!(state.synthetic_mode);
        assert!(state.last_validation_ts.is_none());
        assert!(state.last_compaction_ts.is_none());
        assert!(state.issues.is_empty());
    }

    #[test]
    fn test_memory_state_with_data() {
        let state = MemoryState {
            snapshots_count: 10,
            log_entries_count: 100,
            timeline_events: 50,
            storage_size_mb: 25.5,
            timestamp: 1234567890,
            disk_mode: DiskMode::ReadWrite,
            synthetic_mode: false,
            last_validation_ts: Some(1234567800),
            last_compaction_ts: Some(1234567000),
            issues: vec!["minor issue".to_string()],
        };

        assert_eq!(state.snapshots_count, 10);
        assert_eq!(state.disk_mode, DiskMode::ReadWrite);
        assert!(!state.synthetic_mode);
        assert_eq!(state.issues.len(), 1);
    }

    #[test]
    fn test_memory_state_clone() {
        let state = MemoryState::default();
        let cloned = state.clone();
        assert_eq!(cloned.disk_mode, state.disk_mode);
    }

    #[test]
    fn test_memory_state_debug() {
        let state = MemoryState::default();
        let debug_str = format!("{:?}", state);
        assert!(debug_str.contains("MemoryState"));
    }

    #[test]
    fn test_memory_state_serialization() {
        let state = MemoryState {
            snapshots_count: 5,
            storage_size_mb: 10.5,
            ..Default::default()
        };
        let json = serde_json::to_string(&state).expect("MemoryState should serialize to JSON");
        let restored: MemoryState = serde_json::from_str(&json).expect("MemoryState should deserialize from JSON");
        assert_eq!(restored.snapshots_count, 5);
        assert_eq!(restored.storage_size_mb, 10.5);
    }

    // ─────────────────────────────────────────────────────────────
    // MemoryFileReport Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_memory_file_report_creation() {
        let report = MemoryFileReport {
            name: "snapshot.db".to_string(),
            size_bytes: 1024,
            modified_ts: 1234567890,
            version: Some("v1.0".to_string()),
        };

        assert_eq!(report.name, "snapshot.db");
        assert_eq!(report.size_bytes, 1024);
    }

    #[test]
    fn test_memory_file_report_clone() {
        let report = MemoryFileReport {
            name: "test.dat".to_string(),
            size_bytes: 512,
            modified_ts: 100,
            version: None,
        };
        let cloned = report.clone();
        assert_eq!(cloned.size_bytes, 512);
    }

    #[test]
    fn test_memory_file_report_debug() {
        let report = MemoryFileReport {
            name: "x".to_string(),
            size_bytes: 0,
            modified_ts: 0,
            version: None,
        };
        let debug_str = format!("{:?}", report);
        assert!(debug_str.contains("MemoryFileReport"));
    }

    #[test]
    fn test_memory_file_report_serialization() {
        let report = MemoryFileReport {
            name: "data.json".to_string(),
            size_bytes: 2048,
            modified_ts: 999999,
            version: Some("v2.0".to_string()),
        };
        let json = serde_json::to_string(&report).expect("MemoryFileReport should serialize to JSON");
        let restored: MemoryFileReport = serde_json::from_str(&json).expect("MemoryFileReport should deserialize from JSON");
        assert_eq!(restored.name, "data.json");
        assert_eq!(restored.version, Some("v2.0".to_string()));
    }

    // ─────────────────────────────────────────────────────────────
    // MemoryDirectoryReport Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_memory_directory_report_creation() {
        let report = MemoryDirectoryReport {
            base_path: "/home/user/memory".to_string(),
            missing: false,
            total_size_bytes: 10240,
            files: vec![],
        };

        assert_eq!(report.base_path, "/home/user/memory");
        assert!(!report.missing);
    }

    #[test]
    fn test_memory_directory_report_with_files() {
        let file = MemoryFileReport {
            name: "test.db".to_string(),
            size_bytes: 1000,
            modified_ts: 123,
            version: None,
        };

        let report = MemoryDirectoryReport {
            base_path: "/data".to_string(),
            missing: false,
            total_size_bytes: 1000,
            files: vec![file],
        };

        assert_eq!(report.files.len(), 1);
    }

    #[test]
    fn test_memory_directory_report_clone() {
        let report = MemoryDirectoryReport {
            base_path: "/path".to_string(),
            missing: true,
            total_size_bytes: 0,
            files: vec![],
        };
        let cloned = report.clone();
        assert!(cloned.missing);
    }

    #[test]
    fn test_memory_directory_report_debug() {
        let report = MemoryDirectoryReport {
            base_path: "".to_string(),
            missing: true,
            total_size_bytes: 0,
            files: vec![],
        };
        let debug_str = format!("{:?}", report);
        assert!(debug_str.contains("MemoryDirectoryReport"));
    }

    #[test]
    fn test_memory_directory_report_serialization() {
        let report = MemoryDirectoryReport {
            base_path: "/memory".to_string(),
            missing: false,
            total_size_bytes: 5000,
            files: vec![],
        };
        let json = serde_json::to_string(&report).expect("MemoryDirectoryReport should serialize to JSON");
        let restored: MemoryDirectoryReport = serde_json::from_str(&json).expect("MemoryDirectoryReport should deserialize from JSON");
        assert_eq!(restored.base_path, "/memory");
    }

    // ─────────────────────────────────────────────────────────────
    // LogEntry Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_log_entry_creation() {
        let entry = LogEntry {
            id: "log-001".to_string(),
            timestamp: 1234567890,
            level: LogLevel::Info,
            module: "core".to_string(),
            message: "System started".to_string(),
        };

        assert_eq!(entry.id, "log-001");
        assert!(matches!(entry.level, LogLevel::Info));
    }

    #[test]
    fn test_log_entry_clone() {
        let entry = LogEntry {
            id: "id".to_string(),
            timestamp: 100,
            level: LogLevel::Warning,
            module: "mod".to_string(),
            message: "msg".to_string(),
        };
        let cloned = entry.clone();
        assert_eq!(cloned.module, "mod");
    }

    #[test]
    fn test_log_entry_debug() {
        let entry = LogEntry {
            id: "x".to_string(),
            timestamp: 0,
            level: LogLevel::Error,
            module: "".to_string(),
            message: "".to_string(),
        };
        let debug_str = format!("{:?}", entry);
        assert!(debug_str.contains("LogEntry"));
    }

    #[test]
    fn test_log_entry_serialization() {
        let entry = LogEntry {
            id: "entry-123".to_string(),
            timestamp: 999,
            level: LogLevel::Error,
            module: "sentinel".to_string(),
            message: "Health check failed".to_string(),
        };
        let json = serde_json::to_string(&entry).expect("LogEntry should serialize to JSON");
        let restored: LogEntry = serde_json::from_str(&json).expect("LogEntry should deserialize from JSON");
        assert_eq!(restored.id, "entry-123");
        assert!(matches!(restored.level, LogLevel::Error));
    }

    // ─────────────────────────────────────────────────────────────
    // TimelineEvent Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_timeline_event_creation() {
        let event = TimelineEvent {
            id: "event-001".to_string(),
            timestamp: 1234567890,
            event_type: EventType::SystemStart,
            description: "System booted".to_string(),
            data: HashMap::new(),
        };

        assert_eq!(event.id, "event-001");
        assert!(matches!(event.event_type, EventType::SystemStart));
    }

    #[test]
    fn test_timeline_event_with_data() {
        let mut data = HashMap::new();
        data.insert("key".to_string(), serde_json::json!("value"));
        data.insert("count".to_string(), serde_json::json!(42));

        let event = TimelineEvent {
            id: "ev".to_string(),
            timestamp: 100,
            event_type: EventType::ModuleInit,
            description: "Module initialized".to_string(),
            data,
        };

        assert_eq!(event.data.len(), 2);
    }

    #[test]
    fn test_timeline_event_clone() {
        let event = TimelineEvent {
            id: "id".to_string(),
            timestamp: 0,
            event_type: EventType::Alert,
            description: "desc".to_string(),
            data: HashMap::new(),
        };
        let cloned = event.clone();
        assert_eq!(cloned.description, "desc");
    }

    #[test]
    fn test_timeline_event_debug() {
        let event = TimelineEvent {
            id: "".to_string(),
            timestamp: 0,
            event_type: EventType::Repair,
            description: "".to_string(),
            data: HashMap::new(),
        };
        let debug_str = format!("{:?}", event);
        assert!(debug_str.contains("TimelineEvent"));
    }

    #[test]
    fn test_timeline_event_serialization() {
        let event = TimelineEvent {
            id: "tl-event".to_string(),
            timestamp: 5555,
            event_type: EventType::Snapshot,
            description: "Snapshot taken".to_string(),
            data: HashMap::new(),
        };
        let json = serde_json::to_string(&event).expect("TimelineEvent should serialize to JSON");
        let restored: TimelineEvent = serde_json::from_str(&json).expect("TimelineEvent should deserialize from JSON");
        assert_eq!(restored.id, "tl-event");
        assert!(matches!(restored.event_type, EventType::Snapshot));
    }

    // ─────────────────────────────────────────────────────────────
    // Snapshot Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_snapshot_creation() {
        let snapshot = Snapshot {
            id: "snap-001".to_string(),
            timestamp: 1234567890,
            helios: None,
            nexus: None,
            harmonia: None,
            sentinel: None,
            metadata: HashMap::new(),
        };

        assert_eq!(snapshot.id, "snap-001");
        assert!(snapshot.helios.is_none());
    }

    #[test]
    fn test_snapshot_with_metadata() {
        let mut metadata = HashMap::new();
        metadata.insert("version".to_string(), "v1.0".to_string());
        metadata.insert("creator".to_string(), "system".to_string());

        let snapshot = Snapshot {
            id: "snap".to_string(),
            timestamp: 100,
            helios: None,
            nexus: None,
            harmonia: None,
            sentinel: None,
            metadata,
        };

        assert_eq!(snapshot.metadata.len(), 2);
        assert_eq!(snapshot.metadata.get("version"), Some(&"v1.0".to_string()));
    }

    #[test]
    fn test_snapshot_clone() {
        let snapshot = Snapshot {
            id: "id".to_string(),
            timestamp: 999,
            helios: None,
            nexus: None,
            harmonia: None,
            sentinel: None,
            metadata: HashMap::new(),
        };
        let cloned = snapshot.clone();
        assert_eq!(cloned.timestamp, 999);
    }

    #[test]
    fn test_snapshot_debug() {
        let snapshot = Snapshot {
            id: "".to_string(),
            timestamp: 0,
            helios: None,
            nexus: None,
            harmonia: None,
            sentinel: None,
            metadata: HashMap::new(),
        };
        let debug_str = format!("{:?}", snapshot);
        assert!(debug_str.contains("Snapshot"));
    }

    #[test]
    fn test_snapshot_serialization() {
        let snapshot = Snapshot {
            id: "snapshot-test".to_string(),
            timestamp: 12345,
            helios: None,
            nexus: None,
            harmonia: None,
            sentinel: None,
            metadata: HashMap::new(),
        };
        let json = serde_json::to_string(&snapshot).expect("Snapshot should serialize to JSON");
        let restored: Snapshot = serde_json::from_str(&json).expect("Snapshot should deserialize from JSON");
        assert_eq!(restored.id, "snapshot-test");
    }
}
