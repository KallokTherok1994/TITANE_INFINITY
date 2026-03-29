# ISOLATION_PROOF — P1.13a

## Claim

`persistent_memory_v19` (System 1) and `unified_memory` (System 2) are isolated systems that do not share state at runtime.

## Evidence

### System 1: persistent_memory_v19

- Rust state: `PersistentMemoryState` (main.rs:1282)
- File path: `~/.local/share/titane-infinity/persistent_memory/`
- Written by: `persistent_memory_write_entry` IPC command
- Read by: `persistent_memory_read` IPC command
- Used by: UI memory page, explicit memory writes from chat, `persistent_memory_get_context` for AI injection
- Confirmed accessible: PROVEN P1.13a (X3)

### System 2: unified_memory (ChatOrchestratorState)

- Rust state: `ChatOrchestratorState.unified_memory: Arc<RwLock<UnifiedMemory>>` (chat_orchestrator.rs:225)
- File path: `~/.local/share/titane-infinity/unified_memory/ltm/*.mem`
- Written by: `store_in_unified_memory()` — only called from `chat_send_message` (REMOVED v27.0.5-prod)
- Read by: `orchestrator.unified_memory.recall()` in `conversation_generate` (commands.rs:988)
- Status: WIRED_BUT_BROKEN (write path removed, recall path returns 0 items)

### No shared state

- `PersistentMemoryState` and `ChatOrchestratorState.unified_memory` are separate Tauri state registrations
- Neither reads from the other
- Writing to System 1 does NOT affect System 2 recall
- This isolation is observable: after 3 P1.13a writes to System 1, System 2 recall still returns 0

## Consequence for chat

When a user asks "remember X" or "what do you know about Y" in chat:
1. `router.wants_memory` → true (triggered by keyword matching)
2. `orchestrator.unified_memory.recall()` is called
3. Returns empty Vec — no items injected into prompt
4. The persistent_memory entries (System 1) are NOT recalled via this path

This is the precise break: Systems 1 and 2 exist independently with no bridge.
