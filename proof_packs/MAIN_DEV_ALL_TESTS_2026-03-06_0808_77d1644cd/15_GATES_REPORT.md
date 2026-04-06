# Gates Report - MAIN_DEV_ALL_TESTS_X3

Date: 2026-03-06
Proof pack: `proof_packs/MAIN_DEV_ALL_TESTS_2026-03-06_0808_77d1644cd`

## Execution gates

| Gate | Status | Evidence |
|---|---|---|
| G_ON_MAIN | PASS | `01_BOOTSTRAP.md`, `02_MAIN_SYNC.md` (`MAIN...origin/MAIN`, ahead/behind `0 0`) |
| G_UNIT_X3 | PASS | `06_UNIT_X3.log` (`PASS=3/3`, `3288 passed`) |
| G_LINT_X3 | PASS | `07_LINT_TYPECHECK_X3.log` (`PASS=3/3`) |
| G_TYPECHECK_X3 | PASS | `07_LINT_TYPECHECK_X3.log` (`PASS=3/3`) |
| G_E2E_DESKTOP_SMOKE_X3 | PASS | `08_E2E_DESKTOP_SMOKE_X3.log` final section (`PASS=3/3`) |
| G_E2E_DESKTOP_FULL_X3 | PASS | `09_E2E_DESKTOP_FULL_X3.log` (`PASS=3/3`) |
| G_E2E_WEBIO_WDIO_X3 | PASS (N/A by authority) | `10_E2E_WEBIO_WDIO_X3.log` notes WDIO authority already covered by 08/09 |
| G_E2E_PLAYWRIGHT_X3 | PASS (configured mode) | `11_E2E_PLAYWRIGHT_X3.log` (`PASS=3/3`) |

## Governance and anti-recurrence gates

| Gate | Status | Evidence |
|---|---|---|
| G_AH_RULE_CAPTURED_FOR_EACH_FIX | PASS | `scripts/autoheal/autoheal_rules.jsonl` + `registry/autofix-autoheal-rules.jsonl`, validator output in `14_AUTOFIX_AUTOHEAL.log` |
| G_AH_RECURRENCE_GUARD_PASS | PASS | `bash scripts/autoheal/detect_recurrence.sh` output in `14_AUTOFIX_AUTOHEAL.log` |
| G_VERIFY_INSTRUCTIONS | PASS | `bash scripts/verify_instructions.sh` output (`SUMMARY: PASS=20 FAIL=0`) in `14_AUTOFIX_AUTOHEAL.log` |

## No-skips gate

| Gate | Status | Evidence |
|---|---|---|
| G_NO_SKIPS | FAIL | `12_NO_SKIPS_SCAN.log` contains repeated `gate disabled proof` markers in `11_E2E_PLAYWRIGHT_X3.log`; full-mode probe `TITANE_E2E_FULL=1 pnpm run test:e2e` ends `EXIT_CODE=1` with `4 failed, 74 passed` |

Full-mode failing tests (from `/tmp/titane_pw_full.log`):
1. `e2e/critical/app-launch.spec.ts:25:3`
2. `e2e/critical/engine-navigation.spec.ts:40:3`
3. `e2e/critical/visual-engine.spec.ts:99:3`
4. `e2e/critical/visual-engine.spec.ts:140:3`

## Seal gate decision

- Required condition for `SCELLE`: all applicable gates PASS.
- Current state: `G_NO_SKIPS = FAIL`.
- Seal decision: `NON_SCELLE`.
