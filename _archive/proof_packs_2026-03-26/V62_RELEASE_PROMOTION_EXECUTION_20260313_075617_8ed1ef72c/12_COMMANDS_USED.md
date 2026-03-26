# 12 - Commands Used

Commands executed for final governed closure:

```bash
cd /tmp/titane_v15_wt_20260311_080118
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
pnpm -s verify:registry
git rev-list --left-right --count origin/MAIN...HEAD
git status --porcelain=v1
```

Exit codes:
- recurrence guard: `0`
- instruction verification: `0`
- registry verification: `0`
