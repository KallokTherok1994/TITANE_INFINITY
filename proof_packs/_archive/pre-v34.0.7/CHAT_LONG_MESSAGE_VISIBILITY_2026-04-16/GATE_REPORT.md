# GATE_REPORT

- Gate: targeted unit tests for long-message rendering.
- Gate: targeted Playwright runtime-validation lane for the long-message scenario.
- Gate: `bash scripts/autoheal/detect_recurrence.sh`
- Gate: `bash scripts/verify_instructions.sh`
- Unit tests: PASS via `./node_modules/.bin/vitest run src/components/chat/MessageList.test.tsx src/components/chat/__tests__/VirtualizedMessageList.test.tsx`.
- Playwright long-message lane: PASS via `TITANE_E2E_TAURI=1 TITANE_E2E_USE_WEBSERVER=1 ./node_modules/.bin/playwright test e2e/runtime-validation/chat-ar20.spec.ts --project chromium --grep "TEST LONG MESSAGE"`.
- Governance validators: PASS via `bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh`.
- Current state: all targeted gates PASS for this fix scope.
