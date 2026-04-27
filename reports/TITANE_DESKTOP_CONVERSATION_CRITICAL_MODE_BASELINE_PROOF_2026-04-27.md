# 2026-04-27 - TITANE Desktop Conversation Critical Mode Baseline Proof

## Scope

- verrouiller la baseline modernisée de mode conversationnel dans la lane desktop critique
- capter l absence du contrôle legacy avant tout tour de chat

## Validation

- `TAURI_BINARY_PATH=$PWD/src-tauri/target/debug/titane-infinity TITANE_NATIVE_BINARY_MODE=debug WDIO_SPEC=e2e/desktop/ui-connectivity-critical.wdio.test.js node scripts/e2e/run-desktop-suite.js` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Outcome

- `e2e/desktop/ui-connectivity-critical.wdio.test.js` confirme l absence de `select-conversation-mode`
- la même spec verrouille `chat-mode-selector-select=default` et `page-conversation[data-conversation-mode=data-chat-store-mode=default]`

## Rollback

- `git restore -- e2e/desktop/ui-connectivity-critical.wdio.test.js UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`