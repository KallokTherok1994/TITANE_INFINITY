# 03 — Critical Chain Map

## Chain Entry Point
User Query → conversationEngine.ts (frontend)

## Chain Nodes

### 1. User Query
**Status**: CERTIFIED
**Role**: Entry point

### 2. conversationEngine.ts (Frontend)
**Status**: CERTIFIED
**Role**: Detects explicit memory queries via `isExplicitMemoryQuery()`
**Behavior**: Sets `persistentMemoryStatus = 'skipped'` for explicit memory queries

### 3. IPC → commands.rs (Backend)
**Status**: CERTIFIED
**Role**: Receives request, processes through pipeline

### 4. is_memory_recall_query()
**Status**: CERTIFIED
**Role**: Detects memory recall queries via keyword matching
**Result**: Returns `true` for queries containing "rappelle", "souviens", "mémoire", etc.

### 5. load_conversation_history_with_limit()
**Status**: CERTIFIED
**Role**: Loads conversation history from SQLite
**Result**: Returns `None` if database empty or conversation not found

### 6. build_canonical_memory_fact_block() ← RUPTURE POINT
**Status**: BROKEN (before patch) → FIXED (after patch)
**Role**: Builds CANONICAL_MEMORY_FACTS block for injection into system prompt

**Before Patch**:
```rust
if history.is_empty() || !is_memory_recall_query(message) {
    return None; // ← Returns None when history empty
}
```

**After Patch**:
```rust
if !is_memory_recall_query(message) {
    return None;
}
// Always inject block for memory recall queries, even with empty history
```

### 7. System Prompt Assembly
**Status**: CERTIFIED
**Role**: Assembles final system prompt with all context blocks

### 8. LLM Processing
**Status**: CERTIFIED
**Role**: Generates response based on system prompt

### 9. Response Contract
**Status**: CERTIFIED
**Role**: Returns response to frontend

### 10. UI/Rendered Truth
**Status**: CERTIFIED
**Role**: Displays response to user

## Rupture Point Analysis

### Location
`src-tauri/src/conversation_engine/commands.rs:1707`
Function: `build_canonical_memory_fact_block()`

### Why It Was Broken
When conversation history was empty (first message or no database), the function returned `None`. This meant the `CANONICAL_MEMORY_FACTS` block was never injected into the system prompt.

### Why This Caused FALSE_MEMORY_CLAIM
Without the `CANONICAL_MEMORY_FACTS` block, the LLM never received the instruction:
> "Si un champ demande est absent, reponds INCONNU pour ce champ."

Without this instruction, the LLM fabricated details based on the prompt context, creating a false memory claim.

### Fix
Inject the block even when history is empty, so the LLM always receives the INCONNU instruction.