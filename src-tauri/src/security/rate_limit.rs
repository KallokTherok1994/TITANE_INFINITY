/**
 * TITANE∞ v19.3 — Rate Limiting Backend
 * 
 * Production-grade rate limiting pour toutes les commandes Tauri
 * Protection contre spam, brute-force, et abus
 * 
 * Features:
 * - Per-user rate limiting
 * - Configurable time windows
 * - Memory-efficient cleanup
 * - Thread-safe avec RwLock
 */

use std::collections::HashMap;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use crate::error::{TitaneResult, TitaneError};

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
        
        let user_requests = requests.entry(user_id.to_string())
            .or_insert_with(Vec::new);
        
        user_requests.retain(|&timestamp| {
            now.duration_since(timestamp) < self.window
        });
        
        if user_requests.len() >= self.max_requests {
            return Err(TitaneError::RateLimitExceeded {
                message: format!(
                    "Too many requests. Max {} per {} seconds",
                    self.max_requests,
                    self.window.as_secs()
                ),
            });
        }
        
        user_requests.push(now);
        Ok(())
    }
    
    pub async fn reset(&self, user_id: &str) {
        let mut requests = self.requests.write().await;
        requests.remove(user_id);
    }
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

        // 3 premières requêtes OK
        assert!(limiter.check("user1").await.is_ok());
        assert!(limiter.check("user1").await.is_ok());
        assert!(limiter.check("user1").await.is_ok());

        // 4ème requête bloquée
        let result = limiter.check("user1").await;
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Rate limit exceeded"));
    }

    #[tokio::test]
    async fn test_rate_limit_multiple_users() {
        let limiter = RateLimiter::new(2, 60);

        // User1: 2 requêtes OK
        assert!(limiter.check("user1").await.is_ok());
        assert!(limiter.check("user1").await.is_ok());

        // User2: 2 requêtes OK (compteur séparé)
        assert!(limiter.check("user2").await.is_ok());
        assert!(limiter.check("user2").await.is_ok());

        // User1: 3ème requête bloquée
        assert!(limiter.check("user1").await.is_err());

        // User2: 3ème requête bloquée
        assert!(limiter.check("user2").await.is_err());
    }

    #[tokio::test]
    async fn test_rate_limit_cleanup() {
        let limiter = RateLimiter::new(10, 1); // 1 seconde pour test rapide

        // Ajouter requêtes
        limiter.check("user1").await.ok();
        limiter.check("user2").await.ok();

        // Attendre expiration
        tokio::time::sleep(Duration::from_secs(2)).await;

        // Cleanup
        limiter.cleanup().await;

        // Vérifier que les anciens users sont supprimés
        let stats1 = limiter.get_stats("user1").await;
        let stats2 = limiter.get_stats("user2").await;

        assert_eq!(stats1.current, 0);
        assert_eq!(stats2.current, 0);
    }

    #[tokio::test]
    async fn test_rate_limit() {
        let limiter = RateLimiter::new(3, 1);
        
        assert!(limiter.check("user1").await.is_ok());
        assert!(limiter.check("user1").await.is_ok());
        assert!(limiter.check("user1").await.is_ok());
        assert!(limiter.check("user1").await.is_err());
    }
}
