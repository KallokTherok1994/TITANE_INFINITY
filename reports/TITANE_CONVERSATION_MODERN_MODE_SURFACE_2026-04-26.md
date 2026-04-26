# 2026-04-26 — TITANE Conversation Modern Mode Surface

## Scope

- Monter le sélecteur moderne de modes sur la surface conversation active
- Synchroniser store de modes et moteur conversationnel
- Ajouter une preuve Playwright ciblée sur la route canonique

## Runtime truth

- `ConversationSection` expose maintenant `ChatModeSelector` en variante compacte sur la toolbar active.
- Le sélecteur moderne est borné aux modes compatibles `ConversationMode`: `default`, `brainstorming`, `synthesis`, `planning`, `journal`, `debug_cognitive`.
- La page canonique publie `data-conversation-mode` et `data-chat-store-mode`, ce qui rend visible l alignement entre `useConversationEngine.setMode()` et `useChatModeStore().changeMode()`.

## Validation

- `pnpm exec vitest run src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx src/components/sections/__tests__/ConversationSection.test.ts src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx` → PASS
- `TITANE_E2E_FULL=1 corepack pnpm exec playwright test e2e/critical/chat-interaction.spec.ts --project=chromium --grep MODERN_MODE_SELECTOR_BRIDGES_PAGE_RUNTIME_AND_STORE --reporter=line` → PASS
- `corepack pnpm run check` → PASS
- `bash scripts/autoheal/detect_recurrence.sh` → PASS
- `bash scripts/verify_instructions.sh` → PASS
- `corepack pnpm verify:registry` → PASS

## Outcome

- La surface conversation canonique dispose d une preuve directe du pont mode moderne -> store -> moteur runtime.
- Le select legacy interne reste disponible pour compatibilité, mais la surface moderne est maintenant branchée et certifiée.

## Rollback

- `git restore -- src/components/chat/ChatModeSelector.tsx src/components/sections/ConversationSection.tsx src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx e2e/critical/chat-interaction.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`