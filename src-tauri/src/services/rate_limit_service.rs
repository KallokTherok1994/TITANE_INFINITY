// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — RATE LIMIT SERVICE (Ring 3)
//   P3.0 QUALIFIED++ — token bucket per domain + 429/503 backoff
//   In-memory (no persistence in P3)
// ═══════════════════════════════════════════════════════════════

use crate::types::research::{RateLimitAction, RateLimitEvent};
use std::collections::HashMap;
use std::time::{Duration, Instant};
use tokio::time::sleep;

// ─────────────────────────────────────────────────────────────────
// TOKEN BUCKET (per domain, in-memory)
// ─────────────────────────────────────────────────────────────────

struct TokenBucket {
    tokens: f64,
    capacity: f64,
    /// Tokens added per millisecond
    refill_rate: f64,
    last_refill: Instant,
    /// Exponential backoff state: consecutive 429/503 count
    backoff_count: u32,
    /// When the forced backoff ends (if any)
    backoff_until: Option<Instant>,
}

impl TokenBucket {
    fn new(capacity: f64, refill_rate: f64) -> Self {
        TokenBucket {
            tokens: capacity,
            capacity,
            refill_rate,
            last_refill: Instant::now(),
            backoff_count: 0,
            backoff_until: None,
        }
    }

    fn refill(&mut self) {
        let now = Instant::now();
        let elapsed_ms = now.duration_since(self.last_refill).as_millis() as f64;
        self.tokens = (self.tokens + elapsed_ms * self.refill_rate).min(self.capacity);
        self.last_refill = now;
    }

    /// Try to consume one token. Returns (can_proceed, delay_ms).
    fn try_consume(&mut self) -> (bool, Option<u64>) {
        self.refill();

        // Check forced backoff first
        if let Some(until) = self.backoff_until {
            if Instant::now() < until {
                let delay = until.saturating_duration_since(Instant::now()).as_millis() as u64;
                return (false, Some(delay.max(1)));
            } else {
                self.backoff_until = None;
            }
        }

        if self.tokens >= 1.0 {
            self.tokens -= 1.0;
            (true, None)
        } else {
            // Calculate how long until 1 token is available
            let needed = 1.0 - self.tokens;
            let wait_ms = (needed / self.refill_rate).ceil() as u64;
            (false, Some(wait_ms))
        }
    }

    /// Record a 429/503 response and apply exponential backoff.
    fn record_backoff(&mut self) {
        self.backoff_count += 1;
        // 500ms, 1s, 2s, 4s, 8s (capped)
        let base_ms = 500u64;
        let multiplier = 2u64.pow((self.backoff_count - 1).min(4));
        let delay_ms = base_ms * multiplier;
        self.backoff_until = Some(Instant::now() + Duration::from_millis(delay_ms));
    }

    fn reset_backoff(&mut self) {
        self.backoff_count = 0;
        self.backoff_until = None;
    }
}

// ─────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────

/// Predefined rate limit profiles
pub enum RateLimitProfile {
    /// Default: 30 req/min per domain
    Default,
    /// Polite: 10 req/min per domain
    Polite,
    /// Strict: 1 req per domain (for tests)
    Strict,
    /// Custom: requests per minute
    Custom(u32),
}

impl RateLimitProfile {
    fn capacity_and_rate(&self) -> (f64, f64) {
        let rpm = match self {
            RateLimitProfile::Default => 30,
            RateLimitProfile::Polite => 10,
            RateLimitProfile::Strict => 1,
            RateLimitProfile::Custom(r) => *r,
        };
        let capacity = rpm as f64;
        // tokens per ms = rpm / 60_000
        let rate = (rpm as f64) / 60_000.0;
        (capacity, rate)
    }
}

// ─────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────

pub struct RateLimitService {
    buckets: HashMap<String, TokenBucket>,
    default_capacity: f64,
    default_rate: f64,
    /// Maximum delay we'll sleep for (block if over this)
    max_delay_ms: u64,
}

const MAX_DELAY_MS: u64 = 10_000; // 10 s

impl RateLimitService {
    pub fn new(profile: RateLimitProfile) -> Self {
        let (cap, rate) = profile.capacity_and_rate();
        RateLimitService {
            buckets: HashMap::new(),
            default_capacity: cap,
            default_rate: rate,
            max_delay_ms: MAX_DELAY_MS,
        }
    }

    /// Check rate limit for `domain`.
    /// Returns RateLimitEvent.
    /// If action == Delay and delay_ms <= max_delay_ms, caller should await sleep.
    /// If action == Block, caller must not proceed.
    pub fn check(&mut self, domain: &str) -> RateLimitEvent {
        let bucket = self
            .buckets
            .entry(domain.to_string())
            .or_insert_with(|| TokenBucket::new(self.default_capacity, self.default_rate));

        let (can_proceed, delay_opt) = bucket.try_consume();

        if can_proceed {
            RateLimitEvent {
                domain: domain.to_string(),
                action: RateLimitAction::Allow,
                delay_ms: None,
                reason: None,
            }
        } else if let Some(delay_ms) = delay_opt {
            if delay_ms <= self.max_delay_ms {
                RateLimitEvent {
                    domain: domain.to_string(),
                    action: RateLimitAction::Delay,
                    delay_ms: Some(delay_ms),
                    reason: Some("token bucket exhausted".to_string()),
                }
            } else {
                RateLimitEvent {
                    domain: domain.to_string(),
                    action: RateLimitAction::Block,
                    delay_ms: Some(delay_ms),
                    reason: Some(format!(
                        "delay {}ms exceeds max {}ms",
                        delay_ms, self.max_delay_ms
                    )),
                }
            }
        } else {
            // Shouldn't happen, but safe default
            RateLimitEvent {
                domain: domain.to_string(),
                action: RateLimitAction::Allow,
                delay_ms: None,
                reason: None,
            }
        }
    }

    /// Record a 429 or 503 response for backoff.
    pub fn record_error_response(&mut self, domain: &str, status: u16) {
        if status == 429 || status == 503 {
            if let Some(bucket) = self.buckets.get_mut(domain) {
                bucket.record_backoff();
            }
        }
    }

    /// Record a successful response (resets backoff counter).
    pub fn record_success(&mut self, domain: &str) {
        if let Some(bucket) = self.buckets.get_mut(domain) {
            bucket.reset_backoff();
        }
    }
}

/// Sleep for the delay in the RateLimitEvent (if action == Delay).
pub async fn apply_rate_limit_delay(event: &RateLimitEvent) {
    if event.action == RateLimitAction::Delay {
        if let Some(ms) = event.delay_ms {
            sleep(Duration::from_millis(ms)).await;
        }
    }
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    // G_RATE_LIMIT_DELAY: strict profile (1 token) → 2nd call delayed/blocked
    #[test]
    fn g_rate_limit_strict_first_allowed() {
        let mut svc = RateLimitService::new(RateLimitProfile::Strict);
        let ev = svc.check("example.com");
        assert_eq!(ev.action, RateLimitAction::Allow);
    }

    #[test]
    fn g_rate_limit_strict_second_delayed_or_blocked() {
        let mut svc = RateLimitService::new(RateLimitProfile::Strict);
        // Consume the 1 token
        svc.check("example.com");
        // Second request should delay or block
        let ev = svc.check("example.com");
        assert!(
            ev.action == RateLimitAction::Delay || ev.action == RateLimitAction::Block,
            "Expected Delay or Block, got {:?}",
            ev.action
        );
        assert!(ev.delay_ms.is_some());
    }

    #[test]
    fn g_rate_limit_different_domains_independent() {
        let mut svc = RateLimitService::new(RateLimitProfile::Strict);
        // Consume token for domain A
        svc.check("a.com");
        // Domain B still has tokens
        let ev_b = svc.check("b.com");
        assert_eq!(ev_b.action, RateLimitAction::Allow);
    }

    #[test]
    fn g_rate_limit_backoff_on_429() {
        let mut svc = RateLimitService::new(RateLimitProfile::Default);
        // Prime the bucket
        svc.check("example.com");
        // Simulate 429
        svc.record_error_response("example.com", 429);
        // After backoff recorded, bucket should have backoff_until set
        let bucket = svc.buckets.get("example.com").unwrap();
        assert!(
            bucket.backoff_until.is_some(),
            "backoff_until should be set after 429"
        );
    }

    #[test]
    fn g_rate_limit_no_backoff_on_200() {
        let mut svc = RateLimitService::new(RateLimitProfile::Default);
        svc.check("example.com");
        svc.record_success("example.com");
        let bucket = svc.buckets.get("example.com").unwrap();
        assert_eq!(bucket.backoff_count, 0);
    }
}
