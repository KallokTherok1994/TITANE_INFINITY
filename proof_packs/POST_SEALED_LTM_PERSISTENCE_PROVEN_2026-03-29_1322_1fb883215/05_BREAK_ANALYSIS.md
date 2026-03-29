# BREAK_ANALYSIS — P1.13a

## BREAK_AT_RECALL_WRITE_MISMATCH (persistent in TITANE∞)

### Location

`src-tauri/src/conversation_engine/commands.rs`, lines 985-1021

### Description

`conversation_generate` calls `orchestrator.unified_memory.recall(query, mode_id)` when `router_decision.wants_memory` is true. But `unified_memory` (ChatOrchestratorState.unified_memory) is never written to in the conversation_generate flow.

### Root cause

The only writer for `unified_memory` was `store_in_unified_memory()` in `chat_orchestrator.rs:470-509`. That function was only called from `chat_send_message`. `chat_send_message` was removed at main.rs:1680 in v27.0.5-prod: `[RETRAIT v27.0.5-prod] chat_send_message removed`. When `conversation_generate` was introduced as the replacement, the `unified_memory` write was not ported over.

### Effect

`orchestrator.unified_memory.recall()` always returns an empty `Vec<MemoryChunk>`. `memoryRecallIds` in the conversation response is always empty. No cross-session memory injection from the unified_memory path.

### Is this a new break?

No. This break predates P1.13a. P1.13a documents it with precision.

### Fix scope (NOT applied in P1.13a)

The smallest fix would be: after each `conversation_generate` turn, call `store_in_unified_memory()` with the new turn's content. This is a bounded change in commands.rs only. NOT applied this cycle — bounded proof scope only.

---

## BREAK_AT_CROSS_SESSION_MEMORY (in-session only)

### Location

`src-tauri/src/conversation_engine/mod.rs:70` — `multilayer_memory: Arc<RwLock<MultiLayerMemoryManager>>`

### Description

`MultiLayerMemoryManager.add_to_immediate()` writes to in-memory STM only. On app restart, all STM is lost.

### Effect

Conversation context is ephemeral across sessions. This is by design for the current in-session STM tier.

---

## SYSTEM_PROVEN: persistent_memory_v19

`persistent_memory_v19` provides a functioning write→persist→read round-trip. It IS disk-backed (encrypted long_term, plaintext intermediate). It is IPC-accessible from the main window. However, its content is NOT automatically injected into `conversation_generate` context (requires explicit `persistent_memory_get_context` call + injection).
