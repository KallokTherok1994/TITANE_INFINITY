# P1.13c — COMMIT SCOPE MAP

## Files in Scope

| File | Status | Change Type |
|------|--------|-------------|
| src-tauri/src/core/modules/unified_memory.rs | M (modified) | +80 lines (load_persistent_entries) |
| src-tauri/src/conversation_engine/commands.rs | M (modified) | +12 lines (AtomicBool guard + one-time load) |

## Files NOT in Scope

- No IPC contract changes
- No frontend changes
- No persistence module changes
- No configuration changes

## Change Summary

**Total**: 2 files, ~92 lines added
**Risk**: Low — bounded addition, no deletions, no contract changes