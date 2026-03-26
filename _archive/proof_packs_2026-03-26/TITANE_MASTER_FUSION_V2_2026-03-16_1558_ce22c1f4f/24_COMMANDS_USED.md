# 24 - Commands Used


audit bootstrap:
- git status --short --branch
- git rev-parse --short HEAD
- git log -20 --oneline
- node -v
- pnpm -v
- cargo -V
- rustc -V
- pnpm -s run
- ls -1 src src-tauri e2e tests scripts

identification:
- rg (routes/settings/memory/omega/providers/ipc/capabilities)
- jq -r '.scripts' package.json package.ui.json

preuves gouvernance:
- pnpm -s verify:tauri-only
- pnpm -s verify:online-first
- pnpm -s verify:tauri-configs
- bash scripts/autoheal/detect_recurrence.sh
- bash scripts/verify_instructions.sh

preuves x3:
- pnpm -s test:architecture (x3)
- pnpm -s test:omega (x3)
- pnpm -s build:prod-safe (x3)
- pnpm -s build:prod-safe:verify (x3)
- bash scripts/e2e/run-online-chat-proof-ui.sh (cycle 1, borne)
- bash force-browser-reload.sh (x3)
- bash scripts/launch/deploy_full_local_dev.sh --smoke 15 (cycle 1, borne)
- bash scripts/tests/chat_restore_x3.sh (x3)
- bash test-chat-system.sh (x3)
