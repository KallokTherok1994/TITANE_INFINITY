# GATE_REPORT

- Scope: Critical new-conversation baseline mode proof
- Gate `playwright critical new-conversation baseline mode proof`: PASS
- Gate `detect_recurrence`: PASS
- Gate `verify_instructions`: PASS
- Gate `verify:registry`: PASS

## Commands

- `TITANE_E2E_FULL=1 corepack pnpm exec playwright test e2e/critical/chat-interaction.spec.ts --project=chromium --grep "NEW_CONVERSATION: message et réponse mock" --reporter=line`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `corepack pnpm verify:registry`