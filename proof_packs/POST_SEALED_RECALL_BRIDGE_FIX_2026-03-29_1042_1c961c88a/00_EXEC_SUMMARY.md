# P1.13b — CONVERSATION_GENERATE RECALL BRIDGE FIX

## EXEC SUMMARY

**Lane**: C — APPLY_BOUNDED_RECALL_BRIDGE_FIX
**Date**: 2026-03-29 10:42
**HEAD**: 1c961c88a
**Branch**: MAIN
**Version**: 28.88.0

## Problem

`conversation_generate` calls `orchestrator.unified_memory.recall()` which searches in-memory STM/MTM/LTM structures. However:
- UnifiedMemory is initialized empty at startup
- LTM index is restored from `.mem` files (own storage), but STM/MTM are empty
- `persistent_memory_write_entry` writes to `persistent_memory/intermediate/entries.json` (separate filesystem store)
- These two systems were isolated: entries written via persistent_memory were never loaded into UnifiedMemory

## Solution (Bounded Fix)

1. **`unified_memory.rs`**: Added `load_persistent_entries(&mut self, base_path: &Path)` method
   - Reads `persistent_memory/intermediate/entries.json`
   - Converts PersistentMemoryEntry → MemoryItem (handles type mapping)
   - Loads into STM with dedup by id
   - Safe: skips corrupt/missing entries, no crash

2. **`conversation_engine/commands.rs`**: Added one-time load before recall
   - `AtomicBool` guard prevents repeated file reads
   - Resolves persistent_memory path from `AppHandle`
   - Calls `load_persistent_entries` before `unified_memory.recall()`

## Files Changed

- `src-tauri/src/core/modules/unified_memory.rs` (+80 lines)
- `src-tauri/src/conversation_engine/commands.rs` (+12 lines)

## Verification

- `cargo check` ✅ (0.28s)
- `cargo test --lib core::modules::unified_memory` ✅ (6/6 passed)
- No contract changes, no IPC changes, no frontend changes

## Rollback

```bash
git checkout HEAD~1 -- src-tauri/src/core/modules/unified_memory.rs src-tauri/src/conversation_engine/commands.rs
```

## Verdict

**RECALL_BRIDGE_BOUNDED_FIX_APPLIED**