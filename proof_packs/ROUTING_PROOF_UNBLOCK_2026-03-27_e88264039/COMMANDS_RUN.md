# COMMANDS_RUN

All commands run from repository root.

## Discovery

- `nl -ba src/services/api/chat.ts | sed -n '299,318p'`
- `nl -ba src/services/conversationEngine.ts | sed -n '698,703p'`
- `nl -ba src/services/userPreferencesEngine.ts | sed -n '118,138p'`
- `nl -ba src/services/cognitive/index.ts | sed -n '226,250p'`
- `nl -ba src/cognitive/progression/xpEngine.ts | sed -n '232,248p'`
- `nl -ba src/lib/serviceInvoker.ts | sed -n '176,208p'`
- `nl -ba src/utils/tauriProtector.ts | sed -n '196,220p'`
- `nl -ba src/services/conversationEngine.test.ts | sed -n '1,220p'`
- `nl -ba src/services/conversationEngine.ts | sed -n '400,470p'`
- `nl -ba src/services/conversationEngine.ts | sed -n '760,950p'`

## Validation

- `pnpm exec vitest run src/services/api/chat.test.ts src/services/conversationEngine.test.ts src/__tests__/provider-decision-invariants.test.ts src/__tests__/online-availability.test.ts`
- `bash scripts/verify/verify_instruction_layers.sh`
- `bash scripts/verify/verify_no_doctrine_duplication.sh`
