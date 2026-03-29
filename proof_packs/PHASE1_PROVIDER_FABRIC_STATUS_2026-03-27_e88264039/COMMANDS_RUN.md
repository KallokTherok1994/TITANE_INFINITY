# COMMANDS_RUN

All commands run from repository root.

## Bootstrap

- `git status --porcelain`
- `git rev-parse --short HEAD`
- `git branch --show-current`
- `git log -20 --oneline`

## Discovery

- `nl -ba src/services/ai/orchestrator.ts | sed -n '1,260p'`
- `nl -ba src/services/ai/orchestrator.ts | sed -n '260,460p'`
- `nl -ba src/services/ai/orchestrator.ts | sed -n '1817,1985p'`
- `nl -ba src/services/ai/providerFabric.ts | sed -n '1,320p'`
- `sed -n '1,260p' src/services/ai/__tests__/ollamaAbortFallback.test.ts`

## Validation

- `pnpm exec vitest run src/services/ai/__tests__/providerFabricStatus.test.ts src/services/ai/providers/__tests__/providerFabricAdapter.test.ts src/services/ai/providers/__tests__/openai.test.ts src/services/ai/providers/__tests__/claude.test.ts src/services/ai/providers/__tests__/providerMemoryReuse.test.ts src/services/ai/__tests__/ollamaAbortFallback.test.ts`
- `bash scripts/verify_instructions.sh`
- `bash scripts/autoheal/detect_recurrence.sh`
