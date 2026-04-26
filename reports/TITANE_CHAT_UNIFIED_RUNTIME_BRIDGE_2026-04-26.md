# 2026-04-26 — TITANE Chat Unified Runtime Bridge

## Scope

- Unifier la porte runtime des modes de chat dans `src/config/chatModes.config.ts`
- Rendre `ChatModeSelector` prouvable via `data-testid` stables
- Ajouter la preuve UI moderne -> résolution finale du prompt runtime

## Runtime truth

- `src/config/chatModes.config.ts` reste la porte canonique de résolution runtime, mais bridge désormais les modes étendus non legacy exposés par `src/services/ai/chatModes.config.ts`.
- Les modes personnalisés via `registerCustomMode()` restent prioritaires et inchangés.
- Une sélection UI moderne comme `quick` ou `strategy` peut maintenant atteindre `getSystemPrompt()` sans retomber sur `SYSTEM_PROMPTS.default`.

## Validation

- `pnpm exec vitest run src/__tests__/services/ai/chatModeUnifiedRuntimeBridge.test.ts src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx src/__tests__/services/ai/chatModeRegistryBoundaries.test.ts src/__tests__/config/customModeRegistry.test.ts src/__tests__/chatModes.config.test.ts` → PASS
- `corepack pnpm run check` → PASS
- `bash scripts/autoheal/detect_recurrence.sh` → PASS
- `bash scripts/verify_instructions.sh` → PASS
- `corepack pnpm verify:registry` → PASS

## Outcome

- Point 1: fusion fonctionnelle des deux sous-systèmes au niveau de la porte runtime, sans casser les modes legacy ni les custom modes.
- Point 2: preuve d intégration UI -> prompt final ajoutée et verte.
- Point 3: surface UI renforcée avec selectors stables pour les preuves gouvernées et futures E2E.

## Rollback

- `git restore -- src/config/chatModes.config.ts src/components/chat/ChatModeSelector.tsx src/__tests__/services/ai/chatModeUnifiedRuntimeBridge.test.ts src/__tests__/components/chat/ChatModeSelector.runtimePromptBridge.test.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`