# LTM_PATH_MAP — P1.13a

## Active LTM subsystems in TITANE∞

### System 1: persistent_memory_v19 (ACTIVE, PROVEN P1.13a)

```
UI / IPC caller
  → window.__TAURI__.core.invoke('persistent_memory_write_entry', { content, level, modeId })
  → Tauri capability: tauri.conf.json main-capability (window: main)
  → src-tauri/src/commands/persistent_memory.rs::persistent_memory_write_entry()
  → PersistentMemoryState (registered main.rs:1282)
  → File: ~/.local/share/titane-infinity/persistent_memory/{level}/entries.json
    (long_term: encrypted via encryptor; intermediate: plaintext JSON)
  → Returns: UUID string

WRITE confirmed. READ path:
  → window.__TAURI__.core.invoke('persistent_memory_read', { request: { currentMode } })
  → persistent_memory_read() → reads all levels → returns MemoryReadResponse { entries, total_count }
  → READ confirmed P1.13a
```

### System 2: unified_memory / ChatOrchestratorState (WIRED_BUT_BROKEN)

```
conversation_generate (commands.rs:557)
  → if router_decision.wants_memory:
      orchestrator.unified_memory.recall(query, mode_id)  [line 988]
  → UnifiedMemory at src-tauri/src/core/modules/unified_memory.rs
  → ~/.local/share/titane-infinity/unified_memory/ltm/ (.mem files)
  → BREAK: unified_memory has no active writer in conversation_generate path
    (store_in_unified_memory was only in chat_send_message, REMOVED v27.0.5-prod)
  → recall() always returns 0 items
```

### System 3: MultiLayerMemoryManager (IN-SESSION ONLY)

```
ConversationEngineState (mod.rs:70)
  → multilayer_memory: Arc<RwLock<MultiLayerMemoryManager>>
  → add_to_immediate(user_msg, assistant_msg) after each turn (mod.rs:249-260)
  → In-memory only. Lost on restart. NOT disk-backed.
```

## Interaction between systems

- Systems 1, 2, and 3 are **isolated** — they do not share state
- `conversation_generate` reads from System 2 (unified_memory) — NOT System 1 (persistent_memory)
- System 1 IPC is accessible from frontend but not injected into conversation context automatically
- The `omega_integration.rs` / prompt injection path uses persistent_memory_get_context (System 1), but this is called separately from conversation_generate (not in the recalled-memory pipeline)

## Proof coverage this cycle

| Path segment | Status |
|-------------|--------|
| System 1: write → file persist | PROVEN P1.13a |
| System 1: file persist → IPC read | PROVEN P1.13a |
| System 2: unified_memory write | BREAK (no active writer) |
| System 2: unified_memory recall | WIRED but returns 0 |
| System 3: in-session STM | WIRED (proven by conversation test) |
