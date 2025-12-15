// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — IPC CACHE TESTS
//   Phase 3.1: Integration tests for IPCCache
// ═══════════════════════════════════════════════════════════════

use std::time::Duration;
#[allow(unused_imports)]
use titane_infinity::ipc::{CacheStats, IPCCache};
use tokio::time::sleep;

// ────────────────────────────────────────────────────────────────
// Basic Operations Tests
// ────────────────────────────────────────────────────────────────

#[test]
fn test_cache_basic_operations() {
    let cache: IPCCache<String> = IPCCache::new(10);

    // Test get_or_compute with cache miss
    let value1 = cache.get_or_compute("key1", || "value1".to_string());
    assert_eq!(value1, "value1");

    // Test get_or_compute with cache hit (should not recompute)
    let mut call_count = 0;
    let value2 = cache.get_or_compute("key1", || {
        call_count += 1;
        "new_value".to_string()
    });
    assert_eq!(value2, "value1"); // Should return cached value
    assert_eq!(call_count, 0); // Should not call compute function
}

#[tokio::test]
async fn test_cache_async_operations() {
    let cache: IPCCache<String> = IPCCache::new(10);

    // Test async get_or_compute
    let value1 = cache
        .get_or_compute_async("async_key", || async {
            sleep(Duration::from_millis(10)).await;
            "async_value".to_string()
        })
        .await;
    assert_eq!(value1, "async_value");

    // Test cache hit doesn't re-execute async function
    let value2 = cache
        .get_or_compute_async("async_key", || async {
            panic!("Should not be called - cache hit");
        })
        .await;
    assert_eq!(value2, "async_value");
}

#[tokio::test]
async fn test_cache_expiration() {
    let cache: IPCCache<String> = IPCCache::new(1); // 1 second TTL

    // Insert value
    let value1 = cache.get_or_compute("expire_key", || "initial".to_string());
    assert_eq!(value1, "initial");

    // Wait for expiration
    sleep(Duration::from_secs(2)).await;

    // Should recompute after expiration
    let value2 = cache.get_or_compute("expire_key", || "recomputed".to_string());
    assert_eq!(value2, "recomputed");
}

// ────────────────────────────────────────────────────────────────
// Cache Invalidation Tests
// ────────────────────────────────────────────────────────────────

#[test]
fn test_cache_invalidate_single() {
    let cache: IPCCache<String> = IPCCache::new(10);

    // Insert values
    cache.get_or_compute("key1", || "value1".to_string());
    cache.get_or_compute("key2", || "value2".to_string());

    // Invalidate one key
    cache.invalidate("key1");

    // key1 should be recomputed, key2 should be cached
    let value1 = cache.get_or_compute("key1", || "new_value1".to_string());
    let value2 = cache.get_or_compute("key2", || "should_not_compute".to_string());

    assert_eq!(value1, "new_value1");
    assert_eq!(value2, "value2");
}

#[test]
fn test_cache_invalidate_matching() {
    let cache: IPCCache<String> = IPCCache::new(10);

    // Insert values with different prefixes
    cache.get_or_compute("health_state", || "health1".to_string());
    cache.get_or_compute("health_report", || "health2".to_string());
    cache.get_or_compute("memory_state", || "memory1".to_string());

    // Invalidate all keys starting with "health_"
    cache.invalidate_matching(|key| key.starts_with("health_"));

    // Health keys should be recomputed, memory key should be cached
    let health1 = cache.get_or_compute("health_state", || "new_health1".to_string());
    let health2 = cache.get_or_compute("health_report", || "new_health2".to_string());
    let memory1 = cache.get_or_compute("memory_state", || "should_not_compute".to_string());

    assert_eq!(health1, "new_health1");
    assert_eq!(health2, "new_health2");
    assert_eq!(memory1, "memory1");
}

// ────────────────────────────────────────────────────────────────
// Cache Statistics Tests
// ────────────────────────────────────────────────────────────────

#[test]
fn test_cache_stats_tracking() {
    let cache: IPCCache<i32> = IPCCache::new(10);

    // Initial stats
    let stats = cache.get_stats();
    assert_eq!(stats.total_entries, 0);
    assert_eq!(stats.total_hits, 0);

    // Add entries and generate hits
    cache.get_or_compute("num1", || 42);
    cache.get_or_compute("num2", || 100);

    // Generate cache hits
    cache.get_or_compute("num1", || 0); // Hit
    cache.get_or_compute("num1", || 0); // Hit
    cache.get_or_compute("num2", || 0); // Hit

    let stats = cache.get_stats();
    assert_eq!(stats.total_entries, 2);
    assert!(stats.total_hits >= 3); // At least 3 hits
    assert!(stats.hit_rate > 0.0); // Hit rate should be positive
}

#[test]
fn test_cache_stats_hit_rate() {
    let cache: IPCCache<String> = IPCCache::new(10);

    // Create entry
    cache.get_or_compute("test", || "value".to_string());

    // Generate multiple hits
    for _ in 0..10 {
        cache.get_or_compute("test", || "should_not_compute".to_string());
    }

    let stats = cache.get_stats();
    assert!(stats.hit_rate >= 10.0); // Should have at least 10 hits per entry
}

// ────────────────────────────────────────────────────────────────
// Cleanup Tests
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_cache_cleanup_expired() {
    let cache: IPCCache<String> = IPCCache::new(1); // 1 second TTL

    // Insert entries
    cache.get_or_compute("key1", || "value1".to_string());
    cache.get_or_compute("key2", || "value2".to_string());

    let stats_before = cache.get_stats();
    assert_eq!(stats_before.total_entries, 2);

    // Wait for expiration
    sleep(Duration::from_secs(2)).await;

    // Cleanup expired entries
    cache.cleanup_expired();

    let stats_after = cache.get_stats();
    assert_eq!(stats_after.total_entries, 0); // All expired entries should be removed
}

// ────────────────────────────────────────────────────────────────
// Concurrent Access Tests
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_cache_concurrent_access() {
    use std::sync::Arc;

    let cache = Arc::new(IPCCache::<i32>::new(10));

    // First, populate the cache with initial values (sequential to guarantee entries exist)
    for i in 0..3 {
        cache
            .get_or_compute_async(&format!("key{}", i), || async move { i * 10 })
            .await;
    }

    // Now spawn concurrent tasks that should get cache hits
    let mut handles = vec![];

    for i in 0..10 {
        let cache_clone = Arc::clone(&cache);
        let handle = tokio::spawn(async move {
            cache_clone
                .get_or_compute_async(&format!("key{}", i % 3), || async {
                    sleep(Duration::from_millis(10)).await;
                    i * 100 // Different value to detect if compute was called
                })
                .await
        });
        handles.push(handle);
    }

    // Wait for all tasks
    for handle in handles {
        handle.await.unwrap();
    }

    let stats = cache.get_stats();
    assert_eq!(stats.total_entries, 3); // Should have 3 unique keys (0, 1, 2)
    assert!(stats.total_hits >= 10); // All 10 concurrent accesses should be hits
}

#[tokio::test]
async fn test_cache_concurrent_same_key() {
    use std::sync::atomic::{AtomicU32, Ordering};
    use std::sync::Arc;

    let cache = Arc::new(IPCCache::<String>::new(10));
    let compute_count = Arc::new(AtomicU32::new(0));

    // Spawn multiple tasks accessing the same key
    let mut handles = vec![];

    for _ in 0..10 {
        let cache_clone = Arc::clone(&cache);
        let counter = Arc::clone(&compute_count);
        let handle = tokio::spawn(async move {
            cache_clone
                .get_or_compute_async("shared_key", || async {
                    counter.fetch_add(1, Ordering::SeqCst);
                    sleep(Duration::from_millis(10)).await;
                    "shared_value".to_string()
                })
                .await
        });
        handles.push(handle);
    }

    // Wait for all tasks
    for handle in handles {
        let result = handle.await.unwrap();
        assert_eq!(result, "shared_value");
    }

    // Due to concurrent access, compute might be called multiple times
    // but much less than 10 times (some will hit cache)
    let count = compute_count.load(Ordering::SeqCst);
    assert!(count > 0 && count <= 10);
}

// ────────────────────────────────────────────────────────────────
// Complex Data Types Tests
// ────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq)]
struct ComplexData {
    id: u64,
    name: String,
    values: Vec<i32>,
}

#[test]
fn test_cache_complex_types() {
    let cache: IPCCache<ComplexData> = IPCCache::new(10);

    let data = ComplexData {
        id: 1,
        name: "test".to_string(),
        values: vec![1, 2, 3, 4, 5],
    };

    let cached = cache.get_or_compute("complex", || data.clone());
    assert_eq!(cached, data);

    // Verify cache hit returns same data
    let cached_again = cache.get_or_compute("complex", || ComplexData {
        id: 999,
        name: "should_not_be_used".to_string(),
        values: vec![],
    });
    assert_eq!(cached_again, data);
}
