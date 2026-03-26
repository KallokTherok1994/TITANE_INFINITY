# 07 — DIFF FILES

## 1. src-tauri/src/core/modules/mod.rs
ADDED: `MemoryTier` to pub use export
```diff
- pub use unified_memory::{MemoryType, UnifiedMemory};
+ pub use unified_memory::{MemoryTier, MemoryType, UnifiedMemory};
```

## 2. src-tauri/src/core/modules/unified_memory.rs — recall() LTM section

BEFORE: returned "[LTM:N]" placeholder, no disk read
AFTER: std::fs::read(metadata.file_path) + serde_json::from_slice — real content or skip

## 3. src-tauri/src/conversation_engine/commands.rs — pre-generation recall hook

ADDED before stm_context_block (~line 615):
```rust
const MEMORY_RECALL_MAX: usize = 5;
const MEMORY_ITEM_CHAR_CAP: usize = 200;
let (memory_recall_block, memory_recall_ids): (String, Vec<String>) = {
    if router_decision.wants_memory {
        let recalled = {
            let mut mem = orchestrator.unified_memory.write().await;
            mem.recall(&message, MEMORY_RECALL_MAX)
        };
        // ... assemble block + ids
    } else {
        (String::new(), Vec::new())
    }
};
```

ADDED in system_prompt parts assembly:
```rust
if !memory_recall_block.is_empty() { parts.push(memory_recall_block.clone()); }
```

ADDED in response JSON metadata:
```rust
"memoryRecallIds": memory_recall_ids,
"memoryRecallCount": memory_recall_ids.len(),
```

## Cargo check result:
Checking titane-infinity v28.5.0
Finished `dev` profile [unoptimized + debuginfo] target(s) in 1m 23s
EXIT 0

## Files NOT touched:
- chat_orchestrator.rs (deprecated path, not the live path)
- memory_os/* (not wired to chat)
- unified_memory_v2/* (not wired to chat)
- AutoBackupService.ts (out of scope for this session)
