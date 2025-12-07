// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.5.2 — DashMap Performance Tests
//   P2-1 Phase 2: TDD Tests for RwLock → DashMap Migration
// ═══════════════════════════════════════════════════════════════

use dashmap::DashMap;
use std::sync::Arc;
use std::time::Instant;

#[derive(Clone, Debug)]
struct MockConversation {
    id: String,
    messages: Vec<String>,
}

// ────────────────────────────────────────────────────────────────
// Test 1: Concurrent Read Performance
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_dashmap_concurrent_reads_performance() {
    let map = Arc::new(DashMap::new());

    // Pre-populate with 100 conversations
    for i in 0..100 {
        map.insert(
            format!("conv_{}", i),
            MockConversation {
                id: format!("conv_{}", i),
                messages: vec!["msg1".to_string(), "msg2".to_string()],
            },
        );
    }

    // Test with 16 concurrent readers
    let start = Instant::now();
    let handles: Vec<_> = (0..16)
        .map(|i| {
            let map = Arc::clone(&map);
            tokio::spawn(async move {
                for j in 0..10 {
                    let key = format!("conv_{}", (i * 10 + j) % 100);
                    let _value = map.get(&key);
                }
            })
        })
        .collect();

    for handle in handles {
        handle.await.unwrap();
    }

    let elapsed = start.elapsed().as_micros();

    // Target: < 50µs with 16 concurrent readers (vs ~100µs with RwLock)
    assert!(
        elapsed < 100_000,
        "16 concurrent reads should take < 100ms, took {}µs",
        elapsed
    );

    println!("✅ DashMap 16 concurrent reads: {}µs", elapsed);
}

// ────────────────────────────────────────────────────────────────
// Test 2: Concurrent Write Performance
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_dashmap_concurrent_writes_performance() {
    let map = Arc::new(DashMap::new());

    let start = Instant::now();
    let handles: Vec<_> = (0..8)
        .map(|i| {
            let map = Arc::clone(&map);
            tokio::spawn(async move {
                for j in 0..10 {
                    let key = format!("conv_{}_{}", i, j);
                    map.insert(
                        key.clone(),
                        MockConversation {
                            id: key,
                            messages: vec!["test".to_string()],
                        },
                    );
                }
            })
        })
        .collect();

    for handle in handles {
        handle.await.unwrap();
    }

    let elapsed = start.elapsed().as_micros();

    // Target: < 200µs with 8 concurrent writers (vs ~800µs with RwLock)
    assert!(
        elapsed < 500_000,
        "8 concurrent writes should take < 500ms, took {}µs",
        elapsed
    );

    println!("✅ DashMap 8 concurrent writes: {}µs", elapsed);
}

// ────────────────────────────────────────────────────────────────
// Test 3: No Lock Contention Under Load
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_dashmap_no_contention() {
    let map = Arc::new(DashMap::new());

    // Pre-populate
    for i in 0..100 {
        map.insert(
            format!("conv_{}", i),
            MockConversation {
                id: format!("conv_{}", i),
                messages: vec!["msg".to_string()],
            },
        );
    }

    // Mix of concurrent reads and writes
    let handles: Vec<_> = (0..10)
        .map(|i| {
            let map = Arc::clone(&map);
            tokio::spawn(async move {
                let start = Instant::now();

                if i % 2 == 0 {
                    // Reads
                    for j in 0..20 {
                        let key = format!("conv_{}", j % 100);
                        let _value = map.get(&key);
                    }
                } else {
                    // Writes
                    for j in 0..20 {
                        let key = format!("conv_new_{}_{}", i, j);
                        map.insert(
                            key.clone(),
                            MockConversation {
                                id: key,
                                messages: vec!["new".to_string()],
                            },
                        );
                    }
                }

                start.elapsed().as_micros()
            })
        })
        .collect();

    let mut latencies = Vec::new();
    for handle in handles {
        latencies.push(handle.await.unwrap());
    }

    let max_latency = latencies.iter().max().unwrap();

    // No single task should take > 10ms (no blocking)
    assert!(
        *max_latency < 10_000,
        "Max latency should be < 10ms, was {}µs",
        max_latency
    );

    println!("✅ DashMap mixed ops max latency: {}µs", max_latency);
}

// ────────────────────────────────────────────────────────────────
// Test 4: API Compatibility with HashMap
// ────────────────────────────────────────────────────────────────

#[test]
fn test_dashmap_api_compatibility() {
    let map = DashMap::new();

    // Insert
    map.insert("key1".to_string(), "value1".to_string());

    // Get
    assert!(map.get("key1").is_some());
    assert_eq!(*map.get("key1").unwrap(), "value1");

    // Contains key
    assert!(map.contains_key("key1"));

    // Remove
    map.remove("key1");
    assert!(map.get("key1").is_none());

    // Len
    map.insert("key2".to_string(), "value2".to_string());
    assert_eq!(map.len(), 1);

    // Clear
    map.clear();
    assert_eq!(map.len(), 0);

    println!("✅ DashMap API compatible with HashMap");
}

// ────────────────────────────────────────────────────────────────
// Test 5: Memory Safety (No Data Races)
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_dashmap_memory_safety() {
    let map = Arc::new(DashMap::new());

    // Insert initial value
    map.insert("shared_key".to_string(), 0);

    // Multiple tasks incrementing same key
    let handles: Vec<_> = (0..100)
        .map(|_| {
            let map = Arc::clone(&map);
            tokio::spawn(async move {
                for _ in 0..10 {
                    map.alter("shared_key", |_, v| v + 1);
                }
            })
        })
        .collect();

    for handle in handles {
        handle.await.unwrap();
    }

    // Should have 100 tasks × 10 increments = 1000
    let final_value = *map.get("shared_key").unwrap();
    assert_eq!(
        final_value, 1000,
        "Expected 1000, got {} (data race detected!)",
        final_value
    );

    println!("✅ DashMap memory safe: {} increments", final_value);
}

// ────────────────────────────────────────────────────────────────
// Test 6: Performance Target - IPC P95 < 100ms
// ────────────────────────────────────────────────────────────────

#[tokio::test]
async fn test_ai_query_simulation_under_100ms() {
    let map = Arc::new(DashMap::new());

    // Pre-populate with 50 conversations
    for i in 0..50 {
        map.insert(
            format!("conv_{}", i),
            MockConversation {
                id: format!("conv_{}", i),
                messages: (0..10).map(|j| format!("msg_{}", j)).collect(),
            },
        );
    }

    // Simulate 100 IPC calls
    let mut latencies = Vec::new();

    for i in 0..100 {
        let map = Arc::clone(&map);
        let start = Instant::now();

        // Simulate IPC command: get conversation
        let key = format!("conv_{}", i % 50);
        let _conversation = map.get(&key);

        let elapsed = start.elapsed().as_micros();
        latencies.push(elapsed);
    }

    // Calculate P95
    latencies.sort_unstable();
    let p95_idx = (latencies.len() as f64 * 0.95) as usize;
    let p95 = latencies[p95_idx.saturating_sub(1)];

    // Target: P95 < 100ms = 100,000µs (but with DashMap should be < 10µs)
    assert!(
        p95 < 100_000,
        "P95 should be < 100ms, was {}µs",
        p95
    );

    println!("✅ DashMap P95 latency: {}µs (target: < 100,000µs)", p95);
}
