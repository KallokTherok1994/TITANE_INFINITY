# TEST_RESULTS

## Executed

### Provider fabric status Vitest slice

Command:

`pnpm exec vitest run src/services/ai/__tests__/providerFabricStatus.test.ts src/services/ai/providers/__tests__/providerFabricAdapter.test.ts src/services/ai/providers/__tests__/openai.test.ts src/services/ai/providers/__tests__/claude.test.ts src/services/ai/providers/__tests__/providerMemoryReuse.test.ts src/services/ai/__tests__/ollamaAbortFallback.test.ts`

Result:

- PASS
- Files: `6 passed`
- Tests: `42 passed`
- Duration: `3.84s`

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
- `INFO: entries=3`

## Interpretation

- Orchestrator status now exposes canonical promoted-provider fabric truth without forcing lazy cloud provider loads.
- The proof remains bounded to status/metadata surfaces and does not imply execution-path migration.
