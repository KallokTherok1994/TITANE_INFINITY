# BACKUP COVERAGE MAP

## Mechanism 1: TS AutoBackupService (src/services/backup/AutoBackupService.ts)
- Reads: localStorage keys (titane_memory_short, titane_memory_long, titane_memory_unified_memory, etc.)
- Does NOT include: Rust LTM disk files
- Restore: writes back to localStorage only
- Coverage of *.mem files: ZERO
- Assessment: localStorage memory is session UI state, NOT Rust LTM source of truth

## Mechanism 2: Rust BackupEngine (src-tauri/src/time/backup_engine.rs)
- collect_system_data(): returns {"placeholder": "Integration with SingularityState pending"}
- collect_context(): has comment "Memory files: Count entries in LTM" but does nothing
- Coverage of *.mem files: ZERO (comment-only placeholder)
- Assessment: not a functioning backup mechanism

## Mechanism 3: memory_export / memory_import Tauri commands
- Operates on: MemoryEngineState (src-tauri/src/memory_os/)
- NOT the core::UnifiedMemory used by chat
- Coverage of ~/.local/share/titane-infinity/unified_memory/ltm/: ZERO
- Assessment: wrong memory system

## Mechanism 4 (NEW): chat_memory_backup / chat_memory_restore (THIS PATCH)
- Operates on: core::UnifiedMemory (canonical chat memory)
- Reads from: unified_memory.ltm_storage_path() = ~/.local/share/titane-infinity/unified_memory/ltm/
- Copies: all *.mem files to caller-supplied dest_dir
- Restore: copies back *.mem files + calls reload_ltm_from_disk()
- Coverage of *.mem files: COMPLETE
- Validation: each file parsed as MemoryItem before restore (no silent corrupt restore)

## Rust LTM disk path covered: YES (mechanism 4 only)
## Canonical backup for TITANE memory restore: mechanism 4 (chat_memory_backup/restore)
