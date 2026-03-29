# ROLLBACK

```bash
git restore -- \
  docs/governance/PROVIDER_FABRIC_CANON_v1.md \
  docs/governance/BASELINE_VERDICT.md \
  proof_packs/PHASE1_PROVIDER_FABRIC_FREEZE_2026-03-27_e88264039
```

Post-rollback verification:

```bash
pnpm exec vitest run src/services/ai/providers/__tests__/openai.test.ts src/services/ai/providers/__tests__/claude.test.ts src/services/ai/providers/__tests__/providerMemoryReuse.test.ts
```
