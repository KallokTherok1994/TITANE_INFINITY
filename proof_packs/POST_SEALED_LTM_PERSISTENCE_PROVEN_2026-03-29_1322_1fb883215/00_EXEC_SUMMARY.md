# EXEC_SUMMARY — P1.13a

## Pack

POST_SEALED_LTM_PERSISTENCE_PROVEN_2026-03-29_1322_1fb883215

## Cycle

P1.13a — LTM Runtime Path Reality Check + Persistence Proof

## Verdict

**LTM_PERSISTENCE_PROVEN**

## Summary

The `persistent_memory_v19` IPC path is fully proven at runtime: write→persist→read round-trip confirmed across X3 independent E2E runs via real Tauri binary, real IPC, real file I/O.

Simultaneously, the conversation recall isolation is documented: `conversation_generate` uses `orchestrator.unified_memory.recall()` which always returns 0 items because `unified_memory` has no active writer in the `conversation_generate` path.

## Evidence snapshot (X3)

| Run | pre long_term | UUID | post long_term | read total_count |
|-----|---------------|------|----------------|------------------|
| 1   | 0             | 73cc4a20-c11e-4320-bae8-82878e5ac33b | 1 | 87 |
| 2   | 1             | 8c74e502-2a9e-4a6a-af28-6b005c5f90fb | 2 | 88 |
| 3   | 2             | 3824b693-e72d-4c0e-99b1-644f40a0c037 | 3 | 89 |

## Key corrections from P1.13

P1.13 (prior cycle) analyzed the WRONG path: TypeScript `UnifiedMemoryService` (documented LEGACY since 2026-03). P1.13a corrects this by proving the ACTIVE path: `persistent_memory_v19` (Rust, file-backed, IPC-accessible from main window).

## HEAD at exec

1fb883215

## Version

28.88.0
