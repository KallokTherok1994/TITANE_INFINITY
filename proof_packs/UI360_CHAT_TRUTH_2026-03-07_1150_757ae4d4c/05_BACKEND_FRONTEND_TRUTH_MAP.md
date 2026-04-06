# 05_BACKEND_FRONTEND_TRUTH_MAP

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R1+R2+R3+R4 (`src-tauri/src/**`, `src/**`)
C) RISK: P0
D) PLAN: command map -> invoke map -> critical truth checks in runtime
E) PROOFS: static command/invoke evidence captured + runtime closure in `12E_FULL_RUNTIME_VALIDATION.log` and `12F_RETRY_CRITICAL_RUNTIME_VALIDATION.log`
F) ROLLBACK: `git restore -- proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/05_BACKEND_FRONTEND_TRUTH_MAP.md`

## Static Truth Metrics
- Backend command map rows: `182`
- Frontend invoke trace rows: `815`
- Backend truth scan rows: `19336`

## Current Truth State
- Backend command presence: `PROVEN_STATIC_ONLY`
- UI invoke surface presence: `PROVEN_STATIC_ONLY`
- Runtime effect alignment per critical controls: `PROVEN_RUNTIME`

## Source Inventories
- `proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/BACKEND_COMMAND_MAP.tsv`
- `proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/UI_TO_BACKEND_TRACE_MAP.tsv`
