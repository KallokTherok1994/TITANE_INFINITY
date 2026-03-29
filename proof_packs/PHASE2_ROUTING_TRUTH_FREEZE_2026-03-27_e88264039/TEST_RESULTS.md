# TEST_RESULTS

## Executed

### Routing truth Vitest slice

Command:

`pnpm exec vitest run src/services/api/chat.test.ts src/services/conversationEngine.test.ts src/__tests__/provider-decision-invariants.test.ts src/__tests__/online-availability.test.ts`

Result:

- BLOCKED
- Files: `2 failed | 2 passed`
- Tests: `29 passed`
- Duration: `2.64s`

Blocking transform errors:

- `src/services/conversationEngine.ts:700:8` -> `Expected ";" but found ":"`
- `src/services/api/chat.ts:318:6` -> `Unexpected ")"`

Interpretation:

- The routing truth tests that do not import those broken files still passed.
- The full intended slice cannot be used as a clean PASS proof until the pre-existing
  syntax errors in those runtime files are resolved.
