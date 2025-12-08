// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — KERNEL INTEGRATION WITH OMEGA ORCHESTRATOR
//   Super Prompt #11 Phase 9A — OMEGA + Kernel Bridge
// ═══════════════════════════════════════════════════════════════

use crate::error::TitaneResult;
use crate::kernel::{
    CognitivePriority, EngineOutput, KernelEvent, KernelSignal, SchedulerJob, SignalBus,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};
use uuid::Uuid;

/// OMEGA Engine Request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OmegaRequest {
    /// User message
    pub message: String,
    /// Conversation history
    pub history: Vec<OmegaMessage>,
    /// Chat mode (chat, code, creative, etc.)
    pub mode: String,
    /// User ID
    pub user_id: String,
    /// Session ID
    pub session_id: String,
}

/// OMEGA Message
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OmegaMessage {
    pub role: String,
    pub content: String,
    pub timestamp: i64,
}

/// OMEGA Response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OmegaResponse {
    /// Generated response
    pub response: String,
    /// Selected provider
    pub provider: String,
    /// Processing duration
    pub duration_ms: u64,
    /// Tokens used
    pub tokens_used: u32,
    /// Pipeline steps
    pub pipeline_steps: Vec<String>,
}

/// OMEGA-Kernel Integration Bridge
///
/// Connects OMEGA orchestrator to Kernel scheduler with:
/// - Automatic priority assignment
/// - Task submission to scheduler
/// - Event monitoring
/// - Signal broadcasting
pub struct OmegaKernelBridge {
    /// Signal bus for kernel communication
    signal_bus: Arc<SignalBus>,
    /// Event broadcaster
    event_tx: broadcast::Sender<KernelEvent>,
    /// OMEGA statistics
    stats: Arc<RwLock<OmegaStats>>,
}

/// OMEGA statistics
#[derive(Debug, Clone, Default)]
pub struct OmegaStats {
    pub total_requests: u64,
    pub successful_requests: u64,
    pub failed_requests: u64,
    pub total_duration_ms: u64,
    pub avg_duration_ms: u64,
}

impl OmegaKernelBridge {
    /// Create new OMEGA-Kernel bridge
    pub fn new(
        signal_bus: Arc<SignalBus>,
        event_tx: broadcast::Sender<KernelEvent>,
    ) -> Self {
        Self {
            signal_bus,
            event_tx,
            stats: Arc::new(RwLock::new(OmegaStats::default())),
        }
    }

    /// Submit OMEGA request to kernel scheduler
    pub async fn submit_request(
        &self,
        request: OmegaRequest,
    ) -> TitaneResult<(Uuid, SchedulerJob)> {
        // Determine priority based on mode
        let priority = self.determine_priority(&request.mode);

        // Update stats immediately on submit
        {
            let mut stats_guard = self.stats.write().await;
            stats_guard.total_requests += 1;
        }

        // Clone necessary data for static future
        let event_tx = self.event_tx.clone();
        let stats = Arc::clone(&self.stats);
        let request_clone = request.clone();

        // Create scheduler job with static future
        let job = SchedulerJob::new(
            "OMEGA".to_string(),
            priority,
            Box::pin(async move {
                let start = std::time::Instant::now();

                // Simulate OMEGA processing
                tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

                let duration_ms = start.elapsed().as_millis() as u64;

                // Update stats on completion
                {
                    let mut stats_guard = stats.write().await;
                    stats_guard.successful_requests += 1;
                    stats_guard.total_duration_ms += duration_ms;
                    if stats_guard.successful_requests > 0 {
                        stats_guard.avg_duration_ms = stats_guard.total_duration_ms / stats_guard.successful_requests;
                    }
                }

                // Emit event
                let _ = event_tx.send(KernelEvent::EngineOutput {
                    engine: "OMEGA".to_string(),
                    duration_ms,
                    success: true,
                });

                Ok(EngineOutput {
                    engine: "OMEGA".to_string(),
                    output: format!("OMEGA response to: {}", request_clone.message),
                    duration_ms,
                })
            }),
        );

        let job_id = job.id;

        // Broadcast signal
        self.signal_bus.send(KernelSignal::NewUserMessage {
            user_id: request.user_id.clone(),
            message: request.message.clone(),
            timestamp: chrono::Utc::now().timestamp_millis(),
        }).ok();

        // Emit event (TaskSubmitted instead of EngineRegistered)
        let _ = self.event_tx.send(KernelEvent::TaskSubmitted {
            task_id: job_id.to_string(),
            priority: priority.name().to_string(),
            engine: "OMEGA".to_string(),
        });

        Ok((job_id, job))
    }

    /// Determine priority from chat mode
    fn determine_priority(&self, mode: &str) -> CognitivePriority {
        match mode {
            "emergency" | "security" => CognitivePriority::Critical,
            "brainstorming" | "synthesis" | "code" => CognitivePriority::High,
            "chat" | "creative" => CognitivePriority::Normal,
            "indexing" | "maintenance" => CognitivePriority::Background,
            _ => CognitivePriority::Normal,
        }
    }

    /// Execute OMEGA request (async)
    async fn execute_omega_request(
        &self,
        request: OmegaRequest,
    ) -> TitaneResult<EngineOutput> {
        let start = std::time::Instant::now();

        // Update stats
        {
            let mut stats = self.stats.write().await;
            stats.total_requests += 1;
        }

        // Simulate OMEGA processing (replace with real OMEGA call)
        // In real implementation, this would call:
        // - cognitiveOmega.processMessage()
        // - aiOrchestrator.chat()
        // - chatEngine.generate()

        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

        let response = OmegaResponse {
            response: format!("OMEGA response to: {}", request.message),
            provider: "TITANE-Local".to_string(),
            duration_ms: start.elapsed().as_millis() as u64,
            tokens_used: 150,
            pipeline_steps: vec![
                "validation".to_string(),
                "context".to_string(),
                "generation".to_string(),
            ],
        };

        let duration_ms = start.elapsed().as_millis() as u64;

        // Update stats
        {
            let mut stats = self.stats.write().await;
            stats.successful_requests += 1;
            stats.total_duration_ms += duration_ms;
            stats.avg_duration_ms = stats.total_duration_ms / stats.successful_requests;
        }

        // Broadcast result
        self.signal_bus.send(KernelSignal::EngineOutput {
            engine: "OMEGA".to_string(),
            output: response.response.clone(),
            duration_ms,
        }).ok();

        Ok(EngineOutput {
            engine: "OMEGA".to_string(),
            output: serde_json::to_string(&response).unwrap(),
            duration_ms,
        })
    }

    /// Handle OMEGA error
    pub async fn handle_error(&self, error: &str) {
        // Update stats
        {
            let mut stats = self.stats.write().await;
            stats.failed_requests += 1;
        }

        // Broadcast error signal
        self.signal_bus.send(KernelSignal::SafeMode {
            enabled: true,
        }).ok();

        // Emit error event (using TaskFailed)
        let _ = self.event_tx.send(KernelEvent::TaskFailed {
            task_id: "omega_error".to_string(),
            error: error.to_string(),
        });
    }

    /// Get OMEGA statistics
    pub async fn get_stats(&self) -> OmegaStats {
        self.stats.read().await.clone()
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_bridge() -> OmegaKernelBridge {
        let signal_bus = Arc::new(SignalBus::new(1000));
        let (event_tx, _) = broadcast::channel(100);
        OmegaKernelBridge::new(signal_bus, event_tx)
    }

    #[tokio::test]
    async fn test_bridge_creation() {
        let bridge = create_test_bridge();
        let stats = bridge.get_stats().await;
        assert_eq!(stats.total_requests, 0);
    }

    #[tokio::test]
    async fn test_priority_determination() {
        let bridge = create_test_bridge();
        assert_eq!(
            bridge.determine_priority("emergency"),
            CognitivePriority::Critical
        );
        assert_eq!(
            bridge.determine_priority("code"),
            CognitivePriority::High
        );
        assert_eq!(
            bridge.determine_priority("chat"),
            CognitivePriority::Normal
        );
        assert_eq!(
            bridge.determine_priority("indexing"),
            CognitivePriority::Background
        );
    }

    #[tokio::test]
    async fn test_submit_request() {
        let bridge = create_test_bridge();

        let request = OmegaRequest {
            message: "Hello OMEGA".to_string(),
            history: vec![],
            mode: "chat".to_string(),
            user_id: "user123".to_string(),
            session_id: "session456".to_string(),
        };

        let result = bridge.submit_request(request).await;
        assert!(result.is_ok());

        let (job_id, job) = result.unwrap();
        assert_eq!(job.engine, "OMEGA");
        assert_eq!(job.priority, CognitivePriority::Normal);
    }

    #[tokio::test]
    async fn test_execute_request() {
        let bridge = create_test_bridge();

        let request = OmegaRequest {
            message: "Test request".to_string(),
            history: vec![],
            mode: "chat".to_string(),
            user_id: "user123".to_string(),
            session_id: "session456".to_string(),
        };

        let result = bridge.execute_omega_request(request).await;
        assert!(result.is_ok());

        let output = result.unwrap();
        assert_eq!(output.engine, "OMEGA");
        assert!(output.duration_ms > 0);

        // Check stats updated
        let stats = bridge.get_stats().await;
        assert_eq!(stats.total_requests, 1);
        assert_eq!(stats.successful_requests, 1);
    }
}
