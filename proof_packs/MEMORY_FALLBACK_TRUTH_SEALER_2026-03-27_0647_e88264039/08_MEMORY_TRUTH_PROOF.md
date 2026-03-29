# 08 — Memory Truth Proof

## Memory Truth Source
`src-tauri/src/conversation_engine/commands.rs`

## Evidence
Memory recall is correctly gated and tracked:

```rust
const MEMORY_RECALL_MAX: usize = 5;
const MEMORY_ITEM_CHAR_CAP: usize = 200;
let (memory_recall_block, memory_recall_ids): (String, Vec<String>) = {
    if router_decision.wants_memory {
        let recalled = {
            let mut mem = orchestrator.unified_memory.write().await;
            mem.recall(&message, MEMORY_RECALL_MAX)
        };
        if recalled.is_empty() {
            (String::new(), Vec::new())
        } else {
            let ids: Vec<String> = recalled.iter().map(|i| i.id.clone()).collect();
            let lines: Vec<String> = recalled.iter().map(|item| {
                let tier_label = match item.tier {
                    crate::core::MemoryTier::ShortTerm => "STM",
                    crate::core::MemoryTier::MediumTerm => "MTM",
                    crate::core::MemoryTier::LongTerm => "LTM",
                };
                let content_trunc = if item.content.len() > MEMORY_ITEM_CHAR_CAP {
                    format!("{}…", &item.content[..MEMORY_ITEM_CHAR_CAP])
                } else {
                    item.content.clone()
                };
                format!("[{tier_label}|{:.2}] {content_trunc}", item.importance)
            }).collect();
            let block = format!(
                "\n\n## MEMORY_CONTEXT\n{}\n## END_MEMORY_CONTEXT",
                lines.join("\n")
            );
            (block, ids)
        }
    } else {
        (String::new(), Vec::new())
    }
};
```

## Proof
- Memory recall only when `router_decision.wants_memory = true`
- Empty recall returns empty block (no injection)
- Memory IDs tracked in `memory_recall_ids`
- Memory sources tracked in `memory_sources_injected`
- Memory consumption limited to 5 items, 200 chars each

## Status
**CERTIFIED** ✅