# ROLLBACK

```bash
git restore -- \
  docs/governance/BASELINE_VERDICT.md \
  scripts/autoheal/autoheal_rules.jsonl \
  src/services/ai/providerFabricCatalog.ts \
  src/services/ai/providerFabric.ts \
  src/services/ai/orchestrator.ts \
  src/services/ai/__tests__/providerFabricStatus.test.ts \
  proof_packs/PHASE1_PROVIDER_FABRIC_STATUS_2026-03-27_e88264039
```

Post-rollback verification:

```bash
pnpm exec vitest run src/services/ai/__tests__/providerFabricStatus.test.ts src/services/ai/providers/__tests__/providerFabricAdapter.test.ts src/services/ai/providers/__tests__/openai.test.ts src/services/ai/providers/__tests__/claude.test.ts src/services/ai/providers/__tests__/providerMemoryReuse.test.ts src/services/ai/__tests__/ollamaAbortFallback.test.ts
```
