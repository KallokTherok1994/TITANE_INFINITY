# RUST LTM BACKUP PATH MAP

## Actual LTM storage path
Base: dirs::data_local_dir() = ~/.local/share/ on Linux
Full: ~/.local/share/titane-infinity/unified_memory/ltm/
Env override: TITANE_UNIFIED_MEMORY_LTM_DIR
File pattern: <uuid>.mem (one file per LTM item)

## Before this patch — how backup saw the path
- IGNORED by TS AutoBackupService (reads only localStorage)
- IGNORED by Rust BackupEngine (placeholder JSON stub)
- IGNORED by memory_export/import (uses separate MemoryEngineState)
- Result: *.mem files were never included in any backup

## Metadata needed for restore
- Each file is self-contained JSON (MemoryItem struct includes all metadata)
- No external manifest required — MemoryId is the UUID filename stem
- index rebuilt from file scan (no separate index file needed)

## What restore must recreate
- *.mem files must exist in ltm.storage_path/
- reload_ltm_from_disk() must be called to rebuild ltm.index in RAM
- Recall path uses ltm.index for lookups then reads individual files

## New public accessors
- UnifiedMemory::ltm_storage_path() -> PathBuf — returns canonical ltm storage path
- UnifiedMemory::reload_ltm_from_disk() — clears index + re-scans from disk
