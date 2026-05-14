# GATE_REPORT

- Scope: Web code-intent blocked baseline mode proof
- Gate `playwright web code-intent blocked baseline mode proof`: PASS
- Gate `detect_recurrence`: PASS
- Gate `verify_instructions`: PASS
- Gate `verify:registry`: PASS

## Commands

- `corepack pnpm exec playwright test tests/e2e/chat.spec.ts --grep "should keep code-intent editor route blocked and not open ModeBuilder" --reporter=line`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `corepack pnpm verify:registry`