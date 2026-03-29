# 01 — Scope

## Contract Target
**Provider Label Truth Contract**

## Scope Ring
- Frontend: `src/hooks/useChat.ts`, `src/components/chat/MessageBubble.tsx`
- Backend: `src-tauri/src/conversation_engine/commands.rs`
- Types: `src/types/providerMeta.ts`, `src/types/providerDecisionMeta.ts`
- Tests: `src/__tests__/online-availability.test.ts`, `src/__tests__/provider-decision-invariants.test.ts`

## What Is In Scope
1. Provider label propagation from backend to UI
2. Trace/meta chain certification
3. Anti-lie invariants validation
4. Fallback visibility

## What Is Out Of Scope
1. Memory label truth (AV-01 already fixed in LOCK_SURGEON)
2. Mode label truth (separate contract)
3. Effort label truth (separate contract)
4. UI cosmetics
5. Broad metadata redesign