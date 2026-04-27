# 2026-04-27 - TITANE Desktop Online Chat UI Runtime Mode Proof

## Mission

- étendre la lane desktop online-chat UI pour qu elle prouve aussi la vérité de mode conversationnelle

## Scope

- `e2e/desktop/online-chat-proof-ui.wdio.test.js`
- cartographie et preuves gouvernées du micro-lot desktop online-chat UI

## Actions

- ajout de `pageConversationMode`, `pageChatStoreMode`, `runtimeConversationMode` et `runtimeChatStoreMode` dans le snapshot runtime local
- ajout d assertions multi-tours sur `default` et sur les chaînes `Conversation mode: default` / `Store mode: default`

## Evidence

- `TAURI_BINARY_PATH=$PWD/src-tauri/target/debug/titane-infinity TITANE_NATIVE_BINARY_MODE=debug WDIO_SPEC=e2e/desktop/online-chat-proof-ui.wdio.test.js node scripts/e2e/run-desktop-suite.js` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `bash scripts/verify/verify_agents_index.sh` -> PASS
- `bash scripts/verify/verify_prompt_files_index.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Risks

- risque faible: la lane dépend d un runtime desktop multi-tours déjà plus large que les lanes conversationnelles ciblées

## Verdict

- PASS

## Next Step

- publier le lot scope-limité sur `MAIN`

## Rollback Note

- `git restore -- e2e/desktop/online-chat-proof-ui.wdio.test.js UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`