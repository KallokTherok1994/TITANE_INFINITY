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
use once_cell::sync::Lazy;

/// Configuration globale du rate limiter
#[derive(Debug, Clone)]
pub struct RateLimitConfig {
    /// Maximum de requêtes par fenêtre temporelle
    pub max_requests: usize,
    /// Durée de la fenêtre (en secondes)
    pub window_seconds: u64,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            max_requests: 50,      // 50 requêtes par fenêtre
            window_seconds: 60,    // Fenêtre de 60 secondes
        }
    }
}

/// Rate limiter avec tracking par utilisateur
pub struct RateLimiter {
    /// Map user_id -> timestamps des requêtes
    requests: RwLock<HashMap<String, Vec<Instant>>>,
    /// Configuration
    config: RateLimitConfig,
}

impl RateLimiter {
    /// Créer un nouveau rate limiter
    pub fn new(config: RateLimitConfig) -> Self {
        Self {
            requests: RwLock::new(HashMap::new()),
            config,
        }
    }

    /// Vérifier si une requête est autorisée
    /// 
    /// # Arguments
    /// * `user_id` - Identifiant de l'utilisateur (ou "anonymous" par défaut)
    /// 
    /// # Returns
    /// * `Ok(())` si autorisé
    /// * `Err(String)` avec message d'erreur si rate limit dépassé
    pub async fn check(&self, user_id: &str) -> Result<(), String> {
        let mut requests = self.requests.write().await;
        let now = Instant::now();
        let window = Duration::from_secs(self.config.window_seconds);

        // Récupérer ou créer l'entrée utilisateur
        let user_requests = requests
            .entry(user_id.to_string())
            .or_insert_with(Vec::new);

        // Nettoyer les anciennes requêtes (hors fenêtre)
        user_requests.retain(|&timestamp| now.duration_since(timestamp) < window);

        // Vérifier la limite
        if user_requests.len() >= self.config.max_requests {
            let oldest = user_requests.first().unwrap();
            let wait_time = window.saturating_sub(now.duration_since(*oldest));

            return Err(format!(
                "Rate limit exceeded: {} requests per {} seconds. Please wait {} seconds.",
                self.config.max_requests,
                self.config.window_seconds,
                wait_time.as_secs()
            ));
        }

        // Enregistrer la requête actuelle
        user_requests.push(now);

        Ok(())
    }

    /// Obtenir les statistiques pour un utilisateur
    pub async fn get_stats(&self, user_id: &str) -> RateLimitStats {
        let requests = self.requests.read().await;
        let now = Instant::now();
        let window = Duration::from_secs(self.config.window_seconds);

        let user_requests = requests.get(user_id);

        if let Some(reqs) = user_requests {
            let active_requests = reqs
                .iter()
                .filter(|&&timestamp| now.duration_since(timestamp) < window)
                .count();

            let remaining = self.config.max_requests.saturating_sub(active_requests);
            let reset_time = reqs
                .first()
                .map(|&oldest| window.saturating_sub(now.duration_since(oldest)))
                .unwrap_or_default();

            RateLimitStats {
                current: active_requests,
                limit: self.config.max_requests,
                remaining,
                reset_in_seconds: reset_time.as_secs(),
            }
        } else {
            RateLimitStats {
                current: 0,
                limit: self.config.max_requests,
                remaining: self.config.max_requests,
                reset_in_seconds: 0,
            }
        }
    }

    /// Réinitialiser le compteur pour un utilisateur (admin only)
    pub async fn reset(&self, user_id: &str) {
        let mut requests = self.requests.write().await;
        requests.remove(user_id);
    }

    /// Nettoyer toutes les entrées expirées (maintenance)
    pub async fn cleanup(&self) {
        let mut requests = self.requests.write().await;
        let now = Instant::now();
        let window = Duration::from_secs(self.config.window_seconds);

        // Supprimer utilisateurs sans requêtes actives
        requests.retain(|_, reqs| {
            reqs.retain(|&timestamp| now.duration_since(timestamp) < window);
            !reqs.is_empty()
        });
    }
}

/// Statistiques de rate limiting
#[derive(Debug, Clone, serde::Serialize)]
pub struct RateLimitStats {
    /// Nombre de requêtes dans la fenêtre actuelle
    pub current: usize,
    /// Limite maximale
    pub limit: usize,
    /// Requêtes restantes
    pub remaining: usize,
    /// Temps avant reset (secondes)
    pub reset_in_seconds: u64,
}

/// Rate limiter global (singleton)
pub static GLOBAL_RATE_LIMITER: Lazy<RateLimiter> = Lazy::new(|| {
    RateLimiter::new(RateLimitConfig::default())
});

/// Macro helper pour rate limiting dans les commands
/// 
/// Usage:
/// ```rust
/// #[tauri::command]
/// pub async fn send_message(message: String) -> Result<String, String> {
///     check_rate_limit!("user_id")?;
///     // ... processing
///     Ok("response".to_string())
/// }
/// ```
#[macro_export]
macro_rules! check_rate_limit {
    ($user_id:expr) => {
        $crate::security::rate_limit::GLOBAL_RATE_LIMITER.check($user_id).await
    };
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_rate_limit_basic() {
        let limiter = RateLimiter::new(RateLimitConfig {
            max_requests: 3,
            window_seconds: 60,
        });

        // 3 premières requêtes OK
        assert!(limiter.check("user1").await.is_ok());
        assert!(limiter.check("user1").await.is_ok());
        assert!(limiter.check("user1").await.is_ok());

        // 4ème requête bloquée
        let result = limiter.check("user1").await;
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Rate limit exceeded"));
    }

    #[tokio::test]
    async fn test_rate_limit_multiple_users() {
        let limiter = RateLimiter::new(RateLimitConfig {
            max_requests: 2,
            window_seconds: 60,
        });

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
    async fn test_rate_limit_stats() {
        let limiter = RateLimiter::new(RateLimitConfig {
            max_requests: 5,
            window_seconds: 60,
        });

        // 3 requêtes
        limiter.check("user1").await.ok();
        limiter.check("user1").await.ok();
        limiter.check("user1").await.ok();

        let stats = limiter.get_stats("user1").await;
        assert_eq!(stats.current, 3);
        assert_eq!(stats.limit, 5);
        assert_eq!(stats.remaining, 2);
    }

    #[tokio::test]
    async fn test_rate_limit_reset() {
        let limiter = RateLimiter::new(RateLimitConfig {
            max_requests: 2,
            window_seconds: 60,
        });

        // Remplir le quota
        limiter.check("user1").await.ok();
        limiter.check("user1").await.ok();
        assert!(limiter.check("user1").await.is_err());

        // Reset
        limiter.reset("user1").await;

        // Nouvelles requêtes OK
        assert!(limiter.check("user1").await.is_ok());
    }

    #[tokio::test]
    async fn test_rate_limit_cleanup() {
        let limiter = RateLimiter::new(RateLimitConfig {
            max_requests: 10,
            window_seconds: 1, // 1 seconde pour test rapide
        });

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
}
