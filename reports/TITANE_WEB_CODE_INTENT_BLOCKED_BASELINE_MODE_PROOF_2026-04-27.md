# 2026-04-27 - TITANE Web Code Intent Blocked Baseline Mode Proof

## Mission

- verrouiller dans le scénario web de blocage code-intent la baseline modernisée de mode conversationnel avant l envoi du prompt refusé

## Scope

- `tests/e2e/chat.spec.ts`
- cartographie et preuves gouvernées du micro-lot web code-intent bloqué

## Actions

- ajout d assertions sur l absence de `select-conversation-mode`
- ajout d assertions sur `chat-mode-selector-select=default`
- ajout d assertions sur `page-conversation[data-conversation-mode=default]` et `page-conversation[data-chat-store-mode=default]`
- conservation inchangée de la preuve de blocage: `ModeBuilder` ne doit pas s ouvrir

## Evidence

- `corepack pnpm exec playwright test tests/e2e/chat.spec.ts --grep "should keep code-intent editor route blocked and not open ModeBuilder" --reporter=line` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Risks

- risque faible: le lot ne change pas le runtime produit, il ajoute une garde de baseline à une lane web déjà active de blocage d intent code

## Verdict

- PASS

## Next Step

- exécuter `detect_recurrence`, `verify_instructions` et `verify:registry`, puis publier le lot scope-limité

## Rollback Note

- `git restore -- tests/e2e/chat.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`