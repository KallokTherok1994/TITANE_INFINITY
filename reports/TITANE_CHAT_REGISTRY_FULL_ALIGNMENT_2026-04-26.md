# 2026-04-26 — TITANE Chat Registry Full Alignment

## Scope

- Alignement final des registres de prompts secondaires dans `src/config/chatModes.config.ts`
- Harmonisation des lanes `quick` et `creation` dans `src/services/ai/chatModes.config.ts`
- Renforcement des non-régressions dans `src/__tests__/services/ai/chatModes.runtimeDepth.test.ts` et `src/__tests__/config/customModeRegistry.test.ts`

## Runtime truth

- Les registries primaire et secondaire ne divergent plus sur le plancher qualitatif attendu des réponses TITANE.
- Le mode rapide reste concis mais ne retombe plus sur une réponse superficielle.
- Le mode création et les registres spécialisés coaching, administration, stratégie, audit et créativité portent explicitement une posture expert-grade.

## Validation

- `pnpm exec vitest run src/__tests__/services/ai/chatModes.runtimeDepth.test.ts src/__tests__/config/customModeRegistry.test.ts src/__tests__/chatModes.config.test.ts src/__tests__/config/chatModes.phase17.test.ts` → PASS
- `corepack pnpm run check` → PASS
- `bash scripts/autoheal/detect_recurrence.sh` → PASS
- `bash scripts/verify_instructions.sh` → PASS

## Rollback

- `git restore -- src/services/ai/chatModes.config.ts src/config/chatModes.config.ts src/__tests__/services/ai/chatModes.runtimeDepth.test.ts src/__tests__/config/customModeRegistry.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`