// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.5.2 — IPC Cache Layer
//   P2-1 Phase 4: Intelligent Cache with TTL
// ═══════════════════════════════════════════════════════════════

use dashmap::DashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use serde::{Serialize, Deserialize};

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

#[derive(Clone)]
struct CacheEntry<T: Clone> {
    data: T,
    created_at: Instant,
    hits: u64,
}

/// Generic IPC Cache with TTL and hit tracking
pub struct IPCCache<T: Clone + Send + Sync + 'static> {
    entries: Arc<DashMap<String, CacheEntry<T>>>,
    ttl: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheStats {
    pub total_entries: usize,
    pub total_hits: u64,
    pub hit_rate: f64,
    pub avg_entry_age_ms: u64,
}

// ────────────────────────────────────────────────────────────────
// Implementation
// ────────────────────────────────────────────────────────────────

impl<T: Clone + Send + Sync + 'static> IPCCache<T> {
    /// Create new cache with TTL in seconds
    pub fn new(ttl_seconds: u64) -> Self {
        Self {
            entries: Arc::new(DashMap::new()),
            ttl: Duration::from_secs(ttl_seconds),
        }
    }

    /// Get cached value or compute if missing/expired
    pub fn get_or_compute<F>(&self, key: &str, compute: F) -> T
    where
        F: FnOnce() -> T,
    {
        // Check cache first
        if let Some(mut entry) = self.entries.get_mut(key) {
            if entry.created_at.elapsed() < self.ttl {
                // Cache hit
                entry.hits += 1;
                return entry.data.clone();
            }
            // Expired, will recompute
        }

        // Cache miss or expired - compute
        let data = compute();

        // Store in cache
        self.entries.insert(
            key.to_string(),
            CacheEntry {
                data: data.clone(),
                created_at: Instant::now(),
                hits: 0,
            },
        );

        data
    }

    /// Async version of get_or_compute
    pub async fn get_or_compute_async<F, Fut>(&self, key: &str, compute: F) -> T
    where
        F: FnOnce() -> Fut,
        Fut: std::future::Future<Output = T>,
    {
        // Check cache first
        if let Some(mut entry) = self.entries.get_mut(key) {
            if entry.created_at.elapsed() < self.ttl {
                entry.hits += 1;
                return entry.data.clone();
            }
        }

        // Compute async
        let data = compute().await;

        // Store
        self.entries.insert(
            key.to_string(),
            CacheEntry {
                data: data.clone(),
                created_at: Instant::now(),
                hits: 0,
            },
        );

        data
    }

    /// Invalidate specific key
    pub fn invalidate(&self, key: &str) {
        self.entries.remove(key);
    }

    /// Invalidate all entries matching predicate
    pub fn invalidate_matching<F>(&self, predicate: F)
    where
        F: Fn(&str) -> bool,
    {
        self.entries.retain(|key, _| !predicate(key));
    }

    /// Clear all expired entries
    pub fn cleanup_expired(&self) {
        self.entries.retain(|_, entry| {
            entry.created_at.elapsed() < self.ttl
        });
    }

    /// Get cache statistics
    pub fn get_stats(&self) -> CacheStats {
        let mut total_hits = 0u64;
        let mut total_age_ms = 0u64;
        let count = self.entries.len();

        for entry in self.entries.iter() {
            total_hits += entry.hits;
            total_age_ms += entry.created_at.elapsed().as_millis() as u64;
        }

        let hit_rate = if count > 0 {
            total_hits as f64 / count as f64
        } else {
            0.0
        };

        let avg_age = if count > 0 {
            total_age_ms / count as u64
        } else {
            0
        };

        CacheStats {
            total_entries: count,
            total_hits,
            hit_rate,
            avg_entry_age_ms: avg_age,
        }
    }

    /// Clear all cache
    pub fn clear(&self) {
        self.entries.clear();
    }
}

// ────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread;

    #[test]
    fn test_cache_hit() {
        let cache = IPCCache::<String>::new(10);

        // First call - cache miss
        let result1 = cache.get_or_compute("test_key", || "expensive_result".to_string());
        assert_eq!(result1, "expensive_result");

        // Second call - cache hit
        let result2 = cache.get_or_compute("test_key", || {
            panic!("Should not compute again!");
        });
        assert_eq!(result2, "expensive_result");
    }

    #[test]
    fn test_cache_expiry() {
        let cache = IPCCache::<String>::new(1); // 1 second TTL

        cache.get_or_compute("test_key", || "value".to_string());

        // Wait for expiry
        thread::sleep(Duration::from_millis(1100));

        // Should recompute
        let result = cache.get_or_compute("test_key", || "new_value".to_string());
        assert_eq!(result, "new_value");
    }

    #[test]
    fn test_invalidate() {
        let cache = IPCCache::<i32>::new(10);

        cache.get_or_compute("key1", || 42);
        cache.get_or_compute("key2", || 100);

        assert_eq!(cache.entries.len(), 2);

        cache.invalidate("key1");
        assert_eq!(cache.entries.len(), 1);
    }

    #[test]
    fn test_invalidate_matching() {
        let cache = IPCCache::<i32>::new(10);

        cache.get_or_compute("user_1", || 1);
        cache.get_or_compute("user_2", || 2);
        cache.get_or_compute("system_1", || 3);

        cache.invalidate_matching(|key| key.starts_with("user_"));

        assert_eq!(cache.entries.len(), 1);
        assert!(cache.entries.contains_key("system_1"));
    }

    #[test]
    fn test_cleanup_expired() {
        let cache = IPCCache::<i32>::new(1); // 1 second TTL

        cache.get_or_compute("key1", || 1);
        thread::sleep(Duration::from_millis(1100));
        cache.get_or_compute("key2", || 2); // Fresh entry

        cache.cleanup_expired();

        assert_eq!(cache.entries.len(), 1);
        assert!(cache.entries.contains_key("key2"));
    }

    #[test]
    fn test_cache_stats() {
        let cache = IPCCache::<i32>::new(10);

        cache.get_or_compute("key1", || 1);
        cache.get_or_compute("key1", || 1); // Hit
        cache.get_or_compute("key1", || 1); // Hit
        cache.get_or_compute("key2", || 2);

        let stats = cache.get_stats();
        assert_eq!(stats.total_entries, 2);
        assert_eq!(stats.total_hits, 2); // 2 hits on key1
        assert!(stats.hit_rate > 0.0);
    }

    #[tokio::test]
    async fn test_async_cache() {
        let cache = IPCCache::<String>::new(10);

        let result1 = cache.get_or_compute_async("async_key", || async {
            tokio::time::sleep(Duration::from_millis(10)).await;
            "async_value".to_string()
        }).await;

        assert_eq!(result1, "async_value");

        // Cache hit - should not sleep
        let start = Instant::now();
        let result2 = cache.get_or_compute_async("async_key", || async {
            tokio::time::sleep(Duration::from_millis(100)).await;
            "should_not_compute".to_string()
        }).await;
        let elapsed = start.elapsed();

        assert_eq!(result2, "async_value");
        assert!(elapsed < Duration::from_millis(50)); // Much faster than 100ms
    }
}
