# 06 — PATCH DECISION (Session 2)

## Lock Selected
Lock #9: only fusion score/trend injected; identity/core values/phase never influence chat

## Justification (Section 10 criteria met)
- prompt budget bounded: TWINS_CONTEXT line grows from ~40 to ~65 chars max
- effect is testable: 5 new E-series tests (E1-E5) all PASS
- source freshness: same 30-min stale guard applies to full entry
- no narrative inflation: no new IPC calls, no new API calls, data already fetched

## Files Changed
1. src/hooks/useTwinEvolution.ts — write currentPhase + syncScore to localStorage
2. src/services/chat/chatMemorySingleDoor.ts — extend type + return new fields
3. src-tauri/src/conversation_engine/commands.rs — extract + inject in TWINS_CONTEXT line
4. src/__tests__/twins/twins-context-chain.test.ts — 5 new E-series tests

## NOT Changed (out of scope for this lock)
- coreValues (requires useTwinIdentity hook, different IPC, separate localStorage key — deferred)
- humanStyle (complex struct, would inflate prompt — deferred)
- adjustmentSuggestions (array — prompt budget concern — deferred)
