# TEST_STACK_DISCOVERY

## Browser E2E commands
- pnpm exec playwright test --list
- pnpm exec playwright test --project=chromium-tests-e2e tests/e2e/chat.spec.ts

## Desktop E2E commands
- node scripts/e2e/run-desktop-suite.js
- WDIO_SPEC=e2e/desktop/smoke.wdio.test.js node scripts/e2e/run-desktop-suite.js

## Build/lint/type/test commands found
- pnpm run build:tauri:e2e
- pnpm run lint
- pnpm run check
- pnpm run test:architecture
- pnpm run test:rust

## Stack truth
- Playwright config: playwright.config.ts
- WDIO config: wdio.desktop.conf.cjs
- Desktop wrapper: scripts/e2e/tauri-wrapper.sh
- Desktop suite launcher: scripts/e2e/run-desktop-suite.js

## Artifact locations
- reports/playwright/test-results/
- reports/e2e-desktop/
- proof_packs/E2E_DESKTOP_CHAT_PLAYWRIGHT_ULTRA_2026-03-18_0920_0017c1ad2/

## Driver/runtime truth
- tauri-driver in use for desktop path (port 4444).
- Wrapper proves runtime binary selection and TAURI_DEV_SERVER_URL unset.
