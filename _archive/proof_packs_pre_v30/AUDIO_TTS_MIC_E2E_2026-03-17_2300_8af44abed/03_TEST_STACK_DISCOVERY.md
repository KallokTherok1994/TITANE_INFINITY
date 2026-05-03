# TEST STACK DISCOVERY
**HEAD:** 8af44abed | **Date:** 2026-03-17 23:00

## Browser E2E Command
```
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20
pnpm test:e2e:playwright
# => npx playwright test e2e/
```

## Desktop E2E Command
```
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20
node scripts/e2e/run-desktop-suite.js
# or: pnpm e2e:desktop:run
# Guard: runtime/ALLOW_E2E_TAURI_BUILD.ok must = "I_AUTHORIZE_E2E_TAURI_BUILD"
```

## Build Commands
- Frontend: `vite build`
- Tauri release: `cargo build --release -p titane-infinity` (from src-tauri/)
- Full: `pnpm build:tauri:e2e` (requires authorization gate)
- Safe prod: `pnpm build:production`

## Lint / Typecheck / Test Commands
- TypeScript: `pnpm check` (tsc --noEmit)
- Lint: `pnpm lint`
- Unit tests: `pnpm test`
- Coverage: `pnpm test:coverage`
- All: `pnpm test:all`

## Trace/Report Locations
- Desktop E2E: `reports/e2e-desktop/`
- Playwright: `test-results/` + `reports/`
- Audio E2E snapshots: `reports/e2e-audio-snapshots/`
- WDIO diag log: `reports/e2e-desktop/diagnostics.log`
- WDIO worker log: `reports/e2e-desktop/wdio.log`
- TTS metrics: `reports/e2e-desktop/audio_tts_runtime_controls_metrics.json`

## Screenshots/Artifacts Folders
- `reports/e2e-desktop/screenshots/`
- `test-results/` (Playwright)

## Current Launchers
- Desktop WDIO: `scripts/e2e/run-desktop-suite.js` (Node ESM)
- Playwright: direct `playwright test` via CLI

## Current Wrappers
- WDIO config: `wdio.desktop.conf.cjs`
- Tauri binary path: `src-tauri/target/release/titane-infinity` (primary) or AppImage fallback
- Env file: `/tmp/titane-e2e-wrapper.env`

## tauri-driver Usage
- `~/.cargo/bin/tauri-driver` — PRESENT ✅
- Used by wdio.desktop.conf.cjs via WebKitWebDriver protocol

## WebKitWebDriver
- `/usr/bin/WebKitWebDriver` — PRESENT ✅

## Playwright: Browser-only or Mixed?
- `e2e/audio-truth.spec.ts`: Playwright — invokes `__TAURI__.core.invoke` via page.evaluate
  - In mock mode (TITANE_E2E_FULL != 1): browser-only test that always passes
  - In full mode (TITANE_E2E_FULL=1): requires real Tauri WebView context
- `e2e/*.spec.ts`: Playwright browser-only tests
- `e2e/desktop/*.wdio.test.js`: WDIO desktop tests (Tauri binary + tauri-driver/WebKitWebDriver)
- **SEPARATION IS MAINTAINED** ✅

## Node Version Requirement
- Package engines: `>=20.0.0`
- System default: `v18.19.1` — INCOMPATIBLE
- nvm available: `v20.20.0` ✅ (use: `nvm use 20`)
