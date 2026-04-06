# 01 — AUTO-DISCOVERY

## Runtime discovery
- AppImage: deployment/latest/TITANE-Infinity_26.4.0_amd64.AppImage (~85MB, executable)
- Source version: 27.2.0 (package.json) — **VERSION GAP** vs AppImage 26.4.0
- tauri-driver: ~/.cargo/bin/tauri-driver
- WebKitWebDriver: /usr/bin/WebKitWebDriver
- DISPLAY: :1 (Xvfb actif)
- wdio.desktop.conf.cjs: present, tauri-driver port 4444, native port 4445

## Git state
- Main repo: HEAD=3a32f5fd1, 385 fichiers en retard origin/MAIN, merge conflict autoheal_rules.jsonl
- Worktree v15: HEAD=5acf1ff1a, branche v15_total_audit_20260311_080118
- Worktree choisi pour execution (node_modules present, propre)
