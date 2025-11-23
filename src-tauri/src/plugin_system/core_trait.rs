// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — CORE MODULE TRAIT (Simplified)
//   Lightweight trait for system cores - Phase 2 Migration
// ═══════════════════════════════════════════════════════════════

use async_trait::async_trait;
use serde::{Deserialize, Serialize};

/// Core module result type
pub type CoreResult<T> = Result<T, CoreError>;

/// Core module errors
#[derive(Debug, Clone, thiserror::Error)]
pub enum CoreError {
    #[error("Initialization failed: {0}")]
    InitializationFailed(String),

    #[error("Invalid state transition: {0}")]
    InvalidState(String),

    #[error("Dependency not found: {0}")]
    DependencyNotFound(String),

    #[error("Configuration error: {0}")]
    ConfigurationError(String),

    #[error("Internal error: {0}")]
    Internal(String),

    #[error("Runtime error: {0}")]
    RuntimeError(String),
}

/// Core module status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CoreStatus {
    /// Core not yet initialized
    Stopped,
    /// Core is initializing
    Initializing,
    /// Core is ready to start
    Ready,
    /// Core is running
    Running,
    /// Core is stopping (legacy)
    Stopping,
    /// Core is uninitialized (legacy)
    Uninitialized,
}

/// Core module health status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CoreHealth {
    /// Core is fully operational
    Healthy,
    /// Core is operational but degraded
    Degraded,
    /// Core is failing or non-operational
    Failing,
}

/// Simplified CoreModule trait for Phase 2 migration
#[async_trait]
pub trait CoreModule: Send + Sync {
    /// Unique core name
    fn name(&self) -> &str;

    /// Core version (semver)
    fn version(&self) -> &str;

    /// Core description
    fn description(&self) -> &str;

    /// List of dependency core names
    fn dependencies(&self) -> Vec<String>;

    /// List of capabilities this core provides
    fn capabilities(&self) -> Vec<String>;

    /// Initialize the core (transition: Stopped → Ready)
    async fn initialize(&self) -> CoreResult<()>;

    /// Start the core (transition: Ready → Running)
    async fn start(&self) -> CoreResult<()>;

    /// Stop the core (transition: Running → Stopped)
    async fn stop(&self) -> CoreResult<()>;

    /// Shutdown the core completely (cleanup resources)
    async fn shutdown(&self) -> CoreResult<()>;

    /// Get current core status
    async fn get_status(&self) -> CoreStatus;

    /// Perform health check
    async fn health_check(&self) -> CoreResult<CoreHealth>;
}
