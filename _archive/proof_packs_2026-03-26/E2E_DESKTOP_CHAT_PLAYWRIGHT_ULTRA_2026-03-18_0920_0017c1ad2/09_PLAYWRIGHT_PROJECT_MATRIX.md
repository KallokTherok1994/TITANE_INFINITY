# PLAYWRIGHT_PROJECT_MATRIX

| project | purpose | scope | retries | artifacts | verdict level |
|---|---|---|---|---|---|
| chromium | Browser structural and core e2e lane | e2e/**/*.{spec,test}.ts | CI:2 / local:0 | reports/playwright/test-results | Browser truth only |
| chromium-tests-e2e | Legacy browser suite exposure | tests/e2e/**/*.{spec,test}.ts minus incompatible files | CI:2 / local:0 | reports/playwright/test-results | Browser truth only |

## Exclusions (governed)
- tests/e2e/control_panel.spec.ts (selenium harness)
- tests/e2e/accessibility.spec.ts (axe-playwright missing in this environment)
