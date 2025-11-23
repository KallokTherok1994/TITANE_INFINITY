// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — PLUGIN SYSTEM: HARMONIA MODULE
//   CoreModule Implementation - System Balancing & Stabilization
// ═══════════════════════════════════════════════════════════════

use crate::{
    plugin_system::{CoreModule, CoreStatus, CoreHealth, CoreResult, CoreError},
    types::{HarmoniaState, StabilizationLevel, HeliosState},
    utils::{log_info, log_warn},
};
use async_trait::async_trait;
use chrono::Utc;
use std::sync::Arc;
use std::sync::atomic::{AtomicU32, Ordering};
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════
//   HARMONIA MODULE STRUCTURE
// ═══════════════════════════════════════════════════════════════

pub struct HarmoniaModule {
    name: String,
    version: String,
    status: Arc<RwLock<CoreStatus>>,
    adjustments_applied: Arc<AtomicU32>,
    last_state: Arc<RwLock<Option<HarmoniaState>>>,
}

// ═══════════════════════════════════════════════════════════════
//   IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

impl HarmoniaModule {
    pub fn new() -> Self {
        Self {
            name: "Harmonia".to_string(),
            version: "17.2.0".to_string(),
            status: Arc::new(RwLock::new(CoreStatus::Stopped)),
            adjustments_applied: Arc::new(AtomicU32::new(0)),
            last_state: Arc::new(RwLock::new(None)),
        }
    }

    // ───────────────────────────────────────────────────────────
    //   BUSINESS METHODS
    // ───────────────────────────────────────────────────────────

    /// Balance system based on Helios metrics
    pub async fn balance(&self, helios: &HeliosState) -> CoreResult<HarmoniaState> {
        log_info("HarmoniaModule", "Performing system balancing");

        let cpu_pressure = helios.cpu_usage;
        let ram_pressure = helios.ram_usage;

        // Determine stabilization level
        let stabilization_level = if cpu_pressure > 80.0 || ram_pressure > 80.0 {
            log_warn("HarmoniaModule", &format!(
                "High pressure detected - CPU: {:.1}%, RAM: {:.1}%",
                cpu_pressure, ram_pressure
            ));

            // Increment adjustments counter
            self.adjustments_applied.fetch_add(1, Ordering::Relaxed);

            StabilizationLevel::Rebalancing
        } else if cpu_pressure > 60.0 || ram_pressure > 60.0 {
            StabilizationLevel::Adjusting
        } else {
            StabilizationLevel::Stable
        };

        // Calculate balance score (0-100)
        let balance_score = 100.0 - ((cpu_pressure + ram_pressure) / 2.0).min(100.0);

        let state = HarmoniaState {
            balance_score,
            active_flows: 0, // TODO: Implement flow tracking
            stabilization_level,
            adjustments_applied: self.adjustments_applied.load(Ordering::Relaxed),
            timestamp: Utc::now().timestamp(),
        };

        // Store last state
        let mut last = self.last_state.write().await;
        *last = Some(state.clone());

        Ok(state)
    }

    /// Get last balancing state
    pub async fn get_state(&self) -> CoreResult<Option<HarmoniaState>> {
        let state = self.last_state.read().await;
        Ok(state.clone())
    }

    /// Reset adjustments counter
    pub async fn reset_adjustments(&self) -> CoreResult<()> {
        self.adjustments_applied.store(0, Ordering::Relaxed);
        Ok(())
    }
}

impl Default for HarmoniaModule {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════
//   CORE MODULE TRAIT IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

#[async_trait]
impl CoreModule for HarmoniaModule {
    fn name(&self) -> &str {
        &self.name
    }

    fn version(&self) -> &str {
        &self.version
    }

    fn description(&self) -> &str {
        "System balancing and stabilization core managing load distribution and resource equilibrium"
    }

    fn dependencies(&self) -> Vec<String> {
        vec!["Helios".to_string()] // Requires Helios for metrics
    }

    fn capabilities(&self) -> Vec<String> {
        vec![
            "balance.compute".to_string(),
            "balance.stabilize".to_string(),
            "balance.score".to_string(),
            "balance.state".to_string(),
            "balance.reset".to_string(),
        ]
    }

    async fn initialize(&self) -> CoreResult<()> {
        log_info("HarmoniaModule", "Initializing Harmonia core");

        let mut status = self.status.write().await;
        *status = CoreStatus::Initializing;
        drop(status);

        // Reset counters
        self.adjustments_applied.store(0, Ordering::Relaxed);

        let mut status = self.status.write().await;
        *status = CoreStatus::Ready;

        Ok(())
    }

    async fn start(&self) -> CoreResult<()> {
        log_info("HarmoniaModule", "Starting Harmonia core");

        let status = self.status.read().await;
        if *status != CoreStatus::Ready {
            return Err(CoreError::InvalidState(
                format!("Cannot start from {:?} state", *status)
            ));
        }
        drop(status);

        let mut status = self.status.write().await;
        *status = CoreStatus::Running;

        Ok(())
    }

    async fn stop(&self) -> CoreResult<()> {
        log_info("HarmoniaModule", "Stopping Harmonia core");

        let mut status = self.status.write().await;
        *status = CoreStatus::Stopped;

        Ok(())
    }

    async fn shutdown(&self) -> CoreResult<()> {
        log_info("HarmoniaModule", "Shutting down Harmonia core");

        let mut status = self.status.write().await;
        *status = CoreStatus::Stopped;

        // Clear state
        let mut last = self.last_state.write().await;
        *last = None;

        Ok(())
    }

    async fn get_status(&self) -> CoreStatus {
        *self.status.read().await
    }

    async fn health_check(&self) -> CoreResult<CoreHealth> {
        let status = self.status.read().await;

        match *status {
            CoreStatus::Running => {
                let state = self.get_state().await?;

                if let Some(state) = state {
                    // Failing if balance score < 50
                    if state.balance_score < 50.0 {
                        Ok(CoreHealth::Failing)
                    }
                    // Degraded if rebalancing
                    else if state.stabilization_level == StabilizationLevel::Rebalancing {
                        Ok(CoreHealth::Degraded)
                    } else {
                        Ok(CoreHealth::Healthy)
                    }
                } else {
                    Ok(CoreHealth::Degraded) // No balancing performed yet
                }
            }
            CoreStatus::Ready | CoreStatus::Stopped => Ok(CoreHealth::Healthy),
            CoreStatus::Initializing | CoreStatus::Stopping => Ok(CoreHealth::Degraded),
            CoreStatus::Uninitialized => Ok(CoreHealth::Degraded),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//   UNIT TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::helios::LoadAverage;

    fn create_test_module() -> HarmoniaModule {
        HarmoniaModule::new()
    }

    fn create_helios_state(cpu: f64, ram: f64) -> HeliosState {
        HeliosState {
            cpu_usage: cpu,
            ram_usage: ram,
            ram_total_gb: 16.0,
            ram_used_gb: ram * 16.0 / 100.0,
            disk_usage: 50.0,
            disk_total_gb: 512.0,
            disk_used_gb: 256.0,
            uptime_seconds: 3600,
            load_average: LoadAverage { one: 1.0, five: 1.0, fifteen: 1.0 },
            timestamp: Utc::now().timestamp(),
        }
    }

    #[tokio::test]
    async fn test_harmonia_lifecycle() {
        let module = create_test_module();

        // Initial state
        assert_eq!(module.get_status().await, CoreStatus::Stopped);

        // Initialize
        module.initialize().await.unwrap();
        assert_eq!(module.get_status().await, CoreStatus::Ready);

        // Start
        module.start().await.unwrap();
        assert_eq!(module.get_status().await, CoreStatus::Running);

        // Stop
        module.stop().await.unwrap();
        assert_eq!(module.get_status().await, CoreStatus::Stopped);

        // Shutdown
        module.shutdown().await.unwrap();
        assert_eq!(module.get_status().await, CoreStatus::Stopped);
    }

    #[tokio::test]
    async fn test_harmonia_balance_stable() {
        let module = create_test_module();
        module.initialize().await.unwrap();
        module.start().await.unwrap();

        // Low load - should be stable
        let helios = create_helios_state(30.0, 40.0);
        let state = module.balance(&helios).await.unwrap();

        assert_eq!(state.stabilization_level, StabilizationLevel::Stable);
        assert!(state.balance_score > 60.0);
    }

    #[tokio::test]
    async fn test_harmonia_balance_adjusting() {
        let module = create_test_module();
        module.initialize().await.unwrap();

        // Medium load - should be adjusting
        let helios = create_helios_state(65.0, 70.0);
        let state = module.balance(&helios).await.unwrap();

        assert_eq!(state.stabilization_level, StabilizationLevel::Adjusting);
        assert!(state.balance_score < 70.0);
    }

    #[tokio::test]
    async fn test_harmonia_balance_rebalancing() {
        let module = create_test_module();
        module.initialize().await.unwrap();

        // High load - should be rebalancing
        let helios = create_helios_state(85.0, 90.0);
        let state = module.balance(&helios).await.unwrap();

        assert_eq!(state.stabilization_level, StabilizationLevel::Rebalancing);
        assert!(state.balance_score < 30.0);
        assert_eq!(state.adjustments_applied, 1);
    }

    #[tokio::test]
    async fn test_harmonia_adjustments_counter() {
        let module = create_test_module();
        module.initialize().await.unwrap();

        // Balance multiple times with high load
        let helios = create_helios_state(85.0, 85.0);

        module.balance(&helios).await.unwrap();
        module.balance(&helios).await.unwrap();
        module.balance(&helios).await.unwrap();

        let state = module.get_state().await.unwrap().unwrap();
        assert_eq!(state.adjustments_applied, 3);
    }

    #[tokio::test]
    async fn test_harmonia_reset_adjustments() {
        let module = create_test_module();
        module.initialize().await.unwrap();

        // Apply adjustments
        let helios = create_helios_state(85.0, 85.0);
        module.balance(&helios).await.unwrap();

        let state = module.get_state().await.unwrap().unwrap();
        assert_eq!(state.adjustments_applied, 1);

        // Reset
        module.reset_adjustments().await.unwrap();

        // Counter should be 0
        let helios = create_helios_state(85.0, 85.0);
        let state = module.balance(&helios).await.unwrap();
        assert_eq!(state.adjustments_applied, 1); // First adjustment after reset
    }

    #[tokio::test]
    async fn test_harmonia_health_check() {
        let module = create_test_module();
        module.initialize().await.unwrap();
        module.start().await.unwrap();

        // Balance with low load
        let helios = create_helios_state(30.0, 40.0);
        module.balance(&helios).await.unwrap();

        let health = module.health_check().await.unwrap();
        assert_eq!(health, CoreHealth::Healthy);

        // Balance with high load
        let helios = create_helios_state(85.0, 90.0);
        module.balance(&helios).await.unwrap();

        let health = module.health_check().await.unwrap();
        assert_eq!(health, CoreHealth::Degraded); // Rebalancing
    }

    #[tokio::test]
    async fn test_harmonia_capabilities() {
        let module = create_test_module();
        let caps = module.capabilities();

        assert_eq!(caps.len(), 5);
        assert!(caps.contains(&"balance.compute".to_string()));
        assert!(caps.contains(&"balance.stabilize".to_string()));
        assert!(caps.contains(&"balance.score".to_string()));
        assert!(caps.contains(&"balance.state".to_string()));
        assert!(caps.contains(&"balance.reset".to_string()));
    }

    #[tokio::test]
    async fn test_harmonia_dependencies() {
        let module = create_test_module();
        let deps = module.dependencies();

        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0], "Helios");
    }

    #[tokio::test]
    async fn test_harmonia_balance_score_calculation() {
        let module = create_test_module();
        module.initialize().await.unwrap();

        // Test different load scenarios
        let scenarios = vec![
            (10.0, 10.0, 90.0),   // Low load -> high score
            (50.0, 50.0, 50.0),   // Medium load -> medium score
            (90.0, 90.0, 10.0),   // High load -> low score
            (100.0, 100.0, 0.0),  // Max load -> zero score
        ];

        for (cpu, ram, expected_min_score) in scenarios {
            let helios = create_helios_state(cpu, ram);
            let state = module.balance(&helios).await.unwrap();

            // Allow small margin for calculation
            assert!(state.balance_score >= expected_min_score - 5.0);
            assert!(state.balance_score <= expected_min_score + 5.0);
        }
    }
}
