# 2026-04-26 - TITANE ChatModeSelector Compact Proof

## Scope

- verrouiller la variante compacte de `ChatModeSelector`
- couvrir le selector stable `chat-mode-selector-select`
- ajouter une alerte unitaire précoce avant les lanes E2E/desktop

## Validation

- `runTests src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx` -> PASS
- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `corepack pnpm verify:registry` -> PASS

## Outcome

- la variante `compact` expose toujours `chat-mode-selector-select`
- un changement vers `planning` continue de propager l ID moderne vers `onModeChange`

## Rollback

- `git restore -- src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`