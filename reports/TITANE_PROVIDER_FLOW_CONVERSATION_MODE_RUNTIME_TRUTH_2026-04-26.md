# 2026-04-26 - TITANE Provider Flow Conversation Mode Runtime Truth

## Scope

- sceller la vérité de mode conversationnelle modernisée sur la lane Playwright provider-flow
- verrouiller le comportement de l alias `/chat` sur la surface conversationnelle canonique
- prouver l absence du contrôle legacy `select-conversation-mode`

## Validation

- `TITANE_E2E_INCLUDE_EXPERIMENTAL=1 corepack pnpm exec playwright test tests/e2e/provider-flow.test.ts --project chromium-tests-e2e --grep "Test 8: Modern conversation mode truth on /chat alias" --reporter=line` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Outcome

- l alias `/chat` garde `page-conversation[data-conversation-mode=planning][data-chat-store-mode=planning]` après sélection moderne
- le panneau runtime de la lane riche expose aussi `Conversation mode: planning` et `Store mode: planning`
- les badges runtime incluent `conversation-mode:planning` et `chat-store-mode:planning`

## Rollback

- `git restore -- tests/e2e/provider-flow.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`