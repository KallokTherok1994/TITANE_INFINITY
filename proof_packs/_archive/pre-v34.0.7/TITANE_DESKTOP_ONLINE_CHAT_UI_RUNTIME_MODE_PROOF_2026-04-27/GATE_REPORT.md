# GATE_REPORT

- Scope: Desktop online-chat UI runtime mode proof
- Gate `wdio desktop online-chat UI runtime mode proof` : PASS
- Gate `detect_recurrence` : PASS
- Gate `verify_instructions` : PASS
- Gate `verify_agents_index` : PASS
- Gate `verify_prompt_files_index` : PASS
- Gate `verify:registry` : PASS

## Commands

- `TAURI_BINARY_PATH=$PWD/src-tauri/target/debug/titane-infinity TITANE_NATIVE_BINARY_MODE=debug WDIO_SPEC=e2e/desktop/online-chat-proof-ui.wdio.test.js node scripts/e2e/run-desktop-suite.js`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `bash scripts/verify/verify_agents_index.sh`
- `bash scripts/verify/verify_prompt_files_index.sh`
- `corepack pnpm verify:registry`