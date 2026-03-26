# 13 - Rollback

Minimal rollback for V62 closure:

```bash
cd /tmp/titane_v15_wt_20260311_080118
git restore -- scripts/autoheal/autoheal_rules.jsonl
git clean -fd -- proof_packs/V62_RELEASE_PROMOTION_EXECUTION_20260313_075617_8ed1ef72c
```

Rollback impact:
- Removes V62 release-execution proof pack.
- Removes V62 autoheal capture entry.
