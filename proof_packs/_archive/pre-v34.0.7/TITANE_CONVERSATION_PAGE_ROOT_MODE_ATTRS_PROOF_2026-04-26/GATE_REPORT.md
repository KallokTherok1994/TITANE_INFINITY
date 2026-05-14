# GATE_REPORT

- Scope: Conversation page-root mode attrs proof
- Gate `vitest modeBridge page-root attrs` : PASS
- Gate `detect_recurrence` : PASS
- Gate `verify_instructions` : PASS
- Gate `verify:registry` : PASS

## Commands

- `runTests src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx`
- `bash scripts/autoheal/detect_recurrence.sh`
- `bash scripts/verify_instructions.sh`
- `corepack pnpm verify:registry`