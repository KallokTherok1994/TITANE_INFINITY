//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — API HUB DIAGNOSTICS
//! Super Prompt #17 — Diagnostics et événements du Hub API
//! ═══════════════════════════════════════════════════════════════════════════════

use super::Provider;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::RwLock;

/// Événement du Hub API
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum APIHubEvent {
    /// Hub initialisé
    Initialized { providers_count: usize },
    /// Décision de routage
    RouteDecision {
        request_id: String,
        provider: Provider,
        reason: String,
    },
    /// Requête complétée
    RequestCompleted {
        request_id: String,
        provider: Provider,
        latency_ms: u64,
        tokens: u32,
    },
    /// Requête échouée
    RequestFailed {
        request_id: String,
        provider: Provider,
        error: String,
    },
    /// Multimodal traité
    MultimodalProcessed {
        request_id: String,
        stages: usize,
        providers: Vec<Provider>,
        total_latency_ms: u64,
    },
    /// Réponse harmonisée
    ResponseHarmonized {
        request_id: String,
        original_length: usize,
        harmonized_length: usize,
    },
    /// Validation sécurité
    SafetyValidation {
        request_id: String,
        approved: bool,
        issues_count: usize,
    },
    /// Accès vault
    VaultAccess { provider: Provider, action: String },
    /// Erreur
    Error { context: String, message: String },
    /// Rate limit atteint
    RateLimitHit {
        provider: Provider,
        retry_after_ms: Option<u64>,
    },
    /// Provider indisponible
    ProviderUnavailable { provider: Provider, reason: String },
}

/// Entrée d'événement avec timestamp
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EventEntry {
    pub timestamp: u64,
    pub event: APIHubEvent,
}

/// Métriques du Hub
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct APIHubMetrics {
    pub total_requests: u64,
    pub successful_requests: u64,
    pub failed_requests: u64,
    pub total_tokens: u64,
    pub total_cost_usd: f64,
    pub average_latency_ms: f64,
    pub requests_by_provider: HashMap<String, u64>,
    pub tokens_by_provider: HashMap<String, u64>,
    pub errors_by_provider: HashMap<String, u64>,
    pub latency_by_provider: HashMap<String, f64>,
}

/// État des diagnostics
struct DiagnosticsState {
    events: Vec<EventEntry>,
    metrics: APIHubMetrics,
    max_events: usize,
}

impl Default for DiagnosticsState {
    fn default() -> Self {
        Self {
            events: Vec::new(),
            metrics: APIHubMetrics::default(),
            max_events: 1000,
        }
    }
}

/// Diagnostics du Hub API
pub struct APIHubDiagnostics {
    state: RwLock<DiagnosticsState>,
}

impl APIHubDiagnostics {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(DiagnosticsState::default()),
        }
    }

    /// Émet un événement
    pub async fn emit(&self, event: APIHubEvent) {
        let mut state = self.state.write().await;
        let now = Self::now();

        // Mettre à jour les métriques selon l'événement
        self.update_metrics(&mut state.metrics, &event);

        // Ajouter l'événement
        state.events.push(EventEntry {
            timestamp: now,
            event,
        });

        // Garder seulement les N derniers événements
        while state.events.len() > state.max_events {
            state.events.remove(0);
        }
    }

    /// Met à jour les métriques
    fn update_metrics(&self, metrics: &mut APIHubMetrics, event: &APIHubEvent) {
        match event {
            APIHubEvent::RequestCompleted {
                provider,
                latency_ms,
                tokens,
                ..
            } => {
                metrics.total_requests += 1;
                metrics.successful_requests += 1;
                metrics.total_tokens += *tokens as u64;

                let provider_key = format!("{:?}", provider);

                *metrics
                    .requests_by_provider
                    .entry(provider_key.clone())
                    .or_insert(0) += 1;
                *metrics
                    .tokens_by_provider
                    .entry(provider_key.clone())
                    .or_insert(0) += *tokens as u64;

                // Update average latency
                let n = metrics.successful_requests as f64;
                metrics.average_latency_ms =
                    ((n - 1.0) * metrics.average_latency_ms + *latency_ms as f64) / n;

                // Update provider latency
                let entry = metrics
                    .latency_by_provider
                    .entry(provider_key)
                    .or_insert(0.0);
                let count = *metrics
                    .requests_by_provider
                    .get(&format!("{:?}", provider))
                    .unwrap_or(&1) as f64;
                *entry = ((*entry * (count - 1.0)) + *latency_ms as f64) / count;
            }
            APIHubEvent::RequestFailed { provider, .. } => {
                metrics.total_requests += 1;
                metrics.failed_requests += 1;

                let provider_key = format!("{:?}", provider);
                *metrics.errors_by_provider.entry(provider_key).or_insert(0) += 1;
            }
            _ => {}
        }
    }

    /// Récupère les événements récents
    pub async fn get_recent_events(&self, limit: usize) -> Vec<EventEntry> {
        let state = self.state.read().await;
        state.events.iter().rev().take(limit).cloned().collect()
    }

    /// Récupère les événements par type
    pub async fn get_events_by_type(&self, event_type: &str, limit: usize) -> Vec<EventEntry> {
        let state = self.state.read().await;
        state
            .events
            .iter()
            .rev()
            .filter(|e| self.matches_type(&e.event, event_type))
            .take(limit)
            .cloned()
            .collect()
    }

    /// Vérifie si un événement correspond au type
    fn matches_type(&self, event: &APIHubEvent, type_name: &str) -> bool {
        let event_name = match event {
            APIHubEvent::Initialized { .. } => "initialized",
            APIHubEvent::RouteDecision { .. } => "route_decision",
            APIHubEvent::RequestCompleted { .. } => "request_completed",
            APIHubEvent::RequestFailed { .. } => "request_failed",
            APIHubEvent::MultimodalProcessed { .. } => "multimodal_processed",
            APIHubEvent::ResponseHarmonized { .. } => "response_harmonized",
            APIHubEvent::SafetyValidation { .. } => "safety_validation",
            APIHubEvent::VaultAccess { .. } => "vault_access",
            APIHubEvent::Error { .. } => "error",
            APIHubEvent::RateLimitHit { .. } => "rate_limit",
            APIHubEvent::ProviderUnavailable { .. } => "provider_unavailable",
        };
        event_name == type_name
    }

    /// Récupère les métriques
    pub async fn get_metrics(&self) -> APIHubMetrics {
        let state = self.state.read().await;
        state.metrics.clone()
    }

    /// Récupère les métriques pour un provider
    pub async fn get_provider_metrics(&self, provider: Provider) -> ProviderMetrics {
        let state = self.state.read().await;
        let provider_key = format!("{:?}", provider);

        ProviderMetrics {
            provider,
            total_requests: *state
                .metrics
                .requests_by_provider
                .get(&provider_key)
                .unwrap_or(&0),
            total_tokens: *state
                .metrics
                .tokens_by_provider
                .get(&provider_key)
                .unwrap_or(&0),
            total_errors: *state
                .metrics
                .errors_by_provider
                .get(&provider_key)
                .unwrap_or(&0),
            average_latency_ms: *state
                .metrics
                .latency_by_provider
                .get(&provider_key)
                .unwrap_or(&0.0),
            error_rate: self.calculate_error_rate(&state.metrics, &provider_key),
        }
    }

    /// Calcule le taux d'erreur
    fn calculate_error_rate(&self, metrics: &APIHubMetrics, provider_key: &str) -> f32 {
        let requests = *metrics.requests_by_provider.get(provider_key).unwrap_or(&0);
        let errors = *metrics.errors_by_provider.get(provider_key).unwrap_or(&0);

        if requests == 0 {
            0.0
        } else {
            errors as f32 / requests as f32
        }
    }

    /// Réinitialise les métriques
    pub async fn reset_metrics(&self) {
        let mut state = self.state.write().await;
        state.metrics = APIHubMetrics::default();
    }

    /// Réinitialise les événements
    pub async fn clear_events(&self) {
        let mut state = self.state.write().await;
        state.events.clear();
    }

    /// Génère un rapport de santé
    pub async fn health_report(&self) -> HealthReport {
        let metrics = self.get_metrics().await;
        let events = self.get_recent_events(100).await;

        let error_rate = if metrics.total_requests > 0 {
            metrics.failed_requests as f32 / metrics.total_requests as f32
        } else {
            0.0
        };

        let recent_errors = events
            .iter()
            .filter(|e| {
                matches!(
                    e.event,
                    APIHubEvent::RequestFailed { .. } | APIHubEvent::Error { .. }
                )
            })
            .count();

        let health_status = if error_rate < 0.01 && recent_errors < 5 {
            HealthStatus::Healthy
        } else if error_rate < 0.05 && recent_errors < 20 {
            HealthStatus::Degraded
        } else {
            HealthStatus::Unhealthy
        };

        HealthReport {
            status: health_status,
            error_rate,
            recent_errors,
            average_latency_ms: metrics.average_latency_ms,
            total_requests: metrics.total_requests,
            providers_status: self.providers_health(&metrics),
        }
    }

    /// Santé par provider
    fn providers_health(&self, metrics: &APIHubMetrics) -> HashMap<String, HealthStatus> {
        let mut result = HashMap::new();

        for provider_key in metrics.requests_by_provider.keys() {
            let requests = *metrics.requests_by_provider.get(provider_key).unwrap_or(&0);
            let errors = *metrics.errors_by_provider.get(provider_key).unwrap_or(&0);

            let status = if requests == 0 {
                HealthStatus::Unknown
            } else {
                let error_rate = errors as f32 / requests as f32;
                if error_rate < 0.01 {
                    HealthStatus::Healthy
                } else if error_rate < 0.1 {
                    HealthStatus::Degraded
                } else {
                    HealthStatus::Unhealthy
                }
            };

            result.insert(provider_key.clone(), status);
        }

        result
    }

    fn now() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }
}

impl Default for APIHubDiagnostics {
    fn default() -> Self {
        Self::new()
    }
}

/// Métriques par provider
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProviderMetrics {
    pub provider: Provider,
    pub total_requests: u64,
    pub total_tokens: u64,
    pub total_errors: u64,
    pub average_latency_ms: f64,
    pub error_rate: f32,
}

/// Statut de santé
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum HealthStatus {
    Healthy,
    Degraded,
    Unhealthy,
    Unknown,
}

/// Rapport de santé
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HealthReport {
    pub status: HealthStatus,
    pub error_rate: f32,
    pub recent_errors: usize,
    pub average_latency_ms: f64,
    pub total_requests: u64,
    pub providers_status: HashMap<String, HealthStatus>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_diagnostics_creation() {
        let diag = APIHubDiagnostics::new();
        let metrics = diag.get_metrics().await;
        assert_eq!(metrics.total_requests, 0);
    }

    #[tokio::test]
    async fn test_emit_event() {
        let diag = APIHubDiagnostics::new();

        diag.emit(APIHubEvent::RequestCompleted {
            request_id: "test".to_string(),
            provider: Provider::OpenAI,
            latency_ms: 100,
            tokens: 50,
        })
        .await;

        let events = diag.get_recent_events(10).await;
        assert_eq!(events.len(), 1);

        let metrics = diag.get_metrics().await;
        assert_eq!(metrics.total_requests, 1);
        assert_eq!(metrics.successful_requests, 1);
    }

    #[tokio::test]
    async fn test_error_tracking() {
        let diag = APIHubDiagnostics::new();

        diag.emit(APIHubEvent::RequestFailed {
            request_id: "test".to_string(),
            provider: Provider::Gemini,
            error: "Timeout".to_string(),
        })
        .await;

        let metrics = diag.get_metrics().await;
        assert_eq!(metrics.failed_requests, 1);
        assert_eq!(*metrics.errors_by_provider.get("Gemini").unwrap_or(&0), 1);
    }

    #[tokio::test]
    async fn test_health_report() {
        let diag = APIHubDiagnostics::new();

        // Add some successful requests
        for _ in 0..10 {
            diag.emit(APIHubEvent::RequestCompleted {
                request_id: "test".to_string(),
                provider: Provider::OpenAI,
                latency_ms: 100,
                tokens: 50,
            })
            .await;
        }

        let report = diag.health_report().await;
        assert_eq!(report.status, HealthStatus::Healthy);
    }

    #[tokio::test]
    async fn test_provider_metrics() {
        let diag = APIHubDiagnostics::new();

        diag.emit(APIHubEvent::RequestCompleted {
            request_id: "1".to_string(),
            provider: Provider::Anthropic,
            latency_ms: 200,
            tokens: 100,
        })
        .await;

        let provider_metrics = diag.get_provider_metrics(Provider::Anthropic).await;
        assert_eq!(provider_metrics.total_requests, 1);
        assert_eq!(provider_metrics.total_tokens, 100);
    }

    #[test]
    fn test_api_hub_event_variants() {
        let events = vec![
            APIHubEvent::Initialized { providers_count: 3 },
            APIHubEvent::RouteDecision {
                request_id: "r1".to_string(),
                provider: Provider::OpenAI,
                reason: "Best match".to_string(),
            },
            APIHubEvent::RequestCompleted {
                request_id: "r2".to_string(),
                provider: Provider::Gemini,
                latency_ms: 100,
                tokens: 50,
            },
            APIHubEvent::RequestFailed {
                request_id: "r3".to_string(),
                provider: Provider::Anthropic,
                error: "Timeout".to_string(),
            },
            APIHubEvent::MultimodalProcessed {
                request_id: "r4".to_string(),
                stages: 3,
                providers: vec![Provider::OpenAI, Provider::Gemini],
                total_latency_ms: 500,
            },
            APIHubEvent::ResponseHarmonized {
                request_id: "r5".to_string(),
                original_length: 1000,
                harmonized_length: 800,
            },
            APIHubEvent::SafetyValidation {
                request_id: "r6".to_string(),
                approved: true,
                issues_count: 0,
            },
            APIHubEvent::VaultAccess {
                provider: Provider::OpenAI,
                action: "read".to_string(),
            },
            APIHubEvent::Error {
                context: "test".to_string(),
                message: "error msg".to_string(),
            },
            APIHubEvent::RateLimitHit {
                provider: Provider::Gemini,
                retry_after_ms: Some(5000),
            },
            APIHubEvent::ProviderUnavailable {
                provider: Provider::Anthropic,
                reason: "Maintenance".to_string(),
            },
        ];

        assert_eq!(events.len(), 11);
    }

    #[test]
    fn test_api_hub_metrics_default() {
        let metrics = APIHubMetrics::default();

        assert_eq!(metrics.total_requests, 0);
        assert_eq!(metrics.successful_requests, 0);
        assert_eq!(metrics.failed_requests, 0);
        assert_eq!(metrics.total_tokens, 0);
        assert_eq!(metrics.total_cost_usd, 0.0);
        assert_eq!(metrics.average_latency_ms, 0.0);
    }

    #[test]
    fn test_api_hub_metrics_clone() {
        let mut metrics = APIHubMetrics::default();
        metrics.total_requests = 100;
        metrics.successful_requests = 95;

        let cloned = metrics.clone();
        assert_eq!(cloned.total_requests, 100);
        assert_eq!(cloned.successful_requests, 95);
    }

    #[test]
    fn test_health_status_variants() {
        let statuses = vec![
            HealthStatus::Healthy,
            HealthStatus::Degraded,
            HealthStatus::Unhealthy,
            HealthStatus::Unknown,
        ];

        assert_eq!(statuses.len(), 4);
        assert_ne!(HealthStatus::Healthy, HealthStatus::Degraded);
    }

    #[test]
    fn test_provider_metrics_structure() {
        let metrics = ProviderMetrics {
            provider: Provider::OpenAI,
            total_requests: 100,
            total_tokens: 5000,
            total_errors: 2,
            average_latency_ms: 150.0,
            error_rate: 0.02,
        };

        assert_eq!(metrics.total_requests, 100);
        assert_eq!(metrics.total_tokens, 5000);
        assert_eq!(metrics.total_errors, 2);
    }

    #[test]
    fn test_provider_metrics_clone() {
        let metrics = ProviderMetrics {
            provider: Provider::Gemini,
            total_requests: 50,
            total_tokens: 2500,
            total_errors: 1,
            average_latency_ms: 120.0,
            error_rate: 0.02,
        };

        let cloned = metrics.clone();
        assert_eq!(cloned.total_requests, 50);
        assert_eq!(cloned.provider, Provider::Gemini);
    }

    #[test]
    fn test_health_report_structure() {
        let report = HealthReport {
            status: HealthStatus::Healthy,
            error_rate: 0.01,
            recent_errors: 2,
            average_latency_ms: 100.0,
            total_requests: 1000,
            providers_status: HashMap::new(),
        };

        assert_eq!(report.status, HealthStatus::Healthy);
        assert_eq!(report.total_requests, 1000);
    }

    #[test]
    fn test_event_entry_structure() {
        let entry = EventEntry {
            timestamp: 1234567890,
            event: APIHubEvent::Initialized { providers_count: 3 },
        };

        assert_eq!(entry.timestamp, 1234567890);
    }

    #[tokio::test]
    async fn test_diagnostics_default() {
        let diag = APIHubDiagnostics::default();
        let metrics = diag.get_metrics().await;
        assert_eq!(metrics.total_requests, 0);
    }

    #[tokio::test]
    async fn test_reset_metrics() {
        let diag = APIHubDiagnostics::new();

        diag.emit(APIHubEvent::RequestCompleted {
            request_id: "test".to_string(),
            provider: Provider::OpenAI,
            latency_ms: 100,
            tokens: 50,
        })
        .await;

        let metrics = diag.get_metrics().await;
        assert_eq!(metrics.total_requests, 1);

        diag.reset_metrics().await;
        let metrics = diag.get_metrics().await;
        assert_eq!(metrics.total_requests, 0);
    }

    #[tokio::test]
    async fn test_clear_events() {
        let diag = APIHubDiagnostics::new();

        diag.emit(APIHubEvent::Initialized { providers_count: 3 })
            .await;

        let events = diag.get_recent_events(10).await;
        assert_eq!(events.len(), 1);

        diag.clear_events().await;
        let events = diag.get_recent_events(10).await;
        assert_eq!(events.len(), 0);
    }

    #[tokio::test]
    async fn test_get_events_by_type() {
        let diag = APIHubDiagnostics::new();

        diag.emit(APIHubEvent::Initialized { providers_count: 3 })
            .await;
        diag.emit(APIHubEvent::RequestCompleted {
            request_id: "test".to_string(),
            provider: Provider::OpenAI,
            latency_ms: 100,
            tokens: 50,
        })
        .await;
        diag.emit(APIHubEvent::RequestCompleted {
            request_id: "test2".to_string(),
            provider: Provider::Gemini,
            latency_ms: 150,
            tokens: 60,
        })
        .await;

        let completed_events = diag.get_events_by_type("request_completed", 10).await;
        assert_eq!(completed_events.len(), 2);

        let init_events = diag.get_events_by_type("initialized", 10).await;
        assert_eq!(init_events.len(), 1);
    }

    #[tokio::test]
    async fn test_health_report_degraded() {
        let diag = APIHubDiagnostics::new();

        // Add successful requests
        for _ in 0..80 {
            diag.emit(APIHubEvent::RequestCompleted {
                request_id: "test".to_string(),
                provider: Provider::OpenAI,
                latency_ms: 100,
                tokens: 50,
            })
            .await;
        }

        // Add some failures (around 3% error rate)
        for _ in 0..3 {
            diag.emit(APIHubEvent::RequestFailed {
                request_id: "fail".to_string(),
                provider: Provider::OpenAI,
                error: "Error".to_string(),
            })
            .await;
        }

        let report = diag.health_report().await;
        assert_eq!(report.status, HealthStatus::Degraded);
    }

    #[tokio::test]
    async fn test_health_report_unhealthy() {
        let diag = APIHubDiagnostics::new();

        // Add many failures (>5% error rate)
        for _ in 0..50 {
            diag.emit(APIHubEvent::RequestFailed {
                request_id: "fail".to_string(),
                provider: Provider::OpenAI,
                error: "Error".to_string(),
            })
            .await;
        }

        let report = diag.health_report().await;
        assert_eq!(report.status, HealthStatus::Unhealthy);
    }

    #[tokio::test]
    async fn test_average_latency_calculation() {
        let diag = APIHubDiagnostics::new();

        diag.emit(APIHubEvent::RequestCompleted {
            request_id: "1".to_string(),
            provider: Provider::OpenAI,
            latency_ms: 100,
            tokens: 50,
        })
        .await;

        diag.emit(APIHubEvent::RequestCompleted {
            request_id: "2".to_string(),
            provider: Provider::OpenAI,
            latency_ms: 200,
            tokens: 50,
        })
        .await;

        let metrics = diag.get_metrics().await;
        // Average should be 150
        assert!((metrics.average_latency_ms - 150.0).abs() < 1.0);
    }

    #[tokio::test]
    async fn test_provider_metrics_no_requests() {
        let diag = APIHubDiagnostics::new();
        let provider_metrics = diag.get_provider_metrics(Provider::OpenAI).await;

        assert_eq!(provider_metrics.total_requests, 0);
        assert_eq!(provider_metrics.error_rate, 0.0);
    }

    #[tokio::test]
    async fn test_multiple_providers_metrics() {
        let diag = APIHubDiagnostics::new();

        diag.emit(APIHubEvent::RequestCompleted {
            request_id: "1".to_string(),
            provider: Provider::OpenAI,
            latency_ms: 100,
            tokens: 50,
        })
        .await;

        diag.emit(APIHubEvent::RequestCompleted {
            request_id: "2".to_string(),
            provider: Provider::Gemini,
            latency_ms: 150,
            tokens: 60,
        })
        .await;

        diag.emit(APIHubEvent::RequestCompleted {
            request_id: "3".to_string(),
            provider: Provider::Anthropic,
            latency_ms: 200,
            tokens: 70,
        })
        .await;

        let metrics = diag.get_metrics().await;
        assert_eq!(metrics.total_requests, 3);
        assert_eq!(metrics.requests_by_provider.len(), 3);
    }

    #[test]
    fn test_event_clone() {
        let event = APIHubEvent::RequestCompleted {
            request_id: "clone-test".to_string(),
            provider: Provider::OpenAI,
            latency_ms: 100,
            tokens: 50,
        };

        let cloned = event.clone();
        if let APIHubEvent::RequestCompleted { request_id, .. } = cloned {
            assert_eq!(request_id, "clone-test");
        }
    }

    #[test]
    fn test_health_status_equality() {
        assert_eq!(HealthStatus::Healthy, HealthStatus::Healthy);
        assert_ne!(HealthStatus::Healthy, HealthStatus::Unknown);
    }
}
