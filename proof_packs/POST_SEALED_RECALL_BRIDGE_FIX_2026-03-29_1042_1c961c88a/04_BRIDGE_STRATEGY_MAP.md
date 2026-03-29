# BRIDGE STRATEGY MAP — P1.13b

## Problem
Two isolated memory systems:
1. persistent_memory v19: writes/reads JSON files in persistent_memory/intermediate/
2. unified_memory: in-memory STM/MTM/LTM structures (empty at startup)

conversation_generate calls unified_memory.recall() which never finds persistent entries.

## Strategy chosen: Load-at-first-call (Option A)
Add a method to UnifiedMemory that loads entries from persistent_memory intermediate file, called once before the first recall in conversation_generate.

### Files changed
- `src-tauri/src/core/modules/unified_memory.rs`: +80 lines (load_persistent_entries method)
- `src-tauri/src/conversation_engine/commands.rs`: +12 lines (AtomicBool guard + load call)

### Pros
- Minimal change: 2 files, ~92 lines total
- No IPC contract changes
- No frontend changes
- No architectural redesign
- Dedup prevents duplicates
- One-time load (AtomicBool guard)
- Rollback trivial (git checkout HEAD~1 -- file1 file2)

### Cons
- Only loads intermediate entries (not session or long_term from persistent_memory)
- One-time load means new entries written after app start won't be in UnifiedMemory until restart
- But: the frontend persistentMemoryGetContext path handles real-time recall independently

### Risk: LOW
- No breaking changes
- Existing tests pass
- cargo check passes

## Alternative considered: UnifiedMemory reads persistent_memory directly on every recall
- Rejected: too much overhead, file reads on every query
- Our approach: one-time load at startup, then in-memory search

## Alternative considered: Modify persistent_memory_write_entry to also write to UnifiedMemory
- Rejected: requires persistent_memory to know about UnifiedMemory (cross-dependency)
- Our approach: UnifiedMemory pulls from persistent_memory at init (one direction only)

## Owner
Bridge: conversation_engine/commands.rs
Loader: core/modules/unified_memory.rs