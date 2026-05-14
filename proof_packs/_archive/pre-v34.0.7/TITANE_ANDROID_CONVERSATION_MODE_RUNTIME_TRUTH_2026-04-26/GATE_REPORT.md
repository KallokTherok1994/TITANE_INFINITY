# GATE_REPORT

- Scope: Android/browser conversation mode runtime truth
- Gate `playwright android/browser T21` : PASS
- Gate `detect_recurrence` : PASS
- Gate `verify_instructions` : PASS
- Gate `verify:registry` : PASS

## Commands

- `corepack pnpm exec playwright test e2e/android/android-build-ui.browser.spec.ts --grep "T21 - mobile conversation mode selector keeps page and runtime mode truth aligned" --reporter=line`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `corepack pnpm verify:registry`