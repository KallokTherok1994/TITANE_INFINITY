# ROLLBACK

```bash
git restore --source=HEAD -- \
  .github/copilot-instructions.md \
  src/services/userPreferencesEngine.ts \
  src/services/ai/chatEngine.ts \
  src/services/ai/chatModes.ts \
  src/services/ai/chatModes.config.ts \
  src/config/chatModes.config.ts \
  src/ui/pages/ChatIA/InstructionModeManager.ts \
  src/services/__tests__/userPreferencesEngine.test.ts \
  src/__tests__/services/ai/ollamaPipelineFixes.test.ts \
  src/__tests__/chatEngine.test.ts \
  src/__tests__/services/ai/chatModes.runtimeDepth.test.ts \
  src/__tests__/services/ai/chatModeRegistryBoundaries.test.ts \
  src/__tests__/config/customModeRegistry.test.ts \
  src/ui/pages/ChatIA/InstructionModeManager.test.ts \
  ARCHITECTURE.md \
  UI_SURFACE_MAP.md \
  docs/CARTOGRAPHY_COMPLETE.md \
  scripts/autoheal/autoheal_rules.jsonl \
  reports/titane-natural-voice-2026-04-30.md \
  proof_packs/titane-natural-voice-2026-04-30/GATE_REPORT.md \
  proof_packs/titane-natural-voice-2026-04-30/VERDICT.md \
  proof_packs/titane-natural-voice-2026-04-30/ROLLBACK.md
```

Si tu veux revenir seulement sur la voix sans toucher la cartographie, restaure uniquement les fichiers `src/**` et `src/ui/**` listés ci-dessus.
