//! ═══════════════════════════════════════════════════════════════════════════════
//! CIRCUIT BREAKER TEMPOREL — Résilience adaptative selon contexte
//! ═══════════════════════════════════════════════════════════════════════════════

use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use serde::{Serialize, Deserialize};
use super::temporal_adapter::TemporalApiAdapter;

/// États du circuit breaker
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum CircuitState {
    Closed,     // Fonctionnement normal
    Open,       // Circuit ouvert, rejette requêtes
    HalfOpen,   // Test de récupération
}

/// Circuit breaker adaptatif temporel
pub struct TemporalCircuitBreaker {
    state: Arc<RwLock<BreakerState>>,
    temporal_adapter: Arc<TemporalApiAdapter>,
    endpoint: String,
}

/// État interne du breaker
#[derive(Debug, Clone)]
struct BreakerState {
    current_state: CircuitState,
    failure_count: u32,
    success_count: u32,
    last_failure_time: Option<Instant>,
    last_state_change: Instant,
    consecutive_successes: u32,
}

impl BreakerState {
    fn new() -> Self {
        Self {
            current_state: CircuitState::Closed,
            failure_count: 0,
            success_count: 0,
            last_failure_time: None,
            last_state_change: Instant::now(),
            consecutive_successes: 0,
        }
    }
}

impl TemporalCircuitBreaker {
    pub fn new(endpoint: String, temporal_adapter: Arc<TemporalApiAdapter>) -> Self {
        Self {
            state: Arc::new(RwLock::new(BreakerState::new())),
            temporal_adapter,
            endpoint,
        }
    }

    /// Vérifier si requête autorisée
    pub async fn allow_request(&self) -> Result<(), CircuitBreakerError> {
        let mut state = self.state.write().await;

        match state.current_state {
            CircuitState::Closed => Ok(()),
            CircuitState::Open => {
                // Vérifier si on peut passer en HalfOpen
                if self.should_attempt_recovery(&state).await {
                    state.current_state = CircuitState::HalfOpen;
                    state.last_state_change = Instant::now();
                    state.consecutive_successes = 0;
                    Ok(())
                } else {
                    Err(CircuitBreakerError::CircuitOpen)
                }
            }
            CircuitState::HalfOpen => {
                // Autoriser uniquement quelques requêtes test
                if state.consecutive_successes < 3 {
                    Ok(())
                } else {
                    Err(CircuitBreakerError::TooManyTestRequests)
                }
            }
        }
    }

    /// Enregistrer succès
    pub async fn record_success(&self) {
        let mut state = self.state.write().await;
        state.success_count += 1;
        state.consecutive_successes += 1;

        match state.current_state {
            CircuitState::HalfOpen => {
                // Fermer circuit après 3 succès consécutifs
                if state.consecutive_successes >= 3 {
                    state.current_state = CircuitState::Closed;
                    state.failure_count = 0;
                    state.last_state_change = Instant::now();
                }
            }
            _ => {}
        }
    }

    /// Enregistrer échec
    pub async fn record_failure(&self) {
        let mut state = self.state.write().await;
        state.failure_count += 1;
        state.consecutive_successes = 0;
        state.last_failure_time = Some(Instant::now());

        // Seuil d'échecs adaptatif selon temporalité
        let failure_threshold = self.get_failure_threshold().await;

        match state.current_state {
            CircuitState::Closed => {
                if state.failure_count >= failure_threshold {
                    state.current_state = CircuitState::Open;
                    state.last_state_change = Instant::now();
                }
            }
            CircuitState::HalfOpen => {
                // Un seul échec en HalfOpen rouvre le circuit
                state.current_state = CircuitState::Open;
                state.last_state_change = Instant::now();
            }
            _ => {}
        }
    }

    /// Obtenir seuil d'échecs adaptatif
    async fn get_failure_threshold(&self) -> u32 {
        let adjustments = self.temporal_adapter.get_api_adjustments().await;

        // Heures de pointe: seuil plus strict (5 échecs)
        // Nuit: seuil plus tolérant (10 échecs)
        if adjustments.rate_limit_multiplier > 1.2 {
            5 // Peak hours - strict
        } else if adjustments.rate_limit_multiplier < 0.7 {
            10 // Night - tolerant
        } else {
            7 // Normal
        }
    }

    /// Vérifier si tentative de récupération
    async fn should_attempt_recovery(&self, state: &BreakerState) -> bool {
        if let Some(last_failure) = state.last_failure_time {
            let recovery_timeout = self.get_recovery_timeout().await;
            last_failure.elapsed() >= recovery_timeout
        } else {
            false
        }
    }

    /// Obtenir timeout de récupération adaptatif
    async fn get_recovery_timeout(&self) -> Duration {
        let adjustments = self.temporal_adapter.get_api_adjustments().await;

        // Heures de pointe: récupération rapide (30s)
        // Nuit: récupération lente (120s)
        let base_timeout = if adjustments.rate_limit_multiplier > 1.2 {
            30
        } else if adjustments.rate_limit_multiplier < 0.7 {
            120
        } else {
            60
        };

        Duration::from_secs(base_timeout)
    }

    /// Obtenir état actuel
    pub async fn get_state(&self) -> CircuitState {
        self.state.read().await.current_state
    }

    /// Obtenir statistiques
    pub async fn get_stats(&self) -> BreakerStats {
        let state = self.state.read().await;

        BreakerStats {
            current_state: state.current_state,
            failure_count: state.failure_count,
            success_count: state.success_count,
            consecutive_successes: state.consecutive_successes,
            time_in_current_state: state.last_state_change.elapsed().as_secs(),
        }
    }

    /// Réinitialiser breaker
    pub async fn reset(&self) {
        let mut state = self.state.write().await;
        *state = BreakerState::new();
    }
}

/// Erreur circuit breaker
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CircuitBreakerError {
    CircuitOpen,
    TooManyTestRequests,
}

impl std::fmt::Display for CircuitBreakerError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CircuitBreakerError::CircuitOpen => write!(f, "Circuit breaker is open"),
            CircuitBreakerError::TooManyTestRequests => write!(f, "Too many test requests in half-open state"),
        }
    }
}

impl std::error::Error for CircuitBreakerError {}

/// Statistiques circuit breaker
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BreakerStats {
    pub current_state: CircuitState,
    pub failure_count: u32,
    pub success_count: u32,
    pub consecutive_successes: u32,
    pub time_in_current_state: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_circuit_breaker_creation() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let breaker = TemporalCircuitBreaker::new("/test".to_string(), adapter);

        let state = breaker.get_state().await;
        assert_eq!(state, CircuitState::Closed);
    }

    #[tokio::test]
    async fn test_circuit_opens_after_failures() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let breaker = TemporalCircuitBreaker::new("/test".to_string(), adapter);

        // Simuler 8 échecs (seuil normal = 7)
        for _ in 0..8 {
            breaker.record_failure().await;
        }

        let state = breaker.get_state().await;
        assert_eq!(state, CircuitState::Open);
    }

    #[tokio::test]
    async fn test_circuit_halfopen_recovery() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let breaker = TemporalCircuitBreaker::new("/test".to_string(), adapter);

        // Ouvrir circuit
        for _ in 0..8 {
            breaker.record_failure().await;
        }

        assert_eq!(breaker.get_state().await, CircuitState::Open);

        // Simuler attente timeout (forcer HalfOpen manuellement pour test)
        {
            let mut state = breaker.state.write().await;
            state.current_state = CircuitState::HalfOpen;
            state.last_state_change = Instant::now();
        }

        // 3 succès consécutifs pour fermer
        for _ in 0..3 {
            breaker.record_success().await;
        }

        let final_state = breaker.get_state().await;
        assert_eq!(final_state, CircuitState::Closed);
    }

    #[tokio::test]
    async fn test_success_increments_counter() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let breaker = TemporalCircuitBreaker::new("/test".to_string(), adapter);

        breaker.record_success().await;
        breaker.record_success().await;

        let stats = breaker.get_stats().await;
        assert_eq!(stats.success_count, 2);
        assert_eq!(stats.consecutive_successes, 2);
    }

    #[tokio::test]
    async fn test_reset_breaker() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let breaker = TemporalCircuitBreaker::new("/test".to_string(), adapter);

        breaker.record_failure().await;
        breaker.record_failure().await;

        breaker.reset().await;

        let stats = breaker.get_stats().await;
        assert_eq!(stats.failure_count, 0);
        assert_eq!(stats.current_state, CircuitState::Closed);
    }
}
