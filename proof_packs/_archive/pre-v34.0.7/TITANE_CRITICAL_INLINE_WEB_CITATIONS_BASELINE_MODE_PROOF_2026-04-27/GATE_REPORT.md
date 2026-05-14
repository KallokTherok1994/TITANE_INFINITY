# GATE_REPORT

- Scope: Critical inline web citations baseline mode proof
- Gate `playwright critical inline web citations baseline mode proof`: PASS
- Gate `detect_recurrence`: PASS
- Gate `verify_instructions`: PASS
- Gate `verify:registry`: PASS

## Commands

- `TITANE_E2E_FULL=1 corepack pnpm exec playwright test e2e/critical/chat-interaction.spec.ts --project=chromium --grep "INLINE_WEB_RESEARCH_CITATIONS_TRUTH: la conversation rend les citations inline du handoff web" --reporter=line`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `corepack pnpm verify:registry`