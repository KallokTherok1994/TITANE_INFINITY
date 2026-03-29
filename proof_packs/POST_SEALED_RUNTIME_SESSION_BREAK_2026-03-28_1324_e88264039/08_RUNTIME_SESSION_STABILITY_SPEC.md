# RUNTIME_SESSION_STABILITY_SPEC

## 1. Purpose and scope
Define minimal runtime-session stability requirements for the **active Tauri target** so the memory canary can complete **x3** without session collapse. This is **pre-memory-seal** and not a desktop architecture redesign.

## 2. Active target and same-canary rule
- Target: Tauri desktop (embedded assets), WDIO/wry harness.
- Canary: `scripts/e2e/run-memory-chat-proof-ui.sh` with `TITANE_PROOF_SCENARIO=MEMORY_MULTI_TURN`.
- Rule: same target, same canary; no silent scenario or harness changes.

## 3. Session stability chain
- TARGET_BOOT -> DRIVER_ATTACH -> SESSION_CREATE -> SESSION_PERSIST_STEP -> SESSION_PERSIST_RUN -> SESSION_PERSIST_X3 -> CANARY_COMPLETE.

## 4. Breakpoint vocabulary
- BREAK_AT_TARGET_BOOT
- BREAK_AT_DRIVER_ATTACH
- BREAK_AT_SESSION_CREATE
- BREAK_AT_SESSION_PERSIST_STEP
- BREAK_AT_SESSION_PERSIST_RUN
- BREAK_AT_SESSION_PERSIST_X3
- BREAK_AT_CANARY_COMPLETION
- TARGET_MISMATCH
- UNKNOWN

## 5. Minimal fix rules
Only bounded, reversible stabilizations (no WRY/desktop architecture redesign, no provider/memory changes).

## 6. x3 seal condition
Memory canary seal requires **three consecutive runs** that complete without invalid session id or page-crash.

## 7. Escalation rule
If the session crash requires changes beyond small harness/attach stabilization, stop and triage.

## 8. Rollback rule
To revert this spec: `git restore -- docs/governance/RUNTIME_SESSION_STABILITY_SPEC.md`.
