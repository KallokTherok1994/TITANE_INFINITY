// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — SINGULARITY STATE
//   Global unified state for SingularityEngine
// ═══════════════════════════════════════════════════════════════

use crate::core::modules::{HarmoniaModule, MemoryModule, NexusModule, SentinelModule};
use crate::core::types::*;
use serde::{Deserialize, Serialize};

/// Cognition state - tracks cognitive processing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitionState {
    /// Current cognitive load (0.0 to 1.0)
    pub load: f32,
    /// Active thoughts count
    pub active_thoughts: u32,
    /// Processing depth (0-10)
    pub depth: u8,
    /// Last cognition update timestamp (ms since epoch)
    pub last_update_ms: u64,
}

impl Default for CognitionState {
    fn default() -> Self {
        Self {
            load: 0.0,
            active_thoughts: 0,
            depth: 0,
            last_update_ms: chrono::Utc::now().timestamp_millis() as u64,
        }
    }
}

impl CognitionState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn update_timestamp(&mut self) {
        self.last_update_ms = chrono::Utc::now().timestamp_millis() as u64;
    }
}

/// Timeline state - tracks temporal events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineState {
    /// Total events recorded
    pub event_count: u64,
    /// Current timeline position (ms since epoch)
    pub current_position_ms: u64,
    /// Timeline start (ms since epoch)
    pub start_ms: u64,
    /// Last timeline update (ms since epoch)
    pub last_update_ms: u64,
}

impl Default for TimelineState {
    fn default() -> Self {
        let now = chrono::Utc::now().timestamp_millis() as u64;
        Self {
            event_count: 0,
            current_position_ms: now,
            start_ms: now,
            last_update_ms: now,
        }
    }
}

impl TimelineState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn record_event(&mut self) {
        self.event_count += 1;
        self.current_position_ms = chrono::Utc::now().timestamp_millis() as u64;
        self.last_update_ms = self.current_position_ms;
    }

    pub fn update_timestamp(&mut self) {
        self.last_update_ms = chrono::Utc::now().timestamp_millis() as u64;
    }
}

/// Main SingularityState - global unified state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SingularityState {
    /// Nexus module - central coordinator
    pub nexus: NexusModule,

    /// Memory module - persistent memory
    pub memory: MemoryModule,

    /// Harmonia module - harmony & balance
    pub harmonia: HarmoniaModule,

    /// Sentinel module - monitoring & protection
    pub sentinel: SentinelModule,

    /// Cognition state
    pub cognition: CognitionState,

    /// Timeline state
    pub timeline: TimelineState,

    /// Global metrics
    pub metrics: EngineMetrics,

    /// Initialization timestamp (ms since epoch)
    pub init_timestamp_ms: u64,

    /// Last sync timestamp (ms since epoch)
    pub last_sync_ms: u64,
}

impl Default for SingularityState {
    fn default() -> Self {
        let now = chrono::Utc::now().timestamp_millis() as u64;
        Self {
            nexus: NexusModule::new(),
            memory: MemoryModule::new(),
            harmonia: HarmoniaModule::new(),
            sentinel: SentinelModule::new(),
            cognition: CognitionState::new(),
            timeline: TimelineState::new(),
            metrics: EngineMetrics::new(),
            init_timestamp_ms: now,
            last_sync_ms: now,
        }
    }
}

impl SingularityState {
    /// Create new SingularityState
    pub fn new() -> Self {
        Self::default()
    }

    /// Get overall system health
    pub fn health(&self) -> EngineHealth {
        // Aggregate health from all modules
        let healths = [
            self.nexus.health(),
            self.memory.health(),
            self.harmonia.health(),
            self.sentinel.health(),
        ];

        // Find worst health status
        let max_severity = healths.iter().map(|h| h.severity()).max().unwrap_or(0);

        match max_severity {
            0 => EngineHealth::Healthy,
            1 => EngineHealth::Degraded,
            2 => EngineHealth::Failing,
            _ => EngineHealth::Offline,
        }
    }

    /// Update sync timestamp
    pub fn mark_synced(&mut self) {
        self.last_sync_ms = chrono::Utc::now().timestamp_millis() as u64;
    }

    /// Get time since initialization in seconds
    pub fn uptime_seconds(&self) -> u64 {
        let now = chrono::Utc::now().timestamp_millis() as u64;
        (now - self.init_timestamp_ms) / 1000
    }

    /// Get time since last sync in seconds
    pub fn time_since_sync_seconds(&self) -> u64 {
        let now = chrono::Utc::now().timestamp_millis() as u64;
        (now - self.last_sync_ms) / 1000
    }
}
