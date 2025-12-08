// ═══════════════════════════════════════════════════════════════════════════
// TITANE∞ v20.1 — AI ROUTER CACHE
// Cache LRU pour réponses AI et statuts provider
// Gains: ~90% latence routing sur requêtes identiques
// ═══════════════════════════════════════════════════════════════════════════

use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// Configuration du cache AI
#[derive(Debug, Clone)]
pub struct AICacheConfig {
    /// Capacité maximale du cache réponses
    pub response_cache_capacity: usize,
    /// TTL des réponses cachées (secondes)
    pub response_ttl_secs: u64,
    /// TTL du statut provider (secondes)
    pub status_ttl_secs: u64,
    /// Activer le cache
    pub enabled: bool,
}

impl Default for AICacheConfig {
    fn default() -> Self {
        Self {
            response_cache_capacity: 500,
            response_ttl_secs: 300,  // 5 minutes
            status_ttl_secs: 30,     // 30 secondes
            enabled: true,
        }
    }
}

/// Entrée de cache avec TTL
#[derive(Debug, Clone)]
pub struct CacheEntry<T> {
    pub value: T,
    pub created_at: Instant,
    pub ttl: Duration,
}

impl<T> CacheEntry<T> {
    pub fn new(value: T, ttl_secs: u64) -> Self {
        Self {
            value,
            created_at: Instant::now(),
            ttl: Duration::from_secs(ttl_secs),
        }
    }

    pub fn is_expired(&self) -> bool {
        self.created_at.elapsed() > self.ttl
    }
}

/// Réponse AI cachée
#[derive(Debug, Clone)]
pub struct CachedAIResponse {
    pub content: String,
    pub tokens: u32,
    pub provider: String,
}

/// Statut provider caché
#[derive(Debug, Clone)]
pub struct CachedProviderStatus {
    pub is_available: bool,
    pub last_check: Instant,
}

/// Cache AI Router v20.1
/// Cache LRU avec TTL pour réponses et statuts
pub struct AIRouterCache {
    config: AICacheConfig,
    /// Cache des réponses (clé = hash du prompt)
    responses: Arc<RwLock<lru::LruCache<u64, CacheEntry<CachedAIResponse>>>>,
    /// Cache des statuts provider
    provider_status: Arc<RwLock<std::collections::HashMap<String, CacheEntry<CachedProviderStatus>>>>,
    /// Statistiques
    stats: Arc<RwLock<CacheStats>>,
}

/// Statistiques du cache
#[derive(Debug, Default, Clone)]
pub struct CacheStats {
    pub hits: u64,
    pub misses: u64,
    pub evictions: u64,
    pub total_saved_ms: u64,
}

impl CacheStats {
    pub fn hit_rate(&self) -> f64 {
        let total = self.hits + self.misses;
        if total == 0 {
            0.0
        } else {
            self.hits as f64 / total as f64
        }
    }
}

impl AIRouterCache {
    /// Créer un nouveau cache
    pub fn new(config: AICacheConfig) -> Self {
        let capacity = std::num::NonZeroUsize::new(config.response_cache_capacity)
            .unwrap_or(std::num::NonZeroUsize::new(500).unwrap());

        Self {
            config,
            responses: Arc::new(RwLock::new(lru::LruCache::new(capacity))),
            provider_status: Arc::new(RwLock::new(std::collections::HashMap::new())),
            stats: Arc::new(RwLock::new(CacheStats::default())),
        }
    }

    /// Créer avec configuration par défaut
    pub fn default_cache() -> Self {
        Self::new(AICacheConfig::default())
    }

    /// Générer une clé de cache à partir du prompt et paramètres
    fn generate_cache_key(prompt: &str, temperature: f32, max_tokens: u32) -> u64 {
        let mut hasher = DefaultHasher::new();
        prompt.hash(&mut hasher);
        temperature.to_bits().hash(&mut hasher);
        max_tokens.hash(&mut hasher);
        hasher.finish()
    }

    /// Chercher une réponse dans le cache
    pub async fn get_response(
        &self,
        prompt: &str,
        temperature: f32,
        max_tokens: u32,
    ) -> Option<CachedAIResponse> {
        if !self.config.enabled {
            return None;
        }

        let key = Self::generate_cache_key(prompt, temperature, max_tokens);
        let mut cache = self.responses.write().await;

        if let Some(entry) = cache.get(&key) {
            if !entry.is_expired() {
                // Cache hit
                let mut stats = self.stats.write().await;
                stats.hits += 1;
                // Estimation du temps sauvé (~200ms par requête AI)
                stats.total_saved_ms += 200;

                log::info!(
                    "[AI Cache] HIT: key={} | hit_rate={:.1}%",
                    key,
                    stats.hit_rate() * 100.0
                );

                return Some(entry.value.clone());
            } else {
                // Entrée expirée, supprimer
                cache.pop(&key);
            }
        }

        // Cache miss
        let mut stats = self.stats.write().await;
        stats.misses += 1;

        log::debug!("[AI Cache] MISS: key={}", key);
        None
    }

    /// Stocker une réponse dans le cache
    pub async fn set_response(
        &self,
        prompt: &str,
        temperature: f32,
        max_tokens: u32,
        response: CachedAIResponse,
    ) {
        if !self.config.enabled {
            return;
        }

        let key = Self::generate_cache_key(prompt, temperature, max_tokens);
        let entry = CacheEntry::new(response, self.config.response_ttl_secs);

        let mut cache = self.responses.write().await;

        // Vérifier si on a atteint la capacité (LRU éviction automatique)
        if cache.len() >= self.config.response_cache_capacity {
            let mut stats = self.stats.write().await;
            stats.evictions += 1;
        }

        cache.put(key, entry);

        log::debug!("[AI Cache] SET: key={} | cache_size={}", key, cache.len());
    }

    /// Vérifier le statut caché d'un provider
    pub async fn get_provider_status(&self, provider: &str) -> Option<bool> {
        if !self.config.enabled {
            return None;
        }

        let cache = self.provider_status.read().await;

        if let Some(entry) = cache.get(provider) {
            if !entry.is_expired() {
                return Some(entry.value.is_available);
            }
        }

        None
    }

    /// Mettre à jour le statut caché d'un provider
    pub async fn set_provider_status(&self, provider: &str, is_available: bool) {
        if !self.config.enabled {
            return;
        }

        let entry = CacheEntry::new(
            CachedProviderStatus {
                is_available,
                last_check: Instant::now(),
            },
            self.config.status_ttl_secs,
        );

        let mut cache = self.provider_status.write().await;
        cache.insert(provider.to_string(), entry);
    }

    /// Obtenir les statistiques du cache
    pub async fn get_stats(&self) -> CacheStats {
        self.stats.read().await.clone()
    }

    /// Vider le cache
    pub async fn clear(&self) {
        let mut responses = self.responses.write().await;
        let mut status = self.provider_status.write().await;

        responses.clear();
        status.clear();

        log::info!("[AI Cache] Cache cleared");
    }

    /// Nettoyer les entrées expirées
    pub async fn cleanup_expired(&self) {
        // Nettoyer les réponses expirées
        let mut cache = self.responses.write().await;
        let keys_to_remove: Vec<u64> = cache
            .iter()
            .filter(|(_, entry)| entry.is_expired())
            .map(|(key, _)| *key)
            .collect();

        for key in keys_to_remove {
            cache.pop(&key);
        }

        // Nettoyer les statuts expirés
        let mut status = self.provider_status.write().await;
        status.retain(|_, entry| !entry.is_expired());
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_cache_basic() {
        let cache = AIRouterCache::default_cache();

        // Test set and get
        let response = CachedAIResponse {
            content: "Test response".to_string(),
            tokens: 10,
            provider: "test".to_string(),
        };

        cache.set_response("test prompt", 0.7, 100, response.clone()).await;

        let cached = cache.get_response("test prompt", 0.7, 100).await;
        assert!(cached.is_some());
        assert_eq!(cached.unwrap().content, "Test response");
    }

    #[tokio::test]
    async fn test_cache_miss() {
        let cache = AIRouterCache::default_cache();

        let cached = cache.get_response("nonexistent", 0.7, 100).await;
        assert!(cached.is_none());

        let stats = cache.get_stats().await;
        assert_eq!(stats.misses, 1);
    }

    #[tokio::test]
    async fn test_provider_status() {
        let cache = AIRouterCache::default_cache();

        cache.set_provider_status("gemini", true).await;

        let status = cache.get_provider_status("gemini").await;
        assert_eq!(status, Some(true));
    }
}
