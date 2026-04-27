# GATE_REPORT

- Scope: Provider-flow conversation mode runtime truth
- Gate `playwright provider-flow T8` : PASS
- Gate `detect_recurrence` : PASS
- Gate `verify_instructions` : PASS
- Gate `verify:registry` : PASS

## Commands

- `TITANE_E2E_INCLUDE_EXPERIMENTAL=1 corepack pnpm exec playwright test tests/e2e/provider-flow.test.ts --project chromium-tests-e2e --grep "Test 8: Modern conversation mode truth on /chat alias" --reporter=line`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `corepack pnpm verify:registry`