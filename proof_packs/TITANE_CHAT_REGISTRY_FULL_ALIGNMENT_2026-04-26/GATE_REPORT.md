# GATE_REPORT

- Scope: `src/services/ai/chatModes.config.ts`, `src/config/chatModes.config.ts`, tests de registry associés
- Gate `vitest registries and modes` : PASS
- Gate `check` : PASS
- Gate `detect_recurrence` : PASS
- Gate `verify_instructions` : PASS

## Commands

- `pnpm exec vitest run src/__tests__/services/ai/chatModes.runtimeDepth.test.ts src/__tests__/config/customModeRegistry.test.ts src/__tests__/chatModes.config.test.ts src/__tests__/config/chatModes.phase17.test.ts`
- `corepack pnpm run check`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`