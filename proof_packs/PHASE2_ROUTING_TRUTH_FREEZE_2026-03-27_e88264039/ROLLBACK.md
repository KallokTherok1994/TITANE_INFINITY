# ROLLBACK

```bash
git restore -- \
  docs/governance/ROUTING_TRACE_CONTRACT_v1.md \
  docs/governance/BASELINE_VERDICT.md \
  proof_packs/PHASE2_ROUTING_TRUTH_FREEZE_2026-03-27_e88264039
```

Post-rollback verification:

```bash
pnpm exec vitest run src/services/api/chat.test.ts src/services/conversationEngine.test.ts src/__tests__/provider-decision-invariants.test.ts src/__tests__/online-availability.test.ts
```
