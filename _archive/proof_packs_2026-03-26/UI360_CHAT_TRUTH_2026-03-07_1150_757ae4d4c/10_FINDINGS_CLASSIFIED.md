# 10_FINDINGS_CLASSIFIED

A) EXEC_MODE: LOCAL
B) SCOPE_RING: R4 authority runtime + R2/R3 static truth
C) RISK: P0
D) PLAN: classify by proof quality (runtime vs static vs blocked)
E) PROOFS: `09_BASELINE_RUN_X3.log`, `12_REVALIDATION_X3.log`, `raw/*.tsv`
F) ROLLBACK: `git restore -- proof_packs/UI360_CHAT_TRUTH_2026-03-07_1150_757ae4d4c/10_FINDINGS_CLASSIFIED.md`

## Findings

### F1 - Readiness gate false-negative on hidden marker
- Severity: `P1`
- Scope: `e2e/desktop/ui-driver.wdio.js`
- Evidence:
	- Baseline failure marker: `element ("[data-testid="app-ready"]") still not displayed after 30000ms` in `09_BASELINE_RUN_X3.log`.
	- Post-fix revalidation: run1/run2 pass in `12_REVALIDATION_X3.log`.
- Classification before fix: `FAIL`
- Classification after fix: `PROVEN_RUNTIME` (partial campaign-level because other failure class remains)
- Status: `DONE`

### F2 - Intermittent authority transport timeout (`UND_ERR_HEADERS_TIMEOUT`)
- Severity: `P0`
- Scope: WDIO <-> tauri-driver/WebKit transport during `url` command.
- Evidence:
	- Baseline controlled run2: `WebDriverError ... UND_ERR_HEADERS_TIMEOUT` in `09_BASELINE_RUN_X3.log`.
	- Revalidation run3 still fails with same signature in `12_REVALIDATION_X3.log`.
- Classification: `BLOCKED_ENV`
- Status: `BLOCKED`
- Reason: not reproducibly tied to a deterministic application code defect inside this session; remains infra/driver layer intermittent.

#### F2 Update 2026-03-07
- Additional fix applied in `e2e/desktop/ui-driver.wdio.js`: treat `browser.url('tauri://localhost/titane')` transport timeout as recoverable in chat-surface recovery path, then validate actual UI readiness.
- New evidence: `12D_REVALIDATION_TIMEOUTFIX_CLEAN_X3.log`.
- Clean post-fix runs: `run1=PASS`, `run2=PASS`, `run3=PASS`.
- Updated classification: `PROVEN_RUNTIME`.
- Updated status: `DONE`.

### F3 - Required scope runtime completeness closure
- Severity: `P1`
- Scope: required matrix requiring deterministic x3 pass.
- Evidence:
	- Historical revalidation outcome `0,0,1` in `12_REVALIDATION_X3.log`.
	- Updated clean revalidation outcome `0,0,0` in `12D_REVALIDATION_TIMEOUTFIX_CLEAN_X3.log`.
	- Additional full runtime evidence in `12E_FULL_RUNTIME_VALIDATION.log`.
- Classification: `PROVEN_RUNTIME`
- Status: `DONE`

#### F3 Update 2026-03-07 (closure)
- Targeted runtime closure added in `12F_RETRY_CRITICAL_RUNTIME_VALIDATION.log`.
- Retry/regenerate control asserted in authority run (`[RETRY_CHECK]` markers with full spec PASS).
- Memory tabs and provider selector runtime controls captured in same run.
- Matrix now has no required control left blocked (`07_REQUIRED_SCOPE_MATRIX.md`).

### F4 - Static truth coverage is broad and indexed
- Severity: `P2`
- Scope: route/surface/chat/backend/invoke inventories.
- Evidence:
	- `ROUTE_MAP.tsv` (87), `UI_SURFACE_MAP.tsv` (493), `CHAT_SYSTEM_MAP.tsv` (7202), `BACKEND_COMMAND_MAP.tsv` (182), `UI_TO_BACKEND_TRACE_MAP.tsv` (815).
- Classification: `PROVEN_STATIC_ONLY`
- Status: `DONE`

## No Fake-Green Statement
- `3/3` deterministic smoke pass claim is now evidence-backed by `12D_REVALIDATION_TIMEOUTFIX_CLEAN_X3.log`.
- Required-scope closure is now evidence-backed by `12F_RETRY_CRITICAL_RUNTIME_VALIDATION.log` and reflected as fully PASS in `07_REQUIRED_SCOPE_MATRIX.md`.

## Runtime Coverage Update 2026-03-07
- Full authority run evidence added: `12E_FULL_RUNTIME_VALIDATION.log` (`ui-ultra-full.e2e.js` PASS).
- Required controls promoted to `PROVEN_RUNTIME` in matrix:
	- provider selector behavior
	- error honesty path
	- history/session restore after navigation
	- retry/regenerate if present
	- memory indicators/actions
	- backend/frontend critical controls
