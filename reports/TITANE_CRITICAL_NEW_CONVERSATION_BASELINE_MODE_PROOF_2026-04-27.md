# 2026-04-27 - TITANE Critical New Conversation Baseline Mode Proof

## Mission

- verrouiller dans le scénario critique de première conversation la baseline modernisée de mode conversationnel avant le premier envoi

## Scope

- `e2e/critical/chat-interaction.spec.ts`
- cartographie et preuves gouvernées du micro-lot critique new conversation

## Actions

- ajout d assertions sur l absence de `select-conversation-mode`
- ajout d assertions sur `chat-mode-selector-select=default`
- ajout d assertions sur `page-conversation[data-conversation-mode=default]` et `page-conversation[data-chat-store-mode=default]`
- conservation inchangée de la preuve d aller-retour mock critique

## Evidence

- `TITANE_E2E_FULL=1 corepack pnpm exec playwright test e2e/critical/chat-interaction.spec.ts --project=chromium --grep "NEW_CONVERSATION: message et réponse mock" --reporter=line` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Risks

- risque faible: le lot ne change pas le runtime produit, il ajoute une garde de baseline à la lane critique d entrée du chat

## Verdict

- PASS

## Next Step

- exécuter `detect_recurrence`, `verify_instructions` et `verify:registry`, puis publier le lot scope-limité

## Rollback Note

- `git restore -- e2e/critical/chat-interaction.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`