//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — AGENT DIAGNOSTICS
//! Super Prompt #19 — Diagnostics du système d'agents
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use tokio::sync::RwLock;

/// Événement de diagnostic
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DiagnosticEvent {
    pub timestamp: u64,
    pub event_type: String,
    pub message: String,
    pub severity: DiagnosticSeverity,
    pub data: Option<serde_json::Value>,
}

/// Sévérité de diagnostic
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum DiagnosticSeverity {
    Debug,
    Info,
    Warning,
    Error,
    Critical,
}

/// Diagnostics du système d'agents
#[derive(Clone)]
pub struct AgentDiagnostics {
    events: std::sync::Arc<RwLock<VecDeque<DiagnosticEvent>>>,
    max_events: usize,
    stats: std::sync::Arc<RwLock<DiagnosticStats>>,
}

impl AgentDiagnostics {
    pub fn new() -> Self {
        Self {
            events: std::sync::Arc::new(RwLock::new(VecDeque::new())),
            max_events: 1000,
            stats: std::sync::Arc::new(RwLock::new(DiagnosticStats::default())),
        }
    }

    /// Émet un événement
    pub async fn emit(&self, event_type: &str, message: &str) {
        self.emit_with_severity(event_type, message, DiagnosticSeverity::Info)
            .await;
    }

    /// Émet un événement avec sévérité
    pub async fn emit_with_severity(
        &self,
        event_type: &str,
        message: &str,
        severity: DiagnosticSeverity,
    ) {
        let event = DiagnosticEvent {
            timestamp: Self::now(),
            event_type: event_type.to_string(),
            message: message.to_string(),
            severity,
            data: None,
        };

        let mut events = self.events.write().await;
        events.push_back(event);

        while events.len() > self.max_events {
            events.pop_front();
        }

        // Mettre à jour les stats
        let mut stats = self.stats.write().await;
        stats.total_events += 1;
        match severity {
            DiagnosticSeverity::Error | DiagnosticSeverity::Critical => stats.error_count += 1,
            DiagnosticSeverity::Warning => stats.warning_count += 1,
            _ => {}
        }
    }

    /// Émet un événement avec données
    pub async fn emit_with_data(&self, event_type: &str, message: &str, data: serde_json::Value) {
        let event = DiagnosticEvent {
            timestamp: Self::now(),
            event_type: event_type.to_string(),
            message: message.to_string(),
            severity: DiagnosticSeverity::Info,
            data: Some(data),
        };

        let mut events = self.events.write().await;
        events.push_back(event);

        while events.len() > self.max_events {
            events.pop_front();
        }
    }

    /// Émet une erreur
    pub async fn emit_error(&self, message: &str) {
        self.emit_with_severity("error", message, DiagnosticSeverity::Error)
            .await;
    }

    /// Émet un warning
    pub async fn emit_warning(&self, message: &str) {
        self.emit_with_severity("warning", message, DiagnosticSeverity::Warning)
            .await;
    }

    /// Récupère les événements récents
    pub async fn recent_events(&self, count: usize) -> Vec<DiagnosticEvent> {
        let events = self.events.read().await;
        events.iter().rev().take(count).cloned().collect()
    }

    /// Récupère tous les événements
    pub async fn all_events(&self) -> Vec<DiagnosticEvent> {
        let events = self.events.read().await;
        events.iter().cloned().collect()
    }

    /// Filtre par type
    pub async fn events_by_type(&self, event_type: &str) -> Vec<DiagnosticEvent> {
        let events = self.events.read().await;
        events
            .iter()
            .filter(|e| e.event_type == event_type)
            .cloned()
            .collect()
    }

    /// Filtre par sévérité
    pub async fn events_by_severity(
        &self,
        min_severity: DiagnosticSeverity,
    ) -> Vec<DiagnosticEvent> {
        let events = self.events.read().await;
        events
            .iter()
            .filter(|e| Self::severity_value(&e.severity) >= Self::severity_value(&min_severity))
            .cloned()
            .collect()
    }

    /// Génère un rapport
    pub async fn generate_report(&self) -> DiagnosticReport {
        let events = self.events.read().await;
        let stats = self.stats.read().await;

        // Compter par type
        let by_type: std::collections::HashMap<String, usize> =
            events
                .iter()
                .fold(std::collections::HashMap::new(), |mut acc, e| {
                    *acc.entry(e.event_type.clone()).or_insert(0) += 1;
                    acc
                });

        // Compter par sévérité
        let by_severity: std::collections::HashMap<String, usize> =
            events
                .iter()
                .fold(std::collections::HashMap::new(), |mut acc, e| {
                    *acc.entry(format!("{:?}", e.severity)).or_insert(0) += 1;
                    acc
                });

        // Événements critiques récents
        let critical: Vec<_> = events
            .iter()
            .filter(|e| {
                e.severity == DiagnosticSeverity::Critical
                    || e.severity == DiagnosticSeverity::Error
            })
            .rev()
            .take(10)
            .cloned()
            .collect();

        DiagnosticReport {
            timestamp: Self::now(),
            total_events: events.len(),
            events_by_type: by_type,
            events_by_severity: by_severity,
            critical_events: critical,
            error_count: stats.error_count,
            warning_count: stats.warning_count,
            health_score: self.calculate_health(&stats),
        }
    }

    fn calculate_health(&self, stats: &DiagnosticStats) -> f32 {
        if stats.total_events == 0 {
            return 1.0;
        }

        let error_ratio = stats.error_count as f32 / stats.total_events as f32;
        let warning_ratio = stats.warning_count as f32 / stats.total_events as f32;

        (1.0 - error_ratio * 2.0 - warning_ratio * 0.5).max(0.0)
    }

    fn severity_value(severity: &DiagnosticSeverity) -> u8 {
        match severity {
            DiagnosticSeverity::Debug => 0,
            DiagnosticSeverity::Info => 1,
            DiagnosticSeverity::Warning => 2,
            DiagnosticSeverity::Error => 3,
            DiagnosticSeverity::Critical => 4,
        }
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for AgentDiagnostics {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques de diagnostic
#[derive(Clone, Debug, Default)]
struct DiagnosticStats {
    total_events: u64,
    error_count: u64,
    warning_count: u64,
}

/// Rapport de diagnostic
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DiagnosticReport {
    pub timestamp: u64,
    pub total_events: usize,
    pub events_by_type: std::collections::HashMap<String, usize>,
    pub events_by_severity: std::collections::HashMap<String, usize>,
    pub critical_events: Vec<DiagnosticEvent>,
    pub error_count: u64,
    pub warning_count: u64,
    pub health_score: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_diagnostics() {
        let diag = AgentDiagnostics::new();

        diag.emit("test", "Test event").await;
        diag.emit_error("Test error").await;
        diag.emit_warning("Test warning").await;

        let report = diag.generate_report().await;
        assert_eq!(report.total_events, 3);
        assert_eq!(report.error_count, 1);
        assert_eq!(report.warning_count, 1);
    }
}
