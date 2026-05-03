Rollback Plan

If the launcher selection change is rejected:
- git restore -- wdio.desktop.conf.cjs scripts/autoheal/autoheal_rules.jsonl

If the rebuilt release executable must be replaced:
- Rebuild again from the canonical config:
  GO_FOR_PROD_BUILD__TITANE_INFINITY=GO_FOR_PROD_BUILD__TITANE_INFINITY corepack pnpm exec tauri build --config src-tauri/tauri.conf.json --no-bundle

Operational fallback for future native runs:
- Set TAURI_BINARY_PATH explicitly to the intended executable before launching the desktop suite.
