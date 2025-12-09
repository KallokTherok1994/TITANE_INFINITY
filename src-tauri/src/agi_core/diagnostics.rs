//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — AGI DIAGNOSTICS
//! Super Prompt #11 — Diagnostic et monitoring de l'AGI Core
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use super::introspection::IntrospectionReport;
use super::strategy::Strategy;
use super::evolution::EvolutionPlan;
use super::reasoning::ReasoningChain;

/// Événement AGI
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum AGIEvent {
    /// Introspection terminée
    IntrospectionComplete(IntrospectionReport),
    /// Raisonnement terminé
    ReasoningComplete(ReasoningChain),
    /// Stratégie sélectionnée
    StrategySelected(Strategy),
    /// Plan d'évolution créé
    EvolutionPlanned(EvolutionPlan),
    /// Meta-raisonnement complet
    MetaReasoningComplete {
        duration_ms: u64,
    },
    /// Erreur
    Error {
        component: String,
        message: String,
    },
    /// Avertissement
    Warning {
        component: String,
        message: String,
    },
    /// Métrique enregistrée
    MetricRecorded {
        name: String,
        value: f64,
    },
    /// État de santé mis à jour
    HealthUpdated(AGIHealth),
}

/// Santé de l'AGI
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct AGIHealth {
    /// Score de santé global (0.0-1.0)
    pub overall_health: f32,
    /// Santé du raisonnement
    pub reasoning_health: f32,
    /// Santé de la mémoire
    pub memory_health: f32,
    /// Santé de l'apprentissage
    pub learning_health: f32,
    /// Santé de l'évolution
    pub evolution_health: f32,
    /// Nombre d'erreurs récentes
    pub recent_errors: u32,
    /// Nombre d'avertissements récents
    pub recent_warnings: u32,
    /// Timestamp
    pub timestamp: u64,
}

/// Système de diagnostics AGI
pub struct AGIDiagnostics {
    events: RwLock<Vec<AGIEventRecord>>,
    health: RwLock<AGIHealth>,
    metrics: RwLock<std::collections::HashMap<String, MetricHistory>>,
}

/// Enregistrement d'événement
#[derive(Clone, Debug)]
struct AGIEventRecord {
    event: AGIEvent,
    timestamp: u64,
}

/// Historique de métrique
struct MetricHistory {
    values: Vec<(u64, f64)>,
    min: f64,
    max: f64,
    sum: f64,
    count: u64,
}

impl MetricHistory {
    fn new() -> Self {
        Self {
            values: Vec::new(),
            min: f64::MAX,
            max: f64::MIN,
            sum: 0.0,
            count: 0,
        }
    }

    fn record(&mut self, timestamp: u64, value: f64) {
        self.values.push((timestamp, value));
        self.min = self.min.min(value);
        self.max = self.max.max(value);
        self.sum += value;
        self.count += 1;

        // Garder les 1000 dernières valeurs
        if self.values.len() > 1000 {
            let removed = self.values.remove(0);
            self.sum -= removed.1;
            self.count -= 1;
        }
    }

    fn average(&self) -> f64 {
        if self.count == 0 {
            0.0
        } else {
            self.sum / self.count as f64
        }
    }
}

impl AGIDiagnostics {
    pub fn new() -> Self {
        Self {
            events: RwLock::new(Vec::new()),
            health: RwLock::new(AGIHealth::default()),
            metrics: RwLock::new(std::collections::HashMap::new()),
        }
    }

    /// Émet un événement
    pub async fn emit(&self, event: AGIEvent) {
        let timestamp = Self::now();

        // Enregistrer l'événement
        {
            let mut events = self.events.write().await;
            events.push(AGIEventRecord {
                event: event.clone(),
                timestamp,
            });

            // Garder les 1000 derniers événements
            if events.len() > 1000 {
                events.remove(0);
            }
        }

        // Mettre à jour la santé si nécessaire
        match &event {
            AGIEvent::Error { .. } => {
                let mut health = self.health.write().await;
                health.recent_errors += 1;
                self.recalculate_health(&mut health);
            }
            AGIEvent::Warning { .. } => {
                let mut health = self.health.write().await;
                health.recent_warnings += 1;
                self.recalculate_health(&mut health);
            }
            AGIEvent::MetricRecorded { name, value } => {
                let mut metrics = self.metrics.write().await;
                let history = metrics.entry(name.clone()).or_insert_with(MetricHistory::new);
                history.record(timestamp, *value);
            }
            AGIEvent::MetaReasoningComplete { duration_ms } => {
                let mut metrics = self.metrics.write().await;
                let history = metrics.entry("meta_reasoning_duration".to_string())
                    .or_insert_with(MetricHistory::new);
                history.record(timestamp, *duration_ms as f64);
            }
            _ => {}
        }
    }

    /// Recalcule la santé globale
    fn recalculate_health(&self, health: &mut AGIHealth) {
        // Pénalité pour erreurs et avertissements
        let error_penalty = (health.recent_errors as f32 * 0.1).min(0.5);
        let warning_penalty = (health.recent_warnings as f32 * 0.02).min(0.2);

        health.overall_health = (1.0 - error_penalty - warning_penalty)
            .max(0.0)
            .min(1.0);

        health.timestamp = Self::now();
    }

    /// Récupère les événements récents
    pub async fn get_recent(&self, limit: usize) -> Vec<AGIEvent> {
        let events = self.events.read().await;
        events.iter()
            .rev()
            .take(limit)
            .map(|r| r.event.clone())
            .collect()
    }

    /// Récupère les événements par type
    pub async fn get_by_type(&self, event_type: &str, limit: usize) -> Vec<AGIEvent> {
        let events = self.events.read().await;
        events.iter()
            .rev()
            .filter(|r| self.event_type_matches(&r.event, event_type))
            .take(limit)
            .map(|r| r.event.clone())
            .collect()
    }

    /// Vérifie si un événement correspond au type
    fn event_type_matches(&self, event: &AGIEvent, event_type: &str) -> bool {
        match event {
            AGIEvent::IntrospectionComplete(_) => event_type == "introspection",
            AGIEvent::ReasoningComplete(_) => event_type == "reasoning",
            AGIEvent::StrategySelected(_) => event_type == "strategy",
            AGIEvent::EvolutionPlanned(_) => event_type == "evolution",
            AGIEvent::MetaReasoningComplete { .. } => event_type == "meta_reasoning",
            AGIEvent::Error { .. } => event_type == "error",
            AGIEvent::Warning { .. } => event_type == "warning",
            AGIEvent::MetricRecorded { .. } => event_type == "metric",
            AGIEvent::HealthUpdated(_) => event_type == "health",
        }
    }

    /// Récupère la santé actuelle
    pub async fn get_health(&self) -> AGIHealth {
        self.health.read().await.clone()
    }

    /// Récupère une métrique
    pub async fn get_metric(&self, name: &str) -> Option<MetricSummary> {
        let metrics = self.metrics.read().await;
        metrics.get(name).map(|h| MetricSummary {
            name: name.to_string(),
            current: h.values.last().map(|(_, v)| *v).unwrap_or(0.0),
            min: h.min,
            max: h.max,
            average: h.average(),
            count: h.count,
        })
    }

    /// Récupère toutes les métriques
    pub async fn get_all_metrics(&self) -> Vec<MetricSummary> {
        let metrics = self.metrics.read().await;
        metrics.iter()
            .map(|(name, h)| MetricSummary {
                name: name.clone(),
                current: h.values.last().map(|(_, v)| *v).unwrap_or(0.0),
                min: h.min,
                max: h.max,
                average: h.average(),
                count: h.count,
            })
            .collect()
    }

    /// Récupère le nombre d'erreurs
    pub async fn error_count(&self) -> u32 {
        let health = self.health.read().await;
        health.recent_errors
    }

    /// Réinitialise les compteurs d'erreurs et avertissements
    pub async fn reset_counters(&self) {
        let mut health = self.health.write().await;
        health.recent_errors = 0;
        health.recent_warnings = 0;
        self.recalculate_health(&mut health);
    }

    /// Génère un rapport de diagnostic
    pub async fn generate_report(&self) -> DiagnosticReport {
        let health = self.health.read().await;
        let events = self.events.read().await;
        let metrics = self.metrics.read().await;

        let event_counts = self.count_events_by_type(&events);

        DiagnosticReport {
            health: health.clone(),
            total_events: events.len(),
            event_counts,
            metric_count: metrics.len(),
            uptime_estimate: Self::now() - events.first().map(|e| e.timestamp).unwrap_or(Self::now()),
            timestamp: Self::now(),
        }
    }

    /// Compte les événements par type
    fn count_events_by_type(&self, events: &[AGIEventRecord]) -> std::collections::HashMap<String, usize> {
        let mut counts = std::collections::HashMap::new();

        for record in events {
            let event_type = match &record.event {
                AGIEvent::IntrospectionComplete(_) => "introspection",
                AGIEvent::ReasoningComplete(_) => "reasoning",
                AGIEvent::StrategySelected(_) => "strategy",
                AGIEvent::EvolutionPlanned(_) => "evolution",
                AGIEvent::MetaReasoningComplete { .. } => "meta_reasoning",
                AGIEvent::Error { .. } => "error",
                AGIEvent::Warning { .. } => "warning",
                AGIEvent::MetricRecorded { .. } => "metric",
                AGIEvent::HealthUpdated(_) => "health",
            };

            *counts.entry(event_type.to_string()).or_insert(0) += 1;
        }

        counts
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for AGIDiagnostics {
    fn default() -> Self {
        Self::new()
    }
}

/// Résumé de métrique
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MetricSummary {
    pub name: String,
    pub current: f64,
    pub min: f64,
    pub max: f64,
    pub average: f64,
    pub count: u64,
}

/// Rapport de diagnostic
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DiagnosticReport {
    pub health: AGIHealth,
    pub total_events: usize,
    pub event_counts: std::collections::HashMap<String, usize>,
    pub metric_count: usize,
    pub uptime_estimate: u64,
    pub timestamp: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_diagnostics_creation() {
        let diagnostics = AGIDiagnostics::new();
        let health = diagnostics.get_health().await;
        assert_eq!(health.recent_errors, 0);
    }

    #[tokio::test]
    async fn test_emit_event() {
        let diagnostics = AGIDiagnostics::new();

        diagnostics.emit(AGIEvent::MetaReasoningComplete {
            duration_ms: 100,
        }).await;

        let events = diagnostics.get_recent(10).await;
        assert_eq!(events.len(), 1);
    }

    #[tokio::test]
    async fn test_error_tracking() {
        let diagnostics = AGIDiagnostics::new();

        diagnostics.emit(AGIEvent::Error {
            component: "test".to_string(),
            message: "test error".to_string(),
        }).await;

        let health = diagnostics.get_health().await;
        assert_eq!(health.recent_errors, 1);
        assert!(health.overall_health < 1.0);
    }

    #[tokio::test]
    async fn test_metric_recording() {
        let diagnostics = AGIDiagnostics::new();

        diagnostics.emit(AGIEvent::MetricRecorded {
            name: "test_metric".to_string(),
            value: 100.0,
        }).await;

        let metric = diagnostics.get_metric("test_metric").await;
        assert!(metric.is_some());
        assert_eq!(metric.unwrap().current, 100.0);
    }

    #[tokio::test]
    async fn test_generate_report() {
        let diagnostics = AGIDiagnostics::new();

        diagnostics.emit(AGIEvent::MetaReasoningComplete {
            duration_ms: 50,
        }).await;

        let report = diagnostics.generate_report().await;
        assert_eq!(report.total_events, 1);
    }
}
