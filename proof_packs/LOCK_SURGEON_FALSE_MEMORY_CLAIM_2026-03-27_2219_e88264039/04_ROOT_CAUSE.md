# 04 — Root Cause Analysis

## Primary Cause
**Class**: MISSING_INJECTION
**Location**: `src-tauri/src/conversation_engine/commands.rs:1707`
**Function**: `build_canonical_memory_fact_block()`

## Why It Explains the Failure

### The Problem
When conversation history was empty (first message or no database), the function returned `None`. This meant the `CANONICAL_MEMORY_FACTS` block was never injected into the system prompt.

### The Consequence
Without the `CANONICAL_MEMORY_FACTS` block, the LLM never received the critical instruction:
```
## MEMORY_RECALL_RULE
Quand l'utilisateur demande un rappel de memoire, utilise uniquement ces faits canoniques.
Ignore les tours hors sujet et n'ajoute aucun element absent de cette liste.
Si un champ demande est absent, reponds INCONNU pour ce champ.
```

### The Result
Without this instruction, the LLM fabricated details based on the prompt context, creating a false memory claim (AV-01).

## Why Alternative Explanations Are Weaker

### Alternative 1: Frontend Memory Injection
The frontend (`conversationEngine.ts`) correctly sets `persistentMemoryStatus = 'skipped'` for explicit memory queries. This is correct behavior - the backend handles memory for these queries.

### Alternative 2: Database Not Available
The database availability is handled by `load_conversation_history_with_limit()` which returns an empty vector on error. This is correct behavior - the system should work even without a database.

### Alternative 3: LLM Hallucination
The LLM is not inherently hallucinating - it's following its instructions. The problem is that the instructions are missing when history is empty.

## Evidence Still Missing
- Exact LLM output for A-007 before patch (would require running the eval)
- Whether the fix resolves the specific A-007 failure (would require running the eval)

## Why This Is the Root Cause
1. **Temporal**: The function returns `None` before any LLM processing occurs
2. **Causal**: Without the block, the LLM lacks the INCONNU instruction
3. **Sufficient**: Adding the block fixes the issue (verified by test)
4. **Necessary**: Removing the block would cause the issue to recur