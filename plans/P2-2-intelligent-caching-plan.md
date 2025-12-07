# 📋 PLAN P2-2 — Intelligent Caching System

**Date:** 2025-12-07  
**Task:** P2-2 - Caching intelligent (LRU + persistent)  
**Estimation:** 2-3h  
**Approche:** TDD strict (tests AVANT implémentation)

---

## 🎯 OBJECTIF

Implémenter un système de cache intelligent pour réduire la latence IPC en évitant les appels redondants.

**Targets:**
- Cache hit rate > 60%
- Cache lookup < 1µs
- LRU eviction automatique
- Persistance optionnelle (reload après restart)

---

## 📊 ANALYSE BESOINS

### Commandes IPC Identifiées
**Total:** ~161 commandes Tauri sur 20 fichiers

**Catégories Hot Paths (candidates cache):**
1. **State queries** (frequent, read-only)
   - `get_system_health` - Health checks (1s refresh)
   - `get_cognitive_state` - Cognitive state (5s refresh)
   - `get_all_configs` - Config read (rare changes)

2. **Memory queries** (moderate, expensive)
   - `memory_search` - Search queries (répétitives)
   - `get_conversation_context` - Context retrieval
   - `recall_memory` - Memory recall

3. **Engine status** (frequent, stable)
   - `get_engine_status` - Engine health
   - `get_metrics` - Performance metrics

### Patterns de Cache

**Cache Idéal:**
- **TTL court (1-5s):** State queries, health checks
- **TTL moyen (30s-1min):** Memory queries
- **TTL long (5-10min):** Configs, static data
- **No cache:** Mutations (send_message, update_config)

---

## 🏗️ ARCHITECTURE

### Structure Cache

```rust
// src-tauri/src/cache/mod.rs
pub struct IntelligentCache {
    /// DashMap for lock-free concurrent access
    data: Arc<DashMap<CacheKey, CacheEntry>>,
    /// LRU tracker (lightweight)
    lru: Arc<DashMap<CacheKey, Instant>>,
    /// Config
    config: CacheConfig,
    /// Metrics
    metrics: CacheMetrics,
}

#[derive(Clone, Hash, Eq, PartialEq)]
pub struct CacheKey {
    command: String,
    params_hash: u64, // Hash of serde_json::Value
}

pub struct CacheEntry {
    value: serde_json::Value,
    created_at: Instant,
    ttl: Duration,
    hit_count: AtomicU64,
}

pub struct CacheConfig {
    max_entries: usize,        // Default: 1000
    default_ttl: Duration,      // Default: 5s
    enable_persistence: bool,   // Default: false
    persistence_path: Option<PathBuf>,
}

pub struct CacheMetrics {
    hits: AtomicU64,
    misses: AtomicU64,
    evictions: AtomicU64,
    total_queries: AtomicU64,
}
```

### API Public

```rust
impl IntelligentCache {
    pub fn new(config: CacheConfig) -> Self;
    
    /// Get cached value if valid (not expired)
    pub fn get<T: DeserializeOwned>(&self, key: &CacheKey) -> Option<T>;
    
    /// Set value with TTL
    pub fn set<T: Serialize>(&self, key: CacheKey, value: T, ttl: Duration);
    
    /// Invalidate key
    pub fn invalidate(&self, key: &CacheKey);
    
    /// Invalidate by command pattern
    pub fn invalidate_pattern(&self, pattern: &str);
    
    /// Clear all cache
    pub fn clear(&self);
    
    /// Get metrics
    pub fn metrics(&self) -> CacheMetrics;
    
    /// Cleanup expired entries
    pub fn cleanup_expired(&self);
    
    /// Save to disk (if persistence enabled)
    pub fn persist(&self) -> Result<(), CacheError>;
    
    /// Load from disk
    pub fn restore(&mut self) -> Result<(), CacheError>;
}
```

---

## 🧪 PHASE 1: TESTS TDD (1h)

### Test File: `src-tauri/tests/intelligent_cache_test.rs`

#### Test 1: Basic Cache Operations
```rust
#[tokio::test]
async fn test_cache_set_get() {
    let cache = IntelligentCache::new(CacheConfig::default());
    let key = CacheKey::new("test_command", json!({"id": 1}));
    
    cache.set(key.clone(), json!({"result": "data"}), Duration::from_secs(5));
    
    let result: serde_json::Value = cache.get(&key).unwrap();
    assert_eq!(result, json!({"result": "data"}));
}
```

#### Test 2: TTL Expiration
```rust
#[tokio::test]
async fn test_cache_expiration() {
    let cache = IntelligentCache::new(CacheConfig::default());
    let key = CacheKey::new("test", json!({}));
    
    cache.set(key.clone(), json!({"data": 1}), Duration::from_millis(100));
    
    // Immediate: should hit
    assert!(cache.get::<serde_json::Value>(&key).is_some());
    
    // After TTL: should miss
    tokio::time::sleep(Duration::from_millis(150)).await;
    assert!(cache.get::<serde_json::Value>(&key).is_none());
}
```

#### Test 3: LRU Eviction
```rust
#[tokio::test]
async fn test_lru_eviction() {
    let config = CacheConfig {
        max_entries: 3,
        ..Default::default()
    };
    let cache = IntelligentCache::new(config);
    
    // Fill cache (3 entries)
    for i in 0..3 {
        let key = CacheKey::new("cmd", json!({"id": i}));
        cache.set(key, json!({"data": i}), Duration::from_secs(60));
    }
    
    // Access entry 0 (mark as recently used)
    let key0 = CacheKey::new("cmd", json!({"id": 0}));
    cache.get::<serde_json::Value>(&key0);
    
    // Add 4th entry → should evict LRU (entry 1, not 0)
    let key3 = CacheKey::new("cmd", json!({"id": 3}));
    cache.set(key3, json!({"data": 3}), Duration::from_secs(60));
    
    let key1 = CacheKey::new("cmd", json!({"id": 1}));
    assert!(cache.get::<serde_json::Value>(&key1).is_none()); // Evicted
    assert!(cache.get::<serde_json::Value>(&key0).is_some()); // Preserved
}
```

#### Test 4: Concurrent Access
```rust
#[tokio::test]
async fn test_concurrent_cache_access() {
    let cache = Arc::new(IntelligentCache::new(CacheConfig::default()));
    
    let handles: Vec<_> = (0..16).map(|i| {
        let cache = Arc::clone(&cache);
        tokio::spawn(async move {
            for j in 0..100 {
                let key = CacheKey::new("cmd", json!({"id": (i * 100 + j) % 50}));
                cache.set(key.clone(), json!({"data": j}), Duration::from_secs(10));
                cache.get::<serde_json::Value>(&key);
            }
        })
    }).collect();
    
    for h in handles {
        h.await.unwrap();
    }
    
    // Verify no crashes, metrics consistent
    let metrics = cache.metrics();
    assert!(metrics.total_queries() > 0);
}
```

#### Test 5: Cache Metrics
```rust
#[tokio::test]
async fn test_cache_hit_rate() {
    let cache = IntelligentCache::new(CacheConfig::default());
    let key = CacheKey::new("cmd", json!({"id": 1}));
    
    // First query: miss
    assert!(cache.get::<serde_json::Value>(&key).is_none());
    
    // Set value
    cache.set(key.clone(), json!({"data": 1}), Duration::from_secs(10));
    
    // Next 10 queries: hits
    for _ in 0..10 {
        assert!(cache.get::<serde_json::Value>(&key).is_some());
    }
    
    let metrics = cache.metrics();
    assert_eq!(metrics.hits(), 10);
    assert_eq!(metrics.misses(), 1);
    assert_eq!(metrics.hit_rate(), 0.909); // ~91%
}
```

#### Test 6: Pattern Invalidation
```rust
#[tokio::test]
async fn test_invalidate_pattern() {
    let cache = IntelligentCache::new(CacheConfig::default());
    
    // Add multiple entries
    for i in 0..5 {
        let key = CacheKey::new(&format!("get_user_{}", i), json!({}));
        cache.set(key, json!({"user": i}), Duration::from_secs(60));
    }
    
    // Invalidate all "get_user_*"
    cache.invalidate_pattern("get_user_");
    
    // All should miss
    for i in 0..5 {
        let key = CacheKey::new(&format!("get_user_{}", i), json!({}));
        assert!(cache.get::<serde_json::Value>(&key).is_none());
    }
}
```

#### Test 7: Persistence (Optional)
```rust
#[tokio::test]
async fn test_cache_persistence() {
    let temp_path = "/tmp/titane_cache_test.db";
    
    let config = CacheConfig {
        enable_persistence: true,
        persistence_path: Some(PathBuf::from(temp_path)),
        ..Default::default()
    };
    
    // Create cache, add data, persist
    {
        let cache = IntelligentCache::new(config.clone());
        let key = CacheKey::new("cmd", json!({"id": 1}));
        cache.set(key, json!({"data": "test"}), Duration::from_secs(3600));
        cache.persist().unwrap();
    }
    
    // Create new cache, restore
    {
        let mut cache = IntelligentCache::new(config);
        cache.restore().unwrap();
        
        let key = CacheKey::new("cmd", json!({"id": 1}));
        let value: serde_json::Value = cache.get(&key).unwrap();
        assert_eq!(value, json!({"data": "test"}));
    }
    
    // Cleanup
    std::fs::remove_file(temp_path).ok();
}
```

**Tests Total:** 7 tests (baseline + persistence)

---

## 🛠️ PHASE 2: IMPLÉMENTATION (1h30)

### 2.1 - Core Cache (30min)

**Fichier:** `src-tauri/src/cache/mod.rs`

**Implémentation:**
1. Struct `IntelligentCache` avec DashMap
2. `new()`, `get()`, `set()`, `invalidate()`
3. TTL validation dans `get()`
4. Metrics atomiques (hits, misses)

### 2.2 - LRU Eviction (30min)

**Implémentation:**
1. `lru: DashMap<CacheKey, Instant>` tracker
2. Update LRU on `get()` (touch)
3. Evict oldest on `set()` when `len() >= max_entries`
4. Helper `find_lru()` → iterate lru, find min timestamp

### 2.3 - Pattern Invalidation (15min)

**Implémentation:**
1. `invalidate_pattern(pattern: &str)`
2. Iterate keys, filter by `starts_with(pattern)`
3. Remove matching entries from `data` + `lru`

### 2.4 - Persistence (15min - OPTIONAL)

**Implémentation:**
1. `persist()` → serialize DashMap to JSON → write file
2. `restore()` → read file → deserialize → populate cache
3. Filter expired entries during restore

---

## 🔗 PHASE 3: INTÉGRATION IPC (30min)

### 3.1 - Cache Middleware

**Fichier:** `src-tauri/src/cache/middleware.rs`

```rust
/// Wrapper pour Tauri commands avec cache automatique
pub async fn cached_invoke<T, F, Fut>(
    cache: &IntelligentCache,
    command: &str,
    params: &serde_json::Value,
    ttl: Duration,
    handler: F,
) -> Result<T, String>
where
    T: Serialize + DeserializeOwned,
    F: FnOnce() -> Fut,
    Fut: Future<Output = Result<T, String>>,
{
    let key = CacheKey::new(command, params.clone());
    
    // Try cache
    if let Some(cached) = cache.get::<T>(&key) {
        return Ok(cached);
    }
    
    // Miss: execute handler
    let result = handler().await?;
    
    // Store in cache
    cache.set(key, result.clone(), ttl);
    
    Ok(result)
}
```

### 3.2 - Intégration Commands

**Example:** `src-tauri/src/commands/system_health.rs`

```rust
#[tauri::command]
pub async fn get_system_health(
    state: State<'_, AIChatState>,
    cache: State<'_, IntelligentCache>,
) -> Result<SystemHealth, String> {
    cached_invoke(
        &cache,
        "get_system_health",
        &json!({}),
        Duration::from_secs(1), // 1s TTL
        || async {
            // Original logic here
            Ok(SystemHealth { /* ... */ })
        },
    ).await
}
```

---

## ✅ CRITÈRES SUCCÈS

### Tests
- [ ] 7/7 tests passent (100%)
- [ ] Cache hit rate > 60% (test simulation)
- [ ] Concurrent access safe (16 threads)
- [ ] LRU eviction correct
- [ ] TTL expiration correct
- [ ] Persistence works (optional)

### Performance
- [ ] Cache lookup < 1µs
- [ ] No lock contention (DashMap)
- [ ] Memory usage < 10MB (1000 entries)

### Integration
- [ ] 3+ commands use cache
- [ ] Middleware functional
- [ ] Metrics exposed

---

## 📦 DEPENDENCIES

```toml
# Cargo.toml
[dependencies]
dashmap = "6.0"          # Already added (P2-1)
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.35", features = ["time"] }
```

**Status:** No new dependencies needed! ✅

---

## 🚀 EXECUTION PLAN

### Étape 1: Tests (1h)
```bash
# Create test file
touch src-tauri/tests/intelligent_cache_test.rs

# Write 7 tests
# Run: cargo test --test intelligent_cache_test
```

### Étape 2: Implementation (1h30)
```bash
# Create cache module
mkdir -p src-tauri/src/cache
touch src-tauri/src/cache/mod.rs
touch src-tauri/src/cache/middleware.rs

# Implement core
# Run: cargo test --test intelligent_cache_test
```

### Étape 3: Integration (30min)
```bash
# Modify 3 command files
# Add cache to main.rs state
# Test: cargo run
```

### Étape 4: Validation
```bash
cargo test --test intelligent_cache_test  # All pass
cargo check                                # No errors
cargo clippy                              # No warnings
```

---

## 📊 IMPACT ESTIMÉ

### Performance
| Métrique | Sans Cache | Avec Cache (60% hit) | Gain |
|----------|------------|----------------------|------|
| **Avg latency** | 140ms | ~90ms | **-36%** |
| **P95 latency** | 140ms | ~100ms | **-29%** |
| **Throughput** | 1000 req/s | 1600 req/s | **+60%** |

### Calcul:
- 60% hits: 0ms (instant cache)
- 40% misses: 140ms (backend)
- Average: 0.6×0 + 0.4×140 = **56ms**
- But IPC overhead: +34ms → **~90ms total**

---

## 🎓 NOTES TECHNIQUES

### DashMap vs HashMap<RwLock>
**Why DashMap:**
- Lock-free reads (proven <1µs P2-1)
- Sharded locks (64 shards)
- Perfect for high-frequency cache lookups

### LRU Implementation
**Lightweight approach:**
- DashMap<Key, Instant> instead of complex LinkedList
- Trade-off: O(n) eviction vs O(1) (acceptable for max 1000 entries)
- Simpler, safer, no unsafe code

### Persistence Trade-off
**Pros:**
- Faster cold starts
- Preserve learned patterns

**Cons:**
- Disk I/O overhead
- Stale data risk
- Complexity

**Decision:** Implement but disable by default

---

**Plan Status:** READY FOR EXECUTION  
**Estimated Duration:** 2-3h  
**Approach:** TDD (tests FIRST, then code)

---

*TITANE_INFINITY v19.5.2 — P2-2 Intelligent Caching Plan*
