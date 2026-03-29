# ROLLBACK

Rollback only the files created by this lock:

```bash
git restore -- \
  docs/governance/TARGET_OPERATING_MODEL_v1.md \
  docs/governance/CAPABILITY_MATRIX_CANONICAL_v1.md \
  docs/governance/ROUTING_POLICY_CANON_v1.md \
  docs/governance/BASELINE_VERDICT.md \
  proof_packs/PHASE0_AUTHORITY_FREEZE_2026-03-27_e88264039
```

Post-rollback verification:

```bash
bash scripts/verify/enforce-online-first.sh
pnpm exec vitest run src/__tests__/provider-decision-invariants.test.ts src/__tests__/online-availability.test.ts
```
