# Rollback Instructions

If verdict needs cancellation:

```bash
# Remove proof pack
rm -rf "deployment/latest/certification/phase10_4/P10_4_INFRA_IPC_STABILIZATION_20260218T201829Z"

# Remove wrapper registry entry
# (Add manual step or script)

# Revert commits (if pushed)
git revert -n <commit_hash>
```

**Note**: Wrapper itself is stable. Keep for future E2E runs.
