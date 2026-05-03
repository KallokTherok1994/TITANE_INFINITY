# 11 RUNTIME HARNESS MAP

## WDIO config: wdio.desktop.conf.cjs
- Spec: e2e/desktop/online-chat-proof-ui.wdio.test.js (default)
- Visual probe: /tmp/v12_ui_visual_probe.wdio.test.js (used for V14 baseline)
- Driver: tauri-driver via scripts/e2e/tauri-wrapper.sh
- Framework: mocha

## tauri-wrapper.sh
- Selects binary via priority list (TAURI_BINARY_PATH > AppImage > debug/release > system)
- Wraps binary with isolated memory/log dirs
- Proof witness file: /tmp/e2e-wrapper-executed-<ts>.flag

## wrapper_probe output
- See: artifacts/wrapper_probe/stdout.log, tauri-wrapper.log

## V14 node_modules
- wdio: /tmp/titane_v14_wt_20260311_070038/node_modules/.bin/wdio → PRESENT
- Install required: yes (worktree freshly created, no node_modules initially)
- Fix: `nvm use 24 && pnpm install --frozen-lockfile` (Node 24, .nvmrc=24)
