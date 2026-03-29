# 05 — Patch Decision

## Patch Justification
**YES** — Patch is justified because:
1. Root cause is clearly identified (MISSING_INJECTION)
2. Fix is minimal and causal (add block when history empty)
3. Fix preserves existing behavior (no regression risk)
4. Fix directly addresses the anti-lie violation

## Patch Description
**File**: `src-tauri/src/conversation_engine/commands.rs`
**Function**: `build_canonical_memory_fact_block()`
**Lines**: ~15 lines modified

### Before
```rust
fn build_canonical_memory_fact_block(
    history: Option<&Vec<String>>,
    message: &str,
) -> Option<String> {
    let history = history?;

    if history.is_empty() || !is_memory_recall_query(message) {
        return None;
    }

    let facts = extract_canonical_memory_facts(history);
    if facts.is_empty() {
        return None;
    }

    let rendered_facts = facts
        .into_iter()
        .map(|(key, value)| format!("{key}={value}"))
        .collect::<Vec<String>>()
        .join("\n");

    Some(format!(
        "## CANONICAL_MEMORY_FACTS\n{}\n## MEMORY_RECALL_RULE\n...",
        rendered_facts
    ))
}
```

### After
```rust
fn build_canonical_memory_fact_block(
    history: Option<&Vec<String>>,
    message: &str,
) -> Option<String> {
    if !is_memory_recall_query(message) {
        return None;
    }

    let history = history;
    let facts = history.and_then(|h| {
        if h.is_empty() {
            None
        } else {
            Some(extract_canonical_memory_facts(h))
        }
    });

    let rendered_facts = match facts {
        Some(f) if !f.is_empty() => f
            .into_iter()
            .map(|(key, value)| format!("{key}={value}"))
            .collect::<Vec<String>>()
            .join("\n"),
        _ => String::new(),
    };

    // ANTI-LIE: Always inject the block for memory recall queries so the LLM
    // receives the INCONNU instruction even when history is empty.
    // Without this, the LLM may fabricate details instead of saying "no context".
    Some(format!(
        "## CANONICAL_MEMORY_FACTS\n{}\n## MEMORY_RECALL_RULE\n...",
        rendered_facts
    ))
}
```

## Key Changes
1. Remove early return when history is empty
2. Always inject the block for memory recall queries
3. When history is empty, `rendered_facts` is empty string
4. LLM still receives the MEMORY_RECALL_RULE instruction

## Why This Is the Smallest Patch
- Only modifies one function
- No changes to data structures or APIs
- No changes to other modules
- Preserves all existing behavior for non-memory queries
- Adds missing behavior for memory queries with empty history

## Forbidden Changes NOT Made
- No broad refactor
- No cleanup sweep
- No unrelated module changes
- No threshold changes
- No UI-only patches