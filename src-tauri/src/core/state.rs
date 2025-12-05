// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — SINGULARITY STATE
//   Global unified state for SingularityEngine
// ═══════════════════════════════════════════════════════════════

use crate::core::modules::{HarmoniaModule, MemoryModule, NexusModule, SentinelModule};
use crate::core::types::*;
use serde::{Deserialize, Serialize};

// ═══════════════════════════════════════════════════════════════
// AUTONOMY STATE (v24.30)
// ═══════════════════════════════════════════════════════════════

/// Autonomy state - tracks autonomous system operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutonomyState {
    /// Autonomy enabled flag
    pub enabled: bool,
    /// Health score (0-100)
    pub health_score: u8,
    /// Stability index (0-100)
    pub stability_index: u8,
    /// Pipeline integrity (0-100)
    pub pipeline_integrity: u8,
    /// Auto-evolution level (0-10)
    pub auto_evolution_level: u8,
    /// Last scan timestamp (ms since epoch)
    pub last_scan: Option<u64>,
    /// Last fix timestamp (ms since epoch)
    pub last_fix: Option<u64>,
    /// Last optimization timestamp (ms since epoch)
    pub last_optimization: Option<u64>,
    /// Last evolution timestamp (ms since epoch)
    pub last_evolution: Option<u64>,
    /// Errors fixed count
    pub errors_fixed: u64,
    /// Warnings resolved count
    pub warnings_resolved: u64,
    /// Optimizations applied count
    pub optimizations_applied: u64,
    /// Evolutions completed count
    pub evolutions_completed: u64,
    /// Cycle count (total autonomous cycles executed)
    pub cycle_count: u64,
    /// Last cycle duration (ms)
    pub last_cycle_duration_ms: u64,
    /// Average cycle duration (ms)
    pub average_cycle_duration_ms: u64,
}

impl Default for AutonomyState {
    fn default() -> Self {
        Self {
            enabled: false,
            health_score: 100,
            stability_index: 100,
            pipeline_integrity: 100,
            auto_evolution_level: 0,
            last_scan: None,
            last_fix: None,
            last_optimization: None,
            last_evolution: None,
            errors_fixed: 0,
            warnings_resolved: 0,
            optimizations_applied: 0,
            evolutions_completed: 0,
            cycle_count: 0,
            last_cycle_duration_ms: 0,
            average_cycle_duration_ms: 0,
        }
    }
}

impl AutonomyState {
    pub fn new() -> Self {
        Self::default()
    }

    /// Record a successful autonomous cycle
    pub fn record_cycle(&mut self, duration_ms: u64) {
        self.cycle_count += 1;
        self.last_cycle_duration_ms = duration_ms;

        // Update rolling average
        if self.cycle_count == 1 {
            self.average_cycle_duration_ms = duration_ms;
        } else {
            let total = self.average_cycle_duration_ms * (self.cycle_count - 1) + duration_ms;
            self.average_cycle_duration_ms = total / self.cycle_count;
        }
    }

    /// Update health score
    pub fn update_health(&mut self, score: u8) {
        self.health_score = score.min(100);
    }

    /// Update stability index
    pub fn update_stability(&mut self, index: u8) {
        self.stability_index = index.min(100);
    }

    /// Update pipeline integrity
    pub fn update_integrity(&mut self, integrity: u8) {
        self.pipeline_integrity = integrity.min(100);
    }

    /// Record a scan operation
    pub fn record_scan(&mut self) {
        self.last_scan = Some(chrono::Utc::now().timestamp_millis() as u64);
    }

    /// Record a fix operation
    pub fn record_fix(&mut self) {
        self.last_fix = Some(chrono::Utc::now().timestamp_millis() as u64);
        self.errors_fixed += 1;
    }

    /// Record an optimization operation
    pub fn record_optimization(&mut self) {
        self.last_optimization = Some(chrono::Utc::now().timestamp_millis() as u64);
        self.optimizations_applied += 1;
    }

    /// Record an evolution operation
    pub fn record_evolution(&mut self) {
        self.last_evolution = Some(chrono::Utc::now().timestamp_millis() as u64);
        self.evolutions_completed += 1;
        if self.auto_evolution_level < 10 {
            self.auto_evolution_level += 1;
        }
    }

    /// Get overall autonomy health (0.0 to 1.0)
    pub fn overall_health(&self) -> f32 {
        let health = self.health_score as f32 / 100.0;
        let stability = self.stability_index as f32 / 100.0;
        let integrity = self.pipeline_integrity as f32 / 100.0;
        (health + stability + integrity) / 3.0
    }
}

// ═══════════════════════════════════════════════════════════════
// DEVOPS STATE (v26.0)
// ═══════════════════════════════════════════════════════════════

/// DevOps state - tracks Visual DevOps and Local Agent operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevOpsState {
    /// DevOps system enabled
    pub enabled: bool,
    /// Visual mode active (screen analysis)
    pub visual_mode_active: bool,
    /// Local agent active (build/test/deploy)
    pub local_agent_active: bool,

    // Stats
    /// Total DevOps actions performed
    pub total_actions: u64,
    /// Successful actions
    pub successful_actions: u64,
    /// Failed actions
    pub failed_actions: u64,
    /// Actions pending validation
    pub pending_validations: u64,

    // Security
    /// Security level: "strict", "moderate", "permissive"
    pub security_level: String,

    // Tracking
    /// Last screen analysis timestamp (ms since epoch)
    pub last_screen_analysis: Option<u64>,
    /// Last DevOps action timestamp (ms since epoch)
    pub last_devops_action: Option<u64>,
    /// Last build timestamp (ms since epoch)
    pub last_build: Option<u64>,
    /// Last test timestamp (ms since epoch)
    pub last_test: Option<u64>,
    /// Last deploy timestamp (ms since epoch)
    pub last_deploy: Option<u64>,

    // Project health
    /// Project health score (0-100)
    pub project_health_score: u8,
    /// Active automation workflows
    pub active_workflows: u32,

    // Session
    /// Current session ID (null if no active session)
    pub session_id: Option<String>,
    /// Session duration (ms)
    pub session_duration_ms: u64,
}

impl Default for DevOpsState {
    fn default() -> Self {
        Self {
            enabled: false,
            visual_mode_active: false,
            local_agent_active: false,
            total_actions: 0,
            successful_actions: 0,
            failed_actions: 0,
            pending_validations: 0,
            security_level: "strict".to_string(),
            last_screen_analysis: None,
            last_devops_action: None,
            last_build: None,
            last_test: None,
            last_deploy: None,
            project_health_score: 100,
            active_workflows: 0,
            session_id: None,
            session_duration_ms: 0,
        }
    }
}

impl DevOpsState {
    /// Create new DevOpsState
    pub fn new() -> Self {
        Self::default()
    }

    /// Record a screen analysis
    pub fn record_screen_analysis(&mut self) {
        self.last_screen_analysis = Some(chrono::Utc::now().timestamp_millis() as u64);
    }

    /// Record a DevOps action
    pub fn record_devops_action(&mut self, success: bool) {
        self.last_devops_action = Some(chrono::Utc::now().timestamp_millis() as u64);
        self.total_actions += 1;
        if success {
            self.successful_actions += 1;
        } else {
            self.failed_actions += 1;
        }
    }

    /// Record a build operation
    pub fn record_build(&mut self, success: bool) {
        self.last_build = Some(chrono::Utc::now().timestamp_millis() as u64);
        self.record_devops_action(success);
    }

    /// Record a test operation
    pub fn record_test(&mut self, success: bool) {
        self.last_test = Some(chrono::Utc::now().timestamp_millis() as u64);
        self.record_devops_action(success);
    }

    /// Record a deploy operation
    pub fn record_deploy(&mut self, success: bool) {
        self.last_deploy = Some(chrono::Utc::now().timestamp_millis() as u64);
        self.record_devops_action(success);
    }

    /// Update project health score
    pub fn update_project_health(&mut self, score: u8) {
        self.project_health_score = score.min(100);
    }

    /// Add pending validation
    pub fn add_pending_validation(&mut self) {
        self.pending_validations += 1;
    }

    /// Resolve pending validation
    pub fn resolve_pending_validation(&mut self) {
        if self.pending_validations > 0 {
            self.pending_validations -= 1;
        }
    }

    /// Start a new session
    pub fn start_session(&mut self, session_id: String) {
        self.session_id = Some(session_id);
        self.session_duration_ms = 0;
    }

    /// End current session
    pub fn end_session(&mut self) {
        self.session_id = None;
        self.session_duration_ms = 0;
    }

    /// Get success rate (0.0 to 1.0)
    pub fn success_rate(&self) -> f32 {
        if self.total_actions == 0 {
            return 1.0;
        }
        self.successful_actions as f32 / self.total_actions as f32
    }

    /// Get overall DevOps health (0.0 to 1.0)
    pub fn overall_health(&self) -> f32 {
        let success_rate = self.success_rate();
        let project_health = self.project_health_score as f32 / 100.0;
        let security_factor = match self.security_level.as_str() {
            "strict" => 1.0,
            "moderate" => 0.9,
            "permissive" => 0.7,
            _ => 0.8,
        };
        (success_rate + project_health + security_factor) / 3.0
    }
}

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

    /// Autonomy state (v24.30) - autonomous system
    pub autonomy: Option<AutonomyState>,

    /// DevOps state (v26.0) - Visual DevOps & Local Agent
    pub devops: Option<DevOpsState>,

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
            autonomy: None, // v24.30 - Optional, initialized when autonomy enabled
            devops: None,   // v26.0 - Optional, initialized when DevOps enabled
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
