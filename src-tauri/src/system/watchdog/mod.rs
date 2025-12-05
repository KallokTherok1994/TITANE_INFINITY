// TITANE∞ v8.0 - WATCHDOG Module (Optimized)
// Module health monitoring & logging - No unwrap

use crate::shared::types::{HealthStatus, LogEntry, LogLevel, ModuleHealth, TitaneResult};
use crate::shared::utils::current_timestamp;
use std::collections::VecDeque;
const MODULE_NAME: &str = "Watchdog";
const MAX_LOG_ENTRIES: usize = 1000;
/// Watchdog module state - System surveillance
#[derive(Debug)]
pub struct WatchdogModule {
    pub initialized: bool,
    pub last_update: u64,
    pub tick_misses: usize, // Missed ticks count
    pub last_check: u64,    // Last health check timestamp
    pub module_health: f32, // Overall modules health (0.0 - 100.0)
    logs: VecDeque<LogEntry>,
    start_time: u64,
}
impl WatchdogModule {
    /// Initialize Watchdog module
    pub fn init() -> TitaneResult<Self> {
        log::info!("🐕 [{}] Initializing system monitor", MODULE_NAME);

        Ok(Self {
            initialized: true,
            last_update: current_timestamp(),
            tick_misses: 0,
            last_check: current_timestamp(),
            module_health: 100.0,
            logs: VecDeque::with_capacity(MAX_LOG_ENTRIES),
            start_time: current_timestamp(),
        })
    }

    /// Tick - Check module health
    pub fn tick(&mut self) -> TitaneResult<()> {
        let current = current_timestamp();
        self.last_update = current;
        // Check if tick is on time (tolerance: 2 seconds)
        let expected_interval = 1000; // 1 second
        let actual_interval = current.saturating_sub(self.last_check);
        if actual_interval > expected_interval + 1000 {
            self.tick_misses += 1;
            log::warn!(
                "🐕 [{}] Tick miss detected ({}ms delay)",
                MODULE_NAME,
                actual_interval - expected_interval
            );
        }
        self.last_check = current;
        // Calculate overall module health
        self.module_health = if self.tick_misses == 0 {
            100.0
        } else {
            (100.0 - (self.tick_misses as f32 * 5.0)).max(0.0)
        };

        Ok(())
    }

    /// Get module health
    pub fn health(&self) -> ModuleHealth {
        let current = current_timestamp();
        let uptime = current.saturating_sub(self.start_time);
        let status = if !self.initialized {
            HealthStatus::Offline
        } else if self.module_health < 30.0 {
            HealthStatus::Critical
        } else if self.module_health < 70.0 {
            HealthStatus::Degraded
        } else {
            HealthStatus::Healthy
        };

        ModuleHealth {
            name: MODULE_NAME.to_string(),
            status,
            uptime,
            last_tick: self.last_update,
            message: format!(
                "Logs: {} | Health: {:.1}%",
                self.logs.len(),
                self.module_health
            ),
        }
    }

    /// Add log entry
    #[allow(dead_code)]
    pub fn add_log(&mut self, level: LogLevel, module: &str, message: &str) {
        let entry = LogEntry {
            timestamp: current_timestamp(),
            level,
            module: module.to_string(),
            message: message.to_string(),
        };

        if self.logs.len() >= MAX_LOG_ENTRIES {
            self.logs.pop_front();
        }

        self.logs.push_back(entry);
    }

    /// Get all logs as formatted strings
    pub fn get_logs(&self) -> Vec<String> {
        self.logs
            .iter()
            .map(|log| format!("[{:?}] [{}] {}", log.level, log.module, log.message))
            .collect()
    }
}
