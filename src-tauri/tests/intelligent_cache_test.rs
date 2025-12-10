// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.5.2 — Intelligent Cache Tests (TDD)
//   P2-2: Cache LRU + Persistent - Tests BEFORE Implementation
// ═══════════════════════════════════════════════════════════════

use serde_json::json;
use std::sync::Arc;
use std::time::Duration;

// Mock structures for testing (implementation will be in src/cache/mod.rs)
use titane_infinity::cache::{CacheConfig, CacheKey, IntelligentCache};

// ────────────────────────────────────────────────────────────────
// TEST 1: Basic Cache Operations (set/get)
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_cache_set_get() {
    let cache = IntelligentCache::new(CacheConfig::default());
    let key = CacheKey::new("test_command", json!({"id": 1}));

    // Set value with 5s TTL
    cache.set(
        key.clone(),
        json!({"result": "data"}),
        Duration::from_secs(5),
    );

    // Get should return the value
    let result: serde_json::Value = cache.get(&key).expect("Cache should contain value");
    assert_eq!(result, json!({"result": "data"}));

    // Verify metrics
    let metrics = cache.metrics();
    assert_eq!(metrics.hits(), 1);
    assert_eq!(metrics.misses(), 0);
}

// ────────────────────────────────────────────────────────────────
// TEST 2: TTL Expiration
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_cache_expiration() {
    let cache = IntelligentCache::new(CacheConfig::default());
    let key = CacheKey::new("test", json!({}));

    // Set with 100ms TTL (short for testing)
    cache.set(key.clone(), json!({"data": 1}), Duration::from_millis(100));

    // Immediate get: should hit
    assert!(
        cache.get::<serde_json::Value>(&key).is_some(),
        "Should hit immediately"
    );

    // Wait for TTL to expire
    tokio::time::sleep(Duration::from_millis(150)).await;

    // After TTL: should miss
    assert!(
        cache.get::<serde_json::Value>(&key).is_none(),
        "Should miss after TTL"
    );

    // Verify metrics (1 hit, 1 miss)
    let metrics = cache.metrics();
    assert_eq!(metrics.hits(), 1);
    assert_eq!(metrics.misses(), 1);
}

// ────────────────────────────────────────────────────────────────
// TEST 3: LRU Eviction
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_lru_eviction() {
    let config = CacheConfig {
        max_entries: 3,
        default_ttl: Duration::from_secs(60),
        enable_persistence: false,
        persistence_path: None,
    };
    let cache = IntelligentCache::new(config);

    // Fill cache to capacity (3 entries)
    for i in 0..3 {
        let key = CacheKey::new("cmd", json!({"id": i}));
        cache.set(key, json!({"data": i}), Duration::from_secs(60));
    }

    // Access entry 0 (mark as recently used)
    let key0 = CacheKey::new("cmd", json!({"id": 0}));
    let _ = cache.get::<serde_json::Value>(&key0);

    // Small delay to ensure timestamp difference
    tokio::time::sleep(Duration::from_millis(10)).await;

    // Add 4th entry → should evict LRU (entry 1, not 0 since we just accessed it)
    let key3 = CacheKey::new("cmd", json!({"id": 3}));
    cache.set(key3.clone(), json!({"data": 3}), Duration::from_secs(60));

    // Verify eviction
    let key1 = CacheKey::new("cmd", json!({"id": 1}));
    assert!(
        cache.get::<serde_json::Value>(&key1).is_none(),
        "Entry 1 should be evicted (LRU)"
    );
    assert!(
        cache.get::<serde_json::Value>(&key0).is_some(),
        "Entry 0 should be preserved (recently used)"
    );
    assert!(
        cache.get::<serde_json::Value>(&key3).is_some(),
        "Entry 3 should exist (just added)"
    );

    // Verify eviction metric
    let metrics = cache.metrics();
    assert_eq!(metrics.evictions(), 1);
}

// ────────────────────────────────────────────────────────────────
// TEST 4: Concurrent Access Safety
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_concurrent_cache_access() {
    let cache = Arc::new(IntelligentCache::new(CacheConfig::default()));

    // Spawn 16 concurrent tasks
    let handles: Vec<_> = (0..16)
        .map(|i| {
            let cache = Arc::clone(&cache);
            tokio::spawn(async move {
                for j in 0..100 {
                    // Use modulo to create overlapping keys (simulate real workload)
                    let key = CacheKey::new("cmd", json!({"id": (i * 100 + j) % 50}));

                    // Set value
                    cache.set(key.clone(), json!({"data": j}), Duration::from_secs(10));

                    // Get value
                    let _ = cache.get::<serde_json::Value>(&key);
                }
            })
        })
        .collect();

    // Wait for all tasks
    for h in handles {
        h.await.expect("Task should complete without panic");
    }

    // Verify no crashes, metrics are consistent
    let metrics = cache.metrics();
    assert!(metrics.total_queries() > 0, "Should have recorded queries");
    assert!(
        metrics.hits() + metrics.misses() == metrics.total_queries(),
        "Hits + misses should equal total"
    );
}

// ────────────────────────────────────────────────────────────────
// TEST 5: Cache Metrics & Hit Rate
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_cache_hit_rate() {
    let cache = IntelligentCache::new(CacheConfig::default());
    let key = CacheKey::new("cmd", json!({"id": 1}));

    // First query: miss
    assert!(
        cache.get::<serde_json::Value>(&key).is_none(),
        "First query should miss"
    );

    // Set value
    cache.set(key.clone(), json!({"data": 1}), Duration::from_secs(10));

    // Next 10 queries: all hits
    for _ in 0..10 {
        assert!(
            cache.get::<serde_json::Value>(&key).is_some(),
            "Subsequent queries should hit"
        );
    }

    // Verify metrics
    let metrics = cache.metrics();
    assert_eq!(metrics.hits(), 10, "Should have 10 hits");
    assert_eq!(metrics.misses(), 1, "Should have 1 miss");
    assert_eq!(metrics.total_queries(), 11, "Should have 11 total queries");

    // Verify hit rate calculation
    let hit_rate = metrics.hit_rate();
    assert!(
        (hit_rate - 0.909).abs() < 0.01,
        "Hit rate should be ~90.9% (10/11)"
    );
}

// ────────────────────────────────────────────────────────────────
// TEST 6: Pattern Invalidation
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_invalidate_pattern() {
    let cache = IntelligentCache::new(CacheConfig::default());

    // Add multiple entries with different prefixes
    for i in 0..5 {
        let key = CacheKey::new(&format!("get_user_{}", i), json!({}));
        cache.set(key, json!({"user": i}), Duration::from_secs(60));
    }

    // Add other entries
    for i in 0..3 {
        let key = CacheKey::new(&format!("get_config_{}", i), json!({}));
        cache.set(key, json!({"config": i}), Duration::from_secs(60));
    }

    // Invalidate all "get_user_*" entries
    cache.invalidate_pattern("get_user_");

    // All user entries should miss
    for i in 0..5 {
        let key = CacheKey::new(&format!("get_user_{}", i), json!({}));
        assert!(
            cache.get::<serde_json::Value>(&key).is_none(),
            "User entries should be invalidated"
        );
    }

    // Config entries should still exist
    for i in 0..3 {
        let key = CacheKey::new(&format!("get_config_{}", i), json!({}));
        assert!(
            cache.get::<serde_json::Value>(&key).is_some(),
            "Config entries should remain"
        );
    }
}

// ────────────────────────────────────────────────────────────────
// TEST 7: Persistence (Optional Feature)
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_cache_persistence() {
    let temp_path = std::env::temp_dir().join("titane_cache_test.json");

    // Ensure clean state
    let _ = std::fs::remove_file(&temp_path);

    let config = CacheConfig {
        max_entries: 1000,
        default_ttl: Duration::from_secs(60),
        enable_persistence: true,
        persistence_path: Some(temp_path.clone()),
    };

    // Create cache, add data, persist
    {
        let cache = IntelligentCache::new(config.clone());
        let key = CacheKey::new("cmd", json!({"id": 1}));
        cache.set(
            key,
            json!({"data": "test_value"}),
            Duration::from_secs(3600),
        );

        // Persist to disk
        cache.persist().expect("Persist should succeed");
    }

    // Create new cache instance, restore from disk
    {
        let mut cache = IntelligentCache::new(config);
        cache.restore().expect("Restore should succeed");

        // Verify data was restored
        let key = CacheKey::new("cmd", json!({"id": 1}));
        let value: serde_json::Value = cache
            .get(&key)
            .expect("Restored cache should contain value");
        assert_eq!(value, json!({"data": "test_value"}));
    }

    // Cleanup
    let _ = std::fs::remove_file(temp_path);
}

// ────────────────────────────────────────────────────────────────
// Additional Helper Test: Clear Cache
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_cache_clear() {
    let cache = IntelligentCache::new(CacheConfig::default());

    // Add multiple entries
    for i in 0..10 {
        let key = CacheKey::new("cmd", json!({"id": i}));
        cache.set(key, json!({"data": i}), Duration::from_secs(60));
    }

    // Verify entries exist
    let key0 = CacheKey::new("cmd", json!({"id": 0}));
    assert!(cache.get::<serde_json::Value>(&key0).is_some());

    // Clear cache
    cache.clear();

    // All entries should be gone
    for i in 0..10 {
        let key = CacheKey::new("cmd", json!({"id": i}));
        assert!(
            cache.get::<serde_json::Value>(&key).is_none(),
            "Cache should be empty after clear"
        );
    }
}
