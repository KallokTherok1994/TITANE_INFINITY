# 2026-04-27 - TITANE Desktop Model Truth Chain Mode Proof

## Scope

- verrouiller la vérité de mode conversationnelle dans la lane desktop de vérité modèle
- aligner la lane modèle sur les attributs canoniques déjà exposés par le driver WDIO

## Validation

- `TAURI_BINARY_PATH=$PWD/src-tauri/target/debug/titane-infinity TITANE_NATIVE_BINARY_MODE=debug WDIO_SPEC=e2e/desktop/chat-model-truth-chain.wdio.test.js node scripts/e2e/run-desktop-suite.js` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Outcome

- `e2e/desktop/chat-model-truth-chain.wdio.test.js` verrouille maintenant les attributs de mode sur `page-conversation` et `chat-runtime-state`
- la même spec verrouille aussi le résumé et les badges `conversation-mode:*` / `chat-store-mode:*`

## Rollback

- `git restore -- e2e/desktop/chat-model-truth-chain.wdio.test.js UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`