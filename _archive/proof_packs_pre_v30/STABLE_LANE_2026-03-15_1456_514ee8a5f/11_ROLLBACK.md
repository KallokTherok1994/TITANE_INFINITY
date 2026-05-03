# 11_ROLLBACK.md — STABLE_LANE_2026-03-15_1456

## Rollback: vitest.config.ts change

```bash
git restore -- vitest.config.ts
```

## Effect of rollback

- Re-adds e2e-automated-validation.test.tsx to default run path
- Re-adds ChatWorkflow.e2e.test.tsx to default run path
- Full suite will hang again at 4+ minutes

## No other changes to roll back

Only vitest.config.ts was modified in this session.
