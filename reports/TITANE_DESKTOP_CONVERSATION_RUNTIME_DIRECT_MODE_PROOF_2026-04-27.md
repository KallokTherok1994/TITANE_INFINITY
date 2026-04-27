# 2026-04-27 - TITANE Desktop Conversation Runtime Direct Mode Proof

## Scope

- exposer la vérité de mode conversationnelle directement dans le driver WDIO desktop
- verrouiller les attributs de mode sur la racine canonique et le panneau runtime

## Validation

- `TAURI_BINARY_PATH=$PWD/src-tauri/target/debug/titane-infinity TITANE_NATIVE_BINARY_MODE=debug WDIO_SPEC=e2e/desktop/chat-ui-complete-runtime.wdio.test.js node scripts/e2e/run-desktop-suite.js` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Outcome

- `e2e/desktop/ui-driver.wdio.js` remonte `pageConversationMode`, `pageChatStoreMode`, `runtimeConversationMode` et `runtimeChatStoreMode`
- `e2e/desktop/chat-ui-complete-runtime.wdio.test.js` verrouille maintenant ces attributs directs en plus du résumé et des badges

## Rollback

- `git restore -- e2e/desktop/ui-driver.wdio.js e2e/desktop/chat-ui-complete-runtime.wdio.test.js UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`