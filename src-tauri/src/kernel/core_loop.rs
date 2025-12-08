// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — CORE LOOP
//   Main event loop orchestrating all kernel components
//   Super Prompt #11 — Phase 4
// ═══════════════════════════════════════════════════════════════

use crate::error::{TitaneError, TitaneResult};
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};
use tokio::time::{interval, Duration};

use super::events::KernelEvent;
use super::governance::GovernanceEngine;
use super::kernel_state::{KernelState, Intent};
use super::resources::ResourceManager;
use super::scheduler::CognitiveScheduler;
use super::signals::{KernelSignal, SignalBus};
use super::watchdog::KernelWatchdog;

/// Core loop configuration
#[derive(Debug, Clone)]
pub struct CoreLoopConfig {
    /// Tick interval in milliseconds
    pub tick_interval_ms: u64,
    /// Enable auto-regulation
    pub auto_regulate: bool,
    /// Enable watchdog
    pub enable_watchdog: bool,
}

impl Default for CoreLoopConfig {
    fn default() -> Self {
        Self {
            tick_interval_ms: 50, // 20 Hz
            auto_regulate: true,
            enable_watchdog: true,
        }
    }
}

/// Main kernel core loop orchestrator
pub struct CoreLoop {
    /// Configuration
    config: CoreLoopConfig,
    /// Signal bus receiver
    signal_rx: broadcast::Receiver<KernelSignal>,
    /// Event broadcaster
    event_tx: broadcast::Sender<KernelEvent>,
    /// Kernel state
    state: Arc<RwLock<KernelState>>,
    /// Scheduler
    scheduler: Arc<CognitiveScheduler>,
    /// Watchdog
    watchdog: Option<Arc<RwLock<KernelWatchdog>>>,
    /// Governance engine
    governance: Arc<RwLock<GovernanceEngine>>,
    /// Resource manager
    resources: Arc<RwLock<ResourceManager>>,
    /// Shutdown flag
    shutdown: Arc<RwLock<bool>>,
}

impl CoreLoop {
    /// Create new core loop
    pub fn new(
        config: CoreLoopConfig,
        signal_bus: &SignalBus,
        event_tx: broadcast::Sender<KernelEvent>,
        state: Arc<RwLock<KernelState>>,
        scheduler: Arc<CognitiveScheduler>,
        watchdog: Option<Arc<RwLock<KernelWatchdog>>>,
        governance: Arc<RwLock<GovernanceEngine>>,
        resources: Arc<RwLock<ResourceManager>>,
    ) -> Self {
        let signal_rx = signal_bus.subscribe();

        Self {
            config,
            signal_rx,
            event_tx,
            state,
            scheduler,
            watchdog,
            governance,
            resources,
            shutdown: Arc::new(RwLock::new(false)),
        }
    }

    /// Main event loop
    pub async fn run(&mut self) -> TitaneResult<()> {
        // Broadcast kernel start
        let _ = self.event_tx.send(KernelEvent::KernelStarted {
            version: "v20Ω.0".to_string(),
            timestamp: chrono::Utc::now().timestamp_millis(),
        });

        // Setup ticker
        let mut ticker = interval(Duration::from_millis(self.config.tick_interval_ms));

        loop {
            tokio::select! {
                // Shutdown check
                _ = async {
                    let shutdown = self.shutdown.read().await;
                    if *shutdown {
                        Some(())
                    } else {
                        None
                    }
                } => {
                    if let Some(_) = self.shutdown.read().await.then(|| ()) {
                        break;
                    }
                }

                // Handle signals
                Ok(signal) = self.signal_rx.recv() => {
                    self.handle_signal(signal).await?;
                }

                // Periodic tick
                _ = ticker.tick() => {
                    self.handle_tick().await?;
                }
            }
        }

        // Broadcast kernel stop
        let _ = self.event_tx.send(KernelEvent::KernelStopped {
            reason: "shutdown_requested".to_string(),
            timestamp: chrono::Utc::now().timestamp_millis(),
        });

        Ok(())
    }

    /// Handle incoming signal
    async fn handle_signal(&self, signal: KernelSignal) -> TitaneResult<()> {
        match signal {
            KernelSignal::NewUserMessage {
                user_id,
                message,
                timestamp,
            } => {
                self.handle_user_message(user_id, message, timestamp).await?;
            }

            KernelSignal::EngineOutput {
                engine,
                output,
                duration_ms,
            } => {
                self.handle_engine_output(engine, output, duration_ms)
                    .await?;
            }

            KernelSignal::MemoryUpdated { layer, operation } => {
                self.handle_memory_update(layer, operation).await?;
            }

            KernelSignal::Overload {
                level,
                cpu_usage,
            } => {
                self.handle_overload(level, cpu_usage.into(), 0).await?;
            }

            KernelSignal::Heartbeat { timestamp } => {
                self.handle_heartbeat(timestamp).await?;
            }

            KernelSignal::SafeMode { enabled } => {
                self.handle_safe_mode_toggle(enabled).await?;
            }

            KernelSignal::LoadShedding { priority_threshold } => {
                self.handle_load_shedding(priority_threshold).await?;
            }

            KernelSignal::RequestSnapshot => {
                self.handle_snapshot_request().await?;
            }

            KernelSignal::Shutdown { reason: _ } => {
                let mut shutdown = self.shutdown.write().await;
                *shutdown = true;
            }
        }

        Ok(())
    }

    /// Handle periodic tick
    async fn handle_tick(&self) -> TitaneResult<()> {
        // Update watchdog
        if let Some(watchdog) = &self.watchdog {
            let mut wd = watchdog.write().await;
            wd.tick().await;
        }

        // Check resources
        if self.config.auto_regulate {
            self.check_resources().await?;
        }

        // Calculate overload
        self.update_overload().await?;

        Ok(())
    }

    /// Handle user message signal
    async fn handle_user_message(
        &self,
        _user_id: String,
        _message: String,
        _timestamp: i64,
    ) -> TitaneResult<()> {
        // Increment intent in state
        {
            let mut state = self.state.write().await;
            state.last_intent = Some(Intent {
                intent_type: "processing_message".to_string(),
                confidence: 1.0,
                entities: vec![],
            });
        }

        Ok(())
    }

    /// Handle engine output
    async fn handle_engine_output(
        &self,
        engine: String,
        _output: String,
        duration_ms: u64,
    ) -> TitaneResult<()> {
        // Update state
        {
            let mut state = self.state.write().await;
            state.update_engine_status(&engine, duration_ms, true);
        }

        Ok(())
    }

    /// Handle memory update
    async fn handle_memory_update(&self, layer: String, operation: String) -> TitaneResult<()> {
        let _ = self.event_tx.send(KernelEvent::MemoryUpdated { layer, operation });
        Ok(())
    }

    /// Handle overload signal
    async fn handle_overload(
        &self,
        level: u8,
        cpu_usage: f64,
        _queue_depth: usize,
    ) -> TitaneResult<()> {
        // Update state
        {
            let mut state = self.state.write().await;
            state.overload_level = level;
        }

        // Emit overload event
        let _ = self.event_tx.send(KernelEvent::OverloadDetected {
            level,
            cpu_usage: cpu_usage as f32,
        });

        // Check if safe mode should trigger
        let should_enable_safe_mode = {
            let gov = self.governance.read().await;
            gov.should_enable_safe_mode(level)
        };

        if should_enable_safe_mode {
            let _ = self.event_tx.send(KernelEvent::WatchdogAlert {
                alert_type: "safe_mode".to_string(),
                message: format!("Overload level {} detected", level),
            });
        }

        let _ = self.event_tx.send(KernelEvent::OverloadDetected {
            level,
            cpu_usage: cpu_usage as f32,
        });

        Ok(())
    }

    /// Handle heartbeat
    async fn handle_heartbeat(&self, timestamp: i64) -> TitaneResult<()> {
        let _ = self.event_tx.send(KernelEvent::WatchdogHeartbeat {
            timestamp,
        });
        Ok(())
    }

    /// Handle safe mode toggle
    async fn handle_safe_mode_toggle(&self, enabled: bool) -> TitaneResult<()> {
        let _ = self.event_tx.send(KernelEvent::WatchdogAlert {
            alert_type: "safe_mode".to_string(),
            message: if enabled { "Safe mode enabled" } else { "Safe mode disabled" }.to_string(),
        });
        Ok(())
    }

    /// Handle load shedding
    async fn handle_load_shedding(&self, priority_threshold: u8) -> TitaneResult<()> {
        let _ = self.event_tx.send(KernelEvent::LoadShedding {
            tasks_dropped: 0,
            reason: format!("Priority threshold {}", priority_threshold),
        });
        Ok(())
    }

    /// Handle snapshot request
    async fn handle_snapshot_request(&self) -> TitaneResult<()> {
        let state = self.state.read().await;
        let snapshot = state.clone();
        let _ = self.event_tx.send(KernelEvent::StateSnapshot {
            snapshot_id: format!("snapshot_{}", chrono::Utc::now().timestamp()),
            timestamp: chrono::Utc::now().timestamp_millis(),
        });
        drop(snapshot);
        Ok(())
    }

    /// Check resource limits
    async fn check_resources(&self) -> TitaneResult<()> {
        let resources = self.resources.read().await;

        // Check CPU
        if resources.usage().cpu_usage > resources.limits().max_cpu_usage {
            return Err(TitaneError::ResourceLimitExceeded(format!(
                "CPU usage {:.2} exceeds limit {:.2}",
                resources.usage().cpu_usage, resources.limits().max_cpu_usage
            )));
        }

        // Check memory
        let memory_mb = resources.usage().memory_mb;
        if memory_mb > resources.limits().max_memory_mb as f32 {
            return Err(TitaneError::ResourceLimitExceeded(format!(
                "Memory usage {}MB exceeds limit {}MB",
                memory_mb, resources.limits().max_memory_mb
            )));
        }

        // Check queue
        if resources.usage().queue_depth > resources.limits().max_queue_depth {
            return Err(TitaneError::SchedulerOverload(format!(
                "Queue depth {} exceeds limit {}",
                resources.usage().queue_depth, resources.limits().max_queue_depth
            )));
        }

        Ok(())
    }

    /// Update overload level
    async fn update_overload(&self) -> TitaneResult<()> {
        let state = self.state.read().await;
        let level = state.overload_level;

        // If overload is high, emit warning
        if level >= 7 {
            let _ = self.event_tx.send(KernelEvent::OverloadDetected {
                level,
                cpu_usage: state.load.cpu_usage,
            });
        }

        Ok(())
    }

    /// Request graceful shutdown
    pub async fn shutdown(&self) {
        let mut shutdown = self.shutdown.write().await;
        *shutdown = true;
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use super::super::resources::{ResourceLimits, ResourceManager};
    use super::super::runtime::KernelRuntime;

    async fn create_test_components() -> (
        SignalBus,
        broadcast::Sender<KernelEvent>,
        Arc<RwLock<KernelState>>,
        Arc<CognitiveScheduler>,
        Arc<RwLock<GovernanceEngine>>,
        Arc<RwLock<ResourceManager>>,
    ) {
        let signal_bus = SignalBus::new(1000);
        let (event_tx, _) = broadcast::channel(100);
        let state = Arc::new(RwLock::new(KernelState::new()));
        let runtime = Arc::new(KernelRuntime::new(event_tx.clone(), Arc::clone(&state)));
        let scheduler = Arc::new(CognitiveScheduler::new(
            runtime,
            Arc::clone(&state),
            event_tx.clone(),
            4,
        ));

        let governance = Arc::new(RwLock::new(GovernanceEngine::new()));
        let resources = Arc::new(RwLock::new(ResourceManager::with_limits(
            ResourceLimits::default(),
        )));

        (signal_bus, event_tx, state, scheduler, governance, resources)
    }

    #[tokio::test]
    async fn test_core_loop_creation() {
        let (signal_bus, event_tx, state, scheduler, governance, resources) =
            create_test_components().await;

        let core_loop = CoreLoop::new(
            CoreLoopConfig::default(),
            &signal_bus,
            event_tx,
            state,
            scheduler,
            None,
            governance,
            resources,
        );

        assert!(!*core_loop.shutdown.read().await);
    }

    #[tokio::test]
    async fn test_shutdown_signal() {
        let (signal_bus, event_tx, state, scheduler, governance, resources) =
            create_test_components().await;

        let core_loop = CoreLoop::new(
            CoreLoopConfig::default(),
            &signal_bus,
            event_tx,
            state,
            scheduler,
            None,
            governance,
            resources,
        );

        core_loop.shutdown().await;
        assert!(*core_loop.shutdown.read().await);
    }

    #[tokio::test]
    async fn test_handle_overload() {
        let (signal_bus, event_tx, state, scheduler, governance, resources) =
            create_test_components().await;

        let core_loop = CoreLoop::new(
            CoreLoopConfig::default(),
            &signal_bus,
            event_tx.clone(),
            state.clone(),
            scheduler,
            None,
            governance,
            resources,
        );

        let mut event_rx = event_tx.subscribe();

        // Trigger overload
        core_loop.handle_overload(9, 0.95, 80).await.unwrap();

        // Check state updated
        {
            let state_lock = state.read().await;
            assert_eq!(state_lock.overload_level, 9);
        }

        // Check event emitted
        let event = event_rx.recv().await.unwrap();
        if let KernelEvent::OverloadDetected { level, .. } = event {
            assert_eq!(level, 9);
        } else {
            panic!("Expected OverloadDetected event");
        }
    }
}
