# COMMANDS USED

- `git rev-parse --short HEAD`
- `git branch --show-current`
- token status checks (`present|missing` only)
- `git status --porcelain`
- `git log -20 --oneline`
- `git --no-pager diff --stat`
- `git --no-pager diff --name-only`
- `rg -n "fetch\(|XMLHttpRequest|WebSocket\(|EventSource\(|axios\.|superagent|node:http|node:https|http://|https://" src/components src/pages src/App.tsx src/main.tsx src/hooks`
- `pnpm test:architecture` (x3)
- `TITANE_E2E_TAURI=1 pnpm run test:e2e:vitest` (x3)
- `GO_FOR_PROD_BUILD__TITANE_INFINITY=GO_FOR_PROD_BUILD__TITANE_INFINITY GO_FOR_PROD_DEPLOY__TITANE_INFINITY=GO_FOR_PROD_DEPLOY__TITANE_INFINITY timeout 3600s pnpm run build:production` (x3)
- `RUST_LOG=info RUST_BACKTRACE=1 TAURI_LOG_LEVEL=info TITANE_MODE=online TITANE_OFFLINE_FALLBACK=0 timeout 90s runtime/stable/TITANE-Infinity_27.2.0_amd64.AppImage` (x3)

Token build exact was provided at command environment level for qualification execution.
