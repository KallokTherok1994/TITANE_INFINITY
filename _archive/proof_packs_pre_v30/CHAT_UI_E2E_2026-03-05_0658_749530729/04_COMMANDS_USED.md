# Commands Used

- generated_at_utc: 2026-03-05T12:00:00Z
- proof_pack: proof_packs/CHAT_UI_E2E_2026-03-05_0658_749530729

## Canonical Commands (Campaign)

- `UNIT_CMD`
  - `pnpm run test -- src/__tests__/features/chat/ChatMessage.test.tsx src/__tests__/features/chat/TypingIndicator.test.tsx src/__tests__/features/chat/VirtualMessageList.test.tsx`
- `E2E_CMD_FULL`
  - `TITANE_E2E=1 TITANE_MEMORY_DIR=/tmp/titane-chat-ui-e2e/memory TITANE_LOG_DIR=/tmp/titane-chat-ui-e2e/logs TITANE_E2E_ARTIFACTS_DIR=<pack>/runs/full_<run_stamp> WDIO_SPEC=./e2e/desktop/ui-ultra-full.e2e.js pnpm -s e2e:desktop:run`
- `SMOKE_CMD`
  - `TITANE_E2E=1 TITANE_MEMORY_DIR=/tmp/titane-chat-ui-e2e/memory TITANE_LOG_DIR=/tmp/titane-chat-ui-e2e/logs TITANE_E2E_ARTIFACTS_DIR=<pack>/runs/smoke_<run_stamp> WDIO_SPEC=./e2e/desktop/ui-ultra-smoke.e2e.js pnpm -s e2e:desktop:run`
- `E2E_PREREQ_CMD`
  - `pnpm run e2e:desktop:ensure`
- `INSTRUCTION_GUARD_CMD`
  - `bash scripts/verify_instructions.sh`
- `AUTOHEAL_RECURRENCE_CMD`
  - `bash scripts/autoheal/detect_recurrence.sh`

## Authority Decision Snapshot

- `desktop_e2e_authority`: `WDIO_DESKTOP_TAURI`
- `web_playwright_status`: present but non-authority for desktop runtime validation in this pack

## Execution Log Targets

- unit x3 aggregate: `08_TESTS_X3.log`
- e2e+smoke x3 aggregate: `E2E_RUNS_X3.log`
- per-run logs: `logs/*_run{1..3}.log`

## Final Executed IDs

- `unit_chat`: PASS x3
- `e2e_full_fix`: PASS x3
- `e2e_smoke_fix3`: PASS x3

## Stabilization IDs (failed then fixed)

- `e2e_full` (run2 failed, remediated)
- `e2e_smoke_fix` (run1 failed, remediated)
- `e2e_smoke_fix2` (run2 failed, remediated)
