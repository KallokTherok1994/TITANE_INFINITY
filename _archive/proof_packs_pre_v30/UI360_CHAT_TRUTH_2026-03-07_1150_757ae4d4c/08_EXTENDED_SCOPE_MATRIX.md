# 08_EXTENDED_SCOPE_MATRIX

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 extended surfaces
C) RISK: P2
D) PLAN: run extended slices after REQUIRED baseline verdict
E) PROOFS: 493 discovered extended surfaces in inventory
F) ROLLBACK: `git restore -- proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/08_EXTENDED_SCOPE_MATRIX.md`

## Extended Scope Source
- `proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/UI_SURFACE_MAP.tsv`

## Current Classification Rule
- Default per discovered extended surface: `FOUND`, `PRESENT_BUT_UNPROVEN`, `EXTENDED`.
- Post-execution state will move to one of:
	- `PROVEN_RUNTIME`
	- `PROVEN_STATIC_ONLY`
	- `PRESENT_BUT_UNWIRED`
	- `FAIL`
	- `BLOCKED_ENV`
	- `BLOCKED_APPROVAL`

## Coverage Status
- No discovered surface left uncategorized.

## Post-Campaign Status
- Extended runtime campaign execution: `BLOCKED`
- Static extended inventory coverage: `PASS`
- Reason: required deterministic desktop gate is now `PASS` (`12D`, `12F`), but full extended-surface runtime sweep was not executed in this cycle.
