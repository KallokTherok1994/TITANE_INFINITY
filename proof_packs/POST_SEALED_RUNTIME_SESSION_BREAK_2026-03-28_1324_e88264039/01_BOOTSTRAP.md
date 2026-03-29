# BOOTSTRAP

Commands:
- git status --porcelain=v1
- git rev-parse --short HEAD
- git branch --show-current
- git log -20 --oneline
- git diff --stat
- git diff --name-only
- git diff -- src src-tauri package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json
- grep '"version"' package.json
- grep '^version' src-tauri/Cargo.toml
- rg -n "invalid session id|session deleted|WDIO|WebDriver|WRY|tauri-driver|MEMORY_MULTI_TURN|PASS_MEMORY_REAL|HONEST_OFFLINE_DEGRADED" src src-tauri docs proof_packs scripts reports .clinerules
- find reports/tauri_memory_e2e -maxdepth 2 -type f | sort

Key outputs (abridged):
- git rev-parse --short HEAD: e88264039
- git branch --show-current: MAIN
- versions: package.json "28.88.0"; Cargo.toml 28.88.0
- product diffs: none under src/, src-tauri/, package.json, Cargo.toml, tauri.conf
- recent run dirs:
  - reports/tauri_memory_e2e/20260328T172149Z/
  - reports/tauri_memory_e2e/20260328T172231Z/
  - reports/tauri_memory_e2e/20260328T172340Z/
