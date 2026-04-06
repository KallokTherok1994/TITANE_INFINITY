# 04 — MEMORY PERSISTENCE CHAIN

## STM
- Storage: `self.stm.items: VecDeque<MemoryItem>` — RAM only
- Write timing: immediate on store()
- Crash risk: TOTAL — VecDeque is dropped on process exit
- Durability: session-scoped only

## MTM
- Storage: `self.mtm.items: Vec<MemoryItem>` — RAM only
- Write timing: promoted from STM on STM overflow
- Crash risk: TOTAL — Vec dropped on process exit
- Durability: session-scoped only

## LTM (AFTER FIX)
- Storage: `~/.local/share/titane-infinity/ltm/<uuid>.mem` — JSON on disk
- Schema: MemoryItem { id, content, memory_type, importance, tags, created_at, accessed_count, last_accessed, tier }
- Serialization: serde_json (no encryption in minimal fix — comment noted)
- Write timing: synchronous std::fs::write at MTM→LTM promotion time
- Flush/checkpoint: immediate per item (no batch delay after fix)
- Crash risk: LOW — write happens before index insert is retained; on write failure index entry removed
- Startup restore: restore_ltm_from_disk() scans *.mem files and rebuilds LTM metadata index
- Corruption detection: serde_json::from_slice failure → skip + eprintln, continue loading others
- Backup/export path:
  - Rust: src-tauri/src/time/backup_engine.rs — BackupEngine (Quick/Stable/Deep) via TravelEngine
  - TS: AutoBackupService.ts — collects memory from localStorage + invokes 'write_file' IPC
    NOTE: TS backup reads localStorage memory, NOT the Rust LTM disk files → partial coverage

## Transaction model
- No transactions — each .mem file is an atomic write_all via std::fs::write
- Index update is in-memory after write; index is NOT separately persisted to disk
  → on hard crash after write but before index update: file exists, loaded on next restore ✅
  → no orphan risk: restore scans all *.mem files regardless of index state

## Index persistence
- ltm.index: HashMap<MemoryId, MemoryMetadata> — RAM only (rebuilt from disk on init)
- NOT a separate persisted index file — avoids index/file drift
