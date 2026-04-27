# 2026-04-26 - TITANE Conversation Runtime Mode Truth

## Scope

- retirer le select legacy de la toolbar conversationnelle canonique
- publier le mode actif et le mode store dans `chat-runtime-state`
- migrer les preuves web et desktop vers `chat-mode-selector-select` et la vérité runtime visible

## Runtime truth

- `page-conversation` reste la surface canonique et expose `data-conversation-mode` plus `data-chat-store-mode`
- `chat-runtime-state` expose maintenant les mêmes attributs lorsque le runtime assistant est disponible
- `chat-runtime-summary` inclut `Conversation mode: ...` et `Store mode: ...`
- `chat-runtime-badge` inclut `conversation-mode:<id>` et `chat-store-mode:<id>`

## Validation

- `runTests src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx` -> PASS
- `TITANE_E2E_FULL=1 corepack pnpm exec playwright test e2e/critical/chat-interaction.spec.ts --project=chromium --grep MODERN_MODE_SELECTOR_BRIDGES_PAGE_RUNTIME_AND_STORE --reporter=line` -> PASS
- `TAURI_BINARY_PATH=$PWD/src-tauri/target/debug/titane-infinity TITANE_NATIVE_BINARY_MODE=debug WDIO_SPEC=e2e/desktop/chat-ui-complete-runtime.wdio.test.js node scripts/e2e/run-desktop-suite.js` -> PASS
- `TAURI_BINARY_PATH=$PWD/src-tauri/target/debug/titane-infinity TITANE_NATIVE_BINARY_MODE=debug WDIO_SPEC=e2e/desktop/ui-connectivity-critical.wdio.test.js node scripts/e2e/run-desktop-suite.js` -> PASS

## Outcome

- Le contrôle canonique de mode conversationnel ne dépend plus d un select legacy local.
- La vérité de mode est visible dans la page et dans le panneau runtime.
- La réponse locale de transparence conserve maintenant les métadonnées runtime qualifiées au lieu d effacer le panneau runtime.
- La lane native de retour-bas utilise un scroll programmatique robuste sous WRY et passe jusqu au bout.
- Les preuves web et desktop ciblées passent.

## Rollback

- `git restore -- src/components/sections/ConversationSection.tsx src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx e2e/critical/chat-interaction.spec.ts e2e/desktop/chat-ui-complete-runtime.wdio.test.js e2e/desktop/ui-connectivity-critical.wdio.test.js UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`