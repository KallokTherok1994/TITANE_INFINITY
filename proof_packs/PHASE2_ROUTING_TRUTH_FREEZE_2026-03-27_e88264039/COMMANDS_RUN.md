# COMMANDS_RUN

All commands run from repository root.

## Discovery

- `sed -n '1,240p' src/services/api/chat.test.ts`
- `sed -n '1,220p' src/services/conversationEngine.test.ts`
- targeted `rg` scan over provider/routing truth fields

## Validation

- `pnpm exec vitest run src/services/api/chat.test.ts src/services/conversationEngine.test.ts src/__tests__/provider-decision-invariants.test.ts src/__tests__/online-availability.test.ts`

