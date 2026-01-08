# 📚 TITANE∞ - Memory Module Migration Guide
**Version:** v26.2.2 → v27.0
**Target:** Unified Memory v2 Consolidation
**Phase:** 1 (Quick Wins)
**Estimated Effort:** 8-12 hours

---

## 🎯 OBJECTIF

Consolider tous les modules mémoire vers `unified_memory_v2`, éliminant 4 modules dépréciés et simplifiant l'architecture.

### Avant Migration
```
6 Memory Modules:
├── unified_memory_v2/   ✅ Target (consolidated)
├── memory/              ⚠️ Partial deprecation
├── memory_os/           ⚠️ → unified_memory_v2
├── memory_evolution/    ⚠️ → neural_memory
├── memory_compactor/    ⚠️ → unified_memory_v2
└── memory_persistence/  ⚠️ → unified_memory_v2
```

### Après Migration
```
2 Memory Modules:
├── unified_memory_v2/   ✅ All functionality consolidated
└── neural_memory/       ✅ Evolution-specific (private)
```

**Impact:** 6 → 2 modules (-66%), architecture clarifiée

---

## 📋 PRÉ-REQUIS

### 1. Vérifier l'État Actuel
```bash
# Run analyzer script
./scripts/analyze-memory-migration.sh
```

### 2. Backup
```bash
# Create backup branch
git checkout -b backup-before-memory-migration
git push origin backup-before-memory-migration

# Return to main branch
git checkout main
git checkout -b feature/memory-consolidation-v2
```

### 3. Documentation
```bash
# Read unified_memory_v2 API docs
rustdoc --open src-tauri/src/unified_memory_v2/lib.rs
```

---

## 🔄 MIGRATION PATH

### Module 1: memory_os/ → unified_memory_v2/

#### Current API (memory_os)
```rust
use crate::memory_os::{MemoryOS, MemoryEntry};

// Store memory
memory_os.store("key", data).await?;

// Retrieve memory
let data = memory_os.get("key").await?;

// List memories
let all = memory_os.list().await?;
```

#### New API (unified_memory_v2)
```rust
use crate::unified_memory_v2::{UnifiedMemory, MemoryEntry};

// Store memory
unified_memory.store("key", data).await?;

// Retrieve memory
let data = unified_memory.retrieve("key").await?;

// List memories
let all = unified_memory.list_all().await?;
```

#### Migration Steps
```
1. Find all files importing memory_os
   → grep -r "use.*memory_os" src-tauri/src --include="*.rs"

2. For each file:
   a. Update import: memory_os → unified_memory_v2
   b. Update method calls:
      - store() → store() (same)
      - get() → retrieve()
      - list() → list_all()
   c. Update types if needed
   d. Compile & test

3. Once all files migrated:
   a. Comment out pub mod memory_os in lib.rs
   b. Run cargo check
   c. Fix any remaining references
   d. Archive module
```

---

### Module 2: memory_compactor/ → unified_memory_v2/

#### Current API (memory_compactor)
```rust
use crate::memory_compactor::MemoryCompactor;

// Compact memories
let compactor = MemoryCompactor::new();
compactor.compact().await?;

// Get stats
let stats = compactor.stats().await?;
```

#### New API (unified_memory_v2)
```rust
use crate::unified_memory_v2::UnifiedMemory;

// Consolidate (new name for compact)
unified_memory.consolidate().await?;

// Get consolidation stats
let stats = unified_memory.consolidation_stats().await?;
```

#### Migration Steps
```
1. Find all memory_compactor usages
2. Map to unified_memory_v2::consolidate()
3. Update method names
4. Test consolidation logic
5. Archive module
```

---

### Module 3: memory_persistence/ → unified_memory_v2/

#### Current API (memory_persistence)
```rust
use crate::memory_persistence::MemoryPersistence;

// Save to disk
persistence.save("path").await?;

// Load from disk
persistence.load("path").await?;
```

#### New API (unified_memory_v2)
```rust
use crate::unified_memory_v2::UnifiedMemory;

// Persistence is automatic in unified_memory_v2
// But can be triggered manually:
unified_memory.persist().await?;

// Load is automatic on init, but can reload:
unified_memory.reload().await?;
```

#### Migration Steps
```
1. Find all memory_persistence usages
2. Most calls can be removed (auto-persist)
3. Manual saves → persist()
4. Manual loads → reload()
5. Test persistence workflow
6. Archive module
```

---

### Module 4: memory_evolution/ → neural_memory/

#### Current API (memory_evolution)
```rust
use crate::memory_evolution::MemoryEvolution;

// Evolve memories
let evolution = MemoryEvolution::new();
evolution.evolve().await?;
```

#### New API (neural_memory - via unified_memory_v2)
```rust
use crate::unified_memory_v2::UnifiedMemory;

// Evolution is now part of neural_memory subsystem
// Accessed via unified_memory_v2
unified_memory.neural().evolve().await?;
```

#### Migration Steps
```
1. Find all memory_evolution usages
2. Map to unified_memory_v2.neural().evolve()
3. Note: neural_memory is private, accessed via unified_memory_v2
4. Test evolution logic
5. Archive memory_evolution module
```

---

## 🧪 TESTING STRATEGY

### Unit Tests
```rust
#[cfg(test)]
mod memory_migration_tests {
    use super::*;

    #[tokio::test]
    async fn test_unified_memory_basic_ops() {
        let mem = UnifiedMemory::new().await.unwrap();

        // Store
        mem.store("test_key", "test_value").await.unwrap();

        // Retrieve
        let value = mem.retrieve("test_key").await.unwrap();
        assert_eq!(value, Some("test_value".to_string()));

        // List
        let all = mem.list_all().await.unwrap();
        assert!(all.contains(&"test_key".to_string()));
    }

    #[tokio::test]
    async fn test_consolidation() {
        let mem = UnifiedMemory::new().await.unwrap();

        // Add multiple entries
        for i in 0..10 {
            mem.store(&format!("key_{}", i), &format!("value_{}", i))
                .await
                .unwrap();
        }

        // Consolidate
        let stats = mem.consolidate().await.unwrap();
        assert!(stats.entries_processed > 0);
    }

    #[tokio::test]
    async fn test_persistence() {
        let mem = UnifiedMemory::new().await.unwrap();

        mem.store("persist_test", "data").await.unwrap();

        // Persist
        mem.persist().await.unwrap();

        // Create new instance (should load)
        let mem2 = UnifiedMemory::new().await.unwrap();
        let value = mem2.retrieve("persist_test").await.unwrap();
        assert_eq!(value, Some("data".to_string()));
    }
}
```

### Integration Tests
```bash
# Run full test suite
cargo test --package titane-infinity --lib unified_memory_v2

# Run specific test
cargo test test_unified_memory_basic_ops

# Run with output
cargo test -- --nocapture
```

---

## 📊 PROGRESS TRACKING

### Checklist

#### Phase 1.1: memory_os Migration
```
□ Run analyzer script
□ List all import locations
□ Update imports (memory_os → unified_memory_v2)
□ Update method calls (get → retrieve, list → list_all)
□ Test each file after migration
□ Comment out pub mod memory_os
□ Run cargo check
□ Fix compilation errors
□ Run tests
□ Archive module
```

#### Phase 1.2: memory_compactor Migration
```
□ List all usages
□ Map compact() → consolidate()
□ Update all call sites
□ Test consolidation workflow
□ Comment out pub mod memory_compactor
□ Run cargo check
□ Run tests
□ Archive module
```

#### Phase 1.3: memory_persistence Migration
```
□ List all usages
□ Remove auto-persisted calls
□ Map save() → persist()
□ Map load() → reload()
□ Test persistence workflow
□ Comment out pub mod memory_persistence
□ Run cargo check
□ Run tests
□ Archive module
```

#### Phase 1.4: memory_evolution Migration
```
□ List all usages
□ Map to unified_memory_v2.neural().evolve()
□ Update all call sites
□ Test evolution workflow
□ Comment out pub mod memory_evolution
□ Run cargo check
□ Run tests
□ Archive module
```

#### Phase 1.5: Final Verification
```
□ All deprecated modules commented out
□ All tests passing
□ No compilation warnings
□ Documentation updated
□ Archive deprecated code
□ Commit migration
```

---

## 🚨 TROUBLESHOOTING

### Issue 1: Compilation Errors After Import Update
**Symptom:** `error: failed to resolve: use of undeclared type`

**Solution:**
```rust
// Make sure unified_memory_v2 is public in lib.rs
pub mod unified_memory_v2;

// Import correctly
use crate::unified_memory_v2::UnifiedMemory;
```

### Issue 2: Method Not Found
**Symptom:** `error: no method named 'get' found for type 'UnifiedMemory'`

**Solution:**
```rust
// Old API
let data = memory.get("key").await?;

// New API
let data = memory.retrieve("key").await?;
```

### Issue 3: Tests Failing
**Symptom:** Tests pass individually but fail together

**Solution:**
```rust
// Ensure proper cleanup in tests
#[tokio::test]
async fn test_something() {
    let mem = UnifiedMemory::new().await.unwrap();

    // ... test logic ...

    // Cleanup
    mem.clear().await.unwrap();
}
```

---

## 📈 SUCCESS METRICS

### Before Migration
```
Memory Modules:          6
Lines of Code:           ~5,000 (estimated)
Import Count:            ~50+ (estimated)
Maintenance Complexity:  HIGH
```

### After Migration
```
Memory Modules:          2 (-66%)
Lines of Code:           ~3,000 (-40%)
Import Count:            ~50 (same, but unified)
Maintenance Complexity:  LOW
```

### Benefits
```
✅ Clearer architecture
✅ Single source of truth
✅ Easier maintenance
✅ Better testability
✅ Reduced cognitive load
```

---

## 🎯 NEXT STEPS AFTER MIGRATION

1. **Update Documentation**
   ```bash
   # Generate new API docs
   cargo doc --no-deps --open

   # Update architecture diagrams
   # Update README
   ```

2. **Create Migration PR**
   ```bash
   git add .
   git commit -m "feat: consolidate memory modules to unified_memory_v2

   - Migrate memory_os → unified_memory_v2
   - Migrate memory_compactor → consolidated
   - Migrate memory_persistence → auto-persist
   - Migrate memory_evolution → neural_memory
   - Archive deprecated modules
   - Update all tests

   BREAKING CHANGE: Memory API consolidated
   Closes #XXX"

   git push origin feature/memory-consolidation-v2
   ```

3. **Review & Merge**
   - Create PR
   - Request reviews
   - Address feedback
   - Merge to main

4. **Archive Deprecated Code**
   ```bash
   mkdir -p archive/deprecated-v26
   mv src-tauri/src/memory_os archive/deprecated-v26/
   mv src-tauri/src/memory_compactor archive/deprecated-v26/
   mv src-tauri/src/memory_persistence archive/deprecated-v26/
   mv src-tauri/src/memory_evolution archive/deprecated-v26/
   ```

---

## 📚 ADDITIONAL RESOURCES

### Unified Memory v2 API Reference
```rust
pub struct UnifiedMemory {
    // Internal implementation
}

impl UnifiedMemory {
    // Core operations
    pub async fn new() -> Result<Self, TitaneError>;
    pub async fn store(&self, key: &str, value: &str) -> Result<(), TitaneError>;
    pub async fn retrieve(&self, key: &str) -> Result<Option<String>, TitaneError>;
    pub async fn list_all(&self) -> Result<Vec<String>, TitaneError>;
    pub async fn delete(&self, key: &str) -> Result<(), TitaneError>;

    // Consolidation
    pub async fn consolidate(&self) -> Result<ConsolidationStats, TitaneError>;
    pub async fn consolidation_stats(&self) -> Result<ConsolidationStats, TitaneError>;

    // Persistence
    pub async fn persist(&self) -> Result<(), TitaneError>;
    pub async fn reload(&self) -> Result<(), TitaneError>;

    // Neural/Evolution access
    pub fn neural(&self) -> &NeuralMemory;

    // Utilities
    pub async fn clear(&self) -> Result<(), TitaneError>;
    pub async fn count(&self) -> Result<usize, TitaneError>;
}
```

### Reference Implementations
See `src-tauri/src/unified_memory_v2/examples/` for complete examples.

---

## 🎊 CONCLUSION

Cette migration consolide 6 modules mémoire en 2, simplifiant massivement l'architecture et réduisant la complexité de maintenance de 66%.

**Estimated Time:** 8-12 hours
**Impact:** HIGH (architecture clarity)
**Priority:** Phase 1 (Quick Wins)
**Status:** Ready to Execute

**Good luck with the migration!** 🚀

---

**Guide Created:** 2026-01-07
**Version:** v1.0
**For:** TITANE∞ v26.2.2 → v27.0
**Phase:** 1.1-1.4 (Memory Consolidation)
