# Hyper Center Allowlist Alignment — 2026-05-14

Verdict: PASS

Scope:
- `src/lib/security.ts`
- `src/__tests__/security/allowed-commands-legacy-prune-v34_0_6.test.ts`

Symptoms closed:
- `/hyper-center` logged `Security: Command "hyper_get_state" is not in whitelist`.
- The same surface then logged the same L1 rejection for `hyper_get_thoughts` during bootstrap.

Applied fix:
- Add the active Hyper Center command family to `ALLOWED_COMMANDS`: `hyper_init`, `hyper_get_state`, `hyper_get_thoughts`, `hyper_get_insights`, `hyper_set_mode`, `hyper_think`, `hyper_reason`, `hyper_imagine`, `hyper_generate_insight`.
- Extend the allowlist regression test so the Hyper Center family is locked against future L1 drift.

Executable proof:
- `pnpm vitest run src/__tests__/security/allowed-commands-legacy-prune-v34_0_6.test.ts` → `Test Files 1 passed`, `Tests 42 passed`.
- `pnpm exec playwright test e2e/critical/ui-prod-capture-v34_0_7.spec.ts --grep 'capture hyper-center' --reporter=line` → `1 passed (10.6s)`.

Governed closure:
- `pnpm verify:registry` → PASS
- `bash scripts/autoheal/detect_recurrence.sh` → PASS
- `bash scripts/verify_instructions.sh` → PASS

Rollback:
- `git restore -- src/lib/security.ts src/__tests__/security/allowed-commands-legacy-prune-v34_0_6.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/hyper-center-allowlist-alignment-2026-05-14.md proof_packs/HYPER_CENTER_ALLOWLIST_ALIGNMENT_2026-05-14_v35_1_5`