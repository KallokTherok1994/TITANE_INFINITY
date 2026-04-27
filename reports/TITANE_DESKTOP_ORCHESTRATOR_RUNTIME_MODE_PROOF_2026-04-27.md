# 2026-04-27 - TITANE Desktop Orchestrator Runtime Mode Proof

## Scope

- verrouiller la vérité de mode conversationnelle dans la lane desktop orchestrator
- aligner la lane orchestrator sur les attributs canoniques déjà exposés par le driver WDIO

## Validation

- `TAURI_BINARY_PATH=$PWD/src-tauri/target/debug/titane-infinity TITANE_NATIVE_BINARY_MODE=debug WDIO_SPEC=e2e/desktop/chat-orchestrator-advanced-stress.wdio.test.js node scripts/e2e/run-desktop-suite.js` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Outcome

- `e2e/desktop/chat-orchestrator-advanced-stress.wdio.test.js` verrouille maintenant les attributs de mode à chaque tour et sur le runtime final
- la même spec verrouille aussi le résumé et les badges `conversation-mode:*` / `chat-store-mode:*`

## Rollback

- `git restore -- e2e/desktop/chat-orchestrator-advanced-stress.wdio.test.js UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`