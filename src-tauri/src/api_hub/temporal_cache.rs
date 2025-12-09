//! ═══════════════════════════════════════════════════════════════════════════════
//! CACHE ADAPTATIF TEMPOREL — TTL dynamique selon contexte
//! ═══════════════════════════════════════════════════════════════════════════════

use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use serde::{Serialize, Deserialize};
use super::temporal_adapter::TemporalApiAdapter;

/// Cache adaptatif avec TTL temporel
pub struct TemporalCache<T: Clone> {
    store: Arc<RwLock<HashMap<String, CachedEntry<T>>>>,
    temporal_adapter: Arc<TemporalApiAdapter>,
    max_entries: usize,
}

/// Entrée cachée avec métadonnées
#[derive(Clone, Debug)]
struct CachedEntry<T: Clone> {
    value: T,
    cached_at: Instant,
    ttl: Duration,
    hit_count: u32,
    endpoint: String,
}

impl<T: Clone> CachedEntry<T> {
    fn is_expired(&self) -> bool {
        self.cached_at.elapsed() > self.ttl
    }
}

impl<T: Clone> TemporalCache<T> {
    pub fn new(max_entries: usize, temporal_adapter: Arc<TemporalApiAdapter>) -> Self {
        Self {
            store: Arc::new(RwLock::new(HashMap::new())),
            temporal_adapter,
            max_entries,
        }
    }

    /// Obtenir valeur du cache
    pub async fn get(&self, key: &str) -> Option<T> {
        let mut store = self.store.write().await;

        if let Some(entry) = store.get_mut(key) {
            if entry.is_expired() {
                store.remove(key);
                return None;
            }

            entry.hit_count += 1;
            Some(entry.value.clone())
        } else {
            None
        }
    }

    /// Stocker valeur avec TTL adaptatif
    pub async fn set(&self, key: String, value: T, endpoint: String) {
        // Obtenir TTL adaptatif
        let ttl_seconds = self.temporal_adapter.get_cache_ttl(&endpoint).await;
        let ttl = Duration::from_secs(ttl_seconds);

        let entry = CachedEntry {
            value,
            cached_at: Instant::now(),
            ttl,
            hit_count: 0,
            endpoint,
        };

        let mut store = self.store.write().await;

        // Éviction LRU si plein
        if store.len() >= self.max_entries && !store.contains_key(&key) {
            self.evict_lru(&mut store).await;
        }

        store.insert(key, entry);
    }

    /// Éviction LRU (Least Recently Used)
    async fn evict_lru(&self, store: &mut HashMap<String, CachedEntry<T>>) {
        // Supprimer l'entrée expirée ou avec le plus faible hit_count
        if let Some((key_to_remove, _)) = store
            .iter()
            .filter(|(_, entry)| entry.is_expired())
            .map(|(k, e)| (k.clone(), e.hit_count))
            .min_by_key(|(_, hits)| *hits)
        {
            store.remove(&key_to_remove);
        } else if let Some((key_to_remove, _)) = store
            .iter()
            .map(|(k, e)| (k.clone(), e.hit_count))
            .min_by_key(|(_, hits)| *hits)
        {
            store.remove(&key_to_remove);
        }
    }

    /// Nettoyer entrées expirées
    pub async fn cleanup_expired(&self) {
        let mut store = self.store.write().await;
        store.retain(|_, entry| !entry.is_expired());
    }

    /// Obtenir statistiques
    pub async fn get_stats(&self) -> CacheStats {
        let store = self.store.read().await;

        let total_entries = store.len();
        let expired_entries = store.values().filter(|e| e.is_expired()).count();
        let total_hits: u32 = store.values().map(|e| e.hit_count).sum();

        CacheStats {
            total_entries,
            expired_entries,
            total_hits,
            capacity: self.max_entries,
            hit_rate: if total_entries > 0 {
                total_hits as f32 / total_entries as f32
            } else {
                0.0
            },
        }
    }

    /// Vider cache
    pub async fn clear(&self) {
        self.store.write().await.clear();
    }
}

/// Statistiques cache
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheStats {
    pub total_entries: usize,
    pub expired_entries: usize,
    pub total_hits: u32,
    pub capacity: usize,
    pub hit_rate: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_cache_creation() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let cache: TemporalCache<String> = TemporalCache::new(100, adapter);

        let stats = cache.get_stats().await;
        assert_eq!(stats.total_entries, 0);
    }

    #[tokio::test]
    async fn test_cache_set_get() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let cache: TemporalCache<String> = TemporalCache::new(100, adapter);

        cache.set("key1".to_string(), "value1".to_string(), "/test".to_string()).await;

        let value = cache.get("key1").await;
        assert_eq!(value, Some("value1".to_string()));

        let stats = cache.get_stats().await;
        assert_eq!(stats.total_entries, 1);
        assert_eq!(stats.total_hits, 1);
    }

    #[tokio::test]
    async fn test_cache_miss() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let cache: TemporalCache<String> = TemporalCache::new(100, adapter);

        let value = cache.get("nonexistent").await;
        assert_eq!(value, None);
    }

    #[tokio::test]
    async fn test_cache_cleanup() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let cache: TemporalCache<String> = TemporalCache::new(100, adapter);

        cache.set("key1".to_string(), "value1".to_string(), "/test".to_string()).await;

        let stats_before = cache.get_stats().await;
        assert_eq!(stats_before.total_entries, 1);

        cache.cleanup_expired().await;

        // Devrait être toujours là (pas encore expiré)
        let stats_after = cache.get_stats().await;
        assert_eq!(stats_after.total_entries, 1);
    }

    #[tokio::test]
    async fn test_cache_clear() {
        let adapter = Arc::new(TemporalApiAdapter::new());
        let cache: TemporalCache<String> = TemporalCache::new(100, adapter);

        cache.set("key1".to_string(), "value1".to_string(), "/test".to_string()).await;
        cache.set("key2".to_string(), "value2".to_string(), "/test".to_string()).await;

        cache.clear().await;

        let stats = cache.get_stats().await;
        assert_eq!(stats.total_entries, 0);
    }
}
