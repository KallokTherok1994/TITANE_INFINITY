# Lock D4 — Self-Improvement Lab — ROLLBACK

## Rollback Plan

### Immediate Rollback (< 5 minutes)

```bash
# 1. Restore contract and tests to base state
git restore src/services/self_improvement_lab/SelfImprovementLabContract.ts
git restore src/services/self_improvement_lab/__tests__/SelfImprovementLabContract.test.ts

# 2. Ensure flag is off (already default)
# VITE_TITANE_D4_SELF_IMPROVEMENT_LAB=false  (no action needed — default)

# 3. Restore docs if needed
git restore docs/intelligence/SELF_IMPROVEMENT_LAB_POLICY.md
git restore docs/intelligence/SELF_IMPROVEMENT_LAB_SCHEMA.md
```

### Impact Assessment

| Concern | Impact |
|---------|--------|
| Production behavior | NONE — flag=false by default |
| Existing tests | NONE — base 45 tests still present in any rollback |
| Registries | Revert relevant registry entries |
| AutoHeal | Entry remains (append-only) |

### When to Rollback

- If v15 sidecar introduces TypeScript errors downstream
- If any consuming service misuses approval-gated types
- If governance authority declines D4 lock

### Verification After Rollback

```bash
pnpm vitest run src/services/self_improvement_lab
# Expect: base 45 tests pass
```

Date: 2026-05-06 | Lock: D4
