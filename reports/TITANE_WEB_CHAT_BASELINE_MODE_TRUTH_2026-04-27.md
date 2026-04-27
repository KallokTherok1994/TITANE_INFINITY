# 2026-04-27 - TITANE Web Chat Baseline Mode Truth

## Mission

- verrouiller la baseline modernisée de mode conversationnel dans la lane Playwright web générique du chat

## Scope

- `tests/e2e/chat.spec.ts`
- cartographie et preuves gouvernées du micro-lot web chat baseline

## Actions

- ajout d assertions sur l absence du contrôle legacy `select-conversation-mode`
- ajout d assertions sur `chat-mode-selector-select=default`
- ajout d assertions sur `page-conversation[data-conversation-mode=default]` et `page-conversation[data-chat-store-mode=default]`

## Evidence

- `corepack pnpm exec playwright test tests/e2e/chat.spec.ts --grep "should validate keyboard shortcuts" --reporter=line` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `bash scripts/verify/verify_agents_index.sh` -> PASS
- `bash scripts/verify/verify_prompt_files_index.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Risks

- risque faible: la lane reste limitée à la baseline web sans dépendre du runtime panel enrichi ni d un provider vivant

## Verdict

- PASS

## Next Step

- exécuter `detect_recurrence`, `verify_instructions`, `verify_agents_index`, `verify_prompt_files_index` et `verify:registry`, puis publier le lot scope-limité

## Rollback Note

- `git restore -- tests/e2e/chat.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`