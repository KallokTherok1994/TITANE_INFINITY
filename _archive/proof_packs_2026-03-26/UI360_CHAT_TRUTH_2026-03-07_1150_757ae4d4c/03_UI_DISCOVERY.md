# 03_UI_DISCOVERY

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 (`src/pages/**`, `src/components/**`, `src/features/**`) + R3 (`src/App.tsx` routes)
C) RISK: P1
D) PLAN: discover -> classify -> baseline REQUIRED x3 -> extend
E) PROOFS: route/ui/test inventory files generated in `raw/`
F) ROLLBACK: `git restore -- proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/03_UI_DISCOVERY.md`

## Discovery Metrics
- `ROUTE_MAP.tsv`: 87 routes
- `UI_SURFACE_MAP.tsv`: 493 discovered surfaces
- `CHAT_SYSTEM_MAP.tsv`: 7202 static chat-related hits
- `BACKEND_COMMAND_MAP.tsv`: 182 Tauri command entries
- `UI_TO_BACKEND_TRACE_MAP.tsv`: 815 invoke call sites
- `TEST_COVERAGE_MAP.tsv`: 92 test artifacts

## Machine-readable Inventories
- `proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/ROUTE_MAP.tsv`
- `proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/UI_SURFACE_MAP.tsv`
- `proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/CHAT_SYSTEM_MAP.tsv`
- `proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/BACKEND_COMMAND_MAP.tsv`
- `proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/UI_TO_BACKEND_TRACE_MAP.tsv`
- `proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/TEST_COVERAGE_MAP.tsv`
- `proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/raw/ORPHAN_OR_UNVERIFIED_SURFACES.tsv`

## Current Classification
- Discovery completeness: `PROVEN_STATIC_ONLY`
- Runtime completeness (required scope): `PROVEN_RUNTIME`
- Runtime completeness (extended scope): `PRESENT_BUT_UNPROVEN`
- No discovered surface left uncategorized: current state `FOUND + PRESENT_BUT_UNPROVEN` pending extended runtime pass/fail
