# Runner Authority

## Decision
- `AUTHORITY_E2E = WDIO`
- `EXTENDED = PLAYWRIGHT`

## Evidence
- `scripts/e2e/run-desktop-suite.js` runs `pnpm exec wdio run wdio.desktop.conf.cjs` and supports `WDIO_SPEC` targeting.
- `wdio.desktop.conf.cjs` uses Tauri app wrapper `scripts/e2e/tauri-wrapper.sh` and enforces single WDIO instance (`maxInstances: 1`).
- Desktop spec inventory is WDIO-centric under `e2e/desktop/*`.
- Playwright exists (`playwright.config.ts`) but is not the desktop authority path in this repository.

## Isolation contract
- Required env for desktop authority runs:
	- `TITANE_E2E=1`
	- `TITANE_MEMORY_DIR=/tmp/titane-main-dev-e2e/memory`
	- `TITANE_LOG_DIR=/tmp/titane-main-dev-e2e/logs`
	- `TITANE_E2E_ARTIFACTS_DIR=<proof_pack>/artifacts/<suite>`

