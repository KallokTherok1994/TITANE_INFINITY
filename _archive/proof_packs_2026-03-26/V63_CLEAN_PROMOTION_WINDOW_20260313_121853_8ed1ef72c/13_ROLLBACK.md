# 13 - Rollback

Minimal rollback for V63 artifacts:

```bash
cd /tmp/titane_v15_wt_20260311_080118
git restore -- scripts/autoheal/autoheal_rules.jsonl
git clean -fd -- proof_packs/V63_CLEAN_PROMOTION_WINDOW_20260313_121853_8ed1ef72c
```

Optional rollback to pre-cleanup noisy state:

```bash
cd /tmp/titane_v15_wt_20260311_080118
git switch --detach 8ed1ef72c64abd9042f32c3c3abddf71f2e4fb66
git stash apply stash@{1}
```
