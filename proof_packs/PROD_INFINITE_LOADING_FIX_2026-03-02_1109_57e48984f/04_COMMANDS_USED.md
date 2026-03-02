# COMMANDS USED

- bootstrap: git status/log/diff + token presence masked
- tests: `pnpm test:architecture` x3
- tests: `TITANE_E2E_TAURI=1 pnpm run test:e2e:vitest` x3
- build prod: `GO_FOR_PROD_BUILD__TITANE_INFINITY=... GO_FOR_PROD_DEPLOY__TITANE_INFINITY=... pnpm run build:production` x3
- run release: `TITANE_PROBE_BOOT_MARKERS=1 TITANE_MODE=online TITANE_OFFLINE_FALLBACK=0 timeout 90s runtime/stable/TITANE-Infinity_27.2.0_amd64.AppImage` x3
