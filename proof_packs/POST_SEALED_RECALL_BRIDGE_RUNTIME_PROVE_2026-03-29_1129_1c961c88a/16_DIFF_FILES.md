# P1.13c — DIFF FILES

## File: src-tauri/src/core/modules/unified_memory.rs

Added `load_persistent_entries(&mut self, base_path: &std::path::Path)` method (~80 lines):
- Reads `persistent_memory/intermediate/entries.json`
- Parses JSON entries
- Converts to MemoryItem (handles content_type mapping)
- Deduplicates by id (checks STM+MTM+LTM)
- Pushes to STM
- Prints count of loaded entries

## File: src-tauri/src/conversation_engine/commands.rs

Added (~12 lines):
- `static PERSISTENT_MEMORY_LOADED: AtomicBool = AtomicBool::new(false);` guard
- One-time load before recall in `conversation_generate`:
  ```rust
  if !PERSISTENT_MEMORY_LOADED.swap(true, Ordering::SeqCst) {
      let pm_base_path = resolve_persistent_memory_base_path(&app_handle);
      let mut mem = orchestrator.unified_memory.write().await;
      mem.load_persistent_entries(&pm_base_path);
  }