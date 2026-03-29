# RECALL_PATH_ANALYSIS — P1.13a

## conversation_generate recall path (detailed)

### Entry point

`src-tauri/src/conversation_engine/commands.rs:557`
```rust
pub async fn conversation_generate(
    engine: State<'_, Arc<ConversationEngineState>>,
    orchestrator: State<'_, ChatOrchestratorState>,
    ...
)
```

### Router decision

`router.rs:169-179` — `wants_memory` is true when:
- Intent is `Intent::Clarification` or `Intent::Question`
- OR message contains keywords: "remember", "recall", "mémorise", "rappelle", "souviens", "we discussed", "you said"

### Recall call (commands.rs:985-1021)

```rust
let memory_recall_ids = if router_decision.wants_memory {
    let mem = orchestrator.unified_memory.read().await;
    let recalled = mem.recall(&query, &mode_id).await;
    // recalled is always Vec::new() — unified_memory has no entries
    recalled.iter().map(|c| c.id.clone()).collect()
} else {
    vec![]
};
```

### Why recall returns empty

`ChatOrchestratorState.unified_memory` is initialized at chat_orchestrator.rs:246:
```rust
let mut unified_memory = UnifiedMemory::new();
unified_memory.init();
```

`UnifiedMemory::init()` calls `restore_ltm_from_disk()` which reads `.mem` files from `~/.local/share/titane-infinity/unified_memory/ltm/`. These files are NEVER written to by any active code path (the only writer, `store_in_unified_memory`, was only called from `chat_send_message` which was removed in v27.0.5-prod). Therefore `unified_memory` loads 0 items from disk, and `recall()` returns 0 items.

### Response metadata

`commands.rs:1195`: `"memoryRecallIds": memory_recall_ids` — always `[]` in practice.

### CONVOS_MEMORY_LTM gate

`commands.rs:619`: `let convos_memory_ltm_enabled = read_bool_env("CONVOS_MEMORY_LTM", false);`

This flag is read but its effect on the active recall path is limited to gating certain LTM initialization, not the core recall call. The recall call itself does not check `convos_memory_ltm_enabled`.

## persistent_memory_get_context (separate injection path)

`persistent_memory_get_context` IPC (commands/persistent_memory.rs) is called independently and is used by the omega integration layer for AI prompt injection. This is NOT wired into the `conversation_generate` recall pipeline. It represents a separate, functional injection path that is NOT proven in P1.13a.
