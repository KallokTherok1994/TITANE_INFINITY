# 12 - Rollback

Minimal rollback for V64 artifacts:

```bash
cd /tmp/titane_v15_wt_20260311_080118
git clean -fd -- proof_packs/V64_FINAL_PROD_EXECUTION_20260313_123946_1b714d2f5
```

No production execution was performed in V64, so there is no runtime deploy rollback needed.
