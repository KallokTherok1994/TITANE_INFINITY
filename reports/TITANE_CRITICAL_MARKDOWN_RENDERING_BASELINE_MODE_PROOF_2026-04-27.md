# 2026-04-27 - TITANE Critical Markdown Rendering Baseline Mode Proof

## Mission

- verrouiller dans le scénario critique de rendu markdown assistant la baseline modernisée de mode conversationnel avant l envoi

## Scope

- `e2e/critical/chat-interaction.spec.ts`
- cartographie et preuves gouvernées du micro-lot critique markdown assistant

## Actions

- ajout d assertions sur l absence de `select-conversation-mode`
- ajout d assertions sur `chat-mode-selector-select=default`
- ajout d assertions sur `page-conversation[data-conversation-mode=default]` et `page-conversation[data-chat-store-mode=default]`
- conservation inchangée de la preuve de rendu markdown assistant

## Evidence

- `TITANE_E2E_FULL=1 corepack pnpm exec playwright test e2e/critical/chat-interaction.spec.ts --project=chromium --grep "ASSISTANT_MARKDOWN_RENDERING: la surface canonique rend le markdown assistant sans marqueurs bruts" --reporter=line` -> PASS

## Risks

- risque faible: le lot ne change pas le runtime produit, il ajoute une garde de baseline à la lane critique de rendu markdown assistant

## Governance Validators

- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Verdict

- PASS

## Next Step

- publier le lot scope-limité sur `MAIN`

## Rollback Note

- `git restore -- e2e/critical/chat-interaction.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`