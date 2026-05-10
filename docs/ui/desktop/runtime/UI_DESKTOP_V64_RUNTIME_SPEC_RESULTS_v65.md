# UI_DESKTOP_V64_RUNTIME_SPEC_RESULTS_v65

Mission: TITANE UI_DESKTOP_V64_RUNTIME_RECONCILIATION_SEAL_v65  
Date: 2026-05-10

## Runtime runs (fresh)

### Individual runs

| Spec | Command status | Result |
|---|---|---|
| `e2e/desktop/ui-desktop-topnav-plus-overflow.wdio.test.js` | `wdio close: code=0` | PASS |
| `e2e/desktop/ui-desktop-main-menu-capture-reconciliation.wdio.test.js` | `wdio close: code=0` | PASS |
| `e2e/desktop/ui-desktop-admin-tabs-complete.wdio.test.js` | First run `code=1`, rerun `code=0` | PASS_AFTER_REPAIR |
| `e2e/desktop/ui-desktop-total-dev-locked-contract.wdio.test.js` | `wdio close: code=0` | PASS |

### Combined run

Command family: `WDIO_SPEC='spec1,spec2,spec3,spec4' node scripts/e2e/run-desktop-suite.js`

- Initial combined run: FAIL (`spec file(s) ... not found`) — CSV parsing issue in runner
- After mission-scoped repair in `scripts/e2e/run-desktop-suite.js`: PASS
- Fresh combined proof:
  - `PASSED ... ui-desktop-topnav-plus-overflow.wdio.test.js`
  - `PASSED ... ui-desktop-main-menu-capture-reconciliation.wdio.test.js`
  - `PASSED ... ui-desktop-admin-tabs-complete.wdio.test.js`
  - `PASSED ... ui-desktop-total-dev-locked-contract.wdio.test.js`
  - `Spec Files: 4 passed, 4 total (100% completed) in 00:01:50`

## Evidence snippets

From `reports/e2e-desktop/wdio.log` (fresh combined run):

- Worker start includes all 4 `--spec` entries
- PASS lines for each of the 4 v64 specs
- Final summary: `4 passed, 4 total`

## Runtime verdict

`PASS_RUNTIME_VERIFIED`

## v66 Post-Seal Hygiene Continuity Note

- The 4-spec runtime result remains unchanged (`4 passed, 4 total`).
- Post-seal additional reruns appended extra capture rows; artifact moved from 24 to 32 records without changing verdict.
