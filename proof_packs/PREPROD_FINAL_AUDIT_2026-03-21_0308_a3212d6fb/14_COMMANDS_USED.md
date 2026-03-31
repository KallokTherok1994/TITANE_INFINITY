# 14_COMMANDS_USED

Core commands executed in this audit:

1. Bootstrap commands set (git/toolchain/remotes)
2. Mandatory file inspections (package/cargo/tauri/wdio/playwright/scripts/docs/registry/proof packs)
3. Validator run:
   - `bash scripts/verify/verify-native-binary-freshness.sh`
   - `bash scripts/autoheal/detect_recurrence.sh`
   - `bash scripts/verify_instructions.sh`
4. Native rebuild for stale release guard clearance:
   - `GO_FOR_PROD_BUILD__TITANE_INFINITY=GO_FOR_PROD_BUILD__TITANE_INFINITY corepack pnpm exec tauri build --config src-tauri/tauri.conf.json --no-bundle`
5. Native critical proof x3:
   - `for run in 1 2 3; do TITANE_E2E_ARTIFACTS_DIR=reports/e2e-desktop/preprod-final-audit/run-$run WDIO_SPEC=e2e/desktop/total-dev.wdio.test.js node scripts/e2e/run-desktop-suite.js; done`
6. Browser sample proof:
   - `pnpm exec playwright test e2e/critical/app-launch.spec.ts --project=chromium --reporter=line`
