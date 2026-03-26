# 18 Rollback

If this V17.1 proof-pack update must be reverted:

```bash
cd /tmp/titane_v15_wt_20260311_080118
git restore --staged --worktree proof_packs/DISTRIBUTION_FINAL_SEAL_V17_1_2026-03-11_0910_88c72517d
```

If already committed:

```bash
cd /tmp/titane_v15_wt_20260311_080118
git revert <commit_sha>
```
