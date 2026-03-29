# BREAK_CLASSIFICATION — P1.13a

## Classification table

| Break ID | Component | Classification | Severity | Commit gate |
|----------|-----------|----------------|----------|-------------|
| BREAK_AT_RECALL_WRITE_MISMATCH | `conversation_generate` → `unified_memory.recall()` | WIRED_BUT_BROKEN | Medium (no cross-session recall) | Not blocking P1.13a proof |
| BREAK_AT_CROSS_SESSION | `MultiLayerMemoryManager` in-session STM | BY_DESIGN | Low (expected ephemeral) | N/A |
| SYSTEM_ISOLATED | `persistent_memory_v19` not wired to conversation recall | IDENTIFIED_GAP | Medium (LTM exists but not injected) | Future cycle |

## WIRED_BUT_BROKEN definition

A path that is:
- Present in source code
- Syntactically correct
- Registered and callable at IPC level
- But functionally inert at runtime due to a missing write-side prerequisite

Applies to: `orchestrator.unified_memory.recall()` — the read path exists, the write path was removed.

## IDENTIFIED_GAP definition

Two systems that could interact but do not:
- `persistent_memory_v19` stores LTM entries to disk
- `conversation_generate` does not read from `persistent_memory_v19`
- The gap is known and documented

## NOT a regression

These breaks predate P1.13a. P1.13a documents them precisely. No product regression introduced.

## P1.13 correction

P1.13 classified `LTM_BREAK_IDENTIFIED` based on legacy TypeScript `UnifiedMemoryService` analysis. That service has been LEGACY since 2026-03. P1.13a corrects the classification to the Rust runtime paths.

## What IS proven (commit-eligible)

`persistent_memory_v19` provides a fully working LTM storage path: write → encrypt/persist → read → decrypt at runtime. This is `LTM_PERSISTENCE_PROVEN`.
