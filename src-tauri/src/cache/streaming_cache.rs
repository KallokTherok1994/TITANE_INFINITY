// ═══════════════════════════════════════════════════════════════
// Phase 4 Sprint 2: Streaming Response Cache
// ═══════════════════════════════════════════════════════════════
// Purpose: Cache streaming tokens to avoid recomputation
// Expected: 2-3x latency reduction for repeated queries
// ═══════════════════════════════════════════════════════════════

use serde_json::{json, Value as JsonValue};
use std::sync::Arc;
use parking_lot::RwLock;
use std::collections::HashMap;
use std::time::{Duration, Instant};

/// Streaming response cache for OMEGA v2 tokens
#[derive(Clone)]
pub struct StreamingResponseCache {
    cache: Arc<RwLock<StreamingCacheInner>>,
}

struct StreamingCacheInner {
    entries: HashMap<String, CachedStream>,
    stats: StreamingCacheStats,
}

struct CachedStream {
    tokens: Vec<String>,
    created_at: Instant,
    ttl: Duration,
    hit_count: u64,
}

#[derive(Debug, Clone, Default)]
struct StreamingCacheStats {
    hits: u64,
    misses: u64,
    evictions: u64,
    total_tokens_cached: usize,
}

impl StreamingResponseCache {
    pub fn new() -> Self {
        StreamingResponseCache {
            cache: Arc::new(RwLock::new(StreamingCacheInner {
                entries: HashMap::new(),
                stats: StreamingCacheStats::default(),
            })),
        }
    }

    /// Cache a complete streaming response (token sequence)
    pub fn cache_stream(
        &self,
        query_hash: String,
        tokens: Vec<String>,
        ttl: Duration,
    ) {
        let mut cache = self.cache.write();
        
        // Evict oldest entry if cache gets too large (1000 entries)
        if cache.entries.len() >= 1000 {
            if let Some(oldest_key) = cache.entries
                .iter()
                .min_by_key(|(_, stream)| stream.created_at)
                .map(|(k, _)| k.clone())
            {
                cache.entries.remove(&oldest_key);
                cache.stats.evictions += 1;
            }
        }

        let total_tokens = tokens.len();
        cache.entries.insert(
            query_hash,
            CachedStream {
                tokens,
                created_at: Instant::now(),
                ttl,
                hit_count: 0,
            },
        );
        cache.stats.total_tokens_cached += total_tokens;
    }

    /// Retrieve cached streaming response (if not expired)
    pub fn get_stream(&self, query_hash: &str) -> Option<Vec<String>> {
        let mut cache = self.cache.write();

        if let Some(stream) = cache.entries.get_mut(query_hash) {
            // Check expiration
            if stream.created_at.elapsed() > stream.ttl {
                cache.entries.remove(query_hash);
                cache.stats.misses += 1;
                return None;
            }

            // Cache hit - clone tokens before releasing write lock
            let tokens = stream.tokens.clone();
            stream.hit_count += 1;
            cache.stats.hits += 1;
            return Some(tokens);
        }

        cache.stats.misses += 1;
        None
    }

    /// Get cache statistics
    pub fn stats(&self) -> StreamingCacheStatsSnapshot {
        let cache = self.cache.read();
        let hit_rate = if cache.stats.hits + cache.stats.misses > 0 {
            (cache.stats.hits as f64) / ((cache.stats.hits + cache.stats.misses) as f64)
        } else {
            0.0
        };

        StreamingCacheStatsSnapshot {
            hits: cache.stats.hits,
            misses: cache.stats.misses,
            hit_rate,
            evictions: cache.stats.evictions,
            entries_cached: cache.entries.len(),
            total_tokens_cached: cache.stats.total_tokens_cached,
        }
    }

    /// Clear cache
    pub fn clear(&self) {
        let mut cache = self.cache.write();
        cache.entries.clear();
        cache.stats = StreamingCacheStats::default();
    }

    /// Reset statistics
    pub fn reset_stats(&self) {
        let mut cache = self.cache.write();
        cache.stats = StreamingCacheStats::default();
    }
}

/// Statistics snapshot
#[derive(Debug, Clone)]
pub struct StreamingCacheStatsSnapshot {
    pub hits: u64,
    pub misses: u64,
    pub hit_rate: f64,
    pub evictions: u64,
    pub entries_cached: usize,
    pub total_tokens_cached: usize,
}

impl Default for StreamingResponseCache {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_streaming_cache_hit() {
        let cache = StreamingResponseCache::new();
        let tokens = vec!["hello".to_string(), "world".to_string()];
        let query_hash = "q_123".to_string();

        cache.cache_stream(query_hash.clone(), tokens.clone(), Duration::from_secs(60));

        let retrieved = cache.get_stream(&query_hash).expect("Cache miss");
        assert_eq!(retrieved, tokens);

        let stats = cache.stats();
        assert_eq!(stats.hits, 1);
        assert_eq!(stats.misses, 0);
    }

    #[test]
    fn test_streaming_cache_miss() {
        let cache = StreamingResponseCache::new();

        let result = cache.get_stream("nonexistent");
        assert!(result.is_none());

        let stats = cache.stats();
        assert_eq!(stats.hits, 0);
        assert_eq!(stats.misses, 1);
    }

    #[test]
    fn test_streaming_cache_expiration() {
        let cache = StreamingResponseCache::new();
        let tokens = vec!["expired".to_string()];
        let query_hash = "q_exp".to_string();

        // Cache with 1ms TTL
        cache.cache_stream(query_hash.clone(), tokens, Duration::from_millis(1));

        // Sleep to expire
        std::thread::sleep(Duration::from_millis(10));

        let result = cache.get_stream(&query_hash);
        assert!(result.is_none());

        let stats = cache.stats();
        assert_eq!(stats.misses, 1);
    }

    #[test]
    fn test_streaming_cache_hit_rate() {
        let cache = StreamingResponseCache::new();

        // 3 cache writes, then 2 hits + 1 miss
        cache.cache_stream("q1".to_string(), vec!["token1".to_string()], Duration::from_secs(60));
        cache.cache_stream("q2".to_string(), vec!["token2".to_string()], Duration::from_secs(60));
        cache.cache_stream("q3".to_string(), vec!["token3".to_string()], Duration::from_secs(60));

        let _ = cache.get_stream("q1");
        let _ = cache.get_stream("q2");
        let _ = cache.get_stream("nonexistent"); // miss

        let stats = cache.stats();
        assert_eq!(stats.hits, 2);
        assert_eq!(stats.misses, 1);
        assert!((stats.hit_rate - 0.666).abs() < 0.01);
    }
}
