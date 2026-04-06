# 10 COMMANDS USED

```bash
OFFLINE_SIM=1 TAURI_BINARY_PATH=$PWD/src-tauri/target/release/titane-infinity TITANE_CONVERSATION_TIMEOUT_SECS=5 pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/online-chat-proof.wdio.test.js

# N2 x3
for i in 1 2 3; do
  TAURI_BINARY_PATH=$PWD/src-tauri/target/release/titane-infinity \
  pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/online-chat-proof.wdio.test.js
done

# UI x3
for i in 1 2 3; do
  TAURI_BINARY_PATH=$PWD/src-tauri/target/release/titane-infinity \
  pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/online-chat-proof-ui.wdio.test.js
done

bash scripts/gates/g5-ci-wiring.sh
bash scripts/gates/g7-tauri-allowlist-lock.sh
bash scripts/gates/run-all.sh

bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
```
