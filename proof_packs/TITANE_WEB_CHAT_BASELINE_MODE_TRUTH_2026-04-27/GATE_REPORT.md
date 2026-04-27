# GATE_REPORT

- Scope: Web chat baseline mode truth
- Gate `playwright web chat baseline mode truth`: PASS
- Gate `detect_recurrence`: PASS
- Gate `verify_instructions`: PASS
- Gate `verify_agents_index`: PASS
- Gate `verify_prompt_files_index`: PASS
- Gate `verify:registry`: PASS

## Commands

- `corepack pnpm exec playwright test tests/e2e/chat.spec.ts --grep "should validate keyboard shortcuts" --reporter=line`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `bash scripts/verify/verify_agents_index.sh`
- `bash scripts/verify/verify_prompt_files_index.sh`
- `corepack pnpm verify:registry`