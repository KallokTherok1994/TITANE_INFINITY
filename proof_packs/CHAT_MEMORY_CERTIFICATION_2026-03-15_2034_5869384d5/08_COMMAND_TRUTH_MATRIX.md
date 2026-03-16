# 08_COMMAND_TRUTH_MATRIX

## Commandes Chat Critiques

| Commande | Backend | Frontend | Doc | Statut |
|---|---|---|---|---|
| conversation_generate | conversation_engine::commands ✅ | src/services/api/chat.ts ✅ | Absent tauriCommands.ts | PROVEN |
| create_new_conversation | conversation_engine::commands ✅ | src/services/api/chat.ts ✅ | — | PROVEN |
| send_message | main.rs:673 (now Err) ✅ | Non utilisé en prod | — | FIXED |
| chat_send_message | ABSENT (removed v27.0.5) | Smoke test disabled | — | ABSENT |
| chat_stream_message | overdrive::chat_orchestrator ✅ | Fallback legacy | — | LEGACY_ONLY |
| ollama_generate | commands::ollama_command ✅ | ollamaProvider.ts ✅ | — | PROVEN |
| load_conversation_history | ABSENT | ABSENT | — | MISSING_P0 |

## Commandes Mémoire

| Commande | Backend | Frontend | Statut |
|---|---|---|---|
| memory_get | memory_commands.rs (now with warn) ✅ | Non tracé UI | PARTIAL |
| memory_set | memory_commands.rs ✅ | Non tracé UI | PARTIAL |
| persistent_memory_write_entry | persistent_memory_v19 ✅ | usePersistentMemory.ts ✅ | PARTIAL |
| memory_store | unified_memory_commands ✅ | useUnifiedMemory.ts ✅ | PARTIAL |

## Ghost Commands (14) — FIXED → active:false

singularity_sync_state, helios_get_modules, helios_get_health,
memory_get_recent_memories, nexus_get_status, persona_get_multipliers,
engine_init, engine_stop, engine_get_state, engine_get_health,
devtools_get_logs, devtools_get_metrics, devtools_inspect_singularity,
system_get_info
