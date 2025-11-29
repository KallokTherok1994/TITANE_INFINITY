// TITANE∞ v18.2 — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

//! META MONITORING MODULE
//!
//! Production monitoring system for META-COGNITION and DEEP SYNC engines.
//! Provides real-time metrics, historical data, and alerting capabilities.

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::sync::Arc;
use tokio::sync::RwLock;

#[cfg(test)]
use crate::meta::CognitiveHealthIndicators;
use crate::meta::{DeepSyncAction, MetaCognitiveReport, SyncedState};

/// Maximum number of evaluation history entries to keep in memory
const MAX_HISTORY_SIZE: usize = 1000;

/// META monitoring metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaMonitoringMetrics {
    /// Total evaluations performed
    pub total_evaluations: u64,

    /// Total anomalies detected
    pub total_anomalies: u64,

    /// Total deep syncs performed
    pub total_syncs: u64,

    /// Total sync failures
    pub total_sync_failures: u64,

    /// Average coherence score (last 100 evaluations)
    pub avg_coherence: f32,

    /// Average sync quality (last 100 syncs)
    pub avg_sync_quality: f32,

    /// Current anomaly rate (0-1)
    pub anomaly_rate: f32,

    /// Current sync failure rate (0-1)
    pub sync_failure_rate: f32,

    /// Uptime (seconds)
    pub uptime: u64,

    /// Last evaluation timestamp
    pub last_evaluation: Option<u64>,

    /// Last sync timestamp
    pub last_sync: Option<u64>,

    /// Critical alerts count
    pub critical_alerts: u64,

    /// Warning alerts count
    pub warning_alerts: u64,
}

impl Default for MetaMonitoringMetrics {
    fn default() -> Self {
        Self {
            total_evaluations: 0,
            total_anomalies: 0,
            total_syncs: 0,
            total_sync_failures: 0,
            avg_coherence: 0.0,
            avg_sync_quality: 0.0,
            anomaly_rate: 0.0,
            sync_failure_rate: 0.0,
            uptime: 0,
            last_evaluation: None,
            last_sync: None,
            critical_alerts: 0,
            warning_alerts: 0,
        }
    }
}

/// Historical evaluation entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationHistoryEntry {
    pub timestamp: u64,
    pub coherence_score: f32,
    pub confidence: f32,
    pub anomaly_detected: bool,
    pub recommended_action: Option<DeepSyncAction>,
    pub issues_count: usize,
}

/// Historical sync entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncHistoryEntry {
    pub timestamp: u64,
    pub quality: String, // SyncQuality as string
    pub success: bool,
    pub engines_in_sync: usize,
    pub engines_out_of_sync: usize,
    pub issues_count: usize,
    pub integrity_hash: String,
}

/// Alert severity
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AlertSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

/// META alert
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaAlert {
    pub id: String,
    pub timestamp: u64,
    pub severity: AlertSeverity,
    pub category: String,
    pub message: String,
    pub context: serde_json::Value,
    pub acknowledged: bool,
}

/// META Monitoring Engine
pub struct MetaMonitoringEngine {
    metrics: Arc<RwLock<MetaMonitoringMetrics>>,
    evaluation_history: Arc<RwLock<VecDeque<EvaluationHistoryEntry>>>,
    sync_history: Arc<RwLock<VecDeque<SyncHistoryEntry>>>,
    alerts: Arc<RwLock<Vec<MetaAlert>>>,
    start_time: std::time::SystemTime,
}

impl MetaMonitoringEngine {
    pub fn new() -> Self {
        Self {
            metrics: Arc::new(RwLock::new(MetaMonitoringMetrics::default())),
            evaluation_history: Arc::new(RwLock::new(VecDeque::with_capacity(MAX_HISTORY_SIZE))),
            sync_history: Arc::new(RwLock::new(VecDeque::with_capacity(MAX_HISTORY_SIZE))),
            alerts: Arc::new(RwLock::new(Vec::new())),
            start_time: std::time::SystemTime::now(),
        }
    }

    /// Record META-COGNITION evaluation
    pub async fn record_evaluation(&self, report: &MetaCognitiveReport) {
        let mut metrics = self.metrics.write().await;
        let mut history = self.evaluation_history.write().await;

        // Update metrics
        metrics.total_evaluations += 1;
        if report.anomaly_detected {
            metrics.total_anomalies += 1;
        }

        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        metrics.last_evaluation = Some(timestamp);
        metrics.anomaly_rate = metrics.total_anomalies as f32 / metrics.total_evaluations as f32;

        // Calculate average coherence (last 100)
        let recent_count = history.len().min(100);
        if recent_count > 0 {
            let sum: f32 = history
                .iter()
                .rev()
                .take(recent_count)
                .map(|e| e.coherence_score)
                .sum();
            metrics.avg_coherence = (sum + report.coherence_score) / (recent_count + 1) as f32;
        } else {
            metrics.avg_coherence = report.coherence_score;
        }

        // Update uptime
        metrics.uptime = std::time::SystemTime::now()
            .duration_since(self.start_time)
            .unwrap()
            .as_secs();

        // Add to history
        let entry = EvaluationHistoryEntry {
            timestamp,
            coherence_score: report.coherence_score,
            confidence: report.confidence,
            anomaly_detected: report.anomaly_detected,
            recommended_action: report.recommended_next_state.clone(),
            issues_count: report.detected_issues.len(),
        };

        if history.len() >= MAX_HISTORY_SIZE {
            history.pop_front();
        }
        history.push_back(entry);

        // Generate alert if anomaly detected
        if report.anomaly_detected {
            self.generate_alert(
                AlertSeverity::Warning,
                "META-COGNITION",
                format!(
                    "Anomaly detected: coherence={:.2}, issues={}",
                    report.coherence_score,
                    report.detected_issues.len()
                ),
                serde_json::json!({
                    "coherence_score": report.coherence_score,
                    "confidence": report.confidence,
                    "issues": report.detected_issues,
                    "recommended_action": format!("{:?}", report.recommended_next_state),
                }),
            )
            .await;
        }

        // Critical alert if coherence very low
        if report.coherence_score < 0.3 {
            self.generate_alert(
                AlertSeverity::Critical,
                "META-COGNITION",
                format!("Critical coherence: {:.2}", report.coherence_score),
                serde_json::json!({
                    "coherence_score": report.coherence_score,
                    "anomaly_detected": report.anomaly_detected,
                }),
            )
            .await;
        }
    }

    /// Record DEEP SYNC operation
    pub async fn record_sync(&self, sync_state: &SyncedState) {
        let mut metrics = self.metrics.write().await;
        let mut history = self.sync_history.write().await;

        // Update metrics
        metrics.total_syncs += 1;
        if !sync_state.success {
            metrics.total_sync_failures += 1;
        }

        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        metrics.last_sync = Some(timestamp);
        metrics.sync_failure_rate = metrics.total_sync_failures as f32 / metrics.total_syncs as f32;

        // Calculate average sync quality (last 100)
        let quality_score = match sync_state.quality {
            crate::meta::SyncQuality::Perfect => 1.0,
            crate::meta::SyncQuality::Excellent => 0.95,
            crate::meta::SyncQuality::Good => 0.85,
            crate::meta::SyncQuality::Acceptable => 0.75,
            crate::meta::SyncQuality::Degraded => 0.60,
            crate::meta::SyncQuality::Poor => 0.40,
            crate::meta::SyncQuality::Failed => 0.20,
        };

        let recent_count = history.len().min(100);
        if recent_count > 0 {
            let sum: f32 = history
                .iter()
                .rev()
                .take(recent_count)
                .map(|e| match e.quality.as_str() {
                    "Perfect" => 1.0,
                    "Excellent" => 0.95,
                    "Good" => 0.85,
                    "Acceptable" => 0.75,
                    "Degraded" => 0.60,
                    "Poor" => 0.40,
                    _ => 0.20,
                })
                .sum();
            metrics.avg_sync_quality = (sum + quality_score) / (recent_count + 1) as f32;
        } else {
            metrics.avg_sync_quality = quality_score;
        }

        // Add to history
        let engines_in_sync = sync_state
            .engine_alignment
            .iter()
            .filter(|(_, a)| a.is_aligned)
            .count();
        let engines_out_of_sync = sync_state.engine_alignment.len() - engines_in_sync;

        let entry = SyncHistoryEntry {
            timestamp,
            quality: format!("{:?}", sync_state.quality),
            success: sync_state.success,
            engines_in_sync,
            engines_out_of_sync,
            issues_count: sync_state.issues.len(),
            integrity_hash: sync_state.integrity_hash.clone(),
        };

        if history.len() >= MAX_HISTORY_SIZE {
            history.pop_front();
        }
        history.push_back(entry);

        // Generate alert if sync failed
        if !sync_state.success {
            self.generate_alert(
                AlertSeverity::Error,
                "DEEP-SYNC",
                format!(
                    "Sync failed: quality={:?}, issues={}",
                    sync_state.quality,
                    sync_state.issues.len()
                ),
                serde_json::json!({
                    "quality": format!("{:?}", sync_state.quality),
                    "engines_in_sync": engines_in_sync,
                    "engines_out_of_sync": engines_out_of_sync,
                    "issues": sync_state.issues,
                }),
            )
            .await;
        }

        // Warning if quality degraded
        if matches!(
            sync_state.quality,
            crate::meta::SyncQuality::Degraded | crate::meta::SyncQuality::Poor
        ) {
            self.generate_alert(
                AlertSeverity::Warning,
                "DEEP-SYNC",
                format!("Degraded sync quality: {:?}", sync_state.quality),
                serde_json::json!({
                    "quality": format!("{:?}", sync_state.quality),
                    "engines_out_of_sync": engines_out_of_sync,
                }),
            )
            .await;
        }
    }

    /// Generate alert
    async fn generate_alert(
        &self,
        severity: AlertSeverity,
        category: &str,
        message: String,
        context: serde_json::Value,
    ) {
        let mut alerts = self.alerts.write().await;
        let mut metrics = self.metrics.write().await;

        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let alert = MetaAlert {
            id: format!("ALERT-{}-{}", timestamp, alerts.len()),
            timestamp,
            severity,
            category: category.to_string(),
            message,
            context,
            acknowledged: false,
        };

        match severity {
            AlertSeverity::Critical => metrics.critical_alerts += 1,
            AlertSeverity::Warning => metrics.warning_alerts += 1,
            _ => {}
        }

        alerts.push(alert.clone());

        // Log alert
        match severity {
            AlertSeverity::Critical => {
                log::error!("🚨 CRITICAL ALERT [{}]: {}", category, alert.message)
            }
            AlertSeverity::Error => log::error!("❌ ERROR ALERT [{}]: {}", category, alert.message),
            AlertSeverity::Warning => {
                log::warn!("⚠️  WARNING ALERT [{}]: {}", category, alert.message)
            }
            AlertSeverity::Info => log::info!("ℹ️  INFO ALERT [{}]: {}", category, alert.message),
        }

        // Keep only last 500 alerts in memory
        if alerts.len() > 500 {
            alerts.drain(0..100);
        }
    }

    /// Get current metrics
    pub async fn get_metrics(&self) -> MetaMonitoringMetrics {
        self.metrics.read().await.clone()
    }

    /// Get evaluation history (last N entries)
    pub async fn get_evaluation_history(&self, limit: usize) -> Vec<EvaluationHistoryEntry> {
        let history = self.evaluation_history.read().await;
        history.iter().rev().take(limit).cloned().collect()
    }

    /// Get sync history (last N entries)
    pub async fn get_sync_history(&self, limit: usize) -> Vec<SyncHistoryEntry> {
        let history = self.sync_history.read().await;
        history.iter().rev().take(limit).cloned().collect()
    }

    /// Get recent alerts
    pub async fn get_alerts(
        &self,
        limit: usize,
        severity: Option<AlertSeverity>,
    ) -> Vec<MetaAlert> {
        let alerts = self.alerts.read().await;
        alerts
            .iter()
            .rev()
            .filter(|a| severity.map_or(true, |s| a.severity == s))
            .take(limit)
            .cloned()
            .collect()
    }

    /// Acknowledge alert
    pub async fn acknowledge_alert(&self, alert_id: &str) -> Result<(), String> {
        let mut alerts = self.alerts.write().await;
        if let Some(alert) = alerts.iter_mut().find(|a| a.id == alert_id) {
            alert.acknowledged = true;
            Ok(())
        } else {
            Err(format!("Alert not found: {}", alert_id))
        }
    }

    /// Clear acknowledged alerts
    pub async fn clear_acknowledged_alerts(&self) {
        let mut alerts = self.alerts.write().await;
        alerts.retain(|a| !a.acknowledged);
    }
}

impl Default for MetaMonitoringEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::meta::meta_cognition::{CognitiveIssue, IssueCategory, IssueSeverity};
    use crate::meta::MetaCognitiveReport;

    #[tokio::test]
    async fn test_monitoring_engine_creation() {
        let engine = MetaMonitoringEngine::new();
        let metrics = engine.get_metrics().await;

        assert_eq!(metrics.total_evaluations, 0);
        assert_eq!(metrics.total_syncs, 0);
        assert_eq!(metrics.anomaly_rate, 0.0);
    }

    #[tokio::test]
    async fn test_record_evaluation() {
        let engine = MetaMonitoringEngine::new();

        let report = MetaCognitiveReport {
            timestamp: chrono::Utc::now().timestamp() as u64,
            coherence_score: 0.85,
            confidence: 0.85,
            anomaly_detected: false,
            required_adjustment: None,
            delta_map: std::collections::HashMap::new(),
            engine_alignment: std::collections::HashMap::new(),
            recommended_next_state: None,
            detected_issues: vec![],
            health_indicators: CognitiveHealthIndicators {
                stability: 0.9,
                consistency: 0.88,
                logic_integrity: 0.92,
                temporal_coherence: 0.87,
                memory_alignment: 0.90,
                overall_health: 0.89,
            },
        };

        engine.record_evaluation(&report).await;

        let metrics = engine.get_metrics().await;
        assert_eq!(metrics.total_evaluations, 1);
        assert_eq!(metrics.total_anomalies, 0);
        assert!(metrics.last_evaluation.is_some());
    }

    #[tokio::test]
    async fn test_alert_generation() {
        let engine = MetaMonitoringEngine::new();

        let report = MetaCognitiveReport {
            timestamp: chrono::Utc::now().timestamp() as u64,
            coherence_score: 0.2, // Critical
            confidence: 0.3,
            anomaly_detected: true,
            required_adjustment: Some("Critical coherence".to_string()),
            delta_map: std::collections::HashMap::new(),
            engine_alignment: std::collections::HashMap::new(),
            recommended_next_state: Some(DeepSyncAction::FullDeepSync),
            detected_issues: vec![CognitiveIssue {
                severity: IssueSeverity::Critical,
                category: IssueCategory::CognitiveDrift,
                description: "Critical coherence".to_string(),
                affected_engines: vec![],
                suggested_fix: None,
            }],
            health_indicators: CognitiveHealthIndicators {
                stability: 0.2,
                consistency: 0.3,
                logic_integrity: 0.4,
                temporal_coherence: 0.5,
                memory_alignment: 0.6,
                overall_health: 0.3,
            },
        };

        engine.record_evaluation(&report).await;

        let alerts = engine.get_alerts(10, Some(AlertSeverity::Critical)).await;
        assert!(!alerts.is_empty());

        let metrics = engine.get_metrics().await;
        assert!(metrics.critical_alerts > 0);
    }
}
