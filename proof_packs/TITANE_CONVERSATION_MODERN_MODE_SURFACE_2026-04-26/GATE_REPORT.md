# GATE_REPORT

- Scope: `src/components/sections/ConversationSection.tsx`, `e2e/critical/chat-interaction.spec.ts`
- Gate `vitest conversation mode bridge` : PASS
- Gate `playwright modern mode surface` : PASS
- Gate `check` : PASS
- Gate `detect_recurrence` : PASS
- Gate `verify_instructions` : PASS
- Gate `verify:registry` : PASS

## Commands

- `pnpm exec vitest run src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx src/components/sections/__tests__/ConversationSection.test.ts src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx`
- `TITANE_E2E_FULL=1 corepack pnpm exec playwright test e2e/critical/chat-interaction.spec.ts --project=chromium --grep MODERN_MODE_SELECTOR_BRIDGES_PAGE_RUNTIME_AND_STORE --reporter=line`
- `corepack pnpm run check`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `corepack pnpm verify:registry`