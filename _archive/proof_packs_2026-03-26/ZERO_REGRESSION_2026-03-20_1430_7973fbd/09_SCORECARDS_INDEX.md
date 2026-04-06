# 09 — SCORECARDS INDEX
## Proof Pack: ZERO_REGRESSION_2026-03-20_1430_7973fbd

See `evals/scorecards/v1/` for full scorecard files.

## Summary

| Scorecard | File | Status | Scores |
|-----------|------|--------|--------|
| Response Quality | RESPONSE_QUALITY_SCORECARD.json | ✅ CREATED — JSON valid | PENDING (BLOCKED_BY_ENV) |
| Memory Truth | MEMORY_TRUTH_SCORECARD.json | ✅ CREATED — JSON valid | PENDING (BLOCKED_BY_ENV) |
| Router Truth | ROUTER_TRUTH_SCORECARD.json | ✅ CREATED — JSON valid | PENDING (BLOCKED_BY_ENV) |
| Honesty | HONESTY_SCORECARD.json | ✅ CREATED — JSON valid | PENDING (BLOCKED_BY_ENV) |
| AutoHeal Truth | AUTOHEAL_TRUTH_SCORECARD.json | ✅ CREATED — JSON valid | PENDING (BLOCKED_BY_ENV) |
| Desktop Critical Flow | DESKTOP_CRITICAL_FLOW_SCORECARD.json | ✅ CREATED — JSON valid | PENDING (BLOCKED_BY_ENV) |

**Gate: `G_SCORECARDS_PRESENT = PASS`**

**Why scores are PENDING:**
Node v18.19.1 is incompatible with this project (requires >=20.0.0).
JS-based eval execution cannot run. Scorecard structures are valid and ready to fill.

**To fill scores:**
```bash
nvm install 20 && nvm use 20
pnpm test
pnpm run test:e2e
# Then fill scorecard champion_score fields
```
