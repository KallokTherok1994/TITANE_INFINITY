# P1.13c — ROLLBACK PLAN

## Rollback Command

```bash
git checkout HEAD~1 -- src-tauri/src/core/modules/unified_memory.rs src-tauri/src/conversation_engine/commands.rs
```

## What Gets Reverted

1. `load_persistent_entries()` method removed from unified_memory.rs
2. `PERSISTENT_MEMORY_LOADED` AtomicBool guard removed from commands.rs
3. One-time load call before recall removed from conversation_generate

## Impact

- Persistent memory entries written via `persistent_memory_write_entry` will no longer be loaded into UnifiedMemory
- `unified_memory.recall()` will only find entries stored via `store()` (STM/MTM/LTM)
- No contract changes, no IPC changes, no frontend changes required

## Verification After Rollback

```bash
cd src-tauri && cargo check && cargo test --lib unified_memory