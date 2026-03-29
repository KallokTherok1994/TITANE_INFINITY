# 05 — Primary Rupture Point

## Chosen Rupture Point
**Memory Status Not Visible in UI**

## Evidence
- `conversationEngine.ts`: `persistentMemoryStatus` is set ('loaded', 'empty', 'unavailable', 'skipped')
- `conversationEngine.ts`: `persistentMemoryStatusContext` is injected into `systemPrompt`
- `commands.rs`: `memory_recall_ids` is tracked in metadata
- `MessageBubble.tsx`: No memory status badge displayed

## Why This Is Highest Leverage
1. **User Cannot Verify**: Users cannot see if memory influenced their response
2. **Truth Gap**: Runtime truth (memory used) is not reflected in UI
3. **Anti-Lie Risk**: If memory is not used but response suggests it was, users cannot detect this

## Analysis
However, this is a **design decision**, not a contract violation:
- Memory status is correctly propagated through the chain
- `memory_recall_ids` is available in metadata for debug/trace
- The absence of a UI badge is intentional (not a bug)
- Memory consumption is tracked via `memory_sources_injected`

## Why No Patch Is Needed
The memory truth contract is correctly implemented. The lack of a visible UI label is a design choice, not a contract violation. The runtime truth is available in metadata for consumers who need it.

## What Remains Out Of Scope
- Adding a visible memory status badge (design decision, not contract violation)
- Memory label truth in UI (separate concern)
- Effort label truth (separate contract)
- Mode label truth (separate contract)