# Gate Report

## PASS
- Playwright targeted rerun after patch:
  - command: TITANE_E2E_FULL=1 TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_PORT=4000 ./node_modules/.bin/playwright test e2e/features/governance-center.spec.ts e2e/critical/app-launch.spec.ts e2e/critical/engine-navigation.spec.ts --project=chromium
  - result: 25 passed
- Auto-heal recurrence:
  - command: bash scripts/autoheal/detect_recurrence.sh
  - result: PASS
- Instruction verification:
  - command: bash scripts/verify_instructions.sh
  - result: PASS
- Desktop release visible chat proof:
  - command: TAURI_BINARY_PATH=src-tauri/target/release/titane-infinity WDIO_SPEC=./e2e/desktop/online-chat-proof-ui.wdio.test.js node ./scripts/e2e/run-desktop-suite.js
  - result: 1 passed in 00:01:18
- Desktop release targeted stability x3:
  - artifacts: reports/e2e-desktop/release_online_chat_x3_2026-03-15_1706
  - result: run_1 PASS, run_2 PASS, run_3 PASS

## FAIL
- None on the executed validators.

## BLOCKED CONDITIONS
- Global master-closure certification remains blocked because the full requested surface set was not revalidated in this continuation.
- Online-first truth remains blocked because the proven desktop release run used provider Ollama with data-network-used=false.
- Runtime cleanliness remains blocked by repeated CSS preload recovery markers:
  - BOOT:ENTRY_RECOVERY_RELOAD
  - BOOT:ENTRY_IMPORT_FAIL

## Evidence pointers
- reports/e2e-desktop/wdio.log
- reports/e2e-desktop/tauri_driver.log
- reports/e2e-desktop/release_online_chat_x3_2026-03-15_1706/run_1.wdio.log
- reports/e2e-desktop/release_online_chat_x3_2026-03-15_1706/run_2.wdio.log
- reports/e2e-desktop/release_online_chat_x3_2026-03-15_1706/run_3.wdio.log
- reports/e2e-desktop/release_online_chat_x3_2026-03-15_1706/run_1.tauri.log
- reports/e2e-desktop/release_online_chat_x3_2026-03-15_1706/run_2.tauri.log
- reports/e2e-desktop/release_online_chat_x3_2026-03-15_1706/run_3.tauri.log