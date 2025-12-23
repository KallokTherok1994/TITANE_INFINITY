//! ═══════════════════════════════════════════════════════════════════════════════
//! RATE LIMITER TEMPOREL — Adaptation dynamique selon contexte
//! ═══════════════════════════════════════════════════════════════════════════════

use super::temporal_adapter::TemporalApiAdapter;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// Rate limiter adaptatif avec intelligence temporelle
pub struct TemporalRateLimiter {
    provider_name: String,
    base_requests_per_minute: u32,
    base_requests_per_hour: u32,
    temporal_adapter: Arc<TemporalApiAdapter>,
    minute_tracker: Arc<RwLock<RequestTracker>>,
    hour_tracker: Arc<RwLock<RequestTracker>>,
}

/// Tracker de requêtes par fenêtre temporelle
struct RequestTracker {
    count: u32,
    window_start: Instant,
    window_duration: Duration,
}

impl RequestTracker {
    fn new(window_duration: Duration) -> Self {
        Self {
            count: 0,
            window_start: Instant::now(),
            window_duration,
        }
    }

    fn reset_if_expired(&mut self) {
        if self.window_start.elapsed() >= self.window_duration {
            self.count = 0;
            self.window_start = Instant::now();
        }
    }

    fn increment(&mut self) -> u32 {
        self.reset_if_expired();
        self.count += 1;
        self.count
    }

    fn current_count(&mut self) -> u32 {
        self.reset_if_expired();
        self.count
    }
}

impl TemporalRateLimiter {
    pub fn new(
        provider_name: String,
        base_rpm: u32,
        base_rph: u32,
        temporal_adapter: Arc<TemporalApiAdapter>,
    ) -> Self {
        Self {
            provider_name,
            base_requests_per_minute: base_rpm,
            base_requests_per_hour: base_rph,
            temporal_adapter,
            minute_tracker: Arc::new(RwLock::new(RequestTracker::new(Duration::from_secs(60)))),
            hour_tracker: Arc::new(RwLock::new(RequestTracker::new(Duration::from_secs(3600)))),
        }
    }

    /// Acquérir permission avec adaptation temporelle
    pub async fn acquire_permit(&self) -> Result<(), RateLimitError> {
        // Obtenir ajustements temporels
        let adjustments = self.temporal_adapter.get_api_adjustments().await;
        let multiplier = adjustments.rate_limit_multiplier;

        // Calculer limites ajustées
        let adjusted_rpm = (self.base_requests_per_minute as f32 * multiplier) as u32;
        let adjusted_rph = (self.base_requests_per_hour as f32 * multiplier) as u32;

        // Vérifier limites
        let mut minute = self.minute_tracker.write().await;
        let mut hour = self.hour_tracker.write().await;

        let minute_count = minute.current_count();
        let hour_count = hour.current_count();

        if minute_count >= adjusted_rpm {
            return Err(RateLimitError::MinutelyLimitExceeded {
                current: minute_count,
                limit: adjusted_rpm,
            });
        }

        if hour_count >= adjusted_rph {
            return Err(RateLimitError::HourlyLimitExceeded {
                current: hour_count,
                limit: adjusted_rph,
            });
        }

        // Incrémenter
        minute.increment();
        hour.increment();

        Ok(())
    }

    /// Attendre si nécessaire puis acquérir
    pub async fn wait_and_acquire(&self) -> Result<(), RateLimitError> {
        loop {
            match self.acquire_permit().await {
                Ok(()) => return Ok(()),
                Err(RateLimitError::MinutelyLimitExceeded { .. }) => {
                    tokio::time::sleep(Duration::from_secs(5)).await;
                }
                Err(e) => return Err(e),
            }
        }
    }

    /// Obtenir statistiques actuelles
    pub async fn get_stats(&self) -> RateLimitStats {
        let adjustments = self.temporal_adapter.get_api_adjustments().await;
        let multiplier = adjustments.rate_limit_multiplier;

        let adjusted_rpm = (self.base_requests_per_minute as f32 * multiplier) as u32;
        let adjusted_rph = (self.base_requests_per_hour as f32 * multiplier) as u32;

        let minute = self.minute_tracker.read().await;
        let hour = self.hour_tracker.read().await;

        RateLimitStats {
            provider: self.provider_name.clone(),
            minute_count: minute.count,
            minute_limit: adjusted_rpm,
            hour_count: hour.count,
            hour_limit: adjusted_rph,
            temporal_multiplier: multiplier,
        }
    }
}

/// Erreur de rate limiting
#[derive(Debug, thiserror::Error)]
pub enum RateLimitError {
    #[error("Minutely rate limit exceeded: {current}/{limit}")]
    MinutelyLimitExceeded { current: u32, limit: u32 },

    #[error("Hourly rate limit exceeded: {current}/{limit}")]
    HourlyLimitExceeded { current: u32, limit: u32 },
}

/// Statistiques rate limiting
#[derive(Debug, Clone)]
pub struct RateLimitStats {
    pub provider: String,
    pub minute_count: u32,
    pub minute_limit: u32,
    pub hour_count: u32,
    pub hour_limit: u32,
    pub temporal_multiplier: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_rate_limiter_creation() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let limiter = TemporalRateLimiter::new("test".to_string(), 100, 1000, adapter);

        let stats = limiter.get_stats().await;
        assert_eq!(stats.provider, "test");
    }

    #[tokio::test]
    async fn test_acquire_permit() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let limiter = TemporalRateLimiter::new("test".to_string(), 10, 100, adapter);

        // Devrait réussir
        assert!(limiter.acquire_permit().await.is_ok());

        let stats = limiter.get_stats().await;
        assert_eq!(stats.minute_count, 1);
    }

    #[tokio::test]
    async fn test_rate_limit_exceeded() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let limiter = TemporalRateLimiter::new(
            "test".to_string(),
            3, // Très bas pour test
            100,
            adapter,
        );

        // Acquérir 3 permits
        for _ in 0..3 {
            limiter
                .acquire_permit()
                .await
                .expect("permit acquisition should succeed within limit");
        }

        // 4ème devrait échouer
        assert!(matches!(
            limiter.acquire_permit().await,
            Err(RateLimitError::MinutelyLimitExceeded { .. })
        ));
    }

    #[tokio::test]
    async fn test_multiple_permits_tracking() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let limiter = TemporalRateLimiter::new("multi_test".to_string(), 50, 500, adapter);

        // Acquérir plusieurs permits
        for _ in 0..5 {
            limiter
                .acquire_permit()
                .await
                .expect("permit acquisition should succeed within high limits");
        }

        let stats = limiter.get_stats().await;
        assert_eq!(stats.minute_count, 5);
        assert_eq!(stats.hour_count, 5);
    }

    #[tokio::test]
    async fn test_stats_include_limits() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let limiter = TemporalRateLimiter::new("stats_test".to_string(), 100, 1000, adapter);

        let stats = limiter.get_stats().await;
        // Les limites ajustées dépendent du multiplicateur temporel
        assert!(stats.minute_limit > 0);
        assert!(stats.hour_limit > 0);
        assert!(stats.temporal_multiplier > 0.0);
    }

    #[tokio::test]
    async fn test_different_providers() {
        let adapter = Arc::new(TemporalApiAdapter::new());

        let limiter1 =
            TemporalRateLimiter::new("provider_a".to_string(), 100, 1000, adapter.clone());
        let limiter2 = TemporalRateLimiter::new("provider_b".to_string(), 50, 500, adapter);

        limiter1
            .acquire_permit()
            .await
            .expect("provider_a should acquire permit");

        let stats1 = limiter1.get_stats().await;
        let stats2 = limiter2.get_stats().await;

        assert_eq!(stats1.provider, "provider_a");
        assert_eq!(stats2.provider, "provider_b");
        assert_eq!(stats1.minute_count, 1);
        assert_eq!(stats2.minute_count, 0); // Indépendant
    }
}
