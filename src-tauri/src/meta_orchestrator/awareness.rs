//! ═══════════════════════════════════════════════════════════════════════════
//! TITANE∞ v∞ — SYSTEM AWARENESS ENGINE
//! Conscience système et monitoring global
//! ═══════════════════════════════════════════════════════════════════════════

use super::{AwarenessLevel, MetaOrchestratorError, SystemHealth};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

/// Moteur de conscience système
pub struct SystemAwareness {
    health_history: VecDeque<SystemHealth>,
    max_history: usize,
    alert_thresholds: AlertThresholds,
    current_level: AwarenessLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertThresholds {
    pub cpu_warning: f64,
    pub cpu_critical: f64,
    pub memory_warning: f64,
    pub memory_critical: f64,
    pub error_rate_warning: f64,
    pub error_rate_critical: f64,
}

impl Default for AlertThresholds {
    fn default() -> Self {
        Self {
            cpu_warning: 70.0,
            cpu_critical: 90.0,
            memory_warning: 75.0,
            memory_critical: 95.0,
            error_rate_warning: 0.01,
            error_rate_critical: 0.05,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AwarenessReport {
    pub recommended_level: AwarenessLevel,
    pub health: SystemHealth,
    pub alerts: Vec<SystemAlert>,
    pub trends: HealthTrends,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemAlert {
    pub severity: AlertSeverity,
    pub category: AlertCategory,
    pub message: String,
    pub metric_value: f64,
    pub threshold: f64,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AlertSeverity {
    Info,
    Warning,
    Critical,
    Emergency,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AlertCategory {
    CPU,
    Memory,
    GPU,
    DiskIO,
    Network,
    ErrorRate,
    EngineHealth,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthTrends {
    pub cpu_trend: TrendDirection,
    pub memory_trend: TrendDirection,
    pub error_trend: TrendDirection,
    pub overall_trend: TrendDirection,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TrendDirection {
    Improving,
    Stable,
    Degrading,
    Critical,
}

impl SystemAwareness {
    pub fn new() -> Self {
        Self {
            health_history: VecDeque::with_capacity(100),
            max_history: 100,
            alert_thresholds: AlertThresholds::default(),
            current_level: AwarenessLevel::Dormant,
        }
    }

    pub async fn initialize(&self) -> Result<(), MetaOrchestratorError> {
        log::info!("[SystemAwareness] Initializing awareness engine...");
        Ok(())
    }

    /// Analyse l'état du système
    pub async fn analyze(&self) -> Result<AwarenessReport, MetaOrchestratorError> {
        let health = self.collect_health_metrics().await;
        let alerts = self.check_thresholds(&health);
        let trends = self.calculate_trends();
        let recommended_level = self.determine_awareness_level(&health, &alerts);
        let recommendations = self.generate_recommendations(&health, &alerts);

        Ok(AwarenessReport {
            recommended_level,
            health,
            alerts,
            trends,
            recommendations,
        })
    }

    /// Collecte les métriques de santé système
    async fn collect_health_metrics(&self) -> SystemHealth {
        // En production, ceci utiliserait sysinfo ou similar
        // Pour l'instant, simulation avec valeurs raisonnables

        let cpu_usage = self.get_cpu_usage();
        let memory_usage = self.get_memory_usage();

        let mut warnings = Vec::new();
        let mut critical_issues = Vec::new();

        if cpu_usage > self.alert_thresholds.cpu_warning {
            warnings.push(format!("CPU usage elevated: {:.1}%", cpu_usage));
        }
        if cpu_usage > self.alert_thresholds.cpu_critical {
            critical_issues.push(format!("CPU critical: {:.1}%", cpu_usage));
        }

        if memory_usage > self.alert_thresholds.memory_warning {
            warnings.push(format!("Memory usage elevated: {:.1}%", memory_usage));
        }

        let overall_score = self.calculate_health_score(cpu_usage, memory_usage, 0.0);

        SystemHealth {
            overall_score,
            cpu_usage,
            memory_usage,
            gpu_usage: 0.0,
            disk_io: 0.0,
            network_latency_ms: 0,
            error_rate: 0.0,
            warnings,
            critical_issues,
        }
    }

    fn get_cpu_usage(&self) -> f64 {
        // Simulation - en production utiliser sysinfo
        15.0 + (rand_simple() * 20.0)
    }

    fn get_memory_usage(&self) -> f64 {
        // Simulation - en production utiliser sysinfo
        40.0 + (rand_simple() * 15.0)
    }

    fn calculate_health_score(&self, cpu: f64, memory: f64, error_rate: f64) -> f64 {
        let cpu_score = 1.0 - (cpu / 100.0).min(1.0);
        let memory_score = 1.0 - (memory / 100.0).min(1.0);
        let error_score = 1.0 - (error_rate * 10.0).min(1.0);

        (cpu_score * 0.4 + memory_score * 0.4 + error_score * 0.2).clamp(0.0, 1.0)
    }

    fn check_thresholds(&self, health: &SystemHealth) -> Vec<SystemAlert> {
        let mut alerts = Vec::new();
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        if health.cpu_usage > self.alert_thresholds.cpu_critical {
            alerts.push(SystemAlert {
                severity: AlertSeverity::Critical,
                category: AlertCategory::CPU,
                message: format!("CPU usage critical: {:.1}%", health.cpu_usage),
                metric_value: health.cpu_usage,
                threshold: self.alert_thresholds.cpu_critical,
                timestamp: now,
            });
        } else if health.cpu_usage > self.alert_thresholds.cpu_warning {
            alerts.push(SystemAlert {
                severity: AlertSeverity::Warning,
                category: AlertCategory::CPU,
                message: format!("CPU usage elevated: {:.1}%", health.cpu_usage),
                metric_value: health.cpu_usage,
                threshold: self.alert_thresholds.cpu_warning,
                timestamp: now,
            });
        }

        if health.memory_usage > self.alert_thresholds.memory_critical {
            alerts.push(SystemAlert {
                severity: AlertSeverity::Critical,
                category: AlertCategory::Memory,
                message: format!("Memory usage critical: {:.1}%", health.memory_usage),
                metric_value: health.memory_usage,
                threshold: self.alert_thresholds.memory_critical,
                timestamp: now,
            });
        } else if health.memory_usage > self.alert_thresholds.memory_warning {
            alerts.push(SystemAlert {
                severity: AlertSeverity::Warning,
                category: AlertCategory::Memory,
                message: format!("Memory usage elevated: {:.1}%", health.memory_usage),
                metric_value: health.memory_usage,
                threshold: self.alert_thresholds.memory_warning,
                timestamp: now,
            });
        }

        alerts
    }

    fn calculate_trends(&self) -> HealthTrends {
        // Analyse des tendances basée sur l'historique
        HealthTrends {
            cpu_trend: TrendDirection::Stable,
            memory_trend: TrendDirection::Stable,
            error_trend: TrendDirection::Stable,
            overall_trend: TrendDirection::Stable,
        }
    }

    fn determine_awareness_level(
        &self,
        health: &SystemHealth,
        alerts: &[SystemAlert],
    ) -> AwarenessLevel {
        let has_critical = alerts.iter().any(|a| a.severity == AlertSeverity::Critical);
        let has_emergency = alerts
            .iter()
            .any(|a| a.severity == AlertSeverity::Emergency);
        let warning_count = alerts
            .iter()
            .filter(|a| a.severity == AlertSeverity::Warning)
            .count();

        if has_emergency {
            AwarenessLevel::Transcendent
        } else if has_critical {
            AwarenessLevel::HyperAware
        } else if warning_count > 2 {
            AwarenessLevel::Elevated
        } else if health.overall_score > 0.8 {
            AwarenessLevel::Standard
        } else if health.overall_score > 0.5 {
            AwarenessLevel::Elevated
        } else {
            AwarenessLevel::HyperAware
        }
    }

    fn generate_recommendations(
        &self,
        health: &SystemHealth,
        alerts: &[SystemAlert],
    ) -> Vec<String> {
        let mut recommendations = Vec::new();

        if health.cpu_usage > 70.0 {
            recommendations.push("Consider reducing background tasks".to_string());
        }

        if health.memory_usage > 80.0 {
            recommendations.push("Memory cleanup recommended".to_string());
        }

        if alerts
            .iter()
            .any(|a| a.category == AlertCategory::ErrorRate)
        {
            recommendations.push("Review error logs for patterns".to_string());
        }

        if recommendations.is_empty() {
            recommendations.push("System operating normally".to_string());
        }

        recommendations
    }
}

/// Générateur pseudo-aléatoire simple (pour simulation)
fn rand_simple() -> f64 {
    use std::time::SystemTime;
    let nanos = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap_or_default()
        .subsec_nanos();
    (nanos as f64 % 1000.0) / 1000.0
}
