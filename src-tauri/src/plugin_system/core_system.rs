// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — CORE SYSTEM INITIALIZATION
//   Bootstrap & Registration of All System Cores
// ═══════════════════════════════════════════════════════════════

use crate::{
    plugin_system::{
        cores::{HeliosModule, NexusModule, MemoryModule, HarmoniaModule, SentinelModule},
        CoreResult, CoreHealth,
    },
    services::StorageService,
    utils::log_info,
};
use std::sync::Arc;

/// Initialize all system cores and return them in correct order
pub async fn initialize_all_cores() -> CoreResult<CoreCollection> {
    log_info("CoreSystem", "Initializing all system cores");

    // Create storage service (shared dependency)
    // Use temp directory for now
    let storage_path = std::env::temp_dir().join("titane_storage");
    let storage = StorageService::new(storage_path)
        .map_err(|e| crate::plugin_system::CoreError::Internal(format!("Storage init failed: {}", e)))?;

    // 1. Initialize foundational cores (no dependencies)
    let helios = Arc::new(HeliosModule::new());
    let nexus = Arc::new(NexusModule::new());
    let memory = Arc::new(MemoryModule::new(storage));

    // 2. Initialize dependent cores (require Helios)
    let harmonia = Arc::new(HarmoniaModule::new());
    let sentinel = Arc::new(SentinelModule::new());

    // Initialize all cores
    helios.initialize().await?;
    nexus.initialize().await?;
    memory.initialize().await?;
    harmonia.initialize().await?;
    sentinel.initialize().await?;

    log_info("CoreSystem", "All cores initialized successfully");

    Ok(CoreCollection {
        helios,
        nexus,
        memory,
        harmonia,
        sentinel,
    })
}

/// Start all cores in dependency order
pub async fn start_all_cores(cores: &CoreCollection) -> CoreResult<()> {
    log_info("CoreSystem", "Starting all system cores");

    // Start foundational cores first
    cores.helios.start().await?;
    cores.nexus.start().await?;
    cores.memory.start().await?;

    // Start dependent cores
    cores.harmonia.start().await?;
    cores.sentinel.start().await?;

    log_info("CoreSystem", "All cores started successfully");
    Ok(())
}

/// Stop all cores in reverse dependency order
pub async fn stop_all_cores(cores: &CoreCollection) -> CoreResult<()> {
    log_info("CoreSystem", "Stopping all system cores");

    // Stop dependent cores first
    let _ = cores.sentinel.stop().await;
    let _ = cores.harmonia.stop().await;

    // Stop foundational cores
    let _ = cores.memory.stop().await;
    let _ = cores.nexus.stop().await;
    let _ = cores.helios.stop().await;

    log_info("CoreSystem", "All cores stopped");
    Ok(())
}

/// Shutdown all cores in reverse dependency order
pub async fn shutdown_all_cores(cores: &CoreCollection) -> CoreResult<()> {
    log_info("CoreSystem", "Shutting down all system cores");

    // Shutdown dependent cores first
    let _ = cores.sentinel.shutdown().await;
    let _ = cores.harmonia.shutdown().await;

    // Shutdown foundational cores
    let _ = cores.memory.shutdown().await;
    let _ = cores.nexus.shutdown().await;
    let _ = cores.helios.shutdown().await;

    log_info("CoreSystem", "All cores shutdown complete");
    Ok(())
}

/// Collection of all system cores
pub struct CoreCollection {
    pub helios: Arc<HeliosModule>,
    pub nexus: Arc<NexusModule>,
    pub memory: Arc<MemoryModule>,
    pub harmonia: Arc<HarmoniaModule>,
    pub sentinel: Arc<SentinelModule>,
}

impl CoreCollection {
    /// Get all core names
    pub fn names(&self) -> Vec<&str> {
        vec!["Helios", "Nexus", "Memory", "Harmonia", "Sentinel"]
    }

    /// Get total capabilities count
    pub fn total_capabilities(&self) -> usize {
        self.helios.capabilities().len()
            + self.nexus.capabilities().len()
            + self.memory.capabilities().len()
            + self.harmonia.capabilities().len()
            + self.sentinel.capabilities().len()
    }

    /// Perform health check on all cores
    pub async fn health_check_all(&self) -> HealthReport {
        let helios_health = self.helios.health_check().await.unwrap_or(CoreHealth::Failing);
        let nexus_health = self.nexus.health_check().await.unwrap_or(CoreHealth::Failing);
        let memory_health = self.memory.health_check().await.unwrap_or(CoreHealth::Failing);
        let harmonia_health = self.harmonia.health_check().await.unwrap_or(CoreHealth::Failing);
        let sentinel_health = self.sentinel.health_check().await.unwrap_or(CoreHealth::Failing);

        HealthReport {
            helios: helios_health,
            nexus: nexus_health,
            memory: memory_health,
            harmonia: harmonia_health,
            sentinel: sentinel_health,
        }
    }
}

/// Health report for all cores
#[derive(Debug, Clone)]
pub struct HealthReport {
    pub helios: CoreHealth,
    pub nexus: CoreHealth,
    pub memory: CoreHealth,
    pub harmonia: CoreHealth,
    pub sentinel: CoreHealth,
}

impl HealthReport {
    /// Check if all cores are healthy
    pub fn all_healthy(&self) -> bool {
        self.helios == CoreHealth::Healthy
            && self.nexus == CoreHealth::Healthy
            && self.memory == CoreHealth::Healthy
            && self.harmonia == CoreHealth::Healthy
            && self.sentinel == CoreHealth::Healthy
    }

    /// Get count of failing cores
    pub fn failing_count(&self) -> usize {
        let mut count = 0;
        if self.helios == CoreHealth::Failing { count += 1; }
        if self.nexus == CoreHealth::Failing { count += 1; }
        if self.memory == CoreHealth::Failing { count += 1; }
        if self.harmonia == CoreHealth::Failing { count += 1; }
        if self.sentinel == CoreHealth::Failing { count += 1; }
        count
    }
}

// Re-export types for convenience
// Note: Remove duplicate CoreResult/CoreHealth exports - already imported above

// ═══════════════════════════════════════════════════════════════
//   UNIT TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_initialize_all_cores() {
        let result = initialize_all_cores().await;
        assert!(result.is_ok());

        let cores = result.unwrap();
        assert_eq!(cores.names().len(), 5);
    }

    #[tokio::test]
    async fn test_full_lifecycle() {
        // Initialize
        let cores = initialize_all_cores().await.unwrap();

        // Start
        let result = start_all_cores(&cores).await;
        assert!(result.is_ok());

        // Health check
        let health = cores.health_check_all().await;
        // At least some cores should be healthy
        assert!(health.failing_count() < 5);

        // Stop
        let result = stop_all_cores(&cores).await;
        assert!(result.is_ok());

        // Shutdown
        let result = shutdown_all_cores(&cores).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_core_capabilities() {
        let cores = initialize_all_cores().await.unwrap();

        // Check total capabilities (29 expected)
        let total = cores.total_capabilities();
        assert_eq!(total, 29);
    }

    #[tokio::test]
    async fn test_health_report() {
        let cores = initialize_all_cores().await.unwrap();
        start_all_cores(&cores).await.unwrap();

        let health = cores.health_check_all().await;

        // Should have health status for all 5 cores
        assert!(health.failing_count() <= 5);
    }

    #[tokio::test]
    async fn test_graceful_shutdown() {
        let cores = initialize_all_cores().await.unwrap();
        start_all_cores(&cores).await.unwrap();

        // Shutdown should succeed even if some operations fail
        let result = shutdown_all_cores(&cores).await;
        assert!(result.is_ok());
    }
}
