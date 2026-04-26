# GATE_REPORT

- Scope: `src/config/chatModes.config.ts`, `src/components/chat/ChatModeSelector.tsx`
- Gate `vitest unified runtime bridge` : PASS
- Gate `check` : PASS
- Gate `detect_recurrence` : PASS
- Gate `verify_instructions` : PASS
- Gate `verify:registry` : PASS

## Commands

- `pnpm exec vitest run src/__tests__/services/ai/chatModeUnifiedRuntimeBridge.test.ts src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx src/__tests__/services/ai/chatModeRegistryBoundaries.test.ts src/__tests__/config/customModeRegistry.test.ts src/__tests__/chatModes.config.test.ts`
- `corepack pnpm run check`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `corepack pnpm verify:registry`