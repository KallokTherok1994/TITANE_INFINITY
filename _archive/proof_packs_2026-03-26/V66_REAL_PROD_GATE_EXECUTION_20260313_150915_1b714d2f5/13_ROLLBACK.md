# 13 - Rollback

Minimal rollback for V66 artifacts:

```bash
cd /tmp/titane_v15_wt_20260311_080118
git clean -fd -- proof_packs/V66_REAL_PROD_GATE_EXECUTION_20260313_150915_1b714d2f5
```

No commit/main/build/deploy was executed in V66.
