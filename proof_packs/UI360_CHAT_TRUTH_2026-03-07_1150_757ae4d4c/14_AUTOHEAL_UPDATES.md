# 14_AUTOHEAL_UPDATES

A) EXEC_MODE: LOCAL
B) SCOPE_RING: governance + touched fix files
C) RISK: P1
D) PLAN: record each fix in AutoHeal and verify recurrence/instructions gates
E) PROOFS: `scripts/autoheal/autoheal_rules.jsonl`, recurrence + instruction check outputs
F) ROLLBACK: `git restore -- scripts/autoheal/autoheal_rules.jsonl proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/14_AUTOHEAL_UPDATES.md`

## Captured Entries

### AH-2026-03-07-0080
- Scope: `frontend-bootstrap`, `index-html-guard`, `dev-runtime`
- Symptom: blocked loading false positive (`entree React non initialisee`).
- Fix: env-aware bootstrap timeout + session-scoped recovery in `index.html`.

### AH-2026-03-07-0081
- Scope: `e2e-desktop`, `wdio`, `readiness-marker`
- Symptom: hidden `app-ready` marker caused false fail.
- Fix: readiness fallback to interactive markers in `e2e/desktop/ui-driver.wdio.js`.

### AH-2026-03-07-0082
- Scope: `e2e-desktop`, `wdio`, `transport-timeout-recovery`
- Symptom: intermittent `UND_ERR_HEADERS_TIMEOUT` on recovery navigation (`url` POST) during chat-surface fallback.
- Fix: treat timeout as recoverable in recovery navigation path and verify resulting surface state before failing.
- Proof: `12D_REVALIDATION_TIMEOUTFIX_CLEAN_X3.log` (`3/3 PASS`).

### AH-2026-03-07-0083
- Scope: `e2e-desktop`, `required-scope-closure`, `retry-control`
- Symptom: required scope remained blocked due missing runtime proof for retry/regenerate and critical controls.
- Fix: added explicit retry action assertion helper in `e2e/desktop/ui-driver.wdio.js`, asserted retry/provider controls in `e2e/desktop/ui-ultra-full.e2e.js`, and captured closure evidence in `12F_RETRY_CRITICAL_RUNTIME_VALIDATION.log`.
- Proof: clean full authority run `artifacts/full_timeoutfix_retry_run1_clean/wdio.log` with `Spec Files: 1 passed` and retry/provider markers summarized in `12F_RETRY_CRITICAL_RUNTIME_VALIDATION.log`.

## Mandatory Checks
- `bash scripts/autoheal/detect_recurrence.sh` -> `PASS` (`G_AH_RULE_CAPTURED_FOR_EACH_FIX`, `G_AH_RECURRENCE_GUARD_PASS`).
- `bash scripts/verify_instructions.sh` -> `PASS` (summary reported all checks passed).

## AutoHeal Update Verdict
- `PASS`
