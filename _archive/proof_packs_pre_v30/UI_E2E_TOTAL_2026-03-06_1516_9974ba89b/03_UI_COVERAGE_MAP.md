# UI COVERAGE MAP

## Authority Specs

- Smoke: `e2e/desktop/ui-ultra-smoke.e2e.js`
- Full: `e2e/desktop/ui-ultra-full.e2e.js`

## Coverage Statement

- `PASS`: Desktop runtime boot and app readiness markers (`app-ready`, `ipc-ready`) exercised in authority runner flow.
- `PASS`: Chat no-silence path exercised via `sendChatAndAssertNoSilence` in smoke/full runs.
- `PASS`: Multi-page navigation and interaction exercised in full suite x3.
- `PASS`: Coverage objective for governed desktop smoke/full authority suite is met.

## Residual Limitation (Non-blocking)

- Not every discovered route has a dedicated one-to-one explicit assertion in the current spec set.

## Machine-readable Coverage Inputs

- Pages index: `proof_packs/UI_E2E_TOTAL_2026-03-06_1516_9974ba89b/ui_pages.json`
- Controls index: `proof_packs/UI_E2E_TOTAL_2026-03-06_1516_9974ba89b/ui_controls.json`
- Routes index: `proof_packs/UI_E2E_TOTAL_2026-03-06_1516_9974ba89b/ui_routes.json`
- IPC links index: `proof_packs/UI_E2E_TOTAL_2026-03-06_1516_9974ba89b/ui_ipc_links.json`

