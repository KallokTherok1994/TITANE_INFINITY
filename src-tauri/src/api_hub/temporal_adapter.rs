//! ═══════════════════════════════════════════════════════════════════════════════
//! API HUB ↔ TEMPORAL ENGINE INTEGRATION
//! ═══════════════════════════════════════════════════════════════════════════════

use crate::temporal_engine::{TemporalContext, TemporalIntelligenceEngine};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Adapter pour intégrer API Hub avec Temporal Engine
pub struct TemporalApiAdapter {
    temporal_engine: Option<Arc<RwLock<TemporalIntelligenceEngine>>>,
}

impl TemporalApiAdapter {
    pub fn new() -> Self {
        Self {
            temporal_engine: None,
        }
    }

    pub fn with_temporal_engine(temporal_engine: Arc<RwLock<TemporalIntelligenceEngine>>) -> Self {
        Self {
            temporal_engine: Some(temporal_engine),
        }
    }

    /// Obtient les ajustements API selon contexte temporel
    pub async fn get_api_adjustments(&self) -> ApiTemporalAdjustments {
        if let Some(engine) = &self.temporal_engine {
            let engine_guard = engine.read().await;
            let context = engine_guard.current_context().await;
            Self::calculate_adjustments(&context)
        } else {
            ApiTemporalAdjustments::default()
        }
    }

    /// Calcule les ajustements selon contexte
    fn calculate_adjustments(context: &TemporalContext) -> ApiTemporalAdjustments {
        let hour = context.now.hour;
        let is_weekend = context.now.is_weekend;

        ApiTemporalAdjustments {
            rate_limit_multiplier: Self::calculate_rate_limit_multiplier(hour, is_weekend),
            cache_ttl_seconds: Self::calculate_cache_ttl(hour),
            timeout_multiplier: Self::calculate_timeout_multiplier(hour),
            batch_requests: Self::should_batch_requests(hour),
            prefer_quality: Self::should_prefer_quality(hour),
            cost_sensitivity: Self::calculate_cost_sensitivity(hour, is_weekend),
        }
    }

    /// Multiplicateur rate limiting
    fn calculate_rate_limit_multiplier(hour: u8, is_weekend: bool) -> f32 {
        let base = match hour {
            10..=11 => 1.5,         // Peak: allow more requests
            12..=13 => 1.0,         // Midday: normal
            22..=23 | 0..=5 => 0.5, // Night: conserve
            _ => 1.0,
        };

        if is_weekend {
            base * 0.8
        } else {
            base
        }
    }

    /// TTL cache en secondes
    fn calculate_cache_ttl(hour: u8) -> u64 {
        match hour {
            10..=11 => 300,          // Peak: 5min (fresh data)
            22..=23 | 0..=5 => 1800, // Night: 30min (stable)
            _ => 600,                // Default: 10min
        }
    }

    /// Multiplicateur timeout
    fn calculate_timeout_multiplier(hour: u8) -> f32 {
        match hour {
            10..=11 => 1.0,         // Peak: normal timeout
            22..=23 | 0..=5 => 2.0, // Night: longer timeout OK
            _ => 1.2,
        }
    }

    /// Devrait-on batcher les requêtes
    fn should_batch_requests(hour: u8) -> bool {
        matches!(hour, 22..=23 | 0..=5) // Night: batch for efficiency
    }

    /// Préférer qualité sur vitesse
    fn should_prefer_quality(hour: u8) -> bool {
        matches!(hour, 10..=11 | 14..=16) // Peak working hours
    }

    /// Sensibilité aux coûts (0.0-1.0)
    fn calculate_cost_sensitivity(hour: u8, is_weekend: bool) -> f32 {
        let base = match hour {
            10..=11 => 0.3,         // Peak: less cost-sensitive
            22..=23 | 0..=5 => 0.8, // Night: more cost-sensitive
            _ => 0.5,
        };

        if is_weekend {
            base * 1.2 // Weekend: more cost-sensitive
        } else {
            base
        }
    }

    /// TTL cache pour endpoint spécifique
    pub async fn get_cache_ttl(&self, endpoint: &str) -> u64 {
        let adjustments = self.get_api_adjustments().await;

        // Ajuster selon type endpoint
        let base_ttl = if endpoint.contains("chat") || endpoint.contains("completion") {
            adjustments.cache_ttl_seconds / 2 // Chat: shorter TTL
        } else if endpoint.contains("embedding") {
            adjustments.cache_ttl_seconds * 2 // Embeddings: longer TTL
        } else {
            adjustments.cache_ttl_seconds
        };

        base_ttl
    }

    /// Obtient le provider optimal selon contexte temporel
    pub async fn suggest_provider(&self, modality: super::Modality) -> ProviderSuggestion {
        let adjustments = self.get_api_adjustments().await;

        if adjustments.prefer_quality {
            ProviderSuggestion {
                primary: super::Provider::OpenAI,
                fallback: Some(super::Provider::Anthropic),
                reason: "Quality preferred during peak hours".to_string(),
            }
        } else if adjustments.cost_sensitivity > 0.7 {
            ProviderSuggestion {
                primary: super::Provider::Gemini,
                fallback: Some(super::Provider::OpenAI),
                reason: "Cost optimization during off-peak".to_string(),
            }
        } else {
            ProviderSuggestion {
                primary: super::Provider::OpenAI,
                fallback: Some(super::Provider::Gemini),
                reason: "Balanced choice".to_string(),
            }
        }
    }
}

impl Default for TemporalApiAdapter {
    fn default() -> Self {
        Self::new()
    }
}

/// Ajustements temporels pour API
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ApiTemporalAdjustments {
    pub rate_limit_multiplier: f32,
    pub cache_ttl_seconds: u64,
    pub timeout_multiplier: f32,
    pub batch_requests: bool,
    pub prefer_quality: bool,
    pub cost_sensitivity: f32,
}

impl Default for ApiTemporalAdjustments {
    fn default() -> Self {
        Self {
            rate_limit_multiplier: 1.0,
            cache_ttl_seconds: 600,
            timeout_multiplier: 1.0,
            batch_requests: false,
            prefer_quality: false,
            cost_sensitivity: 0.5,
        }
    }
}

/// Suggestion de provider
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProviderSuggestion {
    pub primary: super::Provider,
    pub fallback: Option<super::Provider>,
    pub reason: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::temporal_engine::time_model::{Moment, Season, TimeOfDay};

    fn create_test_context(hour: u8, is_weekend: bool) -> TemporalContext {
        TemporalContext {
            now: Moment {
                timestamp_ms: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64,
                hour,
                minute: 0,
                second: 0,
                day: 15,
                day_of_week: if is_weekend { 6 } else { 3 },
                day_of_year: 349,
                week_of_year: 50,
                month: 12,
                year: 2025,
                is_weekend,
                season: Season::Winter,
                time_of_day: match hour {
                    0..=5 => TimeOfDay::LateNight,
                    6..=8 => TimeOfDay::EarlyMorning,
                    9..=11 => TimeOfDay::Morning,
                    12..=13 => TimeOfDay::Midday,
                    14..=17 => TimeOfDay::Afternoon,
                    18..=20 => TimeOfDay::Evening,
                    21..=22 => TimeOfDay::Night,
                    _ => TimeOfDay::LateNight,
                },
            },
            session_start: Moment::default(),
            session_duration_ms: 0,
            day_progress: 0.5,
            week_progress: 0.5,
            month_progress: 0.5,
            year_progress: 0.5,
            cognitive_energy_estimate: 0.8,
            optimal_for: vec![],
        }
    }

    #[test]
    fn test_rate_limit_multiplier_peak() {
        let context = create_test_context(10, false);
        let adjustments = TemporalApiAdapter::calculate_adjustments(&context);

        assert_eq!(adjustments.rate_limit_multiplier, 1.5);
    }

    #[test]
    fn test_rate_limit_multiplier_night() {
        let context = create_test_context(2, false);
        let adjustments = TemporalApiAdapter::calculate_adjustments(&context);

        assert_eq!(adjustments.rate_limit_multiplier, 0.5);
    }

    #[test]
    fn test_cache_ttl_peak() {
        let context = create_test_context(10, false);
        let adjustments = TemporalApiAdapter::calculate_adjustments(&context);

        assert_eq!(adjustments.cache_ttl_seconds, 300); // 5 min
    }

    #[test]
    fn test_cache_ttl_night() {
        let context = create_test_context(2, false);
        let adjustments = TemporalApiAdapter::calculate_adjustments(&context);

        assert_eq!(adjustments.cache_ttl_seconds, 1800); // 30 min
    }

    #[test]
    fn test_batch_requests() {
        let context_night = create_test_context(2, false);
        let adj_night = TemporalApiAdapter::calculate_adjustments(&context_night);
        assert!(adj_night.batch_requests);

        let context_day = create_test_context(14, false);
        let adj_day = TemporalApiAdapter::calculate_adjustments(&context_day);
        assert!(!adj_day.batch_requests);
    }

    #[test]
    fn test_prefer_quality() {
        let context_peak = create_test_context(10, false);
        let adj_peak = TemporalApiAdapter::calculate_adjustments(&context_peak);
        assert!(adj_peak.prefer_quality);

        let context_night = create_test_context(2, false);
        let adj_night = TemporalApiAdapter::calculate_adjustments(&context_night);
        assert!(!adj_night.prefer_quality);
    }

    #[test]
    fn test_cost_sensitivity() {
        let context_peak = create_test_context(10, false);
        let adj_peak = TemporalApiAdapter::calculate_adjustments(&context_peak);
        assert_eq!(adj_peak.cost_sensitivity, 0.3);

        let context_night = create_test_context(2, false);
        let adj_night = TemporalApiAdapter::calculate_adjustments(&context_night);
        assert_eq!(adj_night.cost_sensitivity, 0.8);
    }

    #[test]
    fn test_weekend_adjustment() {
        let context_weekday = create_test_context(14, false);
        let adj_weekday = TemporalApiAdapter::calculate_adjustments(&context_weekday);

        let context_weekend = create_test_context(14, true);
        let adj_weekend = TemporalApiAdapter::calculate_adjustments(&context_weekend);

        assert!(adj_weekend.rate_limit_multiplier < adj_weekday.rate_limit_multiplier);
        assert!(adj_weekend.cost_sensitivity > adj_weekday.cost_sensitivity);
    }
}
