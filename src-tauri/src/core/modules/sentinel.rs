// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — SENTINEL MODULE
//   System monitoring and protection
// ═══════════════════════════════════════════════════════════════

use crate::core::state::SingularityState;
use crate::core::types::*;
use serde::{Deserialize, Serialize};

/// Sentinel Module - Monitoring and protection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SentinelModule {
    /// Module health
    health: EngineHealth,

    /// Alerts triggered count
    pub alert_count: u64,

    /// Active monitors count
    pub active_monitors: u32,

    /// Protection level (0-10)
    pub protection_level: u8,

    /// Last check timestamp (ms since epoch)
    pub last_check_ms: u64,

    /// Module initialized
    initialized: bool,
}

impl Default for SentinelModule {
    fn default() -> Self {
        Self {
            health: EngineHealth::Offline,
            alert_count: 0,
            active_monitors: 0,
            protection_level: 10,
            last_check_ms: 0,
            initialized: false,
        }
    }
}

impl SentinelModule {
    /// Create new Sentinel module
    pub fn new() -> Self {
        Self::default()
    }

    /// Initialize the Sentinel module
    pub async fn init(&mut self, _state: &mut SingularityState) -> EngineResult<()> {
        if self.initialized {
            return Ok(());
        }

        self.health = EngineHealth::Healthy;
        self.initialized = true;
        self.active_monitors = 4; // nexus, memory, harmonia, metrics
        self.last_check_ms = chrono::Utc::now().timestamp_millis() as u64;

        Ok(())
    }

    /// Execute sentinel tick
    pub async fn tick(&mut self, state: &mut SingularityState) -> EngineResult<()> {
        if !self.initialized {
            return Err(EngineError::Module {
                module: "Sentinel".to_string(),
                error: "Not initialized".to_string(),
            });
        }

        // Update check timestamp
        self.last_check_ms = chrono::Utc::now().timestamp_millis() as u64;

        // Monitor system health
        let system_health = state.health();

        // Trigger alert if health is degraded
        if system_health.severity() > 1 {
            self.alert_count += 1;
            self.protection_level = 10 - system_health.severity();
        } else {
            // Restore protection level
            self.protection_level = (self.protection_level + 1).min(10);
        }

        // Update metrics
        if state.metrics.error_count > 0 {
            state.metrics.restore_stability(0.01);
        }

        Ok(())
    }

    /// Get module health
    pub fn health(&self) -> EngineHealth {
        // Check protection level
        if self.protection_level < 3 {
            EngineHealth::Failing
        } else if self.protection_level < 7 {
            EngineHealth::Degraded
        } else {
            self.health
        }
    }

    /// Check if initialized
    pub fn is_initialized(&self) -> bool {
        self.initialized
    }

    /// Get module info
    pub fn info(&self) -> ModuleInfo {
        ModuleInfo {
            name: "Sentinel".to_string(),
            version: "14.0.0".to_string(),
            initialized: self.initialized,
            health: self.health(),
        }
    }

    /// Get alert statistics
    pub fn alert_stats(&self) -> (u64, u8) {
        (self.alert_count, self.protection_level)
    }
}
