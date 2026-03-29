# TEST_RESULTS

## Executed

### Routing truth Vitest slice

Command:

`pnpm exec vitest run src/services/api/chat.test.ts src/services/conversationEngine.test.ts src/__tests__/provider-decision-invariants.test.ts src/__tests__/online-availability.test.ts`

Result:

- PASS
- Files: `4 passed`
- Tests: `41 passed`
- Duration: `2.75s`

### Instruction-layer validator

Command:

`bash scripts/verify/verify_instruction_layers.sh`

Result:

- PASS
- `SUMMARY: FAIL=0`

### Doctrine-duplication validator

Command:

`bash scripts/verify/verify_no_doctrine_duplication.sh`

Result:

- PASS
- `SUMMARY: FAIL=0`

## Interpretation

- The previously blocked routing truth slice is runtime-backed again.
- The pass is limited to this targeted proof surface; it is not a full Phase 2 gate pass.
