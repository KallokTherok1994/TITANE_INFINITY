# ROLLBACK

## Command

- `git restore -- src/components/sections/ConversationSection.tsx src/components/sections/__tests__/ConversationSection.modeBridge.test.tsx e2e/critical/chat-interaction.spec.ts e2e/desktop/chat-ui-complete-runtime.wdio.test.js e2e/desktop/ui-connectivity-critical.wdio.test.js UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl`

## Expected effect

- Restaure la toolbar conversationnelle avec son chemin legacy précédent et retire la vérité runtime additionnelle sur le mode actif.