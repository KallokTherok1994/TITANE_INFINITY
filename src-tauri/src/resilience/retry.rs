//! ═══════════════════════════════════════════════════════════════
//!   TITANE∞ Intelligent Retry System v∞
//!   SP-RES-002: Exponential Backoff + Jitter + Circuit Breaker
//! ═══════════════════════════════════════════════════════════════

use rand::Rng;
use serde::{Deserialize, Serialize};
use std::fmt::Display;
use std::future::Future;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use tokio::time::sleep;

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

/// Configuration du système de retry
#[derive(Debug, Clone)]
pub struct RetryConfig {
    /// Nombre maximum de tentatives
    pub max_attempts: u32,
    /// Délai initial en millisecondes
    pub initial_delay_ms: u64,
    /// Multiplicateur pour le backoff exponentiel
    pub backoff_multiplier: f64,
    /// Délai maximum en millisecondes
    pub max_delay_ms: u64,
    /// Facteur de jitter (0.0 - 1.0)
    pub jitter_factor: f64,
    /// Timeout par tentative en millisecondes
    pub timeout_per_attempt_ms: u64,
    /// Catégories d'erreurs à retenter
    pub retryable_errors: Vec<ErrorCategory>,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            initial_delay_ms: 100,
            backoff_multiplier: 2.0,
            max_delay_ms: 5000,
            jitter_factor: 0.2,
            timeout_per_attempt_ms: 10000,
            retryable_errors: vec![
                ErrorCategory::Network,
                ErrorCategory::Timeout,
                ErrorCategory::RateLimit,
                ErrorCategory::ServiceUnavailable,
            ],
        }
    }
}

/// Catégories d'erreurs
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ErrorCategory {
    /// Erreur réseau (connexion, DNS, etc.)
    Network,
    /// Timeout
    Timeout,
    /// Rate limiting (429)
    RateLimit,
    /// Service indisponible (503)
    ServiceUnavailable,
    /// Entrée invalide (400)
    InvalidInput,
    /// Erreur d'authentification (401, 403)
    Authentication,
    /// Erreur serveur (500)
    ServerError,
    /// Erreur inconnue
    Unknown,
}

impl Display for ErrorCategory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ErrorCategory::Network => write!(f, "Network"),
            ErrorCategory::Timeout => write!(f, "Timeout"),
            ErrorCategory::RateLimit => write!(f, "RateLimit"),
            ErrorCategory::ServiceUnavailable => write!(f, "ServiceUnavailable"),
            ErrorCategory::InvalidInput => write!(f, "InvalidInput"),
            ErrorCategory::Authentication => write!(f, "Authentication"),
            ErrorCategory::ServerError => write!(f, "ServerError"),
            ErrorCategory::Unknown => write!(f, "Unknown"),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// RETRY RESULT
// ═══════════════════════════════════════════════════════════════

/// Résultat d'une opération avec retry
#[derive(Debug)]
pub struct RetryResult<T> {
    /// Valeur si succès
    pub value: Option<T>,
    /// Nombre de tentatives effectuées
    pub attempts: u32,
    /// Durée totale en millisecondes
    pub total_duration_ms: u64,
    /// Dernière erreur si échec
    pub last_error: Option<String>,
    /// Succès ou échec
    pub success: bool,
}

impl<T> RetryResult<T> {
    /// Créer un résultat de succès
    pub fn success(value: T, attempts: u32, duration_ms: u64) -> Self {
        Self {
            value: Some(value),
            attempts,
            total_duration_ms: duration_ms,
            last_error: None,
            success: true,
        }
    }

    /// Créer un résultat d'échec
    pub fn failure(error: String, attempts: u32, duration_ms: u64) -> Self {
        Self {
            value: None,
            attempts,
            total_duration_ms: duration_ms,
            last_error: Some(error),
            success: false,
        }
    }

    /// Convertir en Result
    pub fn into_result(self) -> Result<T, String> {
        match self.value {
            Some(v) => Ok(v),
            None => Err(self
                .last_error
                .unwrap_or_else(|| "Unknown error".to_string())),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// RETRY EXECUTOR
// ═══════════════════════════════════════════════════════════════

/// Exécuteur de retry avec backoff exponentiel
pub struct RetryExecutor {
    config: RetryConfig,
    stats: Arc<RwLock<RetryStats>>,
}

/// Statistiques du système de retry
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct RetryStats {
    pub total_operations: u64,
    pub successful_first_try: u64,
    pub successful_after_retry: u64,
    pub failed_after_all_retries: u64,
    pub total_retries: u64,
    pub avg_attempts_per_success: f64,
}

impl RetryExecutor {
    /// Créer un nouvel exécuteur
    pub fn new(config: RetryConfig) -> Self {
        Self {
            config,
            stats: Arc::new(RwLock::new(RetryStats::default())),
        }
    }

    /// Exécuter une opération avec retry
    pub async fn execute<F, Fut, T, E>(&self, operation: F) -> RetryResult<T>
    where
        F: Fn() -> Fut,
        Fut: Future<Output = Result<T, E>>,
        E: Display + Into<ErrorCategory>,
    {
        let start = Instant::now();
        let mut attempts = 0;
        let mut last_error: Option<String> = None;

        while attempts < self.config.max_attempts {
            attempts += 1;

            // Timeout par tentative
            let timeout = Duration::from_millis(self.config.timeout_per_attempt_ms);

            match tokio::time::timeout(timeout, operation()).await {
                Ok(Ok(value)) => {
                    // Succès
                    let duration = start.elapsed().as_millis() as u64;

                    // Mettre à jour les stats
                    {
                        let mut stats = self.stats.write().await;
                        stats.total_operations += 1;
                        if attempts == 1 {
                            stats.successful_first_try += 1;
                        } else {
                            stats.successful_after_retry += 1;
                            stats.total_retries += (attempts - 1) as u64;
                        }
                        // Mettre à jour la moyenne
                        let total_success =
                            stats.successful_first_try + stats.successful_after_retry;
                        if total_success > 0 {
                            stats.avg_attempts_per_success = (stats.successful_first_try
                                + stats.successful_after_retry * 2)
                                as f64
                                / total_success as f64;
                        }
                    }

                    return RetryResult::success(value, attempts, duration);
                }
                Ok(Err(e)) => {
                    let category: ErrorCategory = e.into();
                    last_error = Some(format!("{}", category));

                    // Vérifier si l'erreur est retryable
                    if !self.config.retryable_errors.contains(&category) {
                        log::warn!(
                            "Non-retryable error after {} attempts: {}",
                            attempts,
                            category
                        );
                        break;
                    }

                    log::warn!(
                        "Retry attempt {}/{} failed: {}",
                        attempts,
                        self.config.max_attempts,
                        category
                    );
                }
                Err(_timeout) => {
                    last_error = Some("Operation timed out".to_string());
                    log::warn!(
                        "Retry attempt {}/{} timed out",
                        attempts,
                        self.config.max_attempts
                    );
                }
            }

            // Attendre avant la prochaine tentative
            if attempts < self.config.max_attempts {
                let delay = self.calculate_delay(attempts);
                log::debug!("Waiting {:?} before retry...", delay);
                sleep(delay).await;
            }
        }

        // Échec après toutes les tentatives
        let duration = start.elapsed().as_millis() as u64;

        // Mettre à jour les stats
        {
            let mut stats = self.stats.write().await;
            stats.total_operations += 1;
            stats.failed_after_all_retries += 1;
            stats.total_retries += (attempts - 1) as u64;
        }

        RetryResult::failure(
            last_error.unwrap_or_else(|| "Unknown error".to_string()),
            attempts,
            duration,
        )
    }

    /// Calculer le délai avec backoff exponentiel et jitter
    fn calculate_delay(&self, attempt: u32) -> Duration {
        // Backoff exponentiel: delay = initial * multiplier^(attempt-1)
        let base_delay = self.config.initial_delay_ms as f64
            * self.config.backoff_multiplier.powi(attempt as i32 - 1);

        // Appliquer le maximum
        let capped_delay = base_delay.min(self.config.max_delay_ms as f64);

        // Ajouter le jitter (±jitter_factor * delay)
        let jitter_range = capped_delay * self.config.jitter_factor;
        let jitter = rand::thread_rng().gen_range(-jitter_range..jitter_range);

        let final_delay = (capped_delay + jitter).max(0.0) as u64;

        Duration::from_millis(final_delay)
    }

    /// Obtenir les statistiques
    pub async fn get_stats(&self) -> RetryStats {
        self.stats.read().await.clone()
    }

    /// Réinitialiser les statistiques
    pub async fn reset_stats(&self) {
        let mut stats = self.stats.write().await;
        *stats = RetryStats::default();
    }
}

// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKER
// ═══════════════════════════════════════════════════════════════

/// État du circuit breaker
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CircuitState {
    /// Circuit fermé (normal)
    Closed,
    /// Circuit ouvert (bloqué)
    Open,
    /// Circuit semi-ouvert (test)
    HalfOpen,
}

/// Configuration du circuit breaker
#[derive(Debug, Clone)]
pub struct CircuitBreakerConfig {
    /// Seuil d'échecs avant ouverture
    pub failure_threshold: u32,
    /// Seuil de succès pour fermer
    pub success_threshold: u32,
    /// Durée d'ouverture en secondes
    pub open_duration_secs: u64,
    /// Fenêtre de temps pour compter les échecs
    pub failure_window_secs: u64,
}

impl Default for CircuitBreakerConfig {
    fn default() -> Self {
        Self {
            failure_threshold: 5,
            success_threshold: 3,
            open_duration_secs: 30,
            failure_window_secs: 60,
        }
    }
}

/// Circuit breaker pour protéger les services
pub struct CircuitBreaker {
    config: CircuitBreakerConfig,
    state: Arc<RwLock<CircuitState>>,
    failure_count: Arc<AtomicU32>,
    success_count: Arc<AtomicU32>,
    last_failure: Arc<RwLock<Option<Instant>>>,
    opened_at: Arc<RwLock<Option<Instant>>>,
    stats: Arc<RwLock<CircuitBreakerStats>>,
}

/// Statistiques du circuit breaker
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CircuitBreakerStats {
    pub total_calls: u64,
    pub successful_calls: u64,
    pub failed_calls: u64,
    pub rejected_calls: u64,
    pub state_transitions: u64,
}

impl CircuitBreaker {
    /// Créer un nouveau circuit breaker
    pub fn new(config: CircuitBreakerConfig) -> Self {
        Self {
            config,
            state: Arc::new(RwLock::new(CircuitState::Closed)),
            failure_count: Arc::new(AtomicU32::new(0)),
            success_count: Arc::new(AtomicU32::new(0)),
            last_failure: Arc::new(RwLock::new(None)),
            opened_at: Arc::new(RwLock::new(None)),
            stats: Arc::new(RwLock::new(CircuitBreakerStats::default())),
        }
    }

    /// Vérifier si le circuit permet l'exécution
    pub async fn allow(&self) -> bool {
        let state = *self.state.read().await;

        match state {
            CircuitState::Closed => true,
            CircuitState::Open => {
                // Vérifier si on peut passer en half-open
                if let Some(opened_at) = *self.opened_at.read().await {
                    if opened_at.elapsed().as_secs() >= self.config.open_duration_secs {
                        // Transition vers half-open
                        *self.state.write().await = CircuitState::HalfOpen;
                        self.success_count.store(0, Ordering::SeqCst);
                        log::info!("Circuit breaker: Open -> HalfOpen");

                        let mut stats = self.stats.write().await;
                        stats.state_transitions += 1;

                        return true;
                    }
                }
                false
            }
            CircuitState::HalfOpen => true,
        }
    }

    /// Enregistrer un succès
    pub async fn record_success(&self) {
        let mut stats = self.stats.write().await;
        stats.total_calls += 1;
        stats.successful_calls += 1;
        drop(stats);

        let state = *self.state.read().await;

        match state {
            CircuitState::Closed => {
                // Reset failure count on success
                self.failure_count.store(0, Ordering::SeqCst);
            }
            CircuitState::HalfOpen => {
                let count = self.success_count.fetch_add(1, Ordering::SeqCst) + 1;
                if count >= self.config.success_threshold {
                    // Fermer le circuit
                    *self.state.write().await = CircuitState::Closed;
                    self.failure_count.store(0, Ordering::SeqCst);
                    self.success_count.store(0, Ordering::SeqCst);
                    *self.opened_at.write().await = None;
                    log::info!("Circuit breaker: HalfOpen -> Closed");

                    let mut stats = self.stats.write().await;
                    stats.state_transitions += 1;
                }
            }
            CircuitState::Open => {
                // Ne devrait pas arriver
            }
        }
    }

    /// Enregistrer un échec
    pub async fn record_failure(&self) {
        let mut stats = self.stats.write().await;
        stats.total_calls += 1;
        stats.failed_calls += 1;
        drop(stats);

        *self.last_failure.write().await = Some(Instant::now());

        let state = *self.state.read().await;

        match state {
            CircuitState::Closed => {
                let count = self.failure_count.fetch_add(1, Ordering::SeqCst) + 1;
                if count >= self.config.failure_threshold {
                    // Ouvrir le circuit
                    *self.state.write().await = CircuitState::Open;
                    *self.opened_at.write().await = Some(Instant::now());
                    log::warn!("Circuit breaker: Closed -> Open (threshold reached)");

                    let mut stats = self.stats.write().await;
                    stats.state_transitions += 1;
                }
            }
            CircuitState::HalfOpen => {
                // Retour à Open
                *self.state.write().await = CircuitState::Open;
                *self.opened_at.write().await = Some(Instant::now());
                self.success_count.store(0, Ordering::SeqCst);
                log::warn!("Circuit breaker: HalfOpen -> Open (failure in test)");

                let mut stats = self.stats.write().await;
                stats.state_transitions += 1;
            }
            CircuitState::Open => {
                // Déjà ouvert
            }
        }
    }

    /// Enregistrer un rejet (circuit ouvert)
    pub async fn record_rejection(&self) {
        let mut stats = self.stats.write().await;
        stats.total_calls += 1;
        stats.rejected_calls += 1;
    }

    /// Obtenir l'état actuel
    pub async fn get_state(&self) -> CircuitState {
        *self.state.read().await
    }

    /// Obtenir les statistiques
    pub async fn get_stats(&self) -> CircuitBreakerStats {
        self.stats.read().await.clone()
    }

    /// Forcer la fermeture du circuit
    pub async fn force_close(&self) {
        *self.state.write().await = CircuitState::Closed;
        self.failure_count.store(0, Ordering::SeqCst);
        self.success_count.store(0, Ordering::SeqCst);
        *self.opened_at.write().await = None;
        log::info!("Circuit breaker: Forced close");
    }

    /// Forcer l'ouverture du circuit
    pub async fn force_open(&self) {
        *self.state.write().await = CircuitState::Open;
        *self.opened_at.write().await = Some(Instant::now());
        log::info!("Circuit breaker: Forced open");
    }
}

// ═══════════════════════════════════════════════════════════════
// PRESETS
// ═══════════════════════════════════════════════════════════════

/// Configurations prédéfinies pour différents cas d'usage
pub mod presets {
    use super::*;

    /// Configuration agressive pour opérations rapides
    pub fn fast() -> RetryConfig {
        RetryConfig {
            max_attempts: 2,
            initial_delay_ms: 50,
            backoff_multiplier: 1.5,
            max_delay_ms: 200,
            timeout_per_attempt_ms: 2000,
            jitter_factor: 0.1,
            ..Default::default()
        }
    }

    /// Configuration standard
    pub fn standard() -> RetryConfig {
        RetryConfig::default()
    }

    /// Configuration patiente pour opérations longues
    pub fn patient() -> RetryConfig {
        RetryConfig {
            max_attempts: 5,
            initial_delay_ms: 500,
            backoff_multiplier: 2.5,
            max_delay_ms: 30000,
            timeout_per_attempt_ms: 60000,
            jitter_factor: 0.25,
            ..Default::default()
        }
    }

    /// Configuration pour API avec rate limiting
    pub fn rate_limited() -> RetryConfig {
        RetryConfig {
            max_attempts: 4,
            initial_delay_ms: 1000,
            backoff_multiplier: 3.0,
            max_delay_ms: 30000,
            timeout_per_attempt_ms: 30000,
            jitter_factor: 0.3,
            retryable_errors: vec![ErrorCategory::RateLimit, ErrorCategory::ServiceUnavailable],
        }
    }

    /// Configuration pour appels réseau instables
    pub fn unstable_network() -> RetryConfig {
        RetryConfig {
            max_attempts: 5,
            initial_delay_ms: 200,
            backoff_multiplier: 2.0,
            max_delay_ms: 10000,
            timeout_per_attempt_ms: 15000,
            jitter_factor: 0.4,
            retryable_errors: vec![
                ErrorCategory::Network,
                ErrorCategory::Timeout,
                ErrorCategory::ServiceUnavailable,
            ],
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// COMBINED EXECUTOR
// ═══════════════════════════════════════════════════════════════

/// Exécuteur combinant Retry et Circuit Breaker
pub struct ResilientExecutor {
    retry: RetryExecutor,
    circuit_breaker: CircuitBreaker,
}

impl ResilientExecutor {
    /// Créer un nouvel exécuteur résilient
    pub fn new(retry_config: RetryConfig, cb_config: CircuitBreakerConfig) -> Self {
        Self {
            retry: RetryExecutor::new(retry_config),
            circuit_breaker: CircuitBreaker::new(cb_config),
        }
    }

    /// Exécuter une opération avec protection complète
    pub async fn execute<F, Fut, T, E>(&self, operation: F) -> RetryResult<T>
    where
        F: Fn() -> Fut + Clone,
        Fut: Future<Output = Result<T, E>>,
        E: Display + Into<ErrorCategory> + Clone,
    {
        // Vérifier le circuit breaker
        if !self.circuit_breaker.allow().await {
            self.circuit_breaker.record_rejection().await;
            return RetryResult::failure("Circuit breaker is open".to_string(), 0, 0);
        }

        // Exécuter avec retry
        let result = self.retry.execute(operation).await;

        // Mettre à jour le circuit breaker
        if result.success {
            self.circuit_breaker.record_success().await;
        } else {
            self.circuit_breaker.record_failure().await;
        }

        result
    }

    /// Obtenir les statistiques
    pub async fn get_stats(&self) -> (RetryStats, CircuitBreakerStats) {
        (
            self.retry.get_stats().await,
            self.circuit_breaker.get_stats().await,
        )
    }

    /// Obtenir l'état du circuit
    pub async fn circuit_state(&self) -> CircuitState {
        self.circuit_breaker.get_state().await
    }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Debug)]
    struct TestError(ErrorCategory);

    impl Display for TestError {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            write!(f, "TestError: {:?}", self.0)
        }
    }

    impl From<TestError> for ErrorCategory {
        fn from(e: TestError) -> Self {
            e.0
        }
    }

    #[tokio::test]
    async fn test_successful_first_attempt() {
        let config = presets::fast();
        let executor = RetryExecutor::new(config);

        let result = executor.execute(|| async { Ok::<_, TestError>(42) }).await;

        assert!(result.success);
        assert_eq!(result.attempts, 1);
        assert_eq!(result.value, Some(42));
    }

    #[tokio::test]
    async fn test_retry_then_success() {
        let config = presets::fast();
        let executor = RetryExecutor::new(config);
        let counter = Arc::new(AtomicU32::new(0));

        let result = executor
            .execute({
                let counter = counter.clone();
                move || {
                    let counter = counter.clone();
                    async move {
                        let count = counter.fetch_add(1, Ordering::SeqCst);
                        if count < 1 {
                            Err(TestError(ErrorCategory::Network))
                        } else {
                            Ok(42)
                        }
                    }
                }
            })
            .await;

        assert!(result.success);
        assert_eq!(result.attempts, 2);
        assert_eq!(result.value, Some(42));
    }

    #[tokio::test]
    async fn test_all_retries_fail() {
        let config = RetryConfig {
            max_attempts: 2,
            initial_delay_ms: 10,
            ..presets::fast()
        };
        let executor = RetryExecutor::new(config);

        let result: RetryResult<i32> = executor
            .execute(|| async { Err(TestError(ErrorCategory::Network)) })
            .await;

        assert!(!result.success);
        assert_eq!(result.attempts, 2);
        assert!(result.value.is_none());
    }

    #[tokio::test]
    async fn test_non_retryable_error() {
        let config = presets::fast();
        let executor = RetryExecutor::new(config);

        let result: RetryResult<i32> = executor
            .execute(|| async { Err(TestError(ErrorCategory::InvalidInput)) })
            .await;

        assert!(!result.success);
        assert_eq!(result.attempts, 1); // Pas de retry pour InvalidInput
    }

    #[tokio::test]
    async fn test_circuit_breaker_opens() {
        let config = CircuitBreakerConfig {
            failure_threshold: 2,
            ..Default::default()
        };
        let cb = CircuitBreaker::new(config);

        assert!(cb.allow().await);
        assert_eq!(cb.get_state().await, CircuitState::Closed);

        // Enregistrer des échecs
        cb.record_failure().await;
        assert_eq!(cb.get_state().await, CircuitState::Closed);

        cb.record_failure().await;
        assert_eq!(cb.get_state().await, CircuitState::Open);

        // Le circuit doit rejeter
        assert!(!cb.allow().await);
    }

    #[tokio::test]
    async fn test_circuit_breaker_half_open() {
        let config = CircuitBreakerConfig {
            failure_threshold: 1,
            success_threshold: 1,
            open_duration_secs: 0, // Immédiat pour le test
            ..Default::default()
        };
        let cb = CircuitBreaker::new(config);

        // Ouvrir le circuit
        cb.record_failure().await;
        assert_eq!(cb.get_state().await, CircuitState::Open);

        // Attendre et vérifier half-open
        tokio::time::sleep(Duration::from_millis(10)).await;
        assert!(cb.allow().await);
        assert_eq!(cb.get_state().await, CircuitState::HalfOpen);

        // Succès ferme le circuit
        cb.record_success().await;
        assert_eq!(cb.get_state().await, CircuitState::Closed);
    }

    #[test]
    fn test_delay_calculation() {
        let config = RetryConfig {
            initial_delay_ms: 100,
            backoff_multiplier: 2.0,
            max_delay_ms: 1000,
            jitter_factor: 0.0, // Pas de jitter pour test déterministe
            ..Default::default()
        };
        let executor = RetryExecutor::new(config);

        // attempt 1: 100ms
        let delay1 = executor.calculate_delay(1);
        assert_eq!(delay1.as_millis(), 100);

        // attempt 2: 200ms
        let delay2 = executor.calculate_delay(2);
        assert_eq!(delay2.as_millis(), 200);

        // attempt 3: 400ms
        let delay3 = executor.calculate_delay(3);
        assert_eq!(delay3.as_millis(), 400);

        // attempt 4: 800ms
        let delay4 = executor.calculate_delay(4);
        assert_eq!(delay4.as_millis(), 800);

        // attempt 5: 1000ms (capped)
        let delay5 = executor.calculate_delay(5);
        assert_eq!(delay5.as_millis(), 1000);
    }
}
