// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — KERNEL RUNTIME
//   Stable async runtime with thread pool and timeout guarantees
//   Super Prompt #11 — Phase 2
// ═══════════════════════════════════════════════════════════════

use crate::error::{TitaneError, TitaneResult};
use std::future::Future;
use std::sync::Arc;
use std::time::Duration;
use tokio::runtime::Handle;
use tokio::sync::{broadcast, RwLock};

use super::events::KernelEvent;
use super::kernel_state::KernelState;

/// Runtime configuration
#[derive(Debug, Clone)]
pub struct RuntimeConfig {
    /// Maximum concurrent engine tasks
    pub max_concurrent_tasks: usize,
    /// Global engine timeout in seconds
    pub global_timeout_secs: u64,
    /// Default priority timeout in seconds
    pub priority_timeout_secs: u64,
    /// Enable debug logging
    pub debug_logging: bool,
}

impl Default for RuntimeConfig {
    fn default() -> Self {
        Self {
            max_concurrent_tasks: 16,
            global_timeout_secs: 6,
            priority_timeout_secs: 3,
            debug_logging: false,
        }
    }
}

/// Kernel Runtime — Manages async task execution with timeouts and monitoring
///
/// The runtime provides:
/// - Thread-safe task submission
/// - Automatic timeout enforcement
/// - Event broadcasting
/// - State synchronization
/// - Resource isolation
pub struct KernelRuntime {
    /// Tokio runtime handle (reuses existing runtime)
    handle: Handle,
    /// Configuration
    config: RuntimeConfig,
    /// Event broadcaster
    event_tx: broadcast::Sender<KernelEvent>,
    /// Shared kernel state
    state: Arc<RwLock<KernelState>>,
}

impl KernelRuntime {
    /// Create a new KernelRuntime with default configuration
    pub fn new(
        event_tx: broadcast::Sender<KernelEvent>,
        state: Arc<RwLock<KernelState>>,
    ) -> Self {
        Self::with_config(RuntimeConfig::default(), event_tx, state)
    }

    /// Create a new KernelRuntime with custom configuration
    pub fn with_config(
        config: RuntimeConfig,
        event_tx: broadcast::Sender<KernelEvent>,
        state: Arc<RwLock<KernelState>>,
    ) -> Self {
        Self {
            handle: Handle::current(),
            config,
            event_tx,
            state,
        }
    }

    /// Submit a future for execution with timeout
    ///
    /// # Arguments
    /// * `fut` - Future to execute
    ///
    /// # Returns
    /// Result with future output or timeout error
    ///
    /// # Example
    /// ```ignore
    /// let result = runtime.submit(async {
    ///     process_engine_request().await
    /// }).await?;
    /// ```
    pub async fn submit<F, R>(&self, fut: F) -> TitaneResult<R>
    where
        F: Future<Output = TitaneResult<R>> + Send + 'static,
        R: Send + 'static,
    {
        self.submit_with_timeout(fut, self.config.global_timeout_secs).await
    }

    /// Submit a future with custom timeout
    pub async fn submit_with_timeout<F, R>(
        &self,
        fut: F,
        timeout_secs: u64,
    ) -> TitaneResult<R>
    where
        F: Future<Output = TitaneResult<R>> + Send + 'static,
        R: Send + 'static,
    {
        let start = std::time::Instant::now();

        // Wrap future with timeout
        let result = tokio::time::timeout(
            Duration::from_secs(timeout_secs),
            fut
        ).await;

        let duration_ms = start.elapsed().as_millis() as u64;

        match result {
            Ok(Ok(value)) => {
                // Success
                if self.config.debug_logging {
                    log::debug!("[Kernel] Task completed in {}ms", duration_ms);
                }

                // Broadcast success event
                let _ = self.event_tx.send(KernelEvent::TaskCompleted {
                    task_id: uuid::Uuid::new_v4().to_string(),
                    duration_ms,
                });

                Ok(value)
            }
            Ok(Err(err)) => {
                // Task error
                log::error!("[Kernel] Task failed: {}", err);

                let _ = self.event_tx.send(KernelEvent::TaskFailed {
                    task_id: uuid::Uuid::new_v4().to_string(),
                    error: err.to_string(),
                });

                Err(err)
            }
            Err(_) => {
                // Timeout
                log::warn!("[Kernel] Task timeout after {}ms", duration_ms);

                let _ = self.event_tx.send(KernelEvent::TaskTimeout {
                    task_id: uuid::Uuid::new_v4().to_string(),
                    timeout_ms: timeout_secs * 1000,
                });

                Err(TitaneError::EngineTimeout(timeout_secs * 1000))
            }
        }
    }

    /// Spawn a background task (fire-and-forget)
    ///
    /// Use for non-critical operations that don't need results
    pub fn spawn_background<F>(&self, fut: F)
    where
        F: Future<Output = ()> + Send + 'static,
    {
        let event_tx = self.event_tx.clone();

        self.handle.spawn(async move {
            fut.await;

            let _ = event_tx.send(KernelEvent::BackgroundTaskCompleted);
        });
    }

    /// Get current runtime configuration
    pub fn config(&self) -> &RuntimeConfig {
        &self.config
    }

    /// Get handle to shared kernel state
    pub fn state(&self) -> Arc<RwLock<KernelState>> {
        Arc::clone(&self.state)
    }

    /// Subscribe to kernel events
    pub fn subscribe_events(&self) -> broadcast::Receiver<KernelEvent> {
        self.event_tx.subscribe()
    }

    /// Broadcast a custom kernel event
    pub fn broadcast_event(&self, event: KernelEvent) {
        let _ = self.event_tx.send(event);
    }

    /// Update kernel state
    pub async fn update_state<F>(&self, updater: F)
    where
        F: FnOnce(&mut KernelState),
    {
        let mut state = self.state.write().await;
        updater(&mut state);
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_runtime_creation() {
        let (tx, _rx) = broadcast::channel(100);
        let state = Arc::new(RwLock::new(KernelState::new()));

        let runtime = KernelRuntime::new(tx, state);

        assert_eq!(runtime.config().max_concurrent_tasks, 16);
        assert_eq!(runtime.config().global_timeout_secs, 6);
    }

    #[tokio::test]
    async fn test_submit_success() {
        let (tx, _rx) = broadcast::channel(100);
        let state = Arc::new(RwLock::new(KernelState::new()));
        let runtime = KernelRuntime::new(tx, state);

        let result = runtime.submit(async {
            tokio::time::sleep(Duration::from_millis(10)).await;
            Ok::<_, TitaneError>(42)
        }).await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 42);
    }

    #[tokio::test]
    async fn test_submit_timeout() {
        let (tx, _rx) = broadcast::channel(100);
        let state = Arc::new(RwLock::new(KernelState::new()));
        let runtime = KernelRuntime::new(tx, state);

        let result = runtime.submit_with_timeout(async {
            tokio::time::sleep(Duration::from_secs(10)).await;
            Ok::<_, TitaneError>(())
        }, 1).await;

        assert!(result.is_err());
        match result {
            Err(TitaneError::EngineTimeout(_)) => (),
            _ => panic!("Expected EngineTimeout"),
        }
    }

    #[tokio::test]
    async fn test_submit_error() {
        let (tx, _rx) = broadcast::channel(100);
        let state = Arc::new(RwLock::new(KernelState::new()));
        let runtime = KernelRuntime::new(tx, state);

        let result = runtime.submit(async {
            Err::<(), _>(TitaneError::InternalError("test error".to_string()))
        }).await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_spawn_background() {
        let (tx, mut rx) = broadcast::channel(100);
        let state = Arc::new(RwLock::new(KernelState::new()));
        let runtime = KernelRuntime::new(tx, state);

        runtime.spawn_background(async {
            tokio::time::sleep(Duration::from_millis(50)).await;
        });

        // Wait for event
        tokio::time::sleep(Duration::from_millis(100)).await;

        // Should receive BackgroundTaskCompleted event
        let event = rx.try_recv();
        assert!(event.is_ok());
    }

    #[tokio::test]
    async fn test_state_update() {
        let (tx, _rx) = broadcast::channel(100);
        let state = Arc::new(RwLock::new(KernelState::new()));
        let runtime = KernelRuntime::new(tx, state);

        runtime.update_state(|state| {
            state.load.cpu_usage = 0.5;
        }).await;

        let state = runtime.state().read().await;
        assert_eq!(state.load.cpu_usage, 0.5);
    }
}
