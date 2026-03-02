# SCOPE

- rings: R3 services + R4 UI + tauri bootstrap path
- constraints: minimal patch, no destructive ops, proof-driven
- candidates:
  - build: vite build
  - build-storybook: storybook build
  - build:prod-safe: NPM_CONFIG_IGNORE_SCRIPTS=1 vite build
  - build:prod-safe:verify: node scripts/guards/guard-prod-safe-build.mjs
  - build:production: pnpm run lint && pnpm run format:check && pnpm run ollama:bundle && vite build && tauri build && bash scripts/post-build.sh
  - build:tauri:e2e: pnpm run guard:ollama-proxy && bash scripts/e2e/require-e2e-build-authorization.sh && vite build && tauri build --config src-tauri/tauri.conf.json
  - dev:tauri: node scripts/launch/dev_tauri_monitor.mjs
  - dev:tauri:no-ollama: bash scripts/launch/deploy_full_local_dev.sh --no-ollama
  - dev:tauri:raw: bash scripts/launch/deploy_full_local_dev.sh
  - gate:prod-boot: bash scripts/gate-prod-boot.sh
  - postbuild: bash scripts/post-build.sh
  - run:x3:build: bash scripts/lib/run_x3_profile.sh build
  - stopline:rebuild-proof: bash scripts/stopline_rebuild_proof.sh
  - test:tauri: pnpm run test:rust
  - titane:build: ./titane.sh build
  - verify:prod-boot: node scripts/gates/vite-base-relative-gate.cjs
  - verify:tauri-bundle-type: bash scripts/verify/verify-tauri-bundle-type-warning.sh
  - verify:tauri-configs: bash scripts/verify/validate-tauri-configs.sh
  - verify:tauri-only: bash scripts/verify/enforce-tauri-only.sh

- canonical_prod_command: pnpm run build:production
