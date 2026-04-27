# 2026-04-26 - TITANE Conversation Page Root Mode Attrs Proof

## Scope

- verrouiller les attributs de mode de `page-conversation`
- garder une garde unitaire locale sur la racine canonique de la surface conversationnelle

## Validation

- `runTests src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Outcome

- `page-conversation` publie toujours `data-conversation-mode` et `data-chat-store-mode`
- la valeur initiale de `chat-mode-selector-select` reste alignée sur le mode actif

## Rollback

- `git restore -- src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`