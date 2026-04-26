# 2026-04-26 — TITANE Chat Registry Boundary

## Scope

- Clarification des responsabilités de `src/config/chatModes.config.ts`
- Clarification des responsabilités de `src/services/ai/chatModes.config.ts`
- Ajout du test de frontière `src/__tests__/services/ai/chatModeRegistryBoundaries.test.ts`

## Runtime truth

- La registry legacy `src/config/chatModes.config.ts` reste la voie canonique de résolution runtime des prompts legacy et des modes personnalisés.
- La registry étendue `src/services/ai/chatModes.config.ts` reste la voie canonique des métadonnées de modes UI modernes.
- La coexistence des deux fichiers n est donc pas un doublon fonctionnel pur, mais une séparation de sous-systèmes distincts désormais explicitée et verrouillée par test.

## Validation

- `pnpm exec vitest run src/__tests__/services/ai/chatModeRegistryBoundaries.test.ts src/__tests__/config/customModeRegistry.test.ts src/__tests__/config/chatModes.phase17.test.ts` → PASS
- `bash scripts/autoheal/detect_recurrence.sh` → PASS
- `bash scripts/verify_instructions.sh` → PASS

## Rollback

- `git restore -- src/config/chatModes.config.ts src/services/ai/chatModes.config.ts src/__tests__/services/ai/chatModeRegistryBoundaries.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`