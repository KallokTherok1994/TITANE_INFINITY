# Rapport — PROD Unblock Chat Playwright (E2E)

Date: 2026-02-08

## Objectif
Débloquer le gate « 3/3 scénarios Playwright Chat » avec un mock déterministe local-first et des sélecteurs E2E stables.

## Périmètre
- Mock E2E déterministe dans le pipeline Conversation Engine.
- Ajout de `data-testid` sur les éléments critiques Chat/Conversations/Provider.
- Réécriture des scénarios Playwright Chat (3/3) sans skip.

## Changements appliqués
- Mock E2E déterministe activable par env/flags globaux, marqueur `[MOCK_OK]`.
- Sélecteurs stables: `chat-input`, `send-button`, `assistant-message`, `user-message`, `error-message`, `clear-chat-button`, `provider-select`, `conversations-button`, `conversations-sidebar`, `new-conversation-button`, `conversation-list`.
- Scénarios Playwright:
  - NEW_CONVERSATION (reset historique + envoi)
  - SEND_MESSAGE_ALWAYS_RESPOND (réponse mock)
  - SWITCH_CONVERSATION_PERSISTS (persistance après switch d’onglet)

## Configuration E2E (mock)
- Env:
  - `VITE_TITANE_E2E=1`
  - `VITE_E2E_CHAT_MOCK=1`
  - `VITE_TITANE_E2E_CHAT_PROVIDER=mock-e2e`
  - `VITE_TITANE_E2E_CHAT_MARKER=[MOCK_OK]`
- Flags globaux (Playwright `addInitScript`):
  - `__TITANE_E2E__=true`
  - `__TITANE_E2E_CHAT_MOCK__=true`
  - `__TITANE_E2E_CHAT_PROVIDER__='mock-e2e'`
  - `__TITANE_E2E_CHAT_MARKER__='[MOCK_OK]'`

## Fichiers modifiés
- src/services/conversationEngine.ts
- src/components/sections/ConversationSection.tsx
- src/features/chat/ChatProviderSelector.tsx
- src/features/conversation/ChatProviderSelector.tsx
- src/components/chat/ConversationsButton.tsx
- src/components/chat/ConversationsSidebar.tsx
- e2e/critical/chat-interaction.spec.ts
- registry/ui-events.jsonl

## Tests
- Playwright E2E Chat (3/3): `pnpm -s playwright test e2e/critical/chat-interaction.spec.ts` — ✅ PASS (3/3)

## Preuves (local-first)
- Résultat Playwright: 3 passed (13.1s).
- Réponse assistant contient `[MOCK_OK]`.
- Sélecteurs E2E stables présents sur UI.

## Risques
- Faible. Les changements sont isolés au mode E2E et à des attributs `data-testid`.

## Rollback
- `git revert HEAD` sur les fichiers listés ci-dessus.

## Statut
- Qualified (tests Playwright Chat 3/3 exécutés).
