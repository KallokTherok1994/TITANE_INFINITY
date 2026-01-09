// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Monitoring Engine v27.0
//   Unified monitoring, metrics, performance, and telemetry
//   Phase 1 Consolidation: 7 modules → 1
// ═══════════════════════════════════════════════════════════════

//! # Monitoring Module
//!
//! Unified monitoring system consolidating:
//! - `profiling/` → `metrics/ipc_profiler`
//! - `performance/` → `performance/`
//! - `hypervision/` → `health/`
//! - `harmonia_engine.rs` → `performance/cpu_monitor`
//! - `devtools/metrics.rs` → `metrics/collector`
//! - `system_center/diagnostics.rs` → `health/system_checks`
//!
//! ## Architecture
//!
//! ```text
//! monitoring/
//! ├── metrics/       - Metrics collection (IPC, time-series)
//! ├── performance/   - Performance monitoring (CPU, scheduler, diagnostics)
//! ├── health/        - Health checks (system, hypervision, alerts)
//! └── telemetry/     - Telemetry export (OpenTelemetry, Prometheus)
//! ```

pub mod health;
pub mod metrics;
pub mod performance;
pub mod telemetry;

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Unified monitoring engine coordinating all monitoring subsystems
pub struct MonitoringEngine {
    pub metrics: Arc<RwLock<metrics::MetricsCollector>>,
    pub performance: Arc<RwLock<performance::PerformanceDiagnostics>>,
    pub health: Arc<RwLock<health::HealthMonitor>>,
    pub telemetry: Arc<RwLock<telemetry::TelemetryExporter>>,
}

/// Complete metrics snapshot across all monitoring subsystems
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsSnapshot {
    pub ipc_metrics: metrics::IpcMetrics,
    pub cpu_metrics: performance::CpuMetrics,
    pub task_metrics: performance::TaskMetrics,
    pub health_status: health::HealthStatus,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Data formatted for frontend /stats page
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatsPageData {
    /// CPU usage history (Helios equivalent)
    pub helios_data: performance::CpuHistory,
    /// IPC metrics (Nexus equivalent)
    pub nexus_data: metrics::IpcMetrics,
    /// System health (Harmonia equivalent)
    pub harmonia_data: health::HealthStatus,
}

impl MonitoringEngine {
    /// Create new monitoring engine with all subsystems initialized
    pub fn new() -> Self {
        Self {
            metrics: Arc::new(RwLock::new(metrics::MetricsCollector::new())),
            performance: Arc::new(RwLock::new(performance::PerformanceDiagnostics::new())),
            health: Arc::new(RwLock::new(health::HealthMonitor::new())),
            telemetry: Arc::new(RwLock::new(telemetry::TelemetryExporter::new())),
        }
    }

    /// Get complete snapshot of all metrics
    pub async fn snapshot(&self) -> MetricsSnapshot {
        let metrics = self.metrics.read().await;
        let performance = self.performance.read().await;
        let health = self.health.read().await;

        MetricsSnapshot {
            ipc_metrics: metrics.get_ipc_metrics(),
            cpu_metrics: performance.get_cpu_metrics(),
            task_metrics: performance.get_task_metrics(),
            health_status: health.get_status(),
            timestamp: chrono::Utc::now(),
        }
    }

    /// Export data formatted for frontend /stats page
    pub async fn export_for_ui(&self) -> StatsPageData {
        let performance = self.performance.read().await;
        let metrics = self.metrics.read().await;
        let health = self.health.read().await;

        StatsPageData {
            helios_data: performance.get_cpu_history(),
            nexus_data: metrics.get_ipc_metrics(),
            harmonia_data: health.get_status(),
        }
    }

    /// Start background monitoring tasks
    pub async fn start_monitoring(&self) {
        // TODO: Spawn periodic collection tasks
        // - CPU monitoring every 1s
        // - Health checks every 30s
        // - Telemetry export every 60s
    }
}

impl Default for MonitoringEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_monitoring_engine_new() {
        let engine = MonitoringEngine::new();
        assert!(Arc::strong_count(&engine.metrics) == 1);
        assert!(Arc::strong_count(&engine.performance) == 1);
        assert!(Arc::strong_count(&engine.health) == 1);
        assert!(Arc::strong_count(&engine.telemetry) == 1);
    }

    #[tokio::test]
    async fn test_snapshot_returns_valid_data() {
        let engine = MonitoringEngine::new();
        let snapshot = engine.snapshot().await;

        // Timestamp should be recent (within last second)
        let now = chrono::Utc::now();
        let diff = now - snapshot.timestamp;
        assert!(diff.num_seconds() < 1);
    }

    #[tokio::test]
    async fn test_export_for_ui_returns_data() {
        let engine = MonitoringEngine::new();
        let ui_data = engine.export_for_ui().await;

        // Should have valid data structures
        // (Actual validation depends on submodule implementations)
        // Fresh engine has no CPU samples until periodic monitoring runs.
        assert_eq!(ui_data.helios_data.samples.len(), 0);
    }

    #[test]
    fn test_default_creates_engine() {
        let engine = MonitoringEngine::default();
        assert!(Arc::strong_count(&engine.metrics) == 1);
    }
}
