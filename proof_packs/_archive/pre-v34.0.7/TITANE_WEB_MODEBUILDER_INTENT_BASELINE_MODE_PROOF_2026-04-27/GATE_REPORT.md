# GATE_REPORT

- Scope: Web ModeBuilder intent baseline mode proof
- Gate `playwright web modebuilder intent baseline mode proof`: PASS
- Gate `detect_recurrence`: PASS
- Gate `verify_instructions`: PASS
- Gate `verify:registry`: PASS

## Commands

- `corepack pnpm exec playwright test tests/e2e/chat.spec.ts --grep "should open ModeBuilder for generate-and-open document intent" --reporter=line`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `corepack pnpm verify:registry`