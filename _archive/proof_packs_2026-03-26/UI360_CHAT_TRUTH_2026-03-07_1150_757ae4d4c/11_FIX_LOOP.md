# 11_FIX_LOOP

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4
C) RISK: P1
D) PLAN: one failing signature -> one minimal fix -> x3 revalidation
E) PROOFS: `09_BASELINE_RUN_X3.log`, `12_REVALIDATION_X3.log`, `scripts/autoheal/autoheal_rules.jsonl`
F) ROLLBACK: `git restore -- e2e/desktop/ui-driver.wdio.js scripts/autoheal/autoheal_rules.jsonl`

## Iteration 1
- Symptom selected: `app-ready` displayed timeout (`30000ms`) despite interactive UI.
- Root cause: readiness logic hard-required visible `app-ready` when marker exists.
- Minimal fix:
	- File: `e2e/desktop/ui-driver.wdio.js`
	- Change: tolerate hidden `app-ready`; fallback to interactive markers (`nav-top-main`, `page-titane`, `chat-input`); accept visible nav as readiness signal.
- AutoHeal capture: `AH-2026-03-07-0081`.
- Revalidation x3:
	- run1 pass
	- run2 pass
	- run3 fail (`UND_ERR_HEADERS_TIMEOUT`)

## Iteration 2 Decision
- Residual failing signature differs from iteration-1 root cause and is transport-level intermittent.
- No additional application-level patch applied in this campaign to avoid speculative/flaky band-aid changes.
- Classification moved to `BLOCKED_ENV` with explicit next action (see `18_FINAL_VERDICT.md`).

## Iteration 2 Execution Update (2026-03-07)
- Symptom selected: intermittent `UND_ERR_HEADERS_TIMEOUT` during `browser.url('tauri://localhost/titane')` in `ensureChatSurfaceVisible`.
- Minimal fix:
	- File: `e2e/desktop/ui-driver.wdio.js`
	- Change: recoverable handling of transport timeout for the recovery navigation call, followed by concrete surface verification (`waitAppReady`, selectors visibility).
- Revalidation proof: `12D_REVALIDATION_TIMEOUTFIX_CLEAN_X3.log`.
- Outcome: clean `3/3 PASS` on smoke authority runs (`reval_timeoutfix_clean_run1b/2b/3b`).
- AutoHeal capture: `AH-2026-03-07-0082`.

## Fix Loop Outcome
- Fixed signature: `DONE`
- Residual signature: `DONE` (for timeout class in this scope)
- Campaign fix-loop verdict: `DONE`
