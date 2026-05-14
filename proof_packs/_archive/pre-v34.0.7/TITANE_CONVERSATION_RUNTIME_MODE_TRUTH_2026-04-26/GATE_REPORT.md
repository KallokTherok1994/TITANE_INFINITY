# GATE_REPORT

- Scope: `ConversationSection` runtime mode truth tightening
- Gate `vitest conversation bridge` : PASS
- Gate `playwright conversation mode truth` : PASS
- Gate `wdio chat ui complete runtime` : PASS
- Gate `wdio ui connectivity critical` : PASS
- Gate `detect_recurrence` : PASS
- Gate `verify_instructions` : PASS
- Gate `verify:registry` : PASS

## Commands

- `pnpm exec vitest run src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx`
- `TITANE_E2E_FULL=1 corepack pnpm exec playwright test e2e/critical/chat-interaction.spec.ts --project=chromium --grep MODERN_MODE_SELECTOR_BRIDGES_PAGE_RUNTIME_AND_STORE --reporter=line`
- `TAURI_BINARY_PATH=$PWD/src-tauri/target/debug/titane-infinity TITANE_NATIVE_BINARY_MODE=debug WDIO_SPEC=e2e/desktop/ui-connectivity-critical.wdio.test.js node scripts/e2e/run-desktop-suite.js`
- `TAURI_BINARY_PATH=$PWD/src-tauri/target/debug/titane-infinity TITANE_NATIVE_BINARY_MODE=debug WDIO_SPEC=e2e/desktop/chat-ui-complete-runtime.wdio.test.js node scripts/e2e/run-desktop-suite.js`