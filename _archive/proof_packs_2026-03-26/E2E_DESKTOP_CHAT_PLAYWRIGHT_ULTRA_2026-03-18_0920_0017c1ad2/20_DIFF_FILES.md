# DIFF_FILES

## Changed files
- playwright.config.ts

## Diff summary
- Expanded Playwright discovery from e2e/*.spec.ts only to:
  - e2e/**/*.{spec,test}.ts
  - tests/e2e/**/*.{spec,test}.ts via dedicated project
- Added explicit outputDir: reports/playwright/test-results
- Added secondary project: chromium-tests-e2e
- Excluded incompatible suites in that project:
  - control_panel.spec.ts (selenium harness)
  - accessibility.spec.ts (axe-playwright dependency mismatch)

## Git proof
- git diff --name-only => playwright.config.ts
