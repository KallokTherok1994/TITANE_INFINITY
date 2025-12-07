// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.6.0 — Unified 9-Engine Integration Tests
//   P3-1: End-to-end tests for the consolidated engine architecture
// ═══════════════════════════════════════════════════════════════

use titane_infinity::core::modules::coherence::CoherenceEngine;
use titane_infinity::core::modules::unified_memory::UnifiedMemory;
use titane_infinity::core::modules::system_health::SystemHealth;
use titane_infinity::cache::{IntelligentCache, CacheConfig, CacheKey};
use titane_infinity::batch::{BatchRequest, execute_batch};
use std::time::Duration;

// ────────────────────────────────────────────────────────────────
// Coherence Engine Tests
// ────────────────────────────────────────────────────────────────

#[test]
fn test_coherence_engine_initialization() {
    let engine = CoherenceEngine::new();
    assert!(engine.is_initialized());
    assert!(engine.global_coherence >= 0.0 && engine.global_coherence <= 1.0);
}

#[test]
fn test_coherence_engine_health_check() {
    let engine = CoherenceEngine::new();
    let health = engine.health();

    // Health should be valid enum variant
    match health {
        titane_infinity::core::modules::coherence::HealthStatus::Optimal |
        titane_infinity::core::modules::coherence::HealthStatus::Good |
        titane_infinity::core::modules::coherence::HealthStatus::Degraded |
        titane_infinity::core::modules::coherence::HealthStatus::Critical => {}
    }
}

// ────────────────────────────────────────────────────────────────
// Unified Memory Tests
// ────────────────────────────────────────────────────────────────

#[test]
fn test_unified_memory_initialization() {
    let memory = UnifiedMemory::new();
    assert!(memory.is_initialized());

    let stats = memory.stats();
    assert_eq!(stats.stm_count, 0);
    assert_eq!(stats.mtm_count, 0);
}

#[test]
fn test_unified_memory_store_retrieve() {
    let mut memory = UnifiedMemory::new();

    // Store a memory item
    memory.store_stm("test_key", "test_value", 1.0);

    let stats = memory.stats();
    assert!(stats.stm_count > 0 || stats.total_memories > 0);
}

// ────────────────────────────────────────────────────────────────
// System Health Tests
// ────────────────────────────────────────────────────────────────

#[test]
fn test_system_health_initialization() {
    let health = SystemHealth::new();
    assert!(health.is_initialized());
    assert!(health.global_health >= 0.0 && health.global_health <= 1.0);
}

#[test]
fn test_system_health_metrics_range() {
    let health = SystemHealth::new();

    // All metrics should be in valid range [0.0, 1.0] or reasonable values
    assert!(health.cpu_usage >= 0.0);
    assert!(health.memory_usage >= 0.0);
    assert!(health.disk_usage >= 0.0);
}

// ────────────────────────────────────────────────────────────────
// Cache Integration Tests
// ────────────────────────────────────────────────────────────────

#[test]
fn test_cache_integration_with_engines() {
    let cache = IntelligentCache::new(CacheConfig::default());

    // Simulate caching engine state
    let key = CacheKey::new("health_get_state", serde_json::json!({}));
    let value = serde_json::json!({
        "global_health": 0.95,
        "cpu_usage": 0.15,
        "initialized": true
    });

    cache.set(key.clone(), value.clone(), Duration::from_secs(5));

    let retrieved: Option<serde_json::Value> = cache.get(&key);
    assert!(retrieved.is_some());
    assert_eq!(retrieved.unwrap()["global_health"], 0.95);
}

#[test]
fn test_cache_invalidation_pattern() {
    let cache = IntelligentCache::new(CacheConfig::default());

    // Store multiple health-related entries
    cache.set(
        CacheKey::new("health_get_state", serde_json::json!({})),
        serde_json::json!({"health": true}),
        Duration::from_secs(60),
    );
    cache.set(
        CacheKey::new("health_metrics", serde_json::json!({})),
        serde_json::json!({"metrics": true}),
        Duration::from_secs(60),
    );
    cache.set(
        CacheKey::new("memory_get_state", serde_json::json!({})),
        serde_json::json!({"memory": true}),
        Duration::from_secs(60),
    );

    // Invalidate all health-related entries
    cache.invalidate_pattern("health_");

    // Health entries should be gone
    let health: Option<serde_json::Value> = cache.get(&CacheKey::new("health_get_state", serde_json::json!({})));
    assert!(health.is_none());

    // Memory entry should still exist
    let memory: Option<serde_json::Value> = cache.get(&CacheKey::new("memory_get_state", serde_json::json!({})));
    assert!(memory.is_some());
}

// ────────────────────────────────────────────────────────────────
// Batch Request Integration Tests
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_batch_multiple_engine_queries() {
    let requests = vec![
        BatchRequest {
            id: "health".to_string(),
            command: "health_get_state".to_string(),
            params: serde_json::json!({}),
        },
        BatchRequest {
            id: "memory".to_string(),
            command: "memory_get_state".to_string(),
            params: serde_json::json!({}),
        },
        BatchRequest {
            id: "coherence".to_string(),
            command: "coherence_get_state".to_string(),
            params: serde_json::json!({}),
        },
    ];

    let result = execute_batch(requests).await;

    // All 3 should succeed
    assert_eq!(result.responses.len(), 3);
    assert_eq!(result.success_count, 3);
    assert_eq!(result.failure_count, 0);

    // Verify each response
    for response in &result.responses {
        assert!(response.success);
        assert!(response.data.is_some());
        assert!(response.duration_ms < 1000); // Should be fast
    }
}

#[tokio::test]
async fn test_batch_partial_failure() {
    let requests = vec![
        BatchRequest {
            id: "valid".to_string(),
            command: "health_get_state".to_string(),
            params: serde_json::json!({}),
        },
        BatchRequest {
            id: "invalid".to_string(),
            command: "nonexistent_command".to_string(),
            params: serde_json::json!({}),
        },
    ];

    let result = execute_batch(requests).await;

    // One success, one failure
    assert_eq!(result.responses.len(), 2);
    assert_eq!(result.success_count, 1);
    assert_eq!(result.failure_count, 1);

    // Valid command succeeded
    let valid = result.responses.iter().find(|r| r.id == "valid").unwrap();
    assert!(valid.success);

    // Invalid command failed
    let invalid = result.responses.iter().find(|r| r.id == "invalid").unwrap();
    assert!(!invalid.success);
    assert!(invalid.error.is_some());
}

// ────────────────────────────────────────────────────────────────
// Performance Integration Tests
// ────────────────────────────────────────────────────────────────

#[test]
fn test_cache_performance_under_load() {
    let cache = IntelligentCache::new(CacheConfig {
        max_entries: 100,
        default_ttl: Duration::from_secs(60),
        enable_persistence: false,
        persistence_path: None,
    });

    // Insert 100 entries
    for i in 0..100 {
        let key = CacheKey::new(&format!("test_{}", i), serde_json::json!({"i": i}));
        cache.set(key, serde_json::json!({"value": i}), Duration::from_secs(60));
    }

    // Verify all entries are accessible
    for i in 0..100 {
        let key = CacheKey::new(&format!("test_{}", i), serde_json::json!({"i": i}));
        let value: Option<serde_json::Value> = cache.get(&key);
        assert!(value.is_some());
    }

    // Check metrics
    let metrics = cache.metrics();
    assert_eq!(metrics.hits(), 100);
}

#[tokio::test]
async fn test_batch_performance_timing() {
    use tokio::time::Instant;

    let requests = vec![
        BatchRequest { id: "1".to_string(), command: "health_get_state".to_string(), params: serde_json::json!({}) },
        BatchRequest { id: "2".to_string(), command: "memory_get_state".to_string(), params: serde_json::json!({}) },
        BatchRequest { id: "3".to_string(), command: "coherence_get_state".to_string(), params: serde_json::json!({}) },
        BatchRequest { id: "4".to_string(), command: "cache_get_metrics".to_string(), params: serde_json::json!({}) },
    ];

    let start = Instant::now();
    let result = execute_batch(requests).await;
    let elapsed = start.elapsed();

    // Batch should complete quickly (< 100ms for mock commands)
    assert!(elapsed.as_millis() < 100, "Batch took too long: {}ms", elapsed.as_millis());
    assert_eq!(result.success_count, 4);
}

// ────────────────────────────────────────────────────────────────
// Cross-Engine Integration Tests
// ────────────────────────────────────────────────────────────────

#[test]
fn test_engine_state_consistency() {
    // Initialize all engines
    let coherence = CoherenceEngine::new();
    let memory = UnifiedMemory::new();
    let health = SystemHealth::new();

    // All should be initialized
    assert!(coherence.is_initialized());
    assert!(memory.is_initialized());
    assert!(health.is_initialized());

    // Health values should be reasonable
    assert!(coherence.global_coherence >= 0.0);
    assert!(health.global_health >= 0.0);
}

#[test]
fn test_cache_with_all_engine_data() {
    let cache = IntelligentCache::new(CacheConfig::default());

    // Simulate storing data from all 9 engines
    let engine_data = vec![
        ("coherence_state", serde_json::json!({"coherence": 0.95})),
        ("memory_state", serde_json::json!({"stm": 10, "mtm": 20, "ltm": 100})),
        ("health_state", serde_json::json!({"global": 0.98})),
        ("adaptive_state", serde_json::json!({"learning_rate": 0.01})),
        ("watchdog_state", serde_json::json!({"alerts": 0})),
        ("singularity_state", serde_json::json!({"unified": true})),
    ];

    for (name, data) in &engine_data {
        let key = CacheKey::new(name, serde_json::json!({}));
        cache.set(key, data.clone(), Duration::from_secs(30));
    }

    // Verify all data is cached
    for (name, expected) in &engine_data {
        let key = CacheKey::new(name, serde_json::json!({}));
        let retrieved: Option<serde_json::Value> = cache.get(&key);
        assert!(retrieved.is_some(), "Missing cache for {}", name);
        assert_eq!(&retrieved.unwrap(), expected);
    }
}
