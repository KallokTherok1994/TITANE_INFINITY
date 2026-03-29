# EVALS — P1.12

## Eval harness

**Framework**: WebDriverIO 8 + wry 0.54.4 + Mocha
**Binary**: `src-tauri/target/debug/titane-infinity` (debug, built P1.10c)
**Gate variable**: `TITANE_MULTI_REDUCER_PROOF=1`
**Runner**: `bash scripts/e2e/run-online-chat-proof-ui.sh`

## Test execution log

### Run 1 — Session 20260328T233022Z

```
[wry 0.54.4 linux #0-0] ONLINE_CHAT_FIX proof driver UI
[wry 0.54.4 linux #0-0]    ✓ sends one message and captures assistant response
[wry 0.54.4 linux #0-0]    - classifies real multi-turn memory on desktop Tauri lane
[wry 0.54.4 linux #0-0]    - executes restore/no-loss harness via Tauri persistence commands
[wry 0.54.4 linux #0-0]    - proves append-only event emission and replay via Tauri IPC
[wry 0.54.4 linux #0-0]    ✓ proves multi-reducer event replay coverage: xp / progress / knowledge / settings
[wry 0.54.4 linux #0-0]
[wry 0.54.4 linux #0-0] 2 passing (49.2s)
[wry 0.54.4 linux #0-0] 4 skipped
Spec Files: 1 passed, 1 total (100%) in 00:00:50
[E2E_CHAT_PROOF] STATUS=0
```

### Run 2 — Session 20260328T233128Z

```
[wry 0.54.4 linux #0-0]    ✓ sends one message and captures assistant response
[wry 0.54.4 linux #0-0]    ✓ proves multi-reducer event replay coverage: xp / progress / knowledge / settings
[wry 0.54.4 linux #0-0]
[wry 0.54.4 linux #0-0] 2 passing (39.6s)
[wry 0.54.4 linux #0-0] 4 skipped
Spec Files: 1 passed, 1 total (100%) in 00:00:41
[E2E_CHAT_PROOF] STATUS=0
```

### Run 3 — Session 20260328T233217Z

```
[wry 0.54.4 linux #0-0]    ✓ sends one message and captures assistant response
[wry 0.54.4 linux #0-0]    ✓ proves multi-reducer event replay coverage: xp / progress / knowledge / settings
[wry 0.54.4 linux #0-0]
[wry 0.54.4 linux #0-0] 2 passing (36.9s)
[wry 0.54.4 linux #0-0] 4 skipped
Spec Files: 1 passed, 1 total (100%) in 00:00:38
[E2E_CHAT_PROOF] STATUS=0
```

## WRY session stability

- Crashes: 0/3 runs
- Retry count: 0
- P1.12 was the cleanest proof cycle to date

## Eval verdict

**EVAL_PASS X3** — All 3 runs: 2 passing, 4 skipped, EXIT 0.
