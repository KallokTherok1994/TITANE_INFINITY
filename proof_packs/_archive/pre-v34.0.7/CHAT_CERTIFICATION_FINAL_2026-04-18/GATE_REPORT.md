# GATE REPORT

Date: 2026-04-18
Scope: chat certification final by environment

## Executed gates

- Targeted unit/contract chat lanes: PASS
- Critical browser Playwright lanes on canonical conversation route: PASS
- Desktop native online chat proof: PASS
- Desktop native viewport/fullscreen proof: PASS
- Desktop native memory proof: PASS
- Android browser full lane via canonical server: PASS
- detect_recurrence: PASS
- verify_instructions: PASS

## Command record

- TITANE_E2E_FULL=1 pnpm exec playwright test e2e/critical/chat-interaction.spec.ts e2e/critical/chat-layout-viewport.spec.ts --project chromium --workers=1
- bash scripts/e2e/run-online-chat-proof-ui.sh
- TITANE_E2E_SPEC_PATH=e2e/desktop/chat-layout-viewport.wdio.test.js bash scripts/e2e/run-online-chat-proof-ui.sh
- bash scripts/e2e/run-memory-chat-proof-ui.sh
- curl -I -sS --max-time 5 http://127.0.0.1:1420
- node scripts/e2e/run-android-ui-browser.cjs
- bash scripts/autoheal/detect_recurrence.sh
- bash scripts/verify_instructions.sh

## Measured outcomes

- Android browser lane: 38/38 passed
- Governance summary: PASS=32 FAIL=0

## Residual limit

- Android device lane requires connected ADB hardware/emulator and installed-package truth before any PASS claim