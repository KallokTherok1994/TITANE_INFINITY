# Memory System Migration Guide

**Status:** Phase 2.3 Complete (Compatibility Layer Active)  
**Version:** v24.2.0  
**Date:** 2025-12-10

---

## Quick Migration

### Before (v19.5.2)

```rust
use crate::memory_os::{MemoryOSBridge, MemoryOSBridgeConfig};
let bridge = MemoryOSBridge::new(config);
bridge.store(entry).await?;
```

### After (v24.2.0)

```rust
use crate::unified_memory_v2::{UnifiedMemoryV2, MemoryConfig};
let memory = UnifiedMemoryV2::new(MemoryConfig::default());
memory.init().await?;
memory.store("content", 0.8, MemoryType::Conversation).await?;
```

---

## Compatibility Layer

For **gradual migration**, compatibility types are available:

```rust
use crate::unified_memory_v2::{MemoryBridge, MemoryVectorSearchResult};

// MemoryBridge is a type alias for UnifiedMemoryV2
// MemoryVectorSearchResult is re-exported from neural_memory
```

---

## Module Mapping

| Legacy Module           | Replacement                             | Status                    |
| ----------------------- | --------------------------------------- | ------------------------- |
| `memory_os/`            | `unified_memory_v2` + `neural_memory`   | ⚠️ DEPRECATED             |
| `memory_evolution/`     | `neural_memory/evolution.rs`            | ⚠️ DEPRECATED             |
| `memory_persistence.rs` | `unified_memory_v2/persistence.rs`      | ⚠️ DEPRECATED             |
| `memory_compactor.rs`   | `neural_memory/consolidation.rs`        | ⚠️ DEPRECATED             |
| `memory/`               | `unified_memory_v2` (for system memory) | ⚠️ DEPRECATED (partially) |

**Note:** `memory/` conversation storage (`Conversation`, `MessageRole`) remains for chat history but is separate from the neural memory system.

---

## API Equivalence

| Legacy API                   | New API                      | Notes                      |
| ---------------------------- | ---------------------------- | -------------------------- |
| `MemoryOSBridge::new()`      | `UnifiedMemoryV2::new()`     | Config structure changed   |
| `bridge.store()`             | `memory.store()`             | Simplified parameters      |
| `bridge.recall()`            | `memory.recall()`            | Same interface             |
| `bridge.search()`            | `memory.search()`            | Enhanced with tier filters |
| `MemoryCompactor::compact()` | `memory.consolidate()`       | Auto-promotion STM→MTM→LTM |
| `VectorStore::search()`      | `memory.search()` (semantic) | Integrated into main API   |

---

## Migration Timeline

- ✅ **Phase 2.1** (2025-12-10): Architecture created
- ✅ **Phase 2.2** (2025-12-10): Code migrated (-70% LOC)
- ✅ **Phase 2.3** (2025-12-10): Compatibility layer active
- ⏳ **Phase 2.4** (Next): Full integration tests
- ⏳ **Phase 2.5** (Future): Deprecation warnings enforced
- ⏳ **Phase 3.0** (Future): Legacy modules removed

---

## Questions?

See: `MEMORY_MIGRATION_v24.2_PHASE2.md` for full details.
