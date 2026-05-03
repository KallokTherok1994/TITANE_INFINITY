# DIFF FILES

## Files modified (4)

### 1. src-tauri/src/overdrive/chat_orchestrator.rs
+import MemoryItem from crate::core
+chat_memory_backup() Tauri command (~60 lines)
+chat_memory_restore() Tauri command (~80 lines)

### 2. src-tauri/src/core/modules/unified_memory.rs
+ltm_storage_path() → PathBuf (~5 lines)
+reload_ltm_from_disk() → clears index + re-scans (~7 lines)

### 3. src-tauri/src/core/modules/mod.rs
+MemoryItem added to pub use export (1 line)

### 4. src-tauri/src/main.rs
+MemoryItem added to mod core re-export (1 line)
+chat_memory_backup registration in invoke_handler! (1 line)
+chat_memory_restore registration in invoke_handler! (1 line)

## Total: ~155 lines added, 0 deleted in existing logic
 src-tauri/src/core/modules/mod.rs            |   2 +-
 src-tauri/src/core/modules/unified_memory.rs |  12 ++
 src-tauri/src/main.rs                        |   4 +-
 src-tauri/src/overdrive/chat_orchestrator.rs | 165 ++++++++++++++++++++++++++-
 4 files changed, 180 insertions(+), 3 deletions(-)
