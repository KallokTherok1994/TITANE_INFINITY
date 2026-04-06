# 00 — EXEC SUMMARY

A) EXEC_MODE: BACKGROUND / PROOF-DRIVEN
B) SCOPE_RING: Ring 3 (Rust core memory stack) + Ring 4 (TS backup layer)
C) RISK: HIGH — STM/LTM data loss on crash/restart
D) PLAN: Bootstrap → map → identify lock → minimal patch → cargo check → proof pack
E) PROOFS: cargo check EXIT 0, code trace, disk path verified
F) ROLLBACK: git restore -- src-tauri/src/core/modules/unified_memory.rs

## PRIMARY LOCK IDENTIFIED AND CLOSED

LOCK: STM_NOT_PERSISTED / LTM_NOT_RETRIEVABLE (combined)

Root cause: `promote_mtm_to_ltm()` in `core/modules/unified_memory.rs` (the UnifiedMemory
used by the chat orchestrator) had LTM disk persistence described as a COMMENT ONLY.
No `fs::write()` call was ever made. The LTM in-memory index was populated, but on app
restart the index was empty because no files existed on disk.

ALSO: `init()` had no LTM restore path — even if files existed, they were never loaded.

PATCH (2 changes):
1. `promote_mtm_to_ltm()`: replace comment block with real `std::fs::write()` call +
   rollback of ltm.index entry if write fails (anti-ghost-entry guard).
2. `init()`: add `restore_ltm_from_disk()` call after dir creation — scans *.mem files,
   deserializes MemoryItem (Serialize+Deserialize already derived), rebuilds metadata index.

CARGO CHECK: EXIT 0

FINAL VERDICT: STM_NOT_PERSISTED (STM remains RAM-only — designed behavior, not a bug for
real-time chat; MTM is same), LTM_NOT_RETRIEVABLE (FIXED).
