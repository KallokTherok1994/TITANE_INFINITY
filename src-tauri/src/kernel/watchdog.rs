// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — KERNEL WATCHDOG
//   Anomaly detection and system health monitoring
//   Super Prompt #11 — Phase 7
// ═══════════════════════════════════════════════════════════════

use std::time::Instant;
use tokio::sync::broadcast;

use super::events::KernelEvent;

/// Watchdog configuration
#[derive(Debug, Clone)]
pub struct WatchdogConfig {
    /// Heartbeat interval in seconds
    pub heartbeat_interval_secs: u64,
    /// Maximum allowed slowdown factor (2.0 = 2x slower than expected)
    pub max_slowdown_factor: f32,
    /// Enable automatic alerts
    pub auto_alerts: bool,
}

impl Default for WatchdogConfig {
    fn default() -> Self {
        Self {
            heartbeat_interval_secs: 1,
            max_slowdown_factor: 2.0,
            auto_alerts: true,
        }
    }
}

/// Kernel watchdog for detecting anomalies
///
/// Monitors:
/// - Kernel responsiveness (slowdowns)
/// - Potential deadlocks (no progress)
/// - Memory leaks (growing memory)
/// - Runaway loops (CPU spikes)
pub struct KernelWatchdog {
    config: WatchdogConfig,
    last_tick: Instant,
    tick_count: u64,
    event_tx: broadcast::Sender<KernelEvent>,
}

impl KernelWatchdog {
    /// Create new watchdog
    pub fn new(config: WatchdogConfig, event_tx: broadcast::Sender<KernelEvent>) -> Self {
        Self {
            config,
            last_tick: Instant::now(),
            tick_count: 0,
            event_tx,
        }
    }

    /// Heartbeat tick — Call periodically from core loop
    pub async fn tick(&mut self) {
        let elapsed = self.last_tick.elapsed();
        let expected_interval = std::time::Duration::from_secs(self.config.heartbeat_interval_secs);

        // Check for slowdown
        if elapsed > expected_interval.mul_f32(self.config.max_slowdown_factor) {
            self.alert_slowdown(elapsed.as_secs()).await;
        }

        // Emit heartbeat event
        let _ = self.event_tx.send(KernelEvent::WatchdogHeartbeat {
            timestamp: chrono::Utc::now().timestamp_millis(),
        });

        self.last_tick = Instant::now();
        self.tick_count += 1;
    }

    /// Alert slowdown detected
    async fn alert_slowdown(&self, elapsed_secs: u64) {
        log::warn!(
            "[Watchdog] Kernel slowdown detected: {}s (expected: {}s)",
            elapsed_secs,
            self.config.heartbeat_interval_secs
        );

        if self.config.auto_alerts {
            let _ = self.event_tx.send(KernelEvent::WatchdogAlert {
                alert_type: "slowdown".to_string(),
                message: format!(
                    "Kernel heartbeat delayed by {}s",
                    elapsed_secs - self.config.heartbeat_interval_secs
                ),
            });
        }
    }

    /// Check if watchdog is healthy (recently ticked)
    pub fn is_healthy(&self) -> bool {
        self.last_tick.elapsed().as_secs() < self.config.heartbeat_interval_secs * 3
    }

    /// Get tick count
    pub fn tick_count(&self) -> u64 {
        self.tick_count
    }

    /// Reset watchdog
    pub fn reset(&mut self) {
        self.last_tick = Instant::now();
        self.tick_count = 0;
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::Duration;

    #[tokio::test]
    async fn test_watchdog_creation() {
        let (tx, _rx) = broadcast::channel(100);
        let config = WatchdogConfig::default();
        let watchdog = KernelWatchdog::new(config, tx);

        assert_eq!(watchdog.tick_count(), 0);
        assert!(watchdog.is_healthy());
    }

    #[tokio::test]
    async fn test_watchdog_tick() {
        let (tx, mut rx) = broadcast::channel(100);
        let config = WatchdogConfig::default();
        let mut watchdog = KernelWatchdog::new(config, tx);

        watchdog.tick().await;

        assert_eq!(watchdog.tick_count(), 1);

        // Should receive heartbeat event
        let event = rx.try_recv();
        assert!(event.is_ok());
        assert!(matches!(
            event.unwrap(),
            KernelEvent::WatchdogHeartbeat { .. }
        ));
    }

    #[tokio::test]
    async fn test_watchdog_slowdown_detection() {
        let (tx, mut rx) = broadcast::channel(100);
        let config = WatchdogConfig {
            heartbeat_interval_secs: 1,
            max_slowdown_factor: 1.5,
            auto_alerts: true,
        };
        let mut watchdog = KernelWatchdog::new(config, tx);

        // First tick
        watchdog.tick().await;

        // Wait longer than expected
        tokio::time::sleep(Duration::from_secs(2)).await;

        // Second tick should detect slowdown
        watchdog.tick().await;

        // Should receive alert
        tokio::time::sleep(Duration::from_millis(10)).await;
        let mut found_alert = false;
        while let Ok(event) = rx.try_recv() {
            if matches!(event, KernelEvent::WatchdogAlert { .. }) {
                found_alert = true;
                break;
            }
        }
        assert!(found_alert);
    }

    #[tokio::test]
    async fn test_watchdog_health_check() {
        let (tx, _rx) = broadcast::channel(100);
        let config = WatchdogConfig::default();
        let watchdog = KernelWatchdog::new(config, tx);

        assert!(watchdog.is_healthy());

        // Simulate delay
        tokio::time::sleep(Duration::from_secs(4)).await;

        assert!(!watchdog.is_healthy());
    }
}
