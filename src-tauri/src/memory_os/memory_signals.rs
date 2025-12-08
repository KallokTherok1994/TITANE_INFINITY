// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.1 — MEMORY SIGNALS
//   Super Prompt #12: Memory events for Kernel vΩ integration
//   Signals flow: Memory OS → Kernel → OMEGA Pipeline
// ═══════════════════════════════════════════════════════════════

use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};
use uuid::Uuid;

use super::memory_state::{MemoryEntry, MemoryTier, MemoryType};

/// Memory signal types
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum MemorySignal {
    /// New entry stored
    EntryStored {
        id: Uuid,
        tier: MemoryTier,
        memory_type: MemoryType,
        importance: f32,
    },
    /// Entry accessed/recalled
    EntryAccessed {
        id: Uuid,
        tier: MemoryTier,
        access_count: u32,
    },
    /// Entry promoted to higher tier
    EntryPromoted {
        id: Uuid,
        from_tier: MemoryTier,
        to_tier: MemoryTier,
    },
    /// Entry importance decayed
    EntryDecayed {
        id: Uuid,
        old_importance: f32,
        new_importance: f32,
    },
    /// Entry forgotten/deleted
    EntryForgotten {
        id: Uuid,
        tier: MemoryTier,
        reason: ForgetReason,
    },
    /// Consolidation completed
    ConsolidationComplete {
        stm_to_mtm: usize,
        mtm_to_ltm: usize,
        duration_ms: u128,
    },
    /// Memory health alert
    HealthAlert {
        alert_type: HealthAlertType,
        message: String,
        severity: AlertSeverity,
    },
    /// Semantic search performed
    SearchPerformed {
        query_type: SearchType,
        results_count: usize,
        duration_ms: u128,
    },
    /// Memory capacity warning
    CapacityWarning {
        tier: MemoryTier,
        current: usize,
        max: usize,
        percentage: f32,
    },
    /// System event
    SystemEvent {
        event: SystemMemoryEvent,
    },
}

/// Reason for forgetting
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum ForgetReason {
    LowImportance,
    Expired,
    SimilarityPruning,
    CapacityOverflow,
    UserRequested,
}

/// Health alert types
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum HealthAlertType {
    HighMemoryUsage,
    SlowQueryPerformance,
    ConsolidationBacklog,
    IndexCorruption,
    StorageError,
}

/// Alert severity levels
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum AlertSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

/// Search types
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum SearchType {
    Keyword,
    Semantic,
    ByTag,
    ByType,
    ByTimeRange,
}

/// System memory events
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum SystemMemoryEvent {
    Initialized,
    Shutdown,
    IndexRebuilt,
    StorageSynced,
    ConfigUpdated,
}

/// Memory signal with metadata
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SignalEnvelope {
    /// Unique signal ID
    pub id: Uuid,
    /// Signal timestamp
    pub timestamp: i64,
    /// The actual signal
    pub signal: MemorySignal,
    /// Source component
    pub source: String,
}

impl SignalEnvelope {
    pub fn new(signal: MemorySignal, source: impl Into<String>) -> Self {
        Self {
            id: Uuid::new_v4(),
            timestamp: chrono::Utc::now().timestamp_millis(),
            signal,
            source: source.into(),
        }
    }
}

/// Signal statistics
#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct SignalStats {
    pub total_sent: u64,
    pub entries_stored: u64,
    pub entries_accessed: u64,
    pub entries_promoted: u64,
    pub entries_forgotten: u64,
    pub consolidations: u64,
    pub health_alerts: u64,
    pub searches: u64,
}

/// Memory Signal Bus - Central hub for memory events
///
/// Provides pub/sub functionality for memory system events.
/// Kernel vΩ and other components can subscribe to receive signals.
#[derive(Debug)]
pub struct MemorySignalBus {
    /// Broadcast sender for signals
    sender: broadcast::Sender<SignalEnvelope>,
    /// Signal statistics
    stats: Arc<RwLock<SignalStats>>,
    /// Recent signals buffer
    recent: Arc<RwLock<Vec<SignalEnvelope>>>,
    /// Max recent signals to keep
    max_recent: usize,
    /// Enabled flag
    enabled: Arc<RwLock<bool>>,
}

impl MemorySignalBus {
    /// Create new signal bus
    pub fn new() -> Self {
        let (sender, _) = broadcast::channel(1000);
        Self {
            sender,
            stats: Arc::new(RwLock::new(SignalStats::default())),
            recent: Arc::new(RwLock::new(Vec::new())),
            max_recent: 100,
            enabled: Arc::new(RwLock::new(true)),
        }
    }

    /// Subscribe to signals
    pub fn subscribe(&self) -> broadcast::Receiver<SignalEnvelope> {
        self.sender.subscribe()
    }

    /// Emit a signal
    pub async fn emit(&self, signal: MemorySignal, source: impl Into<String>) {
        if !*self.enabled.read().await {
            return;
        }

        let envelope = SignalEnvelope::new(signal.clone(), source);

        // Update stats
        {
            let mut stats = self.stats.write().await;
            stats.total_sent += 1;

            match &signal {
                MemorySignal::EntryStored { .. } => stats.entries_stored += 1,
                MemorySignal::EntryAccessed { .. } => stats.entries_accessed += 1,
                MemorySignal::EntryPromoted { .. } => stats.entries_promoted += 1,
                MemorySignal::EntryForgotten { .. } => stats.entries_forgotten += 1,
                MemorySignal::ConsolidationComplete { .. } => stats.consolidations += 1,
                MemorySignal::HealthAlert { .. } => stats.health_alerts += 1,
                MemorySignal::SearchPerformed { .. } => stats.searches += 1,
                _ => {}
            }
        }

        // Store in recent buffer
        {
            let mut recent = self.recent.write().await;
            recent.push(envelope.clone());
            if recent.len() > self.max_recent {
                recent.remove(0);
            }
        }

        // Broadcast (ignore if no receivers)
        let _ = self.sender.send(envelope);
    }

    /// Emit entry stored signal
    pub async fn emit_stored(&self, entry: &MemoryEntry) {
        self.emit(
            MemorySignal::EntryStored {
                id: entry.id,
                tier: entry.tier.clone(),
                memory_type: entry.memory_type.clone(),
                importance: entry.importance,
            },
            "MemoryOS",
        )
        .await;
    }

    /// Emit entry accessed signal
    pub async fn emit_accessed(&self, entry: &MemoryEntry) {
        self.emit(
            MemorySignal::EntryAccessed {
                id: entry.id,
                tier: entry.tier.clone(),
                access_count: entry.access_count,
            },
            "MemoryOS",
        )
        .await;
    }

    /// Emit entry promoted signal
    pub async fn emit_promoted(&self, id: Uuid, from: MemoryTier, to: MemoryTier) {
        self.emit(
            MemorySignal::EntryPromoted {
                id,
                from_tier: from,
                to_tier: to,
            },
            "Consolidator",
        )
        .await;
    }

    /// Emit entry forgotten signal
    pub async fn emit_forgotten(&self, id: Uuid, tier: MemoryTier, reason: ForgetReason) {
        self.emit(
            MemorySignal::EntryForgotten { id, tier, reason },
            "ForgettingEngine",
        )
        .await;
    }

    /// Emit consolidation complete signal
    pub async fn emit_consolidation(&self, stm_to_mtm: usize, mtm_to_ltm: usize, duration_ms: u128) {
        self.emit(
            MemorySignal::ConsolidationComplete {
                stm_to_mtm,
                mtm_to_ltm,
                duration_ms,
            },
            "Consolidator",
        )
        .await;
    }

    /// Emit health alert
    pub async fn emit_health_alert(
        &self,
        alert_type: HealthAlertType,
        message: impl Into<String>,
        severity: AlertSeverity,
    ) {
        self.emit(
            MemorySignal::HealthAlert {
                alert_type,
                message: message.into(),
                severity,
            },
            "HealthMonitor",
        )
        .await;
    }

    /// Emit search performed signal
    pub async fn emit_search(&self, query_type: SearchType, results_count: usize, duration_ms: u128) {
        self.emit(
            MemorySignal::SearchPerformed {
                query_type,
                results_count,
                duration_ms,
            },
            "MemoryOS",
        )
        .await;
    }

    /// Emit capacity warning
    pub async fn emit_capacity_warning(&self, tier: MemoryTier, current: usize, max: usize) {
        let percentage = (current as f32 / max as f32) * 100.0;
        self.emit(
            MemorySignal::CapacityWarning {
                tier,
                current,
                max,
                percentage,
            },
            "MemoryOS",
        )
        .await;
    }

    /// Emit system event
    pub async fn emit_system_event(&self, event: SystemMemoryEvent) {
        self.emit(MemorySignal::SystemEvent { event }, "MemoryOS").await;
    }

    /// Get recent signals
    pub async fn get_recent(&self, n: usize) -> Vec<SignalEnvelope> {
        let recent = self.recent.read().await;
        recent.iter().rev().take(n).cloned().collect()
    }

    /// Get signal statistics
    pub async fn get_stats(&self) -> SignalStats {
        self.stats.read().await.clone()
    }

    /// Reset statistics
    pub async fn reset_stats(&self) {
        *self.stats.write().await = SignalStats::default();
    }

    /// Enable/disable signal bus
    pub async fn set_enabled(&self, enabled: bool) {
        *self.enabled.write().await = enabled;
    }

    /// Check if enabled
    pub async fn is_enabled(&self) -> bool {
        *self.enabled.read().await
    }

    /// Clear recent signals
    pub async fn clear_recent(&self) {
        self.recent.write().await.clear();
    }

    /// Get subscriber count (approximate)
    pub fn subscriber_count(&self) -> usize {
        self.sender.receiver_count()
    }
}

impl Default for MemorySignalBus {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for MemorySignalBus {
    fn clone(&self) -> Self {
        Self {
            sender: self.sender.clone(),
            stats: Arc::clone(&self.stats),
            recent: Arc::clone(&self.recent),
            max_recent: self.max_recent,
            enabled: Arc::clone(&self.enabled),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   SIGNAL LISTENER TRAIT
// ═══════════════════════════════════════════════════════════════

/// Trait for components that listen to memory signals
#[async_trait::async_trait]
pub trait MemorySignalListener: Send + Sync {
    /// Handle incoming signal
    async fn on_signal(&self, envelope: &SignalEnvelope);

    /// Get listener name
    fn name(&self) -> &str;
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_signal_bus_creation() {
        let bus = MemorySignalBus::new();
        assert!(bus.is_enabled().await);
        assert_eq!(bus.get_recent(10).await.len(), 0);
    }

    #[tokio::test]
    async fn test_signal_emission() {
        let bus = MemorySignalBus::new();

        bus.emit(
            MemorySignal::EntryStored {
                id: Uuid::new_v4(),
                tier: MemoryTier::STM,
                memory_type: MemoryType::Conversation,
                importance: 0.5,
            },
            "Test",
        )
        .await;

        let stats = bus.get_stats().await;
        assert_eq!(stats.total_sent, 1);
        assert_eq!(stats.entries_stored, 1);
    }

    #[tokio::test]
    async fn test_signal_subscription() {
        let bus = MemorySignalBus::new();
        let mut receiver = bus.subscribe();

        bus.emit(
            MemorySignal::SystemEvent {
                event: SystemMemoryEvent::Initialized,
            },
            "Test",
        )
        .await;

        let envelope = receiver.recv().await.unwrap();
        matches!(envelope.signal, MemorySignal::SystemEvent { .. });
    }

    #[tokio::test]
    async fn test_recent_signals() {
        let bus = MemorySignalBus::new();

        for i in 0..5 {
            bus.emit(
                MemorySignal::EntryStored {
                    id: Uuid::new_v4(),
                    tier: MemoryTier::STM,
                    memory_type: MemoryType::Conversation,
                    importance: i as f32 / 10.0,
                },
                "Test",
            )
            .await;
        }

        let recent = bus.get_recent(3).await;
        assert_eq!(recent.len(), 3);
    }

    #[tokio::test]
    async fn test_disable_signal_bus() {
        let bus = MemorySignalBus::new();
        bus.set_enabled(false).await;

        bus.emit(
            MemorySignal::EntryStored {
                id: Uuid::new_v4(),
                tier: MemoryTier::STM,
                memory_type: MemoryType::Conversation,
                importance: 0.5,
            },
            "Test",
        )
        .await;

        let stats = bus.get_stats().await;
        assert_eq!(stats.total_sent, 0); // Signal not sent when disabled
    }
}
