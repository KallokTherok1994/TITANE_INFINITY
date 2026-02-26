// Ring 2: ResilienceEngine — Circuit Breaker, Backoff, Budgets
// Pure logic, no I/O (state management only, no actual network calls)

use serde::{Deserialize, Serialize};
use std::time::{Duration, SystemTime};

/// Circuit breaker state
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum CircuitState {
    Closed,   // Normal operation
    Open,     // Failing, reject requests
    HalfOpen, // Testing recovery
}

/// Backoff state machine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackoffState {
    pub attempt: u32,
    pub next_retry_at: Option<SystemTime>,
    pub base_delay_ms: u64,
    pub max_delay_ms: u64,
}

impl BackoffState {
    pub fn new(base_delay_ms: u64, max_delay_ms: u64) -> Self {
        BackoffState {
            attempt: 0,
            next_retry_at: None,
            base_delay_ms,
            max_delay_ms,
        }
    }

    /// Calculate next retry delay using exponential backoff
    pub fn calculate_next_delay(&self) -> u64 {
        let exponential = self.base_delay_ms * 2_u64.pow(self.attempt);
        exponential.min(self.max_delay_ms)
    }

    /// Record failure and update backoff state
    pub fn record_failure(&mut self) {
        self.attempt += 1;
        let delay_ms = self.calculate_next_delay();
        self.next_retry_at = Some(SystemTime::now() + Duration::from_millis(delay_ms));
    }

    /// Reset backoff state on success
    pub fn reset(&mut self) {
        self.attempt = 0;
        self.next_retry_at = None;
    }

    /// Check if we can retry now
    pub fn can_retry(&self) -> bool {
        match self.next_retry_at {
            None => true,
            Some(retry_at) => SystemTime::now() >= retry_at,
        }
    }
}

/// Circuit breaker state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CircuitBreaker {
    pub state: CircuitState,
    pub failure_count: u32,
    pub success_count: u32,
    pub failure_threshold: u32,
    pub success_threshold: u32, // For half-open → closed
    pub last_failure_at: Option<SystemTime>,
    pub open_timeout_ms: u64,
}

impl CircuitBreaker {
    pub fn new(failure_threshold: u32, success_threshold: u32, open_timeout_ms: u64) -> Self {
        CircuitBreaker {
            state: CircuitState::Closed,
            failure_count: 0,
            success_count: 0,
            failure_threshold,
            success_threshold,
            last_failure_at: None,
            open_timeout_ms,
        }
    }

    /// Record success
    pub fn record_success(&mut self) {
        match self.state {
            CircuitState::Closed => {
                self.failure_count = 0;
            }
            CircuitState::HalfOpen => {
                self.success_count += 1;
                if self.success_count >= self.success_threshold {
                    self.state = CircuitState::Closed;
                    self.failure_count = 0;
                    self.success_count = 0;
                }
            }
            CircuitState::Open => {
                // Should not happen, but reset
                self.state = CircuitState::Closed;
                self.failure_count = 0;
                self.success_count = 0;
            }
        }
    }

    /// Record failure
    pub fn record_failure(&mut self) {
        self.last_failure_at = Some(SystemTime::now());

        match self.state {
            CircuitState::Closed => {
                self.failure_count += 1;
                if self.failure_count >= self.failure_threshold {
                    self.state = CircuitState::Open;
                }
            }
            CircuitState::HalfOpen => {
                // Failed test, back to open
                self.state = CircuitState::Open;
                self.success_count = 0;
            }
            CircuitState::Open => {
                // Already open, nothing to do
            }
        }
    }

    /// Check if circuit allows requests
    pub fn is_request_allowed(&mut self) -> bool {
        match self.state {
            CircuitState::Closed => true,
            CircuitState::Open => {
                // Check if timeout elapsed → transition to HalfOpen
                if let Some(last_failure) = self.last_failure_at {
                    let elapsed = SystemTime::now()
                        .duration_since(last_failure)
                        .unwrap_or(Duration::from_secs(0));
                    if elapsed >= Duration::from_millis(self.open_timeout_ms) {
                        self.state = CircuitState::HalfOpen;
                        self.success_count = 0;
                        true // Allow one test request
                    } else {
                        false
                    }
                } else {
                    false
                }
            }
            CircuitState::HalfOpen => true, // Allow test request
        }
    }
}

/// Rate limiter (token bucket)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimiter {
    pub tokens: u32,
    pub max_tokens: u32,
    pub refill_rate_per_sec: u32,
    pub last_refill_at: SystemTime,
}

impl RateLimiter {
    pub fn new(max_tokens: u32, refill_rate_per_sec: u32) -> Self {
        RateLimiter {
            tokens: max_tokens,
            max_tokens,
            refill_rate_per_sec,
            last_refill_at: SystemTime::now(),
        }
    }

    /// Refill tokens based on elapsed time
    pub fn refill(&mut self) {
        let now = SystemTime::now();
        let elapsed = now
            .duration_since(self.last_refill_at)
            .unwrap_or(Duration::from_secs(0));
        let elapsed_secs = elapsed.as_secs();

        if elapsed_secs > 0 {
            let tokens_to_add = (elapsed_secs as u32) * self.refill_rate_per_sec;
            self.tokens = (self.tokens + tokens_to_add).min(self.max_tokens);
            self.last_refill_at = now;
        }
    }

    /// Try to consume tokens
    pub fn try_consume(&mut self, count: u32) -> bool {
        self.refill();
        if self.tokens >= count {
            self.tokens -= count;
            true
        } else {
            false
        }
    }

    /// Get available tokens
    pub fn available(&mut self) -> u32 {
        self.refill();
        self.tokens
    }
}

/// ResilienceEngine: Manages circuit breakers, backoffs, and rate limits
/// 
/// **Ring:** 2 (Engines)  
/// **Status:** EXPERIMENTAL  
/// **Purity:** ✅ No I/O, pure state management  
/// 
/// Provides resilience patterns:
/// - Circuit breaker (fail fast)
/// - Exponential backoff (retry with delay)
/// - Rate limiting (token bucket)
pub struct ResilienceEngine {
    pub backoff: BackoffState,
    pub circuit: CircuitBreaker,
    pub rate_limiter: RateLimiter,
}

impl ResilienceEngine {
    /// Create new ResilienceEngine with default config
    pub fn new() -> Self {
        ResilienceEngine {
            backoff: BackoffState::new(1000, 60000), // 1s → 60s
            circuit: CircuitBreaker::new(5, 2, 30000), // 5 failures, 30s timeout
            rate_limiter: RateLimiter::new(100, 10), // 100 tokens, 10/s refill
        }
    }

    /// Create with custom config
    pub fn with_config(
        base_delay_ms: u64,
        max_delay_ms: u64,
        failure_threshold: u32,
        success_threshold: u32,
        open_timeout_ms: u64,
        max_tokens: u32,
        refill_rate: u32,
    ) -> Self {
        ResilienceEngine {
            backoff: BackoffState::new(base_delay_ms, max_delay_ms),
            circuit: CircuitBreaker::new(failure_threshold, success_threshold, open_timeout_ms),
            rate_limiter: RateLimiter::new(max_tokens, refill_rate),
        }
    }

    /// Check if request is allowed (circuit + rate limit + backoff)
    pub fn is_request_allowed(&mut self, cost: u32) -> (bool, Option<String>) {
        // Check circuit breaker
        if !self.circuit.is_request_allowed() {
            return (false, Some("Circuit breaker is open".to_string()));
        }

        // Check backoff
        if !self.backoff.can_retry() {
            return (
                false,
                Some(format!(
                    "Backoff delay active, attempt {}",
                    self.backoff.attempt
                )),
            );
        }

        // Check rate limit
        if !self.rate_limiter.try_consume(cost) {
            return (
                false,
                Some(format!(
                    "Rate limit exceeded, {} tokens available",
                    self.rate_limiter.available()
                )),
            );
        }

        (true, None)
    }

    /// Record success
    pub fn record_success(&mut self) {
        self.circuit.record_success();
        self.backoff.reset();
    }

    /// Record failure
    pub fn record_failure(&mut self) {
        self.circuit.record_failure();
        self.backoff.record_failure();
    }

    /// Get current state summary
    pub fn state_summary(&self) -> String {
        format!(
            "Circuit: {:?}, Backoff: attempt {}, Rate: {}/{} tokens",
            self.circuit.state,
            self.backoff.attempt,
            self.rate_limiter.tokens,
            self.rate_limiter.max_tokens
        )
    }
}

impl Default for ResilienceEngine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread::sleep;

    #[test]
    fn test_backoff_exponential() {
        let mut backoff = BackoffState::new(100, 10000);
        assert_eq!(backoff.calculate_next_delay(), 100); // 2^0 * 100 = 100
        backoff.record_failure();
        // After 1st failure, attempt = 1
        assert_eq!(backoff.calculate_next_delay(), 200); // 2^1 * 100 = 200
        backoff.record_failure();
        // After 2nd failure, attempt = 2
        assert_eq!(backoff.calculate_next_delay(), 400); // 2^2 * 100 = 400
    }

    #[test]
    fn test_backoff_max_delay() {
        let mut backoff = BackoffState::new(100, 500);
        for _ in 0..10 {
            backoff.record_failure();
        }
        assert_eq!(backoff.calculate_next_delay(), 500); // Capped at max
    }

    #[test]
    fn test_backoff_reset() {
        let mut backoff = BackoffState::new(100, 10000);
        backoff.record_failure();
        assert_eq!(backoff.attempt, 1);
        backoff.reset();
        assert_eq!(backoff.attempt, 0);
        assert!(backoff.can_retry());
    }

    #[test]
    fn test_circuit_breaker_trip() {
        let mut circuit = CircuitBreaker::new(3, 2, 5000);
        assert_eq!(circuit.state, CircuitState::Closed);

        circuit.record_failure();
        circuit.record_failure();
        assert_eq!(circuit.state, CircuitState::Closed); // Not yet tripped

        circuit.record_failure();
        assert_eq!(circuit.state, CircuitState::Open); // Tripped!
    }

    #[test]
    fn test_circuit_breaker_recovery() {
        let mut circuit = CircuitBreaker::new(2, 1, 100); // 100ms timeout
        circuit.record_failure();
        circuit.record_failure();
        assert_eq!(circuit.state, CircuitState::Open);

        assert!(!circuit.is_request_allowed());

        sleep(Duration::from_millis(150)); // Wait for timeout

        assert!(circuit.is_request_allowed()); // HalfOpen now
        assert_eq!(circuit.state, CircuitState::HalfOpen);

        circuit.record_success();
        assert_eq!(circuit.state, CircuitState::Closed); // Recovered!
    }

    #[test]
    fn test_rate_limiter_consume() {
        let mut limiter = RateLimiter::new(10, 1);
        assert!(limiter.try_consume(5));
        assert_eq!(limiter.tokens, 5);
        assert!(limiter.try_consume(5));
        assert_eq!(limiter.tokens, 0);
        assert!(!limiter.try_consume(1)); // Out of tokens
    }

    #[test]
    fn test_rate_limiter_refill() {
        let mut limiter = RateLimiter::new(10, 5); // 5 per sec
        limiter.tokens = 0;
        sleep(Duration::from_secs(1));
        limiter.refill();
        assert!(limiter.tokens >= 5);
    }

    #[test]
    fn test_resilience_engine_integration() {
        let mut engine = ResilienceEngine::new();
        
        // Should allow initial request
        let (allowed, reason) = engine.is_request_allowed(1);
        assert!(allowed);
        assert_eq!(reason, None);

        // Record failures
        for _ in 0..5 {
            engine.record_failure();
        }

        // Circuit should be open
        let (allowed, reason) = engine.is_request_allowed(1);
        assert!(!allowed);
        assert!(reason.is_some());
    }

    #[test]
    fn test_resilience_engine_success_recovery() {
        let mut engine = ResilienceEngine::new();
        engine.record_failure();
        engine.record_failure();
        
        engine.record_success();
        
        assert_eq!(engine.circuit.failure_count, 0);
        assert_eq!(engine.backoff.attempt, 0);
    }
}
