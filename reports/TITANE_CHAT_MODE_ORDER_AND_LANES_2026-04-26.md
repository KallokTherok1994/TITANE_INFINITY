# 2026-04-26 — TITANE Chat Mode Order And Lanes

## Scope

- Correction du doublon `sortOrder` dans `src/services/ai/chatModes.config.ts`
- Homogénéisation du niveau expert sur les lanes conversationnelles principales dans `src/services/ai/chatModes.ts` et `src/services/ai/chatModes.config.ts`
- Ajout du test de non-régression `src/__tests__/services/ai/chatModes.runtimeDepth.test.ts`

## Runtime truth

- Le registre actif des modes ne contient plus de doublon `sortOrder` pour les modes activés.
- Les voies `standard`, `synthèse`, `planification`, `debug cognitif`, `développeur`, `stratégie`, `audit`, `urgence` et `oméga` publient maintenant explicitement une posture expert-grade.
- Le runtime legacy des modes conversationnels garde le même plancher qualitatif sur les modes principaux hors fallback global.

## Validation

- `pnpm exec vitest run src/__tests__/services/ai/chatModes.runtimeDepth.test.ts src/__tests__/chatModes.config.test.ts src/__tests__/config/chatModes.phase17.test.ts` → PASS
- `bash scripts/autoheal/detect_recurrence.sh` → PASS
- `bash scripts/verify_instructions.sh` → PASS
- `corepack pnpm verify:registry` → PASS

## Rollback

- `git restore -- src/services/ai/chatModes.ts src/services/ai/chatModes.config.ts src/__tests__/services/ai/chatModes.runtimeDepth.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`