# 2026-04-26 - TITANE Android Conversation Mode Runtime Truth

## Scope

- sceller la vérité de mode conversationnelle modernisée sur la lane Android/browser
- prouver l absence du sélecteur legacy `select-conversation-mode`
- verrouiller l alignement `page-conversation` -> `chat-runtime-state` -> résumé/badges runtime sur mobile

## Validation

- `corepack pnpm exec playwright test e2e/android/android-build-ui.browser.spec.ts --grep "T21 - mobile conversation mode selector keeps page and runtime mode truth aligned" --reporter=line` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Outcome

- la lane mobile navigateur utilise le sélecteur moderne `chat-mode-selector-select`
- la surface canonique mobile garde `data-conversation-mode=planning` et `data-chat-store-mode=planning` après sélection
- le panneau runtime mobile expose `Conversation mode: planning`, `Store mode: planning`, `conversation-mode:planning` et `chat-store-mode:planning`

## Rollback

- `git restore -- e2e/android/android-build-ui.browser.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`