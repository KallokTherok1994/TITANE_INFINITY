// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — KERNEL SIGNALS
//   Signal bus for inter-component communication
//   Super Prompt #11 — Phase 5
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::broadcast;

/// Internal kernel signals for coordination
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum KernelSignal {
    /// New user message to process
    NewUserMessage {
        user_id: String,
        message: String,
        timestamp: i64,
    },

    /// Engine output ready
    EngineOutput {
        engine: String,
        output: String,
        duration_ms: u64,
    },

    /// Memory system updated
    MemoryUpdated { layer: String, operation: String },

    /// System overload detected
    Overload { level: u8, cpu_usage: f32 },

    /// Watchdog heartbeat
    Heartbeat { timestamp: i64 },

    /// Request shutdown
    Shutdown { reason: String },

    /// Request state snapshot
    RequestSnapshot,

    /// Load shedding required
    LoadShedding { priority_threshold: u8 },

    /// Safe mode toggle
    SafeMode { enabled: bool },
}

/// Signal bus for kernel communication
///
/// Provides a broadcast channel for signals between kernel components
pub struct SignalBus {
    tx: broadcast::Sender<KernelSignal>,
}

impl SignalBus {
    /// Create a new signal bus
    pub fn new(capacity: usize) -> Self {
        let (tx, _) = broadcast::channel(capacity);
        Self { tx }
    }

    /// Send a signal
    pub fn send(&self, signal: KernelSignal) -> Result<usize, String> {
        self.tx.send(signal).map_err(|e| e.to_string())
    }

    /// Subscribe to signals
    pub fn subscribe(&self) -> broadcast::Receiver<KernelSignal> {
        self.tx.subscribe()
    }

    /// Get sender clone
    pub fn sender(&self) -> broadcast::Sender<KernelSignal> {
        self.tx.clone()
    }
}

impl Default for SignalBus {
    fn default() -> Self {
        Self::new(1000)
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_signal_bus_creation() {
        let bus = SignalBus::new(100);
        let mut rx = bus.subscribe();

        bus.send(KernelSignal::Heartbeat {
            timestamp: 123456789,
        })
        .unwrap();

        let signal = rx.recv().await.unwrap();
        match signal {
            KernelSignal::Heartbeat { timestamp } => {
                assert_eq!(timestamp, 123456789);
            }
            _ => panic!("Wrong signal type"),
        }
    }

    #[tokio::test]
    async fn test_multiple_subscribers() {
        let bus = SignalBus::new(100);
        let mut rx1 = bus.subscribe();
        let mut rx2 = bus.subscribe();

        bus.send(KernelSignal::Heartbeat { timestamp: 123 })
            .unwrap();

        // Both should receive
        let signal1 = rx1.recv().await.unwrap();
        let signal2 = rx2.recv().await.unwrap();

        assert!(matches!(signal1, KernelSignal::Heartbeat { .. }));
        assert!(matches!(signal2, KernelSignal::Heartbeat { .. }));
    }
}
