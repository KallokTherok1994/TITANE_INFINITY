# Scope Freeze

## Allowed files (minimal)
- `src/config/offline-first.ts`
- `src/__tests__/architecture/no_offline_first_runtime_import.test.ts` (new)
- `proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/*` (evidence only)
- `scripts/autoheal/autoheal_rules.jsonl` (append-only rule capture)

## Forbidden changes
- No new dependencies.
- No broad refactor or file moves.
- Do not touch more than 10 source files.
- No direct UI web calls.

## Ring impact expectation
- Ring 4 only (`src/config`, frontend architecture tests).
- No Ring 1/2/3 behavior change.

## Scope status
- Within limits (<= 2 source files + proof artifacts + autoheal append).

