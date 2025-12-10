//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — TEMPORAL DIAGNOSTICS
//! Super Prompt #18 — Diagnostics du système temporel
//! ═══════════════════════════════════════════════════════════════════════════════

use super::temporal_events::{EventSeverity, TemporalEvent, TemporalEventType};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;

/// Diagnostics du système temporel
pub struct TemporalDiagnostics {
    events: RwLock<Vec<TemporalEvent>>,
    max_events: usize,
    stats: RwLock<DiagnosticsStats>,
}

impl TemporalDiagnostics {
    pub fn new() -> Self {
        Self {
            events: RwLock::new(Vec::new()),
            max_events: 1000,
            stats: RwLock::new(DiagnosticsStats::default()),
        }
    }

    /// Émet un événement
    pub async fn emit(&self, event: TemporalEvent) {
        let mut events = self.events.write().await;

        // Mettre à jour les stats
        {
            let mut stats = self.stats.write().await;
            stats.total_events += 1;

            match event.severity {
                EventSeverity::Error | EventSeverity::Critical => stats.error_count += 1,
                EventSeverity::Warning => stats.warning_count += 1,
                _ => {}
            }
        }

        events.push(event);

        // Limiter la taille
        while events.len() > self.max_events {
            events.remove(0);
        }
    }

    /// Émet un événement simple
    pub async fn emit_simple(&self, event_type: TemporalEventType, message: &str) {
        let event = TemporalEvent::new(event_type, message.to_string());
        self.emit(event).await;
    }

    /// Émet une erreur
    pub async fn emit_error(&self, message: &str, source: &str) {
        let event = TemporalEvent::new(TemporalEventType::Error, message.to_string())
            .with_source(source)
            .with_severity(EventSeverity::Error);
        self.emit(event).await;
    }

    /// Émet un warning
    pub async fn emit_warning(&self, message: &str, source: &str) {
        let event = TemporalEvent::new(TemporalEventType::Warning, message.to_string())
            .with_source(source)
            .with_severity(EventSeverity::Warning);
        self.emit(event).await;
    }

    /// Récupère les événements récents
    pub async fn recent_events(&self, count: usize) -> Vec<TemporalEvent> {
        let events = self.events.read().await;
        events.iter().rev().take(count).cloned().collect()
    }

    /// Récupère tous les événements
    pub async fn all_events(&self) -> Vec<TemporalEvent> {
        self.events.read().await.clone()
    }

    /// Filtre par type
    pub async fn events_by_type(&self, event_type: TemporalEventType) -> Vec<TemporalEvent> {
        let events = self.events.read().await;
        events
            .iter()
            .filter(|e| {
                std::mem::discriminant(&e.event_type) == std::mem::discriminant(&event_type)
            })
            .cloned()
            .collect()
    }

    /// Filtre par sévérité minimum
    pub async fn events_by_min_severity(&self, min: EventSeverity) -> Vec<TemporalEvent> {
        let events = self.events.read().await;
        events
            .iter()
            .filter(|e| Self::severity_value(&e.severity) >= Self::severity_value(&min))
            .cloned()
            .collect()
    }

    /// Récupère les erreurs récentes
    pub async fn recent_errors(&self) -> Vec<TemporalEvent> {
        self.events_by_min_severity(EventSeverity::Error).await
    }

    /// Récupère les warnings récents
    pub async fn recent_warnings(&self) -> Vec<TemporalEvent> {
        let events = self.events.read().await;
        events
            .iter()
            .filter(|e| e.severity == EventSeverity::Warning)
            .cloned()
            .collect()
    }

    /// Génère un rapport de diagnostic
    pub async fn generate_report(&self) -> DiagnosticsReport {
        let events = self.events.read().await;
        let stats = self.stats.read().await;

        // Compter par type
        let mut events_by_type: std::collections::HashMap<String, usize> =
            std::collections::HashMap::new();
        for event in events.iter() {
            let type_name = format!("{:?}", event.event_type);
            *events_by_type.entry(type_name).or_insert(0) += 1;
        }

        // Compter par source
        let mut events_by_source: std::collections::HashMap<String, usize> =
            std::collections::HashMap::new();
        for event in events.iter() {
            *events_by_source.entry(event.source.clone()).or_insert(0) += 1;
        }

        // Événements récents significatifs
        let significant_events: Vec<_> = events
            .iter()
            .filter(|e| {
                Self::severity_value(&e.severity) >= Self::severity_value(&EventSeverity::Warning)
            })
            .rev()
            .take(10)
            .cloned()
            .collect();

        DiagnosticsReport {
            timestamp: Self::now(),
            total_events: events.len(),
            events_by_type,
            events_by_source,
            error_count: stats.error_count,
            warning_count: stats.warning_count,
            significant_events,
            health_status: self.calculate_health(&stats),
            recommendations: self.generate_recommendations(&stats, &events),
        }
    }

    fn calculate_health(&self, stats: &DiagnosticsStats) -> HealthStatus {
        let error_ratio = if stats.total_events > 0 {
            stats.error_count as f32 / stats.total_events as f32
        } else {
            0.0
        };

        if error_ratio > 0.1 {
            HealthStatus::Critical
        } else if error_ratio > 0.05 {
            HealthStatus::Degraded
        } else if stats.warning_count > 10 {
            HealthStatus::Warning
        } else {
            HealthStatus::Healthy
        }
    }

    fn generate_recommendations(
        &self,
        stats: &DiagnosticsStats,
        events: &[TemporalEvent],
    ) -> Vec<String> {
        let mut recommendations = Vec::new();

        if stats.error_count > 5 {
            recommendations.push("High error count detected. Review error logs.".to_string());
        }

        if stats.warning_count > 20 {
            recommendations
                .push("Many warnings accumulated. Consider addressing them.".to_string());
        }

        // Vérifier les patterns d'erreurs
        let error_sources: std::collections::HashMap<_, usize> = events
            .iter()
            .filter(|e| e.severity == EventSeverity::Error)
            .fold(std::collections::HashMap::new(), |mut acc, e| {
                *acc.entry(e.source.clone()).or_insert(0) += 1;
                acc
            });

        for (source, count) in error_sources {
            if count > 3 {
                recommendations.push(format!(
                    "Multiple errors from '{}'. Investigate this component.",
                    source
                ));
            }
        }

        if recommendations.is_empty() {
            recommendations.push("System operating normally.".to_string());
        }

        recommendations
    }

    fn severity_value(severity: &EventSeverity) -> u8 {
        match severity {
            EventSeverity::Debug => 0,
            EventSeverity::Info => 1,
            EventSeverity::Warning => 2,
            EventSeverity::Error => 3,
            EventSeverity::Critical => 4,
        }
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for TemporalDiagnostics {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques de diagnostics
#[derive(Clone, Debug, Default)]
struct DiagnosticsStats {
    total_events: u64,
    error_count: u64,
    warning_count: u64,
}

/// Rapport de diagnostics
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DiagnosticsReport {
    pub timestamp: u64,
    pub total_events: usize,
    pub events_by_type: std::collections::HashMap<String, usize>,
    pub events_by_source: std::collections::HashMap<String, usize>,
    pub error_count: u64,
    pub warning_count: u64,
    pub significant_events: Vec<TemporalEvent>,
    pub health_status: HealthStatus,
    pub recommendations: Vec<String>,
}

/// Statut de santé
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum HealthStatus {
    Healthy,
    Warning,
    Degraded,
    Critical,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_diagnostics() {
        let diag = TemporalDiagnostics::new();

        diag.emit_simple(TemporalEventType::EngineInitialized, "Started")
            .await;
        diag.emit_warning("Test warning", "test").await;

        let report = diag.generate_report().await;
        assert_eq!(report.total_events, 2);
        assert_eq!(report.warning_count, 1);
    }
}
