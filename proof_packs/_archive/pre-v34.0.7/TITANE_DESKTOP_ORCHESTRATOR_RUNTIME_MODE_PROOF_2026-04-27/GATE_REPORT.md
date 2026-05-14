# GATE_REPORT

- Scope: Desktop orchestrator runtime mode proof
- Gate `wdio desktop orchestrator runtime mode proof` : PASS
- Gate `detect_recurrence` : PASS
- Gate `verify_instructions` : PASS
- Gate `verify:registry` : PASS

## Commands

- `TAURI_BINARY_PATH=$PWD/src-tauri/target/debug/titane-infinity TITANE_NATIVE_BINARY_MODE=debug WDIO_SPEC=e2e/desktop/chat-orchestrator-advanced-stress.wdio.test.js node scripts/e2e/run-desktop-suite.js`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `corepack pnpm verify:registry`