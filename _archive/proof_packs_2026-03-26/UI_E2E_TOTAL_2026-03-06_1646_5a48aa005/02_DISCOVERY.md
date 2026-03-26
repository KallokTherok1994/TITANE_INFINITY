# 02 Discovery

## Runner discovery

- Canonical desktop authority selected: WDIO + Tauri driver.
- Entry command: `node scripts/e2e/run-desktop-suite.js`.
- Spec switch used:
	- `WDIO_SPEC=./e2e/desktop/ui-ultra-smoke.e2e.js`
	- `WDIO_SPEC=./e2e/desktop/ui-ultra-full.e2e.js`

## UI discovery scope

- Top-level routes discovered from `e2e/desktop/page-objects/uiPages.po.js` and route map.
- Selectors and readiness markers discovered from `e2e/desktop/ui-driver.wdio.js`.

## Runtime prerequisites validated

- `tauri-driver` available.
- `WebKitWebDriver` available.
- App runtime launchable via desktop harness.

