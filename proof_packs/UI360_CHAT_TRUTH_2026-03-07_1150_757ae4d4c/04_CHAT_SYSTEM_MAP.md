# 04_CHAT_SYSTEM_MAP

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R2+R3+R4 (`src/pages/TitanePage.tsx`, `src/App.tsx`, `src/services/**`, `src/stores/**`, `src-tauri/src/**`)
C) RISK: P0
D) PLAN: static map -> baseline x3 runtime -> classify truth/fake-green/silent fallback
E) PROOFS: static mapping generated; runtime proofs in `12D_REVALIDATION_TIMEOUTFIX_CLEAN_X3.log`, `12E_FULL_RUNTIME_VALIDATION.log`, `12F_RETRY_CRITICAL_RUNTIME_VALIDATION.log`
F) ROLLBACK: `git restore -- proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/04_CHAT_SYSTEM_MAP.md`

## Chat Capability Classification (Current)
- Page render: `PROVEN_RUNTIME`
- Provider selector presence: `PROVEN_RUNTIME`
- Input/send wiring (invoke call sites present): `PROVEN_RUNTIME`
- Streaming/response completion: `PROVEN_RUNTIME`
- Retry/regenerate behavior: `PROVEN_RUNTIME`
- Error honesty/degraded wording: `PROVEN_RUNTIME`
- Session/history restore: `PROVEN_RUNTIME`
- Memory indicators/actions: `PROVEN_RUNTIME`

## Source Inventory
- `proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/CHAT_SYSTEM_MAP.tsv`
