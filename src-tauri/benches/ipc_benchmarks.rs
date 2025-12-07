// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.5.2 — IPC Performance Benchmarks
//   P2-1: Baseline + Optimization Benchmarks
// ═══════════════════════════════════════════════════════════════

use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use std::sync::{Arc, RwLock};
use std::collections::HashMap;
use std::time::Duration;

// ────────────────────────────────────────────────────────────────
// Mock Structures (simplified from actual codebase)
// ────────────────────────────────────────────────────────────────

#[derive(Clone)]
struct Conversation {
    id: String,
    messages: Vec<String>,
}

struct AIChatStateRwLock {
    conversations: Arc<RwLock<HashMap<String, Conversation>>>,
}

impl AIChatStateRwLock {
    fn new() -> Self {
        Self {
            conversations: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    fn get_conversation(&self, id: &str) -> Option<Conversation> {
        let lock = self.conversations.read().unwrap();
        lock.get(id).cloned()
    }

    fn insert_conversation(&self, id: String, conv: Conversation) {
        let mut lock = self.conversations.write().unwrap();
        lock.insert(id, conv);
    }
}

// ────────────────────────────────────────────────────────────────
// Benchmark: Lock Contention (RwLock baseline)
// ────────────────────────────────────────────────────────────────

fn benchmark_rwlock_concurrent_reads(c: &mut Criterion) {
    let mut group = c.benchmark_group("lock_contention");

    for num_threads in [1, 4, 8, 16] {
        group.bench_with_input(
            BenchmarkId::new("rwlock_reads", num_threads),
            &num_threads,
            |b, &threads| {
                let state = Arc::new(AIChatStateRwLock::new());

                // Pre-populate
                for i in 0..100 {
                    state.insert_conversation(
                        format!("conv_{}", i),
                        Conversation {
                            id: format!("conv_{}", i),
                            messages: vec!["msg1".to_string(), "msg2".to_string()],
                        },
                    );
                }

                b.iter(|| {
                    let handles: Vec<_> = (0..threads)
                        .map(|i| {
                            let state = Arc::clone(&state);
                            std::thread::spawn(move || {
                                for j in 0..10 {
                                    let key = format!("conv_{}", (i * 10 + j) % 100);
                                    black_box(state.get_conversation(&key));
                                }
                            })
                        })
                        .collect();

                    for h in handles {
                        h.join().unwrap();
                    }
                });
            },
        );
    }

    group.finish();
}

fn benchmark_rwlock_concurrent_writes(c: &mut Criterion) {
    let mut group = c.benchmark_group("lock_contention");

    for num_threads in [1, 4, 8] {
        group.bench_with_input(
            BenchmarkId::new("rwlock_writes", num_threads),
            &num_threads,
            |b, &threads| {
                b.iter(|| {
                    let state = Arc::new(AIChatStateRwLock::new());

                    let handles: Vec<_> = (0..threads)
                        .map(|i| {
                            let state = Arc::clone(&state);
                            std::thread::spawn(move || {
                                for j in 0..10 {
                                    let key = format!("conv_{}_{}", i, j);
                                    state.insert_conversation(
                                        key.clone(),
                                        Conversation {
                                            id: key,
                                            messages: vec!["test".to_string()],
                                        },
                                    );
                                }
                            })
                        })
                        .collect();

                    for h in handles {
                        h.join().unwrap();
                    }
                });
            },
        );
    }

    group.finish();
}

// ────────────────────────────────────────────────────────────────
// Benchmark: Engine Initialization (Sequential baseline)
// ────────────────────────────────────────────────────────────────

struct MockEngine {
    name: String,
    init_time_ms: u64,
}

impl MockEngine {
    fn init(name: &str, init_time_ms: u64) -> Self {
        std::thread::sleep(Duration::from_millis(init_time_ms));
        Self {
            name: name.to_string(),
            init_time_ms,
        }
    }
}

fn benchmark_sequential_init(c: &mut Criterion) {
    c.bench_function("init_sequential", |b| {
        b.iter(|| {
            // Simulate 10 engines with varying init times (total ~200ms)
            let engines = vec![
                MockEngine::init("security", 20),
                MockEngine::init("ia", 25),
                MockEngine::init("cognitive", 30),
                MockEngine::init("qa", 15),
                MockEngine::init("coherence", 20),
                MockEngine::init("singularity", 25),
                MockEngine::init("adaptive", 15),
                MockEngine::init("narrative", 10),
                MockEngine::init("avatar", 20),
                MockEngine::init("fusion", 20),
            ];

            black_box(engines);
        });
    });
}

// ────────────────────────────────────────────────────────────────
// Benchmark: Memory Context Loading (Sync baseline)
// ────────────────────────────────────────────────────────────────

fn simulate_memory_load_sync(conversation_id: &str) -> Vec<String> {
    // Simulate SQLite query (~50ms)
    std::thread::sleep(Duration::from_millis(50));
    vec![
        format!("memory_1_{}", conversation_id),
        format!("memory_2_{}", conversation_id),
        format!("memory_3_{}", conversation_id),
    ]
}

fn benchmark_memory_load_sync(c: &mut Criterion) {
    c.bench_function("memory_load_sync", |b| {
        b.iter(|| {
            let result = simulate_memory_load_sync(black_box("conv_123"));
            black_box(result);
        });
    });
}

fn benchmark_memory_load_batch(c: &mut Criterion) {
    let mut group = c.benchmark_group("memory_load");

    for batch_size in [1, 5, 10, 20] {
        group.bench_with_input(
            BenchmarkId::new("batch", batch_size),
            &batch_size,
            |b, &size| {
                b.iter(|| {
                    let results: Vec<_> = (0..size)
                        .map(|i| {
                            simulate_memory_load_sync(&format!("conv_{}", i))
                        })
                        .collect();
                    black_box(results);
                });
            },
        );
    }

    group.finish();
}

// ────────────────────────────────────────────────────────────────
// Benchmark: IPC Serialization
// ────────────────────────────────────────────────────────────────

use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct LargeResponse {
    messages: Vec<Message>,
    metadata: Metadata,
}

#[derive(Serialize, Deserialize)]
struct Message {
    id: String,
    content: String,
    timestamp: u64,
}

#[derive(Serialize, Deserialize)]
struct Metadata {
    total: usize,
    page: usize,
}

fn benchmark_json_serialization(c: &mut Criterion) {
    let mut group = c.benchmark_group("ipc_serialization");

    for message_count in [10, 50, 100, 500] {
        let response = LargeResponse {
            messages: (0..message_count)
                .map(|i| Message {
                    id: format!("msg_{}", i),
                    content: "This is a test message with some content that simulates a real conversation message.".to_string(),
                    timestamp: 1234567890 + i as u64,
                })
                .collect(),
            metadata: Metadata {
                total: message_count,
                page: 1,
            },
        };

        group.bench_with_input(
            BenchmarkId::new("json", message_count),
            &message_count,
            |b, _| {
                b.iter(|| {
                    let json = serde_json::to_string(&response).unwrap();
                    black_box(json);
                });
            },
        );
    }

    group.finish();
}

// ────────────────────────────────────────────────────────────────
// Criterion Configuration
// ────────────────────────────────────────────────────────────────

criterion_group!(
    benches,
    benchmark_rwlock_concurrent_reads,
    benchmark_rwlock_concurrent_writes,
    benchmark_sequential_init,
    benchmark_memory_load_sync,
    benchmark_memory_load_batch,
    benchmark_json_serialization,
);

criterion_main!(benches);
