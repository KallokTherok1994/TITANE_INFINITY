# AUTOFIX LOG

## Fix 1

- File: `e2e/desktop/ui-driver.wdio.js`
- Scope: `sendChatAndAssertNoSilence`
- Change: add deterministic chat-surface recovery helper `ensureChatSurfaceVisible`.
- Signature evidence:
- `logs/smoke_run1/wdio.log` contains `none of selectors became visible: [data-testid="chat-input"], [data-testid="tab-conversation"]`.

## Fix 2

- File: `e2e/desktop/ui-driver.wdio.js`
- Scope: `ensureChatSurfaceVisible`
- Change: remove flaky refresh fallback and force route re-anchor with `browser.url('tauri://localhost/titane')`.
- Signature evidence:
- `logs/smoke_x3_run1/wdio.log` contains `WebDriverError: The operation was aborted due to timeout when running "refresh"`.

## Verification

- `PASS`: `logs/smoke_x3b_summary.log` (3/3 pass)
- `PASS`: `logs/full_x3_summary.log` (3/3 pass)
- `PASS`: `logs/no_skips_gate.stdout` (`NO_SKIPS_PASS`)

## Fix 3

- File: `scripts/gates/g_network_one_door.sh`
- Scope: one-door network gate scan exclusions
- Change: exclude `Cargo.lock` and `*.lock` from reqwest/ureq pattern scan.
- Signature evidence before fix:
- `logs/g_network_one_door.log` reported lockfile-only `reqwest` hits.
- Verification after fix:
- `logs/g_network_one_door.log` => `G_NETWORK_ONE_DOOR: PASS`.

