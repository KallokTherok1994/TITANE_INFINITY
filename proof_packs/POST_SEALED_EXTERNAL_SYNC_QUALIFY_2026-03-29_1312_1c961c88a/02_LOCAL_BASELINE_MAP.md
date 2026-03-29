# 02_LOCAL_BASELINE_MAP

## Local LTM Architecture
UnifiedMemory (STM→MTM→LTM) with disk persistence.

### STM (Short-Term Memory)
- VecDeque, max 100 items, 1h retention
- In-memory, O(1) push/pop

### MTM (Medium-Term Memory)
- Vec, max 500 items, 7d retention
- In-memory

### LTM (Long-Term Memory)
- Disk: JSON .mem files at unified_memory/ltm/
- Index: HashMap<MemoryId, MemoryMetadata>
- Restored on init via restore_ltm_from_disk()

### Persistent Memory Bridge
- load_persistent_entries() from persistent_memory v19 intermediate/entries.json
- One-time load per process (AtomicBool guard)

## Test Results
```
cargo test --lib -- unified_memory
test result: ok. 69 passed; 0 failed; 0 ignored; 0 measured; 4413 filtered out
```

## Baseline Status
**INTACT** — no regression. All 69 tests pass.

## Not Reopening
This proof is sealed. Local LTM is not in scope for this cycle.
