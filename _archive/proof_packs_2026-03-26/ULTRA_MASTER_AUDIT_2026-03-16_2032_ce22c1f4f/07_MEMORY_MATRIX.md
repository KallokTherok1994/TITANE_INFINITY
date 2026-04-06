# MEMORY MATRIX

| Capacité | Local Convo | Session | STM | MTM | LTM | Persistance | Retrieval | Provenance | Runtime prouvé | Statut |
|---|---|---|---|---|---|---|---|---|---|---|
| **Conversation SQLite** | ✅ conversation_os_v1.db | ✅ RAM Map | N/A | N/A | ✅ via DB | ✅ SQLite | ✅ load_conversation_history | IPC backend | ⚠️ UNKNOWN | **PARTIAL** |
| **STM (ShortTermMemory)** | N/A | ✅ VecDeque RAM | ✅ push_with_archival V24 | ⚠️ via Consolidator | ⚠️ via Consolidator | ❌ RAM only | ❌ no direct retrieval IPC | neural_memory/stm.rs | ⚠️ UNKNOWN | **PARTIAL** |
| **MTM (MidTermMemory)** | N/A | N/A | ⚠️ promoted from STM | ✅ exists | ⚠️ via Consolidator | ❌ RAM only | ❌ | neural_memory/mtm.rs | ⚠️ UNKNOWN | **PARTIAL** |
| **LTM (LongTermMemory)** | N/A | N/A | N/A | N/A | ✅ exists | ✅ persistent index | ✅ code present | neural_memory/ltm.rs | ❌ DISABLED default | **PARTIAL** |
| **Consolidation STM→MTM→LTM** | N/A | N/A | ⚠️ | ⚠️ | ⚠️ | N/A | N/A | neural_memory/consolidation.rs | ❌ NOT PROVEN | **PARTIAL** |
| **UnifiedMemory v2** | N/A | ✅ init chat_orchestrator | ✅ bridged | ✅ bridged | ✅ bridged | ✅ bloom + encryption | ✅ vector query API | unified_memory_v2/ | ⚠️ UNKNOWN | **PARTIAL** |
| **PersistentMemory v19.2Ω** | N/A | N/A | N/A | N/A | ✅ AES-256-GCM | ✅ encrypted disk | ✅ IPC persistent_memory_read | persistent_memory.rs | ⚠️ UNKNOWN | **PARTIAL** |
| **MemoryEngine (OMEGA)** | ✅ charge contexte | ✅ | N/A | N/A | ⚠️ CONVOS_MEMORY_LTM=false | ✅ SQLite | ✅ dans pipeline | conversation_engine/memory.rs | ⚠️ UNKNOWN | **PARTIAL** |

## Env Flags Critiques

| Flag | Valeur défaut | Impact |
|---|---|---|
| `CONVOS_MEMORY_LTM` | `false` | **LTM désactivé en production par défaut** |
| `CONVOS_MEMORY_SNAPSHOTS` | ⚠️ UNKNOWN | Snapshots de conversation |
| `CONVOS_SEARCH` | `false` | Recherche web dans OMEGA désactivée |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Fallback si OLLAMA_URL absent |

## Issue Détectée

`neural_memory/stm.rs:36`: `push()` deprecated → utiliser `push_with_archival`.  
Code utilise les deux selon contexte. Migration incomplète.

## Classification LOCAL_CONVERSATION_MEMORY

**VERDICT: `PARTIAL`**

- Code complet, intégré, SQLite, pipeline OMEGA ✅
- LTM désactivé par défaut (`CONVOS_MEMORY_LTM=false`) ❌
- Aucune preuve runtime de lecture/écriture conversation ❌

## Classification STM/MTM/LTM

**VERDICT: `PARTIAL_MULTI_TIER`**

- Structures STM/MTM/LTM implémentées en Rust ✅
- Consolidation STM→MTM→LTM code présent ✅
- `UnifiedMemory::init()` avec log "STM/MTM/LTM ready" ✅
- LTM désactivé par défaut ❌
- Consolidator appelé en production = NON PROUVÉ ❌
- Runtime promotion STM→LTM = NON PROUVÉE ❌
