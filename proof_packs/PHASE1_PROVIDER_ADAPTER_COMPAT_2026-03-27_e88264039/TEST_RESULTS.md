# TEST_RESULTS

## Executed

### Provider fabric Vitest slice

Command:

`pnpm exec vitest run src/services/ai/providers/__tests__/providerFabricAdapter.test.ts src/services/ai/providers/__tests__/openai.test.ts src/services/ai/providers/__tests__/claude.test.ts src/services/ai/providers/__tests__/providerMemoryReuse.test.ts`

Result:

- PASS
- Files: `4 passed`
- Tests: `40 passed`
- Duration: `2.09s`

### Instruction verifier

Command:

`bash scripts/verify_instructions.sh`

Result:

- PASS
- `SUMMARY: PASS=23 FAIL=0`

### Autoheal recurrence guard

Command:

`bash scripts/autoheal/detect_recurrence.sh`

Result:

- PASS
- `INFO: entries=2`

### Instruction layer validator

Command:

`bash scripts/verify/verify_instruction_layers.sh`

Result:

- PASS
- `SUMMARY: FAIL=0`

### Doctrine duplication validator

Command:

`bash scripts/verify/verify_no_doctrine_duplication.sh`

Result:

- PASS
- `SUMMARY: FAIL=0`

## Interpretation

- The promoted provider set now has one bounded adapter surface with executable proof.
- The lock remains below a full Phase 1 gate because runtime orchestration is not yet rewired to consume this registry end-to-end.
