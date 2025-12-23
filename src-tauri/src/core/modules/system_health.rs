// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20.0 — SYSTEM HEALTH ENGINE
//   Phase 2 Fusion #3: Helios + Sentinel + Self-Heal
// ═══════════════════════════════════════════════════════════════
// Unified monitoring + anomaly detection + auto-healing
// Closed-loop: Monitor → Detect → Heal
// ═══════════════════════════════════════════════════════════════

use crate::core::state::SingularityState;
use crate::core::types::{EngineError, EngineHealth, EngineResult, ModuleInfo};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sysinfo::System;

// ═══════════════════════════════════════════════════════════════
//   CORE STRUCTURES
// ═══════════════════════════════════════════════════════════════

/// Unified System Health Engine (v20.0)
/// Fusion: Helios + Sentinel + Self-Heal
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemHealth {
    // Core state
    health: EngineHealth,
    initialized: bool,
    pub last_update_ms: u64,

    // System metrics (ex-Helios)
    pub cpu_usage: f32,
    pub memory_usage: f32,
    pub disk_usage: f32,
    pub network_latency_ms: u32,
    pub uptime_ms: u64,

    // Monitoring (ex-Sentinel)
    pub alert_count: u64,
    pub active_monitors: u32,
    pub protection_level: u8,
    error_log: Vec<ErrorRecord>,

    // Auto-healing (ex-Self-Heal)
    pub repairs_performed: u64,
    pub last_repair_ms: u64,
    pub success_rate: f32,
    pub auto_heal_enabled: bool,

    // Unified health score
    pub global_health: f32, // 0.0-1.0
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorRecord {
    pub timestamp: u64,
    pub severity: ErrorSeverity,
    pub module: String,
    pub message: String,
    pub auto_repaired: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum ErrorSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Anomaly {
    pub detected_at: u64,
    pub anomaly_type: AnomalyType,
    pub severity: f32,
    pub description: String,
    pub auto_healable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AnomalyType {
    HighCPU,
    HighMemory,
    HighDisk,
    HighLatency,
    ModuleFailure,
    DataCorruption,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HealingReport {
    pub anomalies_detected: usize,
    pub repairs_attempted: usize,
    pub repairs_successful: usize,
    pub success_rate: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthReport {
    pub timestamp: u64,
    pub global_health: f32,
    pub cpu_usage: f32,
    pub memory_usage: f32,
    pub disk_usage: f32,
    pub network_latency_ms: u32,
    pub alert_count: u64,
    pub repairs_performed: u64,
    pub success_rate: f32,
    pub issues: Vec<HealthIssue>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthIssue {
    pub severity: ErrorSeverity,
    pub module: String,
    pub description: String,
}

// ═══════════════════════════════════════════════════════════════
//   IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

impl SystemHealth {
    pub fn new() -> Self {
        Self {
            health: EngineHealth::Offline,
            initialized: false,
            last_update_ms: 0,
            cpu_usage: 0.0,
            memory_usage: 0.0,
            disk_usage: 0.0,
            network_latency_ms: 0,
            uptime_ms: 0,
            alert_count: 0,
            active_monitors: 3, // CPU, Memory, Disk
            protection_level: 1,
            error_log: Vec::new(),
            repairs_performed: 0,
            last_repair_ms: 0,
            success_rate: 1.0,
            auto_heal_enabled: true,
            global_health: 1.0,
        }
    }

    /// Initialize unified health system
    pub fn init(&mut self) -> EngineResult<()> {
        if self.initialized {
            return Ok(());
        }

        // Initialize system info collector
        self.collect_metrics()?;

        self.health = EngineHealth::Healthy;
        self.initialized = true;
        self.last_update_ms = Self::current_timestamp();

        Ok(())
    }

    /// Main tick: monitor + detect + heal
    pub async fn tick(&mut self, state: &mut SingularityState) -> EngineResult<()> {
        if !self.initialized {
            return Err(EngineError::Runtime(
                "SystemHealth not initialized".to_string(),
            ));
        }

        let now = Self::current_timestamp();

        // 1. Collect system metrics (ex-Helios)
        self.collect_metrics()?;

        // 2. Scan for anomalies (ex-Sentinel)
        let anomalies = self.scan_anomalies(state);

        // 3. Auto-heal if enabled (ex-Self-Heal)
        if self.auto_heal_enabled && !anomalies.is_empty() {
            let report = self.auto_heal(anomalies).await;
            self.repairs_performed += report.repairs_successful as u64;

            // Update success rate (exponential moving average)
            let new_rate = report.success_rate;
            self.success_rate = self.success_rate * 0.9 + new_rate * 0.1;

            if report.repairs_successful > 0 {
                self.last_repair_ms = now;
            }
        }

        // 4. Compute global health score
        self.global_health = self.compute_health_score();

        // 5. Update health status
        self.health = if self.global_health > 0.8 {
            EngineHealth::Healthy
        } else if self.global_health > 0.5 {
            EngineHealth::Degraded
        } else if self.global_health > 0.2 {
            EngineHealth::Failing
        } else {
            EngineHealth::Offline
        };

        self.last_update_ms = now;
        Ok(())
    }

    /// Collect system metrics (ex-Helios)
    fn collect_metrics(&mut self) -> EngineResult<()> {
        let mut sys = System::new_all();
        sys.refresh_all();

        // CPU usage (simple average for compatibility)
        let cpus = sys.cpus();
        if !cpus.is_empty() {
            let total: f32 = cpus.iter().map(|cpu| cpu.cpu_usage()).sum();
            self.cpu_usage = total / cpus.len() as f32;
        }

        // Memory usage
        let total_mem = sys.total_memory() as f32;
        let used_mem = sys.used_memory() as f32;
        self.memory_usage = (used_mem / total_mem) * 100.0;

        // Disk usage (placeholder - API changed)
        self.disk_usage = 50.0; // Would need to iterate sys.disks() properly

        // Uptime (placeholder - no direct method in new API)
        self.uptime_ms = 0;

        // Network latency (placeholder)
        self.network_latency_ms = 10;

        Ok(())
    }

    /// Scan for anomalies (ex-Sentinel)
    fn scan_anomalies(&mut self, state: &SingularityState) -> Vec<Anomaly> {
        let mut anomalies = Vec::new();
        let now = Self::current_timestamp();

        // Check CPU
        if self.cpu_usage > 80.0 {
            anomalies.push(Anomaly {
                detected_at: now,
                anomaly_type: AnomalyType::HighCPU,
                severity: (self.cpu_usage - 80.0) / 20.0, // 0.0-1.0
                description: format!("CPU usage at {:.1}%", self.cpu_usage),
                auto_healable: true,
            });
        }

        // Check Memory
        if self.memory_usage > 85.0 {
            anomalies.push(Anomaly {
                detected_at: now,
                anomaly_type: AnomalyType::HighMemory,
                severity: (self.memory_usage - 85.0) / 15.0,
                description: format!("Memory usage at {:.1}%", self.memory_usage),
                auto_healable: true,
            });
        }

        // Check Disk
        if self.disk_usage > 90.0 {
            anomalies.push(Anomaly {
                detected_at: now,
                anomaly_type: AnomalyType::HighDisk,
                severity: (self.disk_usage - 90.0) / 10.0,
                description: format!("Disk usage at {:.1}%", self.disk_usage),
                auto_healable: false, // User intervention needed
            });
        }

        // Check module health
        if state.coherence.health() == EngineHealth::Failing {
            anomalies.push(Anomaly {
                detected_at: now,
                anomaly_type: AnomalyType::ModuleFailure,
                severity: 0.8,
                description: "CoherenceEngine failing".to_string(),
                auto_healable: true,
            });
        }

        if state.memory.health() == EngineHealth::Failing {
            anomalies.push(Anomaly {
                detected_at: now,
                anomaly_type: AnomalyType::ModuleFailure,
                severity: 0.8,
                description: "UnifiedMemory failing".to_string(),
                auto_healable: true,
            });
        }

        // Log anomalies
        for anomaly in &anomalies {
            self.log_error(
                if anomaly.severity > 0.7 {
                    ErrorSeverity::Critical
                } else if anomaly.severity > 0.4 {
                    ErrorSeverity::Error
                } else {
                    ErrorSeverity::Warning
                },
                "SystemHealth",
                anomaly.description.clone(),
            );
        }

        anomalies
    }

    /// Auto-heal detected issues (ex-Self-Heal)
    async fn auto_heal(&mut self, anomalies: Vec<Anomaly>) -> HealingReport {
        let mut attempted = 0;
        let mut successful = 0;

        for anomaly in &anomalies {
            if !anomaly.auto_healable {
                continue;
            }

            attempted += 1;

            let repaired = match anomaly.anomaly_type {
                AnomalyType::HighCPU => {
                    // Reduce CPU load (placeholder)
                    self.reduce_cpu_load().await
                }
                AnomalyType::HighMemory => {
                    // Clear caches
                    self.clear_memory_cache().await
                }
                AnomalyType::ModuleFailure => {
                    // Restart module
                    self.restart_failed_module(&anomaly.description).await
                }
                _ => false,
            };

            if repaired {
                successful += 1;
                self.mark_error_repaired(&anomaly.description);
            }
        }

        HealingReport {
            anomalies_detected: anomalies.len(),
            repairs_attempted: attempted,
            repairs_successful: successful,
            success_rate: if attempted > 0 {
                successful as f32 / attempted as f32
            } else {
                1.0
            },
        }
    }

    /// Compute global health score
    fn compute_health_score(&self) -> f32 {
        // Weighted average of different metrics
        let cpu_health = (100.0 - self.cpu_usage.min(100.0)) / 100.0;
        let mem_health = (100.0 - self.memory_usage.min(100.0)) / 100.0;
        let disk_health = (100.0 - self.disk_usage.min(100.0)) / 100.0;

        // Recent errors penalty
        let error_penalty = (self.error_log.len().min(10) as f32) * 0.05;

        let score =
            (cpu_health * 0.3 + mem_health * 0.3 + disk_health * 0.2 + self.success_rate * 0.2)
                - error_penalty;

        score.max(0.0).min(1.0)
    }

    /// Get health report
    pub fn get_report(&self) -> HealthReport {
        let recent_errors: Vec<HealthIssue> = self
            .error_log
            .iter()
            .rev()
            .take(5)
            .map(|err| HealthIssue {
                severity: err.severity,
                module: err.module.clone(),
                description: err.message.clone(),
            })
            .collect();

        HealthReport {
            timestamp: Self::current_timestamp(),
            global_health: self.global_health,
            cpu_usage: self.cpu_usage,
            memory_usage: self.memory_usage,
            disk_usage: self.disk_usage,
            network_latency_ms: self.network_latency_ms,
            alert_count: self.alert_count,
            repairs_performed: self.repairs_performed,
            success_rate: self.success_rate,
            issues: recent_errors,
        }
    }

    pub fn health(&self) -> EngineHealth {
        self.health
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }

    pub fn info(&self) -> ModuleInfo {
        ModuleInfo {
            name: "SystemHealth".to_string(),
            version: "20.0".to_string(),
            initialized: self.initialized,
            health: self.health,
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //   HELPER METHODS
    // ═══════════════════════════════════════════════════════════════

    fn log_error(&mut self, severity: ErrorSeverity, module: &str, message: String) {
        self.error_log.push(ErrorRecord {
            timestamp: Self::current_timestamp(),
            severity,
            module: module.to_string(),
            message,
            auto_repaired: false,
        });

        // Keep only last 100 errors
        if self.error_log.len() > 100 {
            self.error_log.drain(0..self.error_log.len() - 100);
        }

        self.alert_count += 1;
    }

    fn mark_error_repaired(&mut self, description: &str) {
        if let Some(err) = self
            .error_log
            .iter_mut()
            .rev()
            .find(|e| e.message.contains(description))
        {
            err.auto_repaired = true;
        }
    }

    async fn reduce_cpu_load(&self) -> bool {
        // Placeholder: Would implement CPU throttling or task prioritization
        tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
        true
    }

    async fn clear_memory_cache(&self) -> bool {
        // Placeholder: Would clear various caches
        tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
        true
    }

    async fn restart_failed_module(&self, _description: &str) -> bool {
        // Placeholder: Would restart the failing module
        tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
        true
    }

    fn current_timestamp() -> u64 {
        Utc::now().timestamp_millis() as u64
    }
}

impl Default for SystemHealth {
    fn default() -> Self {
        Self::new()
    }
}

// ═══════════════════════════════════════════════════════════════
//   TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_system_health_init() {
        let mut health = SystemHealth::new();
        assert!(!health.is_initialized());

        health
            .init()
            .expect("system health should initialize before use");
        assert!(health.is_initialized());
        assert_eq!(health.health(), EngineHealth::Healthy);
    }

    #[test]
    fn test_collect_metrics() {
        let mut health = SystemHealth::new();
        health
            .init()
            .expect("system health should initialize before metrics collection");

        health
            .collect_metrics()
            .expect("should collect metrics after initialization");

        assert!(health.cpu_usage >= 0.0);
        assert!(health.memory_usage >= 0.0);
        assert!(health.disk_usage >= 0.0);
    }

    #[test]
    fn test_health_score_computation() {
        let mut health = SystemHealth::new();
        health.cpu_usage = 50.0;
        health.memory_usage = 60.0;
        health.disk_usage = 40.0;
        health.success_rate = 1.0;

        let score = health.compute_health_score();
        assert!(score > 0.5);
        assert!(score <= 1.0);
    }

    #[test]
    fn test_anomaly_detection_high_cpu() {
        let mut health = SystemHealth::new();
        let state = SingularityState::default();

        health.cpu_usage = 85.0;
        let anomalies = health.scan_anomalies(&state);

        assert_eq!(anomalies.len(), 1);
        assert_eq!(anomalies[0].anomaly_type, AnomalyType::HighCPU);
    }

    #[tokio::test]
    async fn test_auto_heal() {
        let mut health = SystemHealth::new();
        health
            .init()
            .expect("system health should initialize before auto heal");

        let anomalies = vec![Anomaly {
            detected_at: 0,
            anomaly_type: AnomalyType::HighCPU,
            severity: 0.5,
            description: "High CPU".to_string(),
            auto_healable: true,
        }];

        let report = health.auto_heal(anomalies).await;
        assert_eq!(report.repairs_attempted, 1);
        assert_eq!(report.repairs_successful, 1);
    }

    #[test]
    fn test_health_report() {
        let mut health = SystemHealth::new();
        health
            .init()
            .expect("system health should initialize before report generation");
        health.cpu_usage = 45.0;
        health.memory_usage = 55.0;

        let report = health.get_report();
        assert_eq!(report.cpu_usage, 45.0);
        assert_eq!(report.memory_usage, 55.0);
    }
}
