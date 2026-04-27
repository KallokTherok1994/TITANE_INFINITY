# 2026-04-27 - TITANE Canonical Chat Surface Unit Mode Proof

## Mission

- verrouiller dans la garde unitaire canonique la baseline modernisée de mode conversationnel de `TitanePage`

## Scope

- `src/__tests__/e2e-automated-validation.test.tsx`
- cartographie et preuves gouvernées du micro-lot unitaire canonique

## Actions

- montage de `TitanePage` sous `MemoryRouter` pour refléter le contexte runtime requis par `useSearchParams`
- ajout d assertions sur l absence de `select-conversation-mode`
- ajout d assertions sur `chat-mode-selector-select=default`
- ajout d assertions sur `page-conversation[data-conversation-mode=default]` et `page-conversation[data-chat-store-mode=default]`

## Evidence

- `RUN_E2E_TESTS=1 corepack pnpm exec vitest run src/__tests__/e2e-automated-validation.test.tsx -t "renders the active Titane conversation surface instead of the legacy chat page"` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Risks

- risque faible: le lot ne modifie pas le runtime produit, il rend la garde unitaire conforme au contexte Router réel et verrouille des attributs déjà publiés par la surface active

## Verdict

- PASS

## Next Step

- exécuter `detect_recurrence`, `verify_instructions` et `verify:registry`, puis publier le lot scope-limité

## Rollback Note

- `git restore -- src/__tests__/e2e-automated-validation.test.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`