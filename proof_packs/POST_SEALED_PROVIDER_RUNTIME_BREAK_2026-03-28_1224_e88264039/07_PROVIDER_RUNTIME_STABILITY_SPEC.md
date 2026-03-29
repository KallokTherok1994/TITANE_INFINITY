# PROVIDER_RUNTIME_STABILITY_SPEC

## 1. Purpose and scope
This document defines the minimal runtime stability requirements for the **active Tauri target** so the memory consume stage can be proven honestly. It is **pre-control-plane** and does not establish a full provider fabric or routing policy.

## 2. Active target and canary
- Target: Tauri desktop (embedded assets), WDIO/wry harness.
- Canary: `scripts/e2e/run-memory-chat-proof-ui.sh` with `TITANE_PROOF_SCENARIO=MEMORY_MULTI_TURN`.
- Requirement: same canary must be reused across runs; x3 execution for stability.

## 3. Requested -> selected -> executed -> degraded/fallback -> shown chain
- **Requested**: `sendTraceMeta` + runtime summary (`Requested: ...`).
- **Selected**: runtime summary (`Provider: ...`).
- **Executed**: runtime meta (`provider_used`, `provider_mode`) must not be `ERROR`.
- **Degraded/Fallback**: any `PROVIDER_UNAVAILABLE` or `HONEST_OFFLINE_DEGRADED` must be explicit.
- **Shown**: UI runtime summary and data attributes must match runtime truth.

## 4. Canonical owners per stage
- Requested/selected/executed: runtime decision meta + IPC-backed runtime summary.
- Degraded/fallback: provider reason code and mode.
- Shown: UI runtime summary (must reflect runtime truth, not aspiration).

## 5. Memory consume unblock condition
Memory consume is unblocked only if **all** are true during the canary:
- `provider_mode != ERROR`
- `provider_reason != PROVIDER_UNAVAILABLE`
- `MEMORY_PROOF_VERDICT != HONEST_OFFLINE_DEGRADED`

## 6. Breakpoint vocabulary
- BREAK_AT_TARGET_AVAILABILITY
- BREAK_AT_PROVIDER_SELECTION
- BREAK_AT_PROVIDER_EXECUTION
- BREAK_AT_FALLBACK_HANDLING
- BREAK_AT_DEGRADED_GATE
- BREAK_AT_UI_TRUTH_PROJECTION
- BREAK_AT_MEMORY_CONSUME_UNBLOCK
- TARGET_MISMATCH
- UNKNOWN

## 7. Minimal fix rules
Only small, bounded fixes are allowed here (no provider fabric/control-plane redesign).

## 8. Reopen / triage rule
If stabilization requires provider fabric, routing policy redesign, or multi-provider control-plane work, stop and triage.

## 9. Rollback rule
To revert this spec: `git restore -- docs/governance/PROVIDER_RUNTIME_STABILITY_SPEC.md`.
