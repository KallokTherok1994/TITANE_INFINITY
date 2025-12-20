// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — KERNEL INTEGRATION WITH MEMORY OS
//   Super Prompt #11 Phase 9B — Memory + Kernel Bridge
// ═══════════════════════════════════════════════════════════════

use crate::error::TitaneResult;
use crate::kernel::{
    CognitivePriority, EngineOutput, KernelEvent, KernelSignal, KernelState, SchedulerJob,
    SignalBus,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};
use uuid::Uuid;

/// Memory operation types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MemoryOperation {
    Store {
        content: String,
        memory_type: String,
        importance: f32,
        tags: Vec<String>,
    },
    Recall {
        query: String,
        max_results: usize,
    },
    Consolidate {
        tier: String, // "stm_to_mtm" or "mtm_to_ltm"
    },
    Forget {
        threshold: f32,
    },
}

/// Memory operation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryResult {
    pub operation: String,
    pub success: bool,
    pub duration_ms: u64,
    pub data: Option<serde_json::Value>,
}

/// Memory health snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryHealthSnapshot {
    pub stm_count: usize,
    pub mtm_count: usize,
    pub ltm_count: usize,
    pub stm_utilization: f64,
    pub mtm_utilization: f64,
    pub ltm_utilization: f64,
    pub total_memories: u64,
    pub compression_ratio: f32,
}

/// Memory-Kernel Integration Bridge
///
/// Connects Memory OS to Kernel scheduler with:
/// - Memory operation scheduling
/// - Health monitoring
/// - Event broadcasting
/// - Signal-based updates
pub struct MemoryKernelBridge {
    /// Signal bus for kernel communication
    signal_bus: Arc<SignalBus>,
    /// Event broadcaster
    event_tx: broadcast::Sender<KernelEvent>,
    /// Memory statistics
    stats: Arc<RwLock<MemoryStats>>,
    /// Kernel state (optional, for health updates)
    state: Option<Arc<RwLock<KernelState>>>,
}

/// Memory statistics
#[derive(Debug, Clone, Default)]
pub struct MemoryStats {
    pub total_stores: u64,
    pub total_recalls: u64,
    pub total_consolidations: u64,
    pub total_forgettings: u64,
    pub avg_store_duration_ms: u64,
    pub avg_recall_duration_ms: u64,
}

impl MemoryKernelBridge {
    /// Create new Memory-Kernel bridge
    pub fn new(signal_bus: Arc<SignalBus>, event_tx: broadcast::Sender<KernelEvent>) -> Self {
        Self {
            signal_bus,
            event_tx,
            stats: Arc::new(RwLock::new(MemoryStats::default())),
            state: None,
        }
    }

    /// Create new Memory-Kernel bridge with state
    pub fn with_state(
        signal_bus: Arc<SignalBus>,
        event_tx: broadcast::Sender<KernelEvent>,
        state: Arc<RwLock<KernelState>>,
    ) -> Self {
        Self {
            signal_bus,
            event_tx,
            stats: Arc::new(RwLock::new(MemoryStats::default())),
            state: Some(state),
        }
    }

    /// Submit memory operation to kernel scheduler
    pub async fn submit_operation(
        &self,
        operation: MemoryOperation,
    ) -> TitaneResult<(Uuid, SchedulerJob)> {
        // Determine priority based on operation type
        let priority = self.determine_priority(&operation);

        // Update stats immediately on submit
        {
            let mut stats_guard = self.stats.write().await;
            match &operation {
                MemoryOperation::Store { .. } => stats_guard.total_stores += 1,
                MemoryOperation::Recall { .. } => stats_guard.total_recalls += 1,
                MemoryOperation::Consolidate { .. } => stats_guard.total_consolidations += 1,
                MemoryOperation::Forget { .. } => stats_guard.total_forgettings += 1,
            }
        }

        // Clone necessary data for static future
        let event_tx = self.event_tx.clone();
        let signal_bus = self.signal_bus.clone();
        let operation_clone = operation.clone();

        // Create scheduler job with static future
        let job = SchedulerJob::new(
            "Memory".to_string(),
            priority,
            Box::pin(async move {
                let start = std::time::Instant::now();

                // Simulate memory operation
                tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

                let duration_ms = start.elapsed().as_millis() as u64;

                // Emit completion event
                let _ = event_tx.send(KernelEvent::EngineOutput {
                    engine: "Memory".to_string(),
                    duration_ms,
                    success: true,
                });

                // Broadcast memory update signal
                signal_bus
                    .send(KernelSignal::MemoryUpdated {
                        layer: match &operation_clone {
                            MemoryOperation::Store { memory_type, .. } => memory_type.clone(),
                            MemoryOperation::Recall { .. } => "recall".to_string(),
                            MemoryOperation::Consolidate { tier } => tier.clone(),
                            MemoryOperation::Forget { .. } => "forget".to_string(),
                        },
                        operation: format!("{:?}", operation_clone)
                            .split('(')
                            .next()
                            .unwrap_or("Unknown")
                            .to_string(),
                    })
                    .ok();

                Ok(EngineOutput {
                    engine: "Memory".to_string(),
                    output: "Memory operation completed".to_string(),
                    duration_ms,
                })
            }),
        );

        let job_id = job.id;

        // Emit event (TaskSubmitted instead of EngineRegistered)
        let _ = self.event_tx.send(KernelEvent::TaskSubmitted {
            task_id: job_id.to_string(),
            priority: priority.name().to_string(),
            engine: "Memory".to_string(),
        });

        Ok((job_id, job))
    }

    /// Determine priority from operation type
    fn determine_priority(&self, operation: &MemoryOperation) -> CognitivePriority {
        match operation {
            MemoryOperation::Store { .. } => CognitivePriority::High, // Fast storage critical
            MemoryOperation::Recall { .. } => CognitivePriority::High, // Fast recall critical
            MemoryOperation::Consolidate { .. } => CognitivePriority::Normal, // Background process
            MemoryOperation::Forget { .. } => CognitivePriority::Background, // Low priority cleanup
        }
    }

    /// Execute memory operation (async)
    async fn execute_memory_operation(
        &self,
        operation: MemoryOperation,
    ) -> TitaneResult<EngineOutput> {
        let start = std::time::Instant::now();

        let result = match &operation {
            MemoryOperation::Store {
                content,
                memory_type,
                importance,
                tags,
            } => {
                self.handle_store(content, memory_type, *importance, tags)
                    .await
            }
            MemoryOperation::Recall { query, max_results } => {
                self.handle_recall(query, *max_results).await
            }
            MemoryOperation::Consolidate { tier } => self.handle_consolidate(tier).await,
            MemoryOperation::Forget { threshold } => self.handle_forget(*threshold).await,
        };

        let duration_ms = start.elapsed().as_millis() as u64;

        match result {
            Ok(data) => {
                // Broadcast success signal
                self.signal_bus
                    .send(KernelSignal::EngineOutput {
                        engine: "Memory".to_string(),
                        output: "Operation completed".to_string(),
                        duration_ms,
                    })
                    .ok();

                Ok(EngineOutput {
                    engine: "Memory".to_string(),
                    output: serde_json::to_string(&data)?,
                    duration_ms,
                })
            }
            Err(err) => {
                self.handle_error(&err.to_string()).await;
                Err(err)
            }
        }
    }

    /// Handle store operation
    async fn handle_store(
        &self,
        content: &str,
        memory_type: &str,
        importance: f32,
        tags: &[String],
    ) -> TitaneResult<MemoryResult> {
        // Simulate store operation (replace with real Memory OS call)
        tokio::time::sleep(tokio::time::Duration::from_millis(5)).await;

        // Update stats
        {
            let mut stats = self.stats.write().await;
            stats.total_stores += 1;
        }

        // Broadcast memory updated signal
        self.signal_bus
            .send(KernelSignal::MemoryUpdated {
                layer: "STM".to_string(),
                operation: format!("stored_{}_bytes", content.len()),
            })
            .ok();

        Ok(MemoryResult {
            operation: "store".to_string(),
            success: true,
            duration_ms: 5,
            data: Some(serde_json::json!({
                "memory_id": Uuid::new_v4().to_string(),
                "stored_in": "STM"
            })),
        })
    }

    /// Handle recall operation
    async fn handle_recall(&self, query: &str, max_results: usize) -> TitaneResult<MemoryResult> {
        // Simulate recall operation (replace with real Memory OS call)
        tokio::time::sleep(tokio::time::Duration::from_millis(15)).await;

        // Update stats
        {
            let mut stats = self.stats.write().await;
            stats.total_recalls += 1;
        }

        Ok(MemoryResult {
            operation: "recall".to_string(),
            success: true,
            duration_ms: 15,
            data: Some(serde_json::json!({
                "results": [],
                "count": 0
            })),
        })
    }

    /// Handle consolidate operation
    async fn handle_consolidate(&self, tier: &str) -> TitaneResult<MemoryResult> {
        // Simulate consolidation (replace with real Memory OS call)
        tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;

        // Update stats
        {
            let mut stats = self.stats.write().await;
            stats.total_consolidations += 1;
        }

        // Broadcast consolidation signal
        self.signal_bus
            .send(KernelSignal::MemoryUpdated {
                layer: tier.to_string(),
                operation: "consolidation_complete".to_string(),
            })
            .ok();

        Ok(MemoryResult {
            operation: "consolidate".to_string(),
            success: true,
            duration_ms: 50,
            data: Some(serde_json::json!({
                "tier": tier,
                "entries_consolidated": 0
            })),
        })
    }

    /// Handle forget operation
    async fn handle_forget(&self, threshold: f32) -> TitaneResult<MemoryResult> {
        // Simulate forgetting (replace with real Memory OS call)
        tokio::time::sleep(tokio::time::Duration::from_millis(30)).await;

        // Update stats
        {
            let mut stats = self.stats.write().await;
            stats.total_forgettings += 1;
        }

        Ok(MemoryResult {
            operation: "forget".to_string(),
            success: true,
            duration_ms: 30,
            data: Some(serde_json::json!({
                "threshold": threshold,
                "entries_forgotten": 0
            })),
        })
    }

    /// Update memory health in kernel state
    pub async fn update_memory_health(&self, snapshot: MemoryHealthSnapshot) {
        // Update kernel state if available
        if let Some(state) = &self.state {
            let mut state_guard = state.write().await;
            state_guard.memory_health.stm_utilization = snapshot.stm_utilization as f32;
            state_guard.memory_health.mtm_utilization = snapshot.mtm_utilization as f32;
            state_guard.memory_health.ltm_size_mb = snapshot.ltm_utilization as f32;
            state_guard.memory_health.total_entries = snapshot.total_memories as usize;
        }

        // Broadcast memory health update
        self.signal_bus
            .send(KernelSignal::MemoryUpdated {
                layer: "ALL".to_string(),
                operation: format!(
                    "health_update_stm:{}_mtm:{}_ltm:{}",
                    snapshot.stm_count, snapshot.mtm_count, snapshot.ltm_count
                ),
            })
            .ok();

        // Emit event with memory health snapshot
        let _ = self.event_tx.send(KernelEvent::MemoryUpdated {
            layer: "ALL".to_string(),
            operation: format!(
                "health_update:stm={}_mtm={}_ltm={}",
                snapshot.stm_count, snapshot.mtm_count, snapshot.ltm_count
            ),
        });
    }

    /// Handle memory error
    async fn handle_error(&self, error: &str) {
        // Broadcast error signal
        self.signal_bus
            .send(KernelSignal::SafeMode { enabled: true })
            .ok();

        // Emit error event (using TaskFailed)
        let _ = self.event_tx.send(KernelEvent::TaskFailed {
            task_id: "memory_error".to_string(),
            error: error.to_string(),
        });
    }

    /// Get memory statistics
    pub async fn get_stats(&self) -> MemoryStats {
        self.stats.read().await.clone()
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_bridge() -> MemoryKernelBridge {
        let signal_bus = Arc::new(SignalBus::new(1000));
        let (event_tx, _) = broadcast::channel(100);
        MemoryKernelBridge::new(signal_bus, event_tx)
    }

    #[tokio::test]
    async fn test_bridge_creation() {
        let bridge = create_test_bridge();
        let stats = bridge.get_stats().await;
        assert_eq!(stats.total_stores, 0);
    }

    #[tokio::test]
    async fn test_priority_determination() {
        let bridge = create_test_bridge();

        let store_op = MemoryOperation::Store {
            content: "test".to_string(),
            memory_type: "conversation".to_string(),
            importance: 0.8,
            tags: vec![],
        };
        assert_eq!(
            bridge.determine_priority(&store_op),
            CognitivePriority::High
        );

        let recall_op = MemoryOperation::Recall {
            query: "test".to_string(),
            max_results: 10,
        };
        assert_eq!(
            bridge.determine_priority(&recall_op),
            CognitivePriority::High
        );

        let consolidate_op = MemoryOperation::Consolidate {
            tier: "stm_to_mtm".to_string(),
        };
        assert_eq!(
            bridge.determine_priority(&consolidate_op),
            CognitivePriority::Normal
        );

        let forget_op = MemoryOperation::Forget { threshold: 0.3 };
        assert_eq!(
            bridge.determine_priority(&forget_op),
            CognitivePriority::Background
        );
    }

    #[tokio::test]
    async fn test_store_operation() {
        let bridge = create_test_bridge();

        let result = bridge
            .handle_store("test content", "conversation", 0.8, &[])
            .await;
        assert!(result.is_ok());

        let stats = bridge.get_stats().await;
        assert_eq!(stats.total_stores, 1);
    }

    #[tokio::test]
    async fn test_recall_operation() {
        let bridge = create_test_bridge();

        let result = bridge.handle_recall("test query", 10).await;
        assert!(result.is_ok());

        let stats = bridge.get_stats().await;
        assert_eq!(stats.total_recalls, 1);
    }

    #[tokio::test]
    async fn test_memory_health_update() {
        let bridge = create_test_bridge();

        let snapshot = MemoryHealthSnapshot {
            stm_count: 50,
            mtm_count: 200,
            ltm_count: 5000,
            stm_utilization: 0.5,
            mtm_utilization: 0.67,
            ltm_utilization: 0.89,
            total_memories: 5250,
            compression_ratio: 0.7,
        };

        bridge.update_memory_health(snapshot).await;
        // If no panic, test passes
    }
}
