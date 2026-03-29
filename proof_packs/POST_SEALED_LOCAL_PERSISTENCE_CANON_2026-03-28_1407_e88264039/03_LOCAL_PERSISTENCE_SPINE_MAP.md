# LOCAL_PERSISTENCE_SPINE_MAP

## Canonical spine
| Domain | Canonical owner | Surface/path | Status | Proof source | Risk |
| --- | --- | --- | --- | --- | --- |
| Chat turns | Conversation OS v1 | conversation_os_v1.db | PARTIAL | commands.rs + db_service.rs | Runtime proof not executed |
| Orchestrator meta | Conversation OS v1 | provider_decisions/sources | PARTIAL | commands.rs | Runtime proof not executed |
| Memory files | Memory Vault | vault/encrypted + memory_files_db | PARTIAL | memory_persistence.rs + vault_engine.rs | Runtime proof not executed |
| LTM | UnifiedMemory | data_local_dir/titane-infinity/unified_memory/ltm | PARTIAL | unified_memory.rs | Competing config path |
| Sync | Option1 local DB | option1_libsql_local.db | PARTIAL | db_commands.rs + sync_service.rs | Remote config required |
| Backups | BackupEngine | TITANE_INFINITY/persistence | DOC_ONLY | backup.rs | No restore proof |

## Competing/derived surfaces
- `data/cognitive/semantic_memory.db` (derived index).
- `memory/backup/*.json.backup` (backup artifacts).
- MemoryOSConfig default `./data/memory/ltm` (competing path).
