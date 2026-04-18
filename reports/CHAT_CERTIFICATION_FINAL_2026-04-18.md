# CHAT CERTIFICATION FINAL 2026-04-18

Date: 2026-04-18
Scope: application complete autour du chat
Canonical surface: /titane?tab=conversation

## Summary

- Browser local: PASS
- Desktop native Tauri/Wry: PASS
- Android browser: PASS
- Android device: BLOCKED

## Canonical truth

- Active runtime surface validated: /titane?tab=conversation
- Legacy /chat remains compatibility-only alias
- Stable selectors required by certification are present on the active surface

## Evidence by environment

### Browser local

- Targeted unit and contract lane: PASS
- Critical Playwright browser lane: PASS
- Canonical interaction and viewport proofs executed on the conversation surface

Commands executed:

- pnpm exec vitest run targeted chat and contract lanes
- TITANE_E2E_FULL=1 pnpm exec playwright test e2e/critical/chat-interaction.spec.ts e2e/critical/chat-layout-viewport.spec.ts --project chromium --workers=1

Outcome:

- Chat interaction proof: PASS
- Chat layout and viewport proof: PASS

### Desktop native Tauri/Wry

- Online chat native proof: PASS
- Viewport/fullscreen native proof: PASS
- Memory native proof: PASS

Commands executed:

- bash scripts/e2e/run-online-chat-proof-ui.sh
- TITANE_E2E_SPEC_PATH=e2e/desktop/chat-layout-viewport.wdio.test.js bash scripts/e2e/run-online-chat-proof-ui.sh
- bash scripts/e2e/run-memory-chat-proof-ui.sh

Outcome:

- Native chat response proof: PASS
- Native fullscreen/viewport containment proof: PASS
- Native memory/false-recall proof: PASS

### Android browser

- Canonical Android server authority verified on http://127.0.0.1:1420
- Wrapper defect fixed during session and lane rerun against canonical server
- Full Playwright Android browser lane: PASS

Commands executed:

- curl -I -sS --max-time 5 http://127.0.0.1:1420
- node scripts/e2e/run-android-ui-browser.cjs

Outcome:

- 38 passed / 38 total
- T1 renders core conversation UI: PASS
- T9 non-silence assistant responds or chat-error shown: PASS
- Cold-load JS/page critical errors lane: PASS after browser-mode IPC noise suppression

### Android device

- Device-install truth not certified in this session
- No attached ADB device was available during the Android freshness phase

Command executed:

- adb devices -l

Outcome:

- Device lane remains BLOCKED pending connected hardware or emulator with install proof

## Governance gates

Commands executed:

- bash scripts/autoheal/detect_recurrence.sh
- bash scripts/verify_instructions.sh

Outcome:

- detect_recurrence: PASS
- verify_instructions: PASS
- Combined governance summary: PASS=32 FAIL=0

## Blocking limit

- Android device lane cannot move to PASS without ADB install and runtime truth from the installed package

## Final environment verdict

- Browser local: PASS
- Desktop native Tauri/Wry: PASS
- Android browser: PASS
- Android device: BLOCKED

## Session verdict

DONE