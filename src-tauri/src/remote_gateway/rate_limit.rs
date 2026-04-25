// ═══════════════════════════════════════════════════════════════
//   TITANE∞ Remote Gateway — Per-IP Rate Limiter (Ring 0)
//   Wraps the existing security::rate_limit::RateLimiter by IP
// ═══════════════════════════════════════════════════════════════

use std::collections::HashMap;
use std::net::IpAddr;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// 60 requests per minute per IP address
pub const REMOTE_MAX_REQUESTS_PER_WINDOW: usize = 60;
pub const REMOTE_WINDOW_SECS: u64 = 60;

#[derive(Clone)]
pub struct RemoteRateLimiter {
    requests: Arc<RwLock<HashMap<String, Vec<Instant>>>>,
    max_requests: usize,
    window: Duration,
}

impl RemoteRateLimiter {
    pub fn new() -> Self {
        Self {
            requests: Arc::new(RwLock::new(HashMap::new())),
            max_requests: REMOTE_MAX_REQUESTS_PER_WINDOW,
            window: Duration::from_secs(REMOTE_WINDOW_SECS),
        }
    }

    /// Returns Ok(()) if allowed, Err("rate_limit_exceeded") if blocked.
    pub async fn check(&self, ip: IpAddr) -> Result<(), &'static str> {
        let key = ip.to_string();
        let mut map = self.requests.write().await;
        let now = Instant::now();
        let bucket = map.entry(key).or_default();
        bucket.retain(|&ts| now.duration_since(ts) < self.window);
        if bucket.len() >= self.max_requests {
            return Err("rate_limit_exceeded");
        }
        bucket.push(now);
        Ok(())
    }

    /// Cleanup stale entries (call periodically)
    pub async fn cleanup(&self) {
        let mut map = self.requests.write().await;
        let now = Instant::now();
        map.retain(|_, bucket| {
            bucket.retain(|&ts| now.duration_since(ts) < self.window);
            !bucket.is_empty()
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::Ipv4Addr;

    #[tokio::test]
    async fn test_allows_up_to_limit() {
        let limiter = RemoteRateLimiter {
            requests: Arc::new(RwLock::new(HashMap::new())),
            max_requests: 3,
            window: Duration::from_secs(60),
        };
        let ip = IpAddr::V4(Ipv4Addr::LOCALHOST);
        for _ in 0..3 {
            assert!(limiter.check(ip).await.is_ok());
        }
        // 4th request should be blocked
        assert!(limiter.check(ip).await.is_err());
    }

    #[tokio::test]
    async fn test_different_ips_independent() {
        let limiter = RemoteRateLimiter {
            requests: Arc::new(RwLock::new(HashMap::new())),
            max_requests: 1,
            window: Duration::from_secs(60),
        };
        let ip1 = IpAddr::V4("1.1.1.1".parse().unwrap());
        let ip2 = IpAddr::V4("2.2.2.2".parse().unwrap());
        assert!(limiter.check(ip1).await.is_ok());
        assert!(limiter.check(ip1).await.is_err());
        assert!(limiter.check(ip2).await.is_ok()); // ip2 unaffected
    }
}
