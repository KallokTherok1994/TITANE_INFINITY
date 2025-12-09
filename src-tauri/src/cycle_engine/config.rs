#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   CYCLE ENGINE CONFIGURATION
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CycleEngineConfig {
    pub enabled: bool,
    pub tick_interval_seconds: u64, // Clock tick frequency
    pub daily_cycle_enabled: bool,
    pub weekly_cycle_enabled: bool,
    pub monthly_cycle_enabled: bool,
    pub seasonal_cycle_enabled: bool,
    pub adaptive_load_enabled: bool,
    pub predictive_enabled: bool,
}

impl Default for CycleEngineConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            tick_interval_seconds: 60, // 1 minute
            daily_cycle_enabled: true,
            weekly_cycle_enabled: true,
            monthly_cycle_enabled: true,
            seasonal_cycle_enabled: true,
            adaptive_load_enabled: true,
            predictive_enabled: true,
        }
    }
}

pub type CycleResult<T> = Result<T, CycleError>;

#[derive(Debug, Clone)]
pub struct CycleError(pub String);

impl std::fmt::Display for CycleError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "CycleError: {}", self.0)
    }
}

impl std::error::Error for CycleError {}
