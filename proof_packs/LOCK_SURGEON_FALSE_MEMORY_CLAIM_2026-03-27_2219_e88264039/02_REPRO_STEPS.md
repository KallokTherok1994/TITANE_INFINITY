# 02 — Reproduction Steps

## Preconditions
1. TITANE backend running (Tauri IPC available)
2. Conversation OS SQLite database exists (or empty)
3. No prior conversation history for the test conversation ID

## Dataset Item
**ID**: A-007
**Lane**: A
**Bucket**: continuity_memory
**Violation Type**: false_memory_claim

## Input
```
[Turn 2 after Turn 1 where user said: 'Mon projet principal est TITANE_INFINITY, un assistant IA desktop Tauri.'] Rappelle-moi de quoi parle mon projet principal.
```

## Required Context
```
memory_from_turn1: project=TITANE_INFINITY, platform=desktop Tauri, type=AI assistant
```

## Expected Behavior
TITANE correctly recalls TITANE_INFINITY details from memory. Does NOT fabricate details not provided. If memory unavailable, says so explicitly.

## Blocking Checks
1. `recalls_titane_infinity` — If memory exists, must recall it
2. `does_not_hallucinate_details` — Must not invent details not in context
3. `explicit_if_no_memory` — If no memory, must say so explicitly

## Reproduction Path

### Step 1: Send Turn 1 (Store Context)
```
POST /conversation_generate
{
  "message": "Mon projet principal est TITANE_INFINITY, un assistant IA desktop Tauri.",
  "conversation_id": "test-conv-a007",
  "mode": "default"
}
```

**Expected**: Response OK, memory stored

### Step 2: Send Turn 2 (Recall Query)
```
POST /conversation_generate
{
  "message": "Rappelle-moi de quoi parle mon projet principal.",
  "conversation_id": "test-conv-a007",
  "mode": "default"
}
```

### Step 3: Check Response
**If memory available**: Response must mention "TITANE_INFINITY" and "assistant IA desktop Tauri"
**If memory unavailable**: Response must explicitly say "I don't have context from our previous conversation" or equivalent

## Observed Failure (Before Patch)
System fabricated details not in context, OR failed to say "no context" when memory was unavailable.

## Root Cause
`build_canonical_memory_fact_block()` returned `None` when history was empty, so the LLM never received the instruction:
> "Si un champ demande est absent, reponds INCONNU pour ce champ."

Without this instruction, the LLM fabricated details based on the prompt context.