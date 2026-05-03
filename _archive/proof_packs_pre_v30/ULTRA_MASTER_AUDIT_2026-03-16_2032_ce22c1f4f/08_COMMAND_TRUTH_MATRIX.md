# COMMAND TRUTH MATRIX

## Légende
- ✅ RÉEL = code + IPC + handler présents
- ⚠️ PARTIAL = présent mais condition requise (key, flag, feature)
- ❌ STUB = retourne err/mock/console.log
- ❌ REMOVED = retiré, plus dans generate_handler

## Commandes Critiques

| Commande | Frontend registry | Backend handler | IPC callable | Anti-drift | Statut |
|---|---|---|---|---|---|
| `conversation_generate` | ✅ chat.ts:invokeWithRetry | ✅ conversation_engine/commands.rs | ✅ main.rs | ✅ canonical path | **RÉEL** |
| `create_new_conversation` | ✅ chat.ts | ✅ conversation_engine/commands.rs | ✅ | ✅ | **RÉEL** |
| `load_conversation_history` | ✅ chat.ts | ✅ conversation_engine/commands.rs | ✅ | ✅ | **RÉEL** |
| `list_restorable_conversations` | ✅ | ✅ | ✅ | ✅ | **RÉEL** |
| `chat_stream_message` | ✅ | ✅ overdrive/chat_orchestrator.rs | ✅ | ✅ | **RÉEL** |
| `chat_get_providers_status` | ✅ | ✅ | ✅ | ✅ | **RÉEL** |
| `chat_generate_gemini` | ✅ | ✅ commands/chat_generate_commands.rs | ✅ | ⚠️ key-gated | **PARTIAL** |
| `chat_generate_openai` | ✅ | ✅ | ✅ | ⚠️ key-gated | **PARTIAL** |
| `chat_generate_claude` | ✅ | ✅ | ✅ | ⚠️ key-gated | **PARTIAL** |
| `chat_generate_copilot` | ✅ | ✅ | ✅ | ⚠️ key-gated | **PARTIAL** |
| `ollama_generate` | ✅ | ✅ commands/ollama_command.rs | ✅ | ✅ | **RÉEL** |
| `send_message` | ⚠️ legacy | ❌ STUB chat.rs:39 "NOT IMPLEMENTED" | ✅ (enregistré) | ❌ | **STUB/FAIL** |
| `engine_get_evolution_state` | ⚠️ | ❌ STUB "Phase 5.2" | ✅ (enregistré) | ❌ | **STUB** |
| `web_research` | ⚠️ | ❌ P1 STUB webResearchService.ts | ✅ (enregistré) | ❌ | **STUB** |
| `persistent_memory_read` | ✅ | ✅ persistent_memory.rs | ✅ | ✅ | **RÉEL** |
| `persistent_memory_write` | ✅ | ✅ | ✅ | ✅ | **RÉEL** |
| `autofix_*` (~15 cmds) | ✅ | ✅ singularity_fusion/ | ✅ | ✅ | **RÉEL** |
| `autoheal_*` (~15 cmds) | ✅ | ✅ singularity_fusion/ | ✅ | ✅ | **RÉEL** |
| `chat_send_message` | ❌ REMOVED | ❌ REMOVED v27.0.5 | ❌ | ✅ | **REMOVED** |
| `ai_query` | ⚠️ legacy | ⚠️ feature="full" ou STUB | ⚠️ | ⚠️ | **FEATURE-GATED** |
| `generate_response` | ⚠️ | ⚠️ feature="mock"/"full" | ⚠️ | ⚠️ | **FEATURE-GATED** |

## Stubs Confirmés (Catalogue Complet)

| ID | Commande/Service | Fichier | Type stub | Impact |
|---|---|---|---|---|
| S-001 | `send_message` | src-tauri/src/commands/chat.rs:39 | Retourne Err() | P1 |
| S-002 | `engine_get_evolution_state` | commands/engine_commands.rs:221 | Retourne stub struct | P2 |
| S-003 | `web_research` | commands/web_research.rs | BLOCKED réseau | P2 |
| S-004 | weather tool | src/services/chat/toolCaller.ts | console.log | P2 |
| S-005 | stock tool | src/services/chat/toolCaller.ts | console.log | P2 |
| S-006 | `generate_response` (mock) | src-tauri/src/mock_commands.rs | feature="mock" only | P2 dev |
| S-007 | `ai_query` etc (non-full) | legacy_ai_bridge | feature non-full → stubs | P1 |
| S-008 | Streaming Ollama | src/services/ai/providers/ollama.ts:673 | TODO non livré | P1 |

## Modules Désactivés (Commands/mod.rs)

```rust
// pub mod ai_chat          — duplicate symbols
// pub mod coherence_commands — unresolved extern crate
// pub mod meta_mode         — unresolved imports
// pub mod evolution         — duplicate commands
// pub mod evolution_v14     — duplicate commands
// pub mod devtools_commands — duplicates
// pub mod memory_os_commands — duplicates
```

Ces modules contiennent possiblement des commandes qui étaient disponibles dans des versions précédentes mais sont maintenant désactivées (dead code non nettoyé).
