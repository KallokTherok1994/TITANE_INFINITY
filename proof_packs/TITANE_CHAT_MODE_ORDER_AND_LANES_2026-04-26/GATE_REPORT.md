# GATE_REPORT

- Scope: `src/services/ai/chatModes.ts`, `src/services/ai/chatModes.config.ts`, `src/__tests__/services/ai/chatModes.runtimeDepth.test.ts`
- Gate `vitest targeted modes` : PASS
- Gate `detect_recurrence` : PASS
- Gate `verify_instructions` : PASS
- Gate `verify:registry` : PASS

## Commands

- `pnpm exec vitest run src/__tests__/services/ai/chatModes.runtimeDepth.test.ts src/__tests__/chatModes.config.test.ts src/__tests__/config/chatModes.phase17.test.ts`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `corepack pnpm verify:registry`