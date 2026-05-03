# 08 — ROLLBACK

## Undo all changes from this session:
```bash
git restore -- \
  src-tauri/src/core/modules/unified_memory.rs \
  src-tauri/src/core/modules/mod.rs \
  src-tauri/src/conversation_engine/commands.rs
```

## Verify rollback:
```bash
cargo check --manifest-path src-tauri/Cargo.toml
grep -n "memory_recall_block\|MEMORY_CONTEXT\|memoryRecallIds" \
  src-tauri/src/conversation_engine/commands.rs
# Should return no results after rollback
grep -n "full_item\|fs::read.*metadata.file_path" \
  src-tauri/src/core/modules/unified_memory.rs
# Should return no results after rollback
```

## What rollback restores:
- recall() LTM section: reverts to "[LTM:N]" placeholder
- conversation_generate: removes recall() pre-generation hook
- conversation_generate: removes memoryRecallIds from response JSON
- modules/mod.rs: removes MemoryTier from pub use

## Impact of rollback:
- MEMORY_INJECTION_UNPROVEN is reinstated
- LTM items exist on disk but recall returns placeholder content
- No memory context in chat prompts
- Previously fixed LTM disk write + restore (from prior session) remain intact
