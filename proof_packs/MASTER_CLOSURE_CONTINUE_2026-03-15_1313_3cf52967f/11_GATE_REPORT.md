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

## ADDENDUM 2026-03-15 18:24Z - label-aware reruns

### PASS
- Release proof reference (css split fixed):
  - artifacts: reports/e2e-desktop/release_online_chat_csssplitfix_20260315T175032Z
  - result: 1 passing
  - runtime note: conversation request completed after long latency (`[AI Router v20.1] ✓ Ollama success` at about 73.8s)

### FAIL
- Labelguard rerun set:
  - reports/e2e-desktop/release_online_chat_labelguard_20260315T181740Z -> 0 passed, 1 failed (`No assistant response detected`)
  - reports/e2e-desktop/release_online_chat_labelguard_20260315T181927Z -> 0 passed, 1 failed (`No assistant response detected`) + `UND_ERR_SOCKET` on teardown
  - reports/e2e-desktop/release_online_chat_labelguard_20260315T182148Z -> 0 passed, 1 failed (`No assistant response detected`)

### BLOCKED CONDITIONS (strengthened)
- Deterministic runtime truth remains blocked: pass/fail split is driven by provider completion latency exceeding proof window in multiple reruns.
- In failed labelguard runs, the send action was executed and backend generation started (`[Ω:CMD] Request` + `[AI Router v20.1] Query` + `Routing to Ollama`), but no completion was observed before WDIO timeout.
- `BOOT:ENTRY_IMPORT_FAIL` persists on `label=main` in recent reruns (not only non-main noise).

### Additional evidence pointers
- reports/e2e-desktop/release_online_chat_csssplitfix_20260315T175032Z/wdio.log
- reports/e2e-desktop/release_online_chat_csssplitfix_20260315T175032Z/tauri_driver.log
- reports/e2e-desktop/release_online_chat_labelguard_20260315T181629Z/wdio.log
- reports/e2e-desktop/release_online_chat_labelguard_20260315T181629Z/tauri_driver.log
- reports/e2e-desktop/release_online_chat_labelguard_20260315T181740Z/wdio.log
- reports/e2e-desktop/release_online_chat_labelguard_20260315T181740Z/tauri_driver.log
- reports/e2e-desktop/release_online_chat_labelguard_20260315T181927Z/wdio.log
- reports/e2e-desktop/release_online_chat_labelguard_20260315T181927Z/tauri_driver.log
- reports/e2e-desktop/release_online_chat_labelguard_20260315T182148Z/wdio.log
- reports/e2e-desktop/release_online_chat_labelguard_20260315T182148Z/tauri_driver.log