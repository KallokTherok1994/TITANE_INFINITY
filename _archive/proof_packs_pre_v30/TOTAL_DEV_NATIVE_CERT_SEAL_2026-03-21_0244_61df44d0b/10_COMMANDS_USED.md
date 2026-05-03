# 10_COMMANDS_USED

Executed commands (ordered, condensed):

1. `git status --short`
2. `git rev-parse --short HEAD`
3. `git branch --show-current`
4. `git log -12 --oneline`
5. `node -v && pnpm -v && cargo -V && rustc -V`
6. inspections: `read_file` on `wdio.desktop.conf.cjs`, `scripts/e2e/run-desktop-suite.js`, `scripts/e2e/tauri-wrapper.sh`, `scripts/autoheal/autoheal_rules.jsonl`
7. evidence listing: latest proof packs + run artifacts + log grep
8. `node --check wdio.desktop.conf.cjs`
9. `node --check scripts/e2e/run-desktop-suite.js`
10. `bash scripts/verify/verify-native-binary-freshness.sh`
11. `bash scripts/autoheal/detect_recurrence.sh`
12. `bash scripts/verify_instructions.sh`
13. targeted blocked run:
   - `TITANE_E2E_ARTIFACTS_DIR=reports/e2e-desktop/total-dev-seal/block-check WDIO_SPEC=e2e/desktop/total-dev.wdio.test.js node scripts/e2e/run-desktop-suite.js`
14. rebuild attempt:
   - `GO_FOR_PROD_BUILD__TITANE_INFINITY=GO_FOR_PROD_BUILD__TITANE_INFINITY corepack pnpm exec tauri build --config src-tauri/tauri.conf.json --no-bundle`
