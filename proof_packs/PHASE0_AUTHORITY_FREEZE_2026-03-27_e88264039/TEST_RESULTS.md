# TEST_RESULTS

## Executed

### `bash scripts/verify/enforce-online-first.sh`

- Result: PASS
- Summary: `0 failures, 0 warnings`

### `pnpm exec vitest run src/__tests__/provider-decision-invariants.test.ts src/__tests__/online-availability.test.ts`

- Result: PASS
- Files: `2 passed`
- Tests: `29 passed`
- Duration: `1.16s`

## Not Executed

- Full repo validation set
- cargo-based provider/router runtime tests
- eval harness runs
- E2E UI truth packs

These were outside the bounded docs-only lock.
