// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

use crate::error::{TitaneError, TitaneResult};
use once_cell::sync::Lazy;
/**
 * TITANE∞ v19.5 — Rate Limiting Backend (REPAIRED vΩ)
 *
 * Production-grade rate limiting pour toutes les commandes Tauri
 * Protection contre spam, brute-force, et abus
 *
 * Features:
 * - Per-user rate limiting
 * - Configurable time windows
 * - Memory-efficient cleanup
 * - Thread-safe avec RwLock
 * - get_stats() and cleanup() API
 */
use std::collections::HashMap;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

// ═══════════════════════════════════════════════════════════════
// RATE LIMITER CORE
// ═══════════════════════════════════════════════════════════════

pub struct RateLimiter {
    requests: RwLock<HashMap<String, Vec<Instant>>>,
    max_requests: usize,
    window: Duration,
}

impl RateLimiter {
    pub fn new(max_requests: usize, window_seconds: u64) -> Self {
        Self {
            requests: RwLock::new(HashMap::new()),
            max_requests,
            window: Duration::from_secs(window_seconds),
        }
    }

    pub async fn check(&self, user_id: &str) -> TitaneResult<()> {
        let mut requests = self.requests.write().await;
        let now = Instant::now();

        let user_requests = requests.entry(user_id.to_string()).or_insert_with(Vec::new);

        user_requests.retain(|&timestamp| now.duration_since(timestamp) < self.window);

        if user_requests.len() >= self.max_requests {
            // Calculate retry_after_seconds based on oldest request
            let oldest = user_requests.first().copied().unwrap_or(now);
            let elapsed = now.duration_since(oldest).as_secs();
            let retry_after = self.window.as_secs().saturating_sub(elapsed);

            return Err(TitaneError::RateLimitExceeded {
                message: format!(
                    "Too many requests. Max {} per {} seconds",
                    self.max_requests,
                    self.window.as_secs()
                ),
                retry_after_seconds: Some(retry_after),
            });
        }

        user_requests.push(now);
        Ok(())
    }

    pub async fn reset(&self, user_id: &str) {
        let mut requests = self.requests.write().await;
        requests.remove(user_id);
    }

    /// Get statistics for a specific user
    pub async fn get_stats(&self, user_id: &str) -> RateLimitStats {
        let requests = self.requests.read().await;
        let now = Instant::now();

        let current = requests
            .get(user_id)
            .map(|reqs| {
                reqs.iter()
                    .filter(|&&timestamp| now.duration_since(timestamp) < self.window)
                    .count()
            })
            .unwrap_or(0);

        RateLimitStats {
            user_id: user_id.to_string(),
            current: current as u64,
            limit: self.max_requests as u64,
            window_seconds: self.window.as_secs(),
        }
    }

    /// Clean up expired entries
    pub async fn cleanup(&self) {
        let mut requests = self.requests.write().await;
        let now = Instant::now();

        requests.retain(|_, timestamps| {
            timestamps.retain(|&timestamp| now.duration_since(timestamp) < self.window);
            !timestamps.is_empty()
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL RATE LIMITER INSTANCE
// ═══════════════════════════════════════════════════════════════

/// Global rate limiter instance (DÉSACTIVÉ: 100→10000 req/min)
pub static GLOBAL_RATE_LIMITER: Lazy<RateLimiter> = Lazy::new(|| RateLimiter::new(10000, 60));

// ═══════════════════════════════════════════════════════════════
// TYPES & CONFIG
// ═══════════════════════════════════════════════════════════════

/// Configuration for rate limiting
#[derive(Debug, Clone)]
pub struct RateLimitConfig {
    pub max_requests: usize,
    pub window_seconds: u64,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            max_requests: 100,
            window_seconds: 60,
        }
    }
}

/// Statistics for rate limiting
#[derive(Debug, Clone)]
pub struct RateLimitStats {
    pub user_id: String,
    pub current: u64,
    pub limit: u64,
    pub window_seconds: u64,
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_rate_limit_basic() {
        let limiter = RateLimiter::new(3, 60);

        assert!(limiter.check("user1").await.is_ok());
        assert!(limiter.check("user1").await.is_ok());
        assert!(limiter.check("user1").await.is_ok());

        let result = limiter.check("user1").await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_rate_limit_multiple_users() {
        let limiter = RateLimiter::new(2, 60);

        assert!(limiter.check("user1").await.is_ok());
        assert!(limiter.check("user1").await.is_ok());
        assert!(limiter.check("user2").await.is_ok());
        assert!(limiter.check("user2").await.is_ok());

        assert!(limiter.check("user1").await.is_err());
        assert!(limiter.check("user2").await.is_err());
    }

    #[tokio::test]
    async fn test_get_stats() {
        let limiter = RateLimiter::new(10, 60);

        limiter.check("user1").await.ok();
        limiter.check("user1").await.ok();

        let stats = limiter.get_stats("user1").await;
        assert_eq!(stats.current, 2);
        assert_eq!(stats.limit, 10);
    }

    #[tokio::test]
    async fn test_cleanup() {
        let limiter = RateLimiter::new(10, 1);

        limiter.check("user1").await.ok();
        limiter.check("user2").await.ok();

        tokio::time::sleep(Duration::from_secs(2)).await;
        limiter.cleanup().await;

        let stats1 = limiter.get_stats("user1").await;
        let stats2 = limiter.get_stats("user2").await;

        assert_eq!(stats1.current, 0);
        assert_eq!(stats2.current, 0);
    }
}
