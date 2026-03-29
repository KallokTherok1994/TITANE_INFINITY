# COMMANDS_RUN

All commands run from repository root.

## Discovery

- `sed -n '252,340p' src/services/ai/types.ts`
- `sed -n '1,220p' src/services/ai/providers/__tests__/openai.test.ts`
- `sed -n '1,220p' src/services/ai/providers/__tests__/claude.test.ts`
- `sed -n '1,220p' src/services/ai/providers/__tests__/providerMemoryReuse.test.ts`
- targeted `rg` and `find` scans over provider surfaces

## Validation

- `pnpm exec vitest run src/services/ai/providers/__tests__/openai.test.ts src/services/ai/providers/__tests__/claude.test.ts src/services/ai/providers/__tests__/providerMemoryReuse.test.ts`

