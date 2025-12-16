#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   CLOCK ENGINE — Internal System Clock
//   SUPER PROMPT #16
// ═══════════════════════════════════════════════════════════════

use crate::cycle_engine::config::{CycleError, CycleResult};
use chrono::{DateTime, Local, Timelike};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::time::{interval, Duration};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ClockEvent {
    Tick,
    HourChange { hour: u32 },
    DayPhaseChange { phase: String },
    WeekPhaseChange { day: String },
    SeasonChange { season: String },
}

pub struct ClockEngine {
    tick_interval: Duration,
    running: Arc<RwLock<bool>>,
    current_time: Arc<RwLock<DateTime<Local>>>,
}

impl ClockEngine {
    pub fn new(tick_interval_seconds: u64) -> Self {
        Self {
            tick_interval: Duration::from_secs(tick_interval_seconds),
            running: Arc::new(RwLock::new(false)),
            current_time: Arc::new(RwLock::new(Local::now())),
        }
    }

    /// Start clock engine
    pub async fn start(&self) -> CycleResult<()> {
        let mut running = self.running.write().await;
        if *running {
            return Err(CycleError("Clock already running".to_string()));
        }
        *running = true;

        // Spawn background task
        let tick_interval = self.tick_interval;
        let current_time = Arc::clone(&self.current_time);
        let running_clone = Arc::clone(&self.running);

        tokio::spawn(async move {
            let mut interval_timer = interval(tick_interval);
            loop {
                interval_timer.tick().await;

                let running = running_clone.read().await;
                if !*running {
                    break;
                }
                drop(running);

                // Update current time
                let mut time = current_time.write().await;
                *time = Local::now();

                // Emit tick event
                // Implementation: Integrate with CycleEngine event system
                // - Event: Emit "cycle:tick" event with timestamp payload
                // - Tauri: Use app_handle.emit_all("cycle:tick", timestamp) for frontend
                // - Subscribers: Notify registered listeners (AI scheduler, memory sync, UI clock)
                // - Frequency: Configurable tick interval (default: 1s, range: 100ms-60s)
                // - Performance: Use async channel (tokio::sync::broadcast) for non-blocking
            }
        });

        Ok(())
    }

    /// Stop clock engine
    pub async fn stop(&self) -> CycleResult<()> {
        let mut running = self.running.write().await;
        *running = false;
        Ok(())
    }

    /// Get current time
    pub async fn current_time(&self) -> DateTime<Local> {
        let time = self.current_time.read().await;
        *time
    }

    /// Get current hour
    pub async fn current_hour(&self) -> u32 {
        let time = self.current_time().await;
        time.hour()
    }

    /// Check if running
    pub async fn is_running(&self) -> bool {
        let running = self.running.read().await;
        *running
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_clock_engine_start_stop() {
        let clock = ClockEngine::new(1);
        assert!(!clock.is_running().await);

        let _ = clock.start().await;
        assert!(clock.is_running().await);

        let _ = clock.stop().await;
        assert!(!clock.is_running().await);
    }
}
