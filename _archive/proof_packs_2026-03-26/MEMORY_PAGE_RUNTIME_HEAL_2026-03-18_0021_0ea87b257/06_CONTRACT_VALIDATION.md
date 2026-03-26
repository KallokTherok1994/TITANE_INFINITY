# CONTRACT VALIDATION

## TS → Rust Contract Check

### persistent_memory_read

**TS caller (usePersistentMemory.ts)**:
```typescript
const request: MemoryReadRequest = {
  levels, topics, currentMode: modeId,
  projectId, includeSummaries: true, limit: 500
};
const response = await tauriClient.persistentMemoryRead({ request }) as MemoryReadResponse;
```

**Rust handler (persistent_memory.rs)**:
```rust
#[tauri::command]
pub fn persistent_memory_read(request: MemoryReadRequest, ...) -> Result<MemoryReadResponse, String>
```

**Contract**: `{ request: MemoryReadRequest }` → `MemoryReadResponse { entries, summaries, total_count }`
**Status**: PASS — no drift detected. Both sides use identical snake_case field names via serde.

---

### persistent_memory_get_bundles

**TS caller**:
```typescript
const bundles = await tauriClient.persistentMemoryGetBundles() as MemoryBundle[];
```

**Rust handler**:
```rust
#[tauri::command]
pub fn persistent_memory_get_bundles(...) -> Result<Vec<MemoryBundle>, String>
```

**Contract**: `{}` → `MemoryBundle[]`
**Status**: PASS — no drift detected.

---

### persistent_memory_get_stats

**TS caller**:
```typescript
const stats = await tauriClient.persistentMemoryGetStats() as MemoryStats;
```

**Rust handler**:
```rust
#[tauri::command]
pub fn persistent_memory_get_stats(...) -> Result<MemoryStats, String>
```

**Status**: PASS — already whitelisted (pre-existing). No drift.

---

## Verdict: G_MEMORY_CONTRACT_VALIDATED = PASS
No TS↔Rust contract drift. The only issue was the whitelist gate — not a type/shape mismatch.
