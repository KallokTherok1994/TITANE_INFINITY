# POSTFIX SCOPE

## Scope: Rust LTM backup/restore only

Already certified in prior sessions (DO NOT REOPEN):
- LTM disk write in promote_mtm_to_ltm()
- LTM startup restore in init() via restore_ltm_from_disk()
- LTM full content load in recall()
- Memory injection in conversation_generate()
- memoryRecallIds in response metadata
- Provider circuit-breaker truth
- UI provider status truth

This session only:
- chat_memory_backup Tauri command
- chat_memory_restore Tauri command
- ltm_storage_path() public accessor
- reload_ltm_from_disk() post-restore rehydration

## Minimal diff: 4 files, ~200 lines added
