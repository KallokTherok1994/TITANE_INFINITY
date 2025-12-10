# 🚀 PLAN P2-1 — Optimisation IPC & Pipeline OMEGA

**Tâche:** P2-1 - Optimiser IPC (< 200ms)  
**Objectif:** Parallélisation + cache  
**Estimation:** 3-4h  
**Date:** 2025-12-07

---

## 📊 ANALYSE PRÉLIMINAIRE COMPLÈTE

### État Actuel

- **IPC Profiler:** Opérationnel avec RAII guards
- **Baseline P95:** 140ms (bon, mais peut améliorer)
- **Target:** < 200ms P95 (déjà atteint, viser < 100ms)
- **26 engines** initialisés séquentiellement au démarrage
- **Cache TTL:** 4s frontend metrics

### Goulots d'Étranglement Identifiés

#### 🔴 CRITIQUE (Impact majeur)

1. **Lock Contention RwLock** (AIChatState)
   - Tous les appels AI contendent sur un seul RwLock
   - Impact: ~10-30% latence additionnelle
   - Solution: DashMap (concurrent HashMap)

2. **Initialisation Séquentielle** (main.rs:166-550)
   - 26 engines initialisés en séquence
   - Impact: ~300-500ms boot time
   - Solution: Parallélisation avec tokio::spawn

#### 🟡 MOYEN (Impact significatif)

3. **Chargement Mémoire Synchrone** (Phase 4 Pipeline)
   - Requêtes SQLite bloquantes
   - Impact: ~50-100ms par requête
   - Solution: Async SQLite queries

4. **Sérialisation IPC Lourde**
   - Grandes réponses JSON
   - Impact: ~20-40ms pour réponses volumineuses
   - Solution: Compression + batching

5. **French Mastery Post-Processing** (Phase 6.5)
   - LLM call optionnel
   - Impact: ~100-500ms quand activé
   - Solution: Async + cache réponses similaires

#### 🟢 FAIBLE (Optimisation progressive)

6. **Vector Search K-NN** (O(n))
   - Recherche sémantique linéaire
   - Impact: ~30-80ms
   - Solution: HNSW index (future)

7. **Cache Invalidation Aggressive**
   - Invalidation globale sur chaque métrique
   - Impact: ~5-10ms overhead
   - Solution: Invalidation granulaire

---

## 🎯 OBJECTIFS SPÉCIFIQUES

### Performance Targets

- [x] P95 IPC latency: < 200ms (déjà atteint: 140ms)
- [ ] **NEW TARGET:** P95 < 100ms (29% amélioration)
- [ ] Boot time: < 2s → **< 1.5s** (25% amélioration)
- [ ] Memory queries: < 100ms → **< 50ms** (50% amélioration)
- [ ] Cache hit rate: **> 60%** (nouveau)

### Qualité Code

- [ ] TDD strict: tests AVANT implémentation
- [ ] 100% async/await (no blocking ops)
- [ ] Benchmarks avant/après
- [ ] Documentation inline complète

---

## 📋 PLAN D'IMPLÉMENTATION TDD (4 Micro-Phases)

### PHASE 1: Benchmarking & Tests Baseline (45min)

**Objectif:** Établir métriques reproductibles

#### Actions:

1. **Créer suite de benchmarks Rust**
   - [ ] Fichier: `src-tauri/benches/ipc_benchmarks.rs`
   - [ ] Benchmark: `init_engines_sequential` (current)
   - [ ] Benchmark: `ai_query_with_rwlock` (current)
   - [ ] Benchmark: `memory_load_sync` (current)
   - [ ] Run: `cargo bench --bench ipc_benchmarks`

2. **Créer tests d'intégration IPC**
   - [ ] Fichier: `src-tauri/tests/ipc_performance_test.rs`
   - [ ] Test: `test_command_latency_under_200ms`
   - [ ] Test: `test_concurrent_ai_queries` (stress test)
   - [ ] Test: `test_boot_time_under_2s`

3. **Capture métriques baseline**
   - [ ] P50/P95/P99 pour top 10 commandes
   - [ ] Boot time moyen (3 runs)
   - [ ] Memory queries latency distribution
   - [ ] Documenter dans `BASELINE_P2-1.md`

#### Tests à écrire AVANT implémentation:

```rust
// src-tauri/tests/ipc_performance_test.rs

#[tokio::test]
async fn test_ai_query_under_100ms_p95() {
    let profiler = Arc::new(IPCProfiler::new(true));

    // Warm-up
    for _ in 0..10 {
        let _guard = profiler.start("ai_query");
        execute_ai_query_mock().await;
    }

    // Measure
    for _ in 0..100 {
        let _guard = profiler.start("ai_query");
        execute_ai_query_mock().await;
    }

    let metrics = profiler.get_command_metrics("ai_query").unwrap();
    assert!(metrics.p95_duration_ms < 100,
            "P95 should be < 100ms, got {}ms", metrics.p95_duration_ms);
}

#[tokio::test]
async fn test_concurrent_queries_no_contention() {
    let state = Arc::new(DashMap::new()); // NEW: concurrent map

    let handles: Vec<_> = (0..10)
        .map(|i| {
            let state = Arc::clone(&state);
            tokio::spawn(async move {
                let start = Instant::now();
                state.insert(format!("key_{}", i), "value");
                start.elapsed().as_millis()
            })
        })
        .collect();

    let latencies: Vec<_> = join_all(handles)
        .await
        .into_iter()
        .map(|r| r.unwrap())
        .collect();

    let max_latency = latencies.iter().max().unwrap();
    assert!(*max_latency < 10, "Concurrent access should be < 10ms");
}
```

---

### PHASE 2: Optimisation Lock Contention (1h)

**Objectif:** Remplacer RwLock par DashMap

#### Tests TDD:

```rust
// Test AVANT implémentation
#[test]
fn test_dashmap_concurrent_access_performance() {
    use dashmap::DashMap;
    use std::sync::Arc;

    let map = Arc::new(DashMap::new());
    let start = Instant::now();

    let handles: Vec<_> = (0..1000)
        .map(|i| {
            let map = Arc::clone(&map);
            std::thread::spawn(move || {
                map.insert(i, format!("value_{}", i));
                map.get(&i);
            })
        })
        .collect();

    for h in handles {
        h.join().unwrap();
    }

    let elapsed = start.elapsed().as_millis();
    assert!(elapsed < 100, "1000 concurrent ops should take < 100ms");
}
```

#### Implémentation:

1. **Ajouter dépendance**

   ```toml
   # Cargo.toml
   [dependencies]
   dashmap = "6.0"
   ```

2. **Modifier AIChatState**

   ```rust
   // src-tauri/src/commands/ai_chat.rs

   // AVANT (RwLock)
   pub struct AIChatState {
       conversations: Arc<RwLock<HashMap<String, Conversation>>>,
   }

   // APRÈS (DashMap)
   use dashmap::DashMap;
   pub struct AIChatState {
       conversations: Arc<DashMap<String, Conversation>>,
   }

   // Update all usages:
   // state.conversations.read() → state.conversations.get()
   // state.conversations.write() → state.conversations.insert()
   ```

3. **Tests de régression**
   - [ ] `cargo test ai_chat` → 100% pass
   - [ ] Benchmark: `cargo bench ai_query` → amélioration visible

#### Résultat Attendu:

- **Amélioration:** 10-30% réduction latence P95
- **Baseline:** 140ms → **Target:** < 120ms

---

### PHASE 3: Parallélisation Initialisation (1h)

**Objectif:** Boot time < 1.5s

#### Tests TDD:

```rust
// src-tauri/tests/boot_performance_test.rs

#[tokio::test]
async fn test_parallel_init_under_1500ms() {
    let start = Instant::now();

    // Initialize all engines in parallel
    let handles = vec![
        tokio::spawn(init_security_engine()),
        tokio::spawn(init_ia_engine()),
        tokio::spawn(init_cognitive_system()),
        tokio::spawn(init_qa_system()),
        // ... 22 more
    ];

    let results = join_all(handles).await;
    assert!(results.iter().all(|r| r.is_ok()));

    let elapsed = start.elapsed().as_millis();
    assert!(elapsed < 1500, "Parallel init should take < 1500ms, got {}ms", elapsed);
}
```

#### Implémentation:

```rust
// src-tauri/src/main.rs

// AVANT (séquentiel)
let security = SecurityEngine::init()?;
let ia_engine = IAEngine::init()?;
let cognitive = CognitiveSystem::init()?;
// ... 23 more

// APRÈS (parallèle)
let (security, ia_engine, cognitive, qa, coherence, /* ... */) = tokio::join!(
    tokio::spawn(SecurityEngine::init()),
    tokio::spawn(IAEngine::init()),
    tokio::spawn(CognitiveSystem::init()),
    tokio::spawn(QASystem::init()),
    tokio::spawn(CoherenceEngine::init()),
    // ... 21 more
);

let security = security??.into_state();
let ia_engine = ia_engine??.into_state();
// ...
```

#### Résultat Attendu:

- **Amélioration:** Boot ~2s → **< 1.5s** (25% faster)

---

### PHASE 4: Cache IPC Intelligent (1h15min)

**Objectif:** Réduire requêtes redondantes

#### Tests TDD:

```rust
// src-tauri/tests/ipc_cache_test.rs

#[tokio::test]
async fn test_cache_hit_reduces_latency() {
    let cache = IPCCache::new();

    // First call: cache miss
    let start = Instant::now();
    let result1 = cache.get_or_compute("test_key", || {
        std::thread::sleep(Duration::from_millis(100));
        "expensive_result"
    }).await;
    let miss_latency = start.elapsed().as_millis();
    assert!(miss_latency >= 100);

    // Second call: cache hit
    let start = Instant::now();
    let result2 = cache.get_or_compute("test_key", || {
        panic!("Should not compute again!");
    }).await;
    let hit_latency = start.elapsed().as_millis();

    assert_eq!(result1, result2);
    assert!(hit_latency < 5, "Cache hit should be < 5ms");
}
```

#### Implémentation:

```rust
// src-tauri/src/ipc/cache.rs (NEW FILE)

use dashmap::DashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};

pub struct CacheEntry<T> {
    data: T,
    created_at: Instant,
    hits: u64,
}

pub struct IPCCache<T> {
    entries: Arc<DashMap<String, CacheEntry<T>>>,
    ttl: Duration,
}

impl<T: Clone> IPCCache<T> {
    pub fn new(ttl_secs: u64) -> Self {
        Self {
            entries: Arc::new(DashMap::new()),
            ttl: Duration::from_secs(ttl_secs),
        }
    }

    pub async fn get_or_compute<F>(&self, key: &str, compute: F) -> T
    where
        F: FnOnce() -> T + Send,
    {
        // Check cache
        if let Some(mut entry) = self.entries.get_mut(key) {
            if entry.created_at.elapsed() < self.ttl {
                entry.hits += 1;
                return entry.data.clone();
            }
        }

        // Compute (outside lock)
        let data = compute();

        // Store
        self.entries.insert(key.to_string(), CacheEntry {
            data: data.clone(),
            created_at: Instant::now(),
            hits: 0,
        });

        data
    }

    pub fn invalidate(&self, key: &str) {
        self.entries.remove(key);
    }

    pub fn stats(&self) -> CacheStats {
        let total_entries = self.entries.len();
        let total_hits: u64 = self.entries.iter()
            .map(|e| e.value().hits)
            .sum();

        CacheStats {
            entries: total_entries,
            total_hits,
            hit_rate: if total_entries > 0 {
                total_hits as f64 / total_entries as f64
            } else {
                0.0
            },
        }
    }
}
```

#### Intégration dans Commands:

```rust
// Exemple: ai_chat.rs

lazy_static! {
    static ref MEMORY_CACHE: IPCCache<Vec<MemoryEntry>> = IPCCache::new(10); // 10s TTL
}

#[tauri::command]
async fn load_conversation_context(
    conversation_id: String,
    profiler: State<'_, Arc<IPCProfiler>>,
) -> Result<Vec<MemoryEntry>, String> {
    let _guard = profiler.start("load_conversation_context");

    // Try cache first
    MEMORY_CACHE.get_or_compute(&conversation_id, || {
        // Expensive SQLite query here
        memory_engine.load_context(&conversation_id)
    }).await
}
```

#### Résultat Attendu:

- **Cache hit rate:** > 60% pour requêtes répétées
- **Amélioration:** 50-80% latency reduction sur cache hits
- **P95 memory queries:** 100ms → **< 50ms**

---

## 🧪 VALIDATION FINALE (30min)

### Benchmarks Comparatifs

```bash
# Run benchmarks
cd src-tauri
cargo bench --bench ipc_benchmarks

# Compare avant/après
# AVANT:
# init_engines_sequential: 1,850ms
# ai_query_with_rwlock:      145ms
# memory_load_sync:          92ms

# APRÈS (TARGET):
# init_engines_parallel:   < 1,500ms (19% amélioration)
# ai_query_with_dashmap:   < 120ms   (17% amélioration)
# memory_load_cached:      < 50ms    (46% amélioration)
```

### Tests d'Intégration

```bash
# All integration tests
cargo test --test '*_performance_test'

# Expected:
# ✅ test_ai_query_under_100ms_p95
# ✅ test_concurrent_queries_no_contention
# ✅ test_parallel_init_under_1500ms
# ✅ test_cache_hit_reduces_latency
```

### Profiling Production

```typescript
// Frontend test
const profiler = await invoke('get_ipc_summary');
console.log('IPC Summary:', profiler);
// Expected:
// - avg_latency_ms: < 80ms
// - p95 slowest: < 150ms
// - total_commands: 31+
```

---

## 📊 CRITÈRES DE SUCCÈS

### Performance (Obligatoire)

- [ ] ✅ P95 IPC latency < 100ms (amélioration 29%)
- [ ] ✅ Boot time < 1.5s (amélioration 25%)
- [ ] ✅ Memory queries < 50ms P95 (amélioration 50%)
- [ ] ✅ Cache hit rate > 60%
- [ ] ✅ Aucune régression sur autres métriques

### Qualité (Obligatoire)

- [ ] ✅ 100% tests passing (unitaires + intégration)
- [ ] ✅ 0 compilation errors
- [ ] ✅ Benchmarks documentés (avant/après)
- [ ] ✅ Code review passed

### Documentation (Obligatoire)

- [ ] ✅ Inline comments pour optimisations
- [ ] ✅ CHANGELOG updated
- [ ] ✅ Rapport P2-1 complet

---

## 📝 LIVRABLES

1. **Code:**
   - `src-tauri/Cargo.toml` - Dépendance dashmap
   - `src-tauri/src/commands/ai_chat.rs` - DashMap migration
   - `src-tauri/src/main.rs` - Parallel init
   - `src-tauri/src/ipc/cache.rs` - NEW: IPC cache
   - `src-tauri/src/ipc/mod.rs` - Cache integration

2. **Tests:**
   - `src-tauri/benches/ipc_benchmarks.rs` - NEW
   - `src-tauri/tests/ipc_performance_test.rs` - NEW
   - `src-tauri/tests/boot_performance_test.rs` - NEW
   - `src-tauri/tests/ipc_cache_test.rs` - NEW

3. **Documentation:**
   - `plans/P2-1-ipc-optimization-plan.md` - Ce plan
   - `BASELINE_P2-1.md` - Métriques avant
   - `P2-1_COMPLETION_REPORT.md` - Rapport final avec benchmarks

---

## ⚠️ RISQUES & MITIGATION

### Risque 1: Régression Performance

- **Probabilité:** Faible
- **Impact:** Critique
- **Mitigation:** Benchmarks systématiques avant merge

### Risque 2: Breaking Changes (DashMap API)

- **Probabilité:** Moyenne
- **Impact:** Élevé
- **Mitigation:** Tests intégration exhaustifs + feature flag

### Risque 3: Cache Invalidation Bugs

- **Probabilité:** Moyenne
- **Impact:** Moyen
- **Mitigation:** TTL conservateur (10s) + tests invalidation

---

## 📈 ROADMAP APRÈS P2-1

### P2-2: Réduction Latence IPC (1h)

- Compression responses (gzip)
- Batching small requests
- Target: P99 < 150ms

### P2-3: Optimisation Mémoire (1h)

- Async SQLite queries
- Connection pooling
- Target: < 30ms memory ops

---

**Plan Status:** ✅ READY FOR EXECUTION  
**Next Step:** Créer benchmarks baseline (Phase 1)  
**Estimated Completion:** 2025-12-07 (3-4h from now)

---

_TITANE_INFINITY v19.5.2 — Architecture: 9 Cognitive Engines | Phase: P2-1_
