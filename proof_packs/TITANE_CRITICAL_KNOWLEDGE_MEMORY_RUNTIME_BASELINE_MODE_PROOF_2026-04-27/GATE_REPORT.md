# GATE_REPORT

- Scope: Critical knowledge memory runtime baseline mode proof
- Gate `playwright critical knowledge memory runtime baseline mode proof`: PASS
- Gate `detect_recurrence`: PASS
- Gate `verify_instructions`: PASS
- Gate `verify:registry`: PASS

## Commands

- `TITANE_E2E_FULL=1 corepack pnpm exec playwright test e2e/critical/chat-interaction.spec.ts --project=chromium --grep "KNOWLEDGE_MEMORY_RUNTIME_TRUTH: la lane mock expose la connaissance seedee et le rappel memoire" --reporter=line`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `corepack pnpm verify:registry`