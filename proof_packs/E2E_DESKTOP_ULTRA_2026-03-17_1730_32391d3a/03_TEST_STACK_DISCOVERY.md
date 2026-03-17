# 03_TEST_STACK_DISCOVERY.md

## Source: package.json scripts (real, not assumed)

### Browser E2E
```
pnpm run test:e2e             → playwright test e2e (matches **/*.spec.ts in e2e/)
pnpm run test:e2e:playwright  → playwright test e2e
```
Config: playwright.config.ts
- testDir: e2e/
- testMatch: **/*.spec.ts
- baseURL: http://127.0.0.1:5173 (or TITANE_E2E_PORT)
- webServer: auto-start vite (unless TITANE_E2E_USE_WEBSERVER=0)
- trace: on-first-retry, screenshot: only-on-failure, video: retain-on-failure
- Browsers: Chromium only

Browser E2E truth level: L2 (runtime DOM) — NOT desktop certification (I2)

### Desktop E2E
```
pnpm run e2e:desktop          → guard:ollama-proxy + require-e2e-build-authorization.sh + e2e:desktop:ensure + e2e:desktop:run
pnpm run e2e:desktop:run      → node scripts/e2e/run-desktop-suite.js
pnpm run e2e:desktop:ensure   → bash scripts/e2e/ensure-webkit-webdriver.sh
```
Config: wdio.desktop.conf.cjs
- Driver: WebKitWebDriver + tauri-driver
- Binary: src-tauri/target/release/titane-infinity (primary), deployment/v27.0.2_prod_final/TITANE-Infinity_27.0.2_amd64.AppImage (fallback)
- Reports: reports/e2e-desktop/
- Requires: DISPLAY env + X server + tauri-driver in PATH

Desktop E2E truth level: L2+L3 — DESKTOP CERTIFICATION path

### Vitest Unit/Integration
```
pnpm run test         → vitest run (all unit/integration)
pnpm run test:rust    → cargo test --lib
pnpm run test:all     → test + test:rust + test:architecture + test:compliance
```
Config: vitest.config.ts, vitest.unit.config.ts, vitest.integration.config.ts
Truth level: L1 (unit) / L1+L2 (integration)

### IPC Contract Test
```
pnpm run guard:ipc-contract → vitest run tests/contract/tauri-ipc-contract.test.ts
```
Truth level: L1 (static contract)

### Build Commands
```
pnpm run build               → vite build (frontend only)
pnpm run build:tauri:e2e     → guard:ollama-proxy + require-e2e-build-authorization.sh + vite build + tauri build
pnpm run build:production    → lint + format:check + ollama:bundle + vite build + tauri build + post-build
```

### Verify / Lint
```
pnpm run lint        → eslint src/**/*.{ts,tsx,js,jsx}
pnpm run format:check → prettier --check .
pnpm run check       → tsc --noEmit
pnpm run verify      → full chain (lint+format+check+test:all+verify:tauri-only+...)
```

### Governance Gates
```
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
bash scripts/verify/enforce-tauri-only.sh
bash scripts/verify/enforce-online-first.sh
bash scripts/verify/enforce-invariants-governed.sh
bash scripts/guards/guard-network-policy.sh
bash scripts/guard/guard-ipc-only-tests.sh
```

### Trace / Report Locations
- Browser E2E: playwright-report/ (HTML), test-results/ (traces, videos, screenshots)
- Desktop E2E: reports/e2e-desktop/ (wdio.log, tauri_driver.log, webkit_driver.log, diagnostics.log)
- Metrics JSON: reports/e2e-desktop/<test>_metrics.json

### Screenshot / Artifact Folders
- Playwright: test-results/ (on failure)
- WDIO: reports/e2e-desktop/ (captureFailureScreenshot() in ui-driver.wdio.js)

## Desktop E2E Test Files (e2e/desktop/)
- admin-design-truth.wdio.test.js
- ai-verification.full.e2e.js
- audio-tts-runtime-controls.wdio.test.js  ← MODIFIED (bounded fix)
- chat-ar20.wdio.test.js
- diagnostic-tauri-api.wdio.test.js
- memory-conversations.wdio.test.js
- online-chat-proof-ui.wdio.test.js
- online-chat-proof.wdio.test.js
- preprod_admin_config_propagation.wdio.test.js
- smoke.wdio.test.js
- ui-chat-360-autofix.wdio.test.cjs
- ui-connectivity-critical.wdio.test.js
- ui-driver.wdio.js (shared driver)
- ui-ultra-full.e2e.js
- ui-ultra-smoke.e2e.js
- v20_desktop_cert_audit.wdio.test.js
- v20_dom_diag.wdio.test.js
- v22_visible_real_ui_cert.wdio.test.js
- v24_visible_real_ui_fullstack_perfection.wdio.test.js
- v25_visible_real_chat_functional_truth.wdio.test.js
- v26_real_online_chat_truth.wdio.test.js

## Browser E2E Test Files (e2e/)
- critical/app-launch.spec.ts
- critical/chat-interaction.spec.ts
- critical/engine-navigation.spec.ts
- critical/system-resilience.spec.ts
- critical/visual-engine.spec.ts
- features/admin-main-menu-truth.spec.ts
- features/audio-center.spec.ts
- features/governance-center.spec.ts
- features/memory-tree-viewer.spec.ts
- features/production-health.spec.ts
- runtime-validation/chat-ar20.spec.ts
- chat-provider-decision-certification.spec.ts
- chat-provider-decision-certification-structural.spec.ts
- feedback-loop.spec.ts
- omega-pipeline-e2e.spec.ts
- onboarding.test.ts
- smoke.test.ts
- user-flows.test.ts
- beta-smoke.test.js
