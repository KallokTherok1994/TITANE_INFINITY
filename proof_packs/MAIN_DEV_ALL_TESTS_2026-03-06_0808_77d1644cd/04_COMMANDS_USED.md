# Commands Used

## Canonical commands (proven)
- UNIT_CMD: `pnpm run test`
: source `package.json` -> `scripts.test`
- LINT_CMD: `pnpm run lint`
: source `package.json` -> `scripts.lint`
- TYPECHECK_CMD: `pnpm run check`
: source `package.json` -> `scripts.check`
- RUST_TEST_CMD: `pnpm run test:rust`
: source `package.json` -> `scripts.test:rust`
- E2E_DESKTOP_CMD: `pnpm -s e2e:desktop:run`
: source `package.json` + `scripts/e2e/run-desktop-suite.js`
- E2E_DESKTOP_SMOKE_CMD: `TITANE_E2E=1 TITANE_MEMORY_DIR=/tmp/titane-main-dev-e2e/memory TITANE_LOG_DIR=/tmp/titane-main-dev-e2e/logs TITANE_E2E_ARTIFACTS_DIR=<pack>/artifacts/smoke WDIO_SPEC=./e2e/desktop/ui-ultra-smoke.e2e.js pnpm -s e2e:desktop:run`
: source specs in `e2e/desktop/` + `WDIO_SPEC` support in `scripts/e2e/run-desktop-suite.js`
- E2E_DESKTOP_FULL_CMD: `TITANE_E2E=1 TITANE_MEMORY_DIR=/tmp/titane-main-dev-e2e/memory TITANE_LOG_DIR=/tmp/titane-main-dev-e2e/logs TITANE_E2E_ARTIFACTS_DIR=<pack>/artifacts/full WDIO_SPEC=./e2e/desktop/ui-ultra-full.e2e.js pnpm -s e2e:desktop:run`
: source specs in `e2e/desktop/` + `WDIO_SPEC` support in `scripts/e2e/run-desktop-suite.js`
- WDIO_CMD: same as `E2E_DESKTOP_CMD` (not distinct from authority in this run)
- PLAYWRIGHT_CMD: `pnpm run test:e2e`
: source `package.json` -> `scripts.test:e2e`

## Policy notes
- DEV mode only: no `build`, no `build:tauri:e2e`, no prod scripts.
- Desktop E2E wrapper isolation required: `scripts/e2e/tauri-wrapper.sh`.

