# GATE_REPORT — CHAT_UI_ZOOM_WIDTH_CONTAINMENT_2026-04-17

- PASS — `runTests src/components/layout/__tests__/AppShell.test.tsx src/__tests__/ui/conversation-fullscreen-shell.test.ts`
- PASS — `TITANE_E2E_FULL=1 corepack pnpm exec playwright test e2e/critical/chat-layout-viewport.spec.ts --reporter=line`
- PASS — `TAURI_BINARY_PATH=/usr/bin/titane-infinity TITANE_NATIVE_BINARY_MODE=installed corepack pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/chat-layout-viewport.wdio.test.js`
- PASS — `bash scripts/autoheal/detect_recurrence.sh`
- PASS — `bash scripts/verify_instructions.sh`