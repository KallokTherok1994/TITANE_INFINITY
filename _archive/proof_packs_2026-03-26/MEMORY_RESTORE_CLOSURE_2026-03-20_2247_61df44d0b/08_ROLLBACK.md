# ROLLBACK

## Command
git restore -- \
  src-tauri/src/overdrive/chat_orchestrator.rs \
  src-tauri/src/core/modules/unified_memory.rs \
  src-tauri/src/core/modules/mod.rs \
  src-tauri/src/main.rs

## Impact of rollback
- Removes chat_memory_backup and chat_memory_restore IPC commands
- Removes ltm_storage_path() and reload_ltm_from_disk() methods
- No existing functionality is affected (additive-only patch)
- LTM disk write, restore_ltm_from_disk, recall, memory injection remain intact

## Risk: LOW — rollback is clean with no side effects
