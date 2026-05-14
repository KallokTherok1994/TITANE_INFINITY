# ROLLBACK

## Command

- `git restore -- src/services/ai/chatModes.config.ts src/config/chatModes.config.ts src/__tests__/services/ai/chatModes.runtimeDepth.test.ts src/__tests__/config/customModeRegistry.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`

## Expected effect

- Restaure les prompts précédents des registres secondaires et des lanes `quick` / `creation`, ainsi que leurs artefacts de preuve et de cartographie associés.