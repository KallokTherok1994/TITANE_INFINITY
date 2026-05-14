# GATE_REPORT

- Scope: Canonical chat surface unit mode proof
- Gate `targeted canonical chat surface unit test`: PASS
- Gate `detect_recurrence`: PASS
- Gate `verify_instructions`: PASS
- Gate `verify:registry`: PASS

## Commands

- `RUN_E2E_TESTS=1 corepack pnpm exec vitest run src/__tests__/e2e-automated-validation.test.tsx -t "renders the active Titane conversation surface instead of the legacy chat page"`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `corepack pnpm verify:registry`