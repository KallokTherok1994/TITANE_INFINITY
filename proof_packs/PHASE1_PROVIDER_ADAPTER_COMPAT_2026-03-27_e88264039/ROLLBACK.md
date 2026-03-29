# ROLLBACK

```bash
git restore -- \
  docs/governance/BASELINE_VERDICT.md \
  scripts/autoheal/autoheal_rules.jsonl \
  src/services/ai/types.ts \
  src/services/ai/providerFabric.ts \
  src/services/ai/providers/__tests__/providerFabricAdapter.test.ts \
  proof_packs/PHASE1_PROVIDER_ADAPTER_COMPAT_2026-03-27_e88264039
```

Post-rollback verification:

```bash
pnpm exec vitest run src/services/ai/providers/__tests__/providerFabricAdapter.test.ts src/services/ai/providers/__tests__/openai.test.ts src/services/ai/providers/__tests__/claude.test.ts src/services/ai/providers/__tests__/providerMemoryReuse.test.ts
```
