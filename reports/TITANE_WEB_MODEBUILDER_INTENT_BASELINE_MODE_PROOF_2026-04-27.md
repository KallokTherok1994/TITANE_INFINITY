# 2026-04-27 - TITANE Web ModeBuilder Intent Baseline Mode Proof

## Mission

- verrouiller dans le scénario web ModeBuilder document la baseline modernisée de mode conversationnel avant le routage d intention

## Scope

- `tests/e2e/chat.spec.ts`
- cartographie et preuves gouvernées du micro-lot web ModeBuilder document

## Actions

- ajout d assertions sur l absence de `select-conversation-mode`
- ajout d assertions sur `chat-mode-selector-select=default`
- ajout d assertions sur `page-conversation[data-conversation-mode=default]` et `page-conversation[data-chat-store-mode=default]`
- conservation inchangée de la preuve d ouverture de `ModeBuilder`

## Evidence

- `corepack pnpm exec playwright test tests/e2e/chat.spec.ts --grep "should open ModeBuilder for generate-and-open document intent" --reporter=line` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Risks

- risque faible: le lot ne change pas le runtime produit, il ajoute une garde de baseline à une lane web déjà active et prouvée

## Verdict

- PASS

## Next Step

- exécuter `detect_recurrence`, `verify_instructions` et `verify:registry`, puis publier le lot scope-limité

## Rollback Note

- `git restore -- tests/e2e/chat.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`